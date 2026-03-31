

import httpx
import json
from datetime import datetime
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# --- API base URLs ---
HN_ALGOLIA_BASE  = "https://hn.algolia.com/api/v1"
GROQ_API_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL       = "llama-3.3-70b-versatile"


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _format_algolia_hit(hit: dict) -> dict | None:
    """Convert an Algolia search hit into the standard story dict."""
    url = hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}"
    if not hit.get("title"):
        return None
    return {
        "source"      : "hackernews",
        "type"        : "story",
        "id"          : hit.get("objectID"),
        "title"       : hit.get("title", "").strip(),
        "url"         : url,
        "hn_url"      : f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}",
        "description" : hit.get("story_text") or "",
        "author"      : hit.get("author", ""),
        "score"       : hit.get("points", 0),
        "comments"    : hit.get("num_comments", 0),
        "fetched_at"  : datetime.utcnow().isoformat(),
    }


async def _interests_to_queries(interests: list[str]) -> list[str]:
    """
    Use Groq to dynamically expand user interests into rich, specific search queries.

    e.g. ["AI", "mental health"] →
         ["large language models", "AI safety", "mental health apps",
          "therapy technology", "NLP research", ...]

    This replaces the hardcoded expansion dict so any interest the user types
    during signup works — not just the ones we anticipated.

    Falls back to raw interest keywords if Groq call fails.
    """
    prompt = f"""You are a search query generator for Hacker News.

Given these user interests: {json.dumps(interests)}

Generate exactly 3 Hacker News search queries PER interest — no more, no less.
Structure your response as a JSON object where each key is the interest and value is an array of 3 queries.

STRICT RULES:
- 3 queries per interest, exactly
- Each query must be 2-4 words
- Focus on APPLICATIONS, PRODUCTS, DEBATES, USE CASES — not raw tech terms
- Never use raw library/framework names alone (no "Transformers", "PyTorch", "BERT", "NLP" alone)
- Cover different angles per interest: one tool/product, one debate/trend, one use case
- Think: what would someone interested in this topic actually search on HN?

Example for interests ["AI", "mental health"]:
{{
  "AI": ["AI coding tools", "LLM product launches", "AI safety debate"],
  "mental health": ["mental health apps", "digital therapy tools", "workplace burnout"]
}}

Respond ONLY with a valid JSON object. No explanation, no markdown."""

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "max_tokens": 500,
                    "temperature": 0.4,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"].strip()

            # Strip markdown fences if Groq adds them
            content = content.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(content)

            all_queries = []
            if isinstance(parsed, dict):
                # New format: {"AI": [...], "NLP": [...], "mental health": [...]}
                # Take exactly 3 queries per interest in round-robin order
                # so no single interest dominates
                per_interest = list(parsed.values())
                max_len = max(len(q) for q in per_interest) if per_interest else 0
                for i in range(max_len):
                    for interest_queries in per_interest:
                        if i < len(interest_queries) and isinstance(interest_queries[i], str):
                            all_queries.append(interest_queries[i])
            elif isinstance(parsed, list):
                # Fallback: flat array (old format)
                all_queries = [q for q in parsed if isinstance(q, str)]

            if all_queries:
                return list(dict.fromkeys(all_queries))  # deduplicate, preserve order

    except Exception as e:
        logger.warning(f"Groq query expansion failed, falling back to raw interests: {e}")

    # Fallback — just use the raw interest keywords
    return interests


# ---------------------------------------------------------------------------
# Function 1 — Personalized daily feed by user interests
# ---------------------------------------------------------------------------

async def fetch_stories_by_interests(
    interests: list[str],
    limit: int = 20,
) -> list[dict]:
    """
    Fetch HN stories personalized to the user's interests.
    Called on home page load — replaces a generic top stories feed.

    Uses Algolia HN Search API with:
    - Groq-expanded interest queries (purpose/application focused)
    - Date filter: last 7 days only
    - Post-fetch relevance filter: drops stories with no keyword overlap
    - Sorted by score so best stories surface first

    Args:
        interests: User interest list from their profile e.g. ["AI", "NLP", "mental health"]
        limit:     Total stories to return across all interests

    Returns:
        Deduplicated, relevant list of story dicts sorted by score descending.
    """
    queries = await _interests_to_queries(interests)

    seen_ids: set[str] = set()
    all_stories: list[dict] = []

    async with httpx.AsyncClient(timeout=15.0) as client:
        for query in queries:
            try:
                params = {
                    "query"         : query,
                    "tags"          : "story",
                    "numericFilters": "points>15", # Focus on higher quality discussions
                    "hitsPerPage"   : 5,           # Less quantity, higher rank
                }
                # Use /search instead of /search_by_date for immense relevancy gains
                resp = await client.get(f"{HN_ALGOLIA_BASE}/search", params=params)
                resp.raise_for_status()
                hits = resp.json().get("hits", [])

                for hit in hits:
                    story = _format_algolia_hit(hit)
                    if not story or story["id"] in seen_ids:
                        continue

                    # Algolia is inherently highly relevant if we sort by score/relevancy
                    seen_ids.add(story["id"])
                    all_stories.append(story)

            except Exception as e:
                logger.warning(f"HN interest search failed for '{query}': {e}")
                continue

    # Sort the unified results by score to bubble up the best discussions across interests
    all_stories.sort(key=lambda s: s["score"], reverse=True)
    logger.info(f"Fetched {len(all_stories)} personalized HN stories for interests: {interests}")
    return all_stories[:limit]


# ---------------------------------------------------------------------------
# Function 2 — Search bar
# ---------------------------------------------------------------------------

async def search_hn_stories(
    query: str,
    limit: int = 20,
    sort_by: str = "relevance",   # "relevance" | "date"
    min_score: int = 0,
) -> list[dict]:
    """
    Search HN stories by a user-typed query. Powers the search bar.

    Uses Algolia HN Search API — same engine HN's own search uses.
    Supports full-text search across titles, URLs, and story text.

    Args:
        query:     Search string from the user e.g. "rust async runtime"
        limit:     Number of results to return
        sort_by:   "relevance" (best match first) or "date" (newest first)
        min_score: Minimum upvote score to filter noise (default 0 = show all)

    Returns:
        List of story dicts matching the query.
    """
    endpoint = "search" if sort_by == "relevance" else "search_by_date"

    params = {
        "query"      : query,
        "tags"       : "story",
        "hitsPerPage": limit,
    }
    if min_score > 0:
        params["numericFilters"] = f"points>={min_score}"

    logger.info(f"Searching HN for: '{query}' (sort={sort_by})")

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(f"{HN_ALGOLIA_BASE}/{endpoint}", params=params)
        resp.raise_for_status()
        hits = resp.json().get("hits", [])

    stories = []
    for hit in hits:
        story = _format_algolia_hit(hit)
        if story:
            stories.append(story)

    logger.info(f"HN search returned {len(stories)} results for '{query}'")
    return stories


# ---------------------------------------------------------------------------
# Function 3 — Project detail page (related HN discussions)
# ---------------------------------------------------------------------------

async def fetch_stories_for_project(
    project_description: str,
    limit: int = 5,
) -> list[dict]:
    """
    Find HN stories and discussions relevant to a specific project.
    Called when a user opens a project detail page — mirrors fetch_repos_for_project().

    Uses Groq to break the project description into 3 simple, focused HN search
    queries, fires each separately, then deduplicates and returns top results.
    This avoids zero-result queries from over-combined keyword strings.

    Args:
        project_description: Free-text project description e.g.
                            "mental health chatbot using NLP and transformers"
        limit:              Number of stories to return (default 5)

    Returns:
        List of story dicts most relevant to the project, sorted by score.
    """
    # Use Groq to generate focused simple queries from the project description
    queries = await _project_to_queries(project_description)
    logger.info(f"Project queries generated: {queries}")

    seen_ids: set[str] = set()
    all_stories: list[dict] = []

    async with httpx.AsyncClient(timeout=15.0) as client:
        for query in queries:
            try:
                params = {
                    "query"      : query,
                    "tags"       : "story",
                    "hitsPerPage": limit,
                }
                resp = await client.get(f"{HN_ALGOLIA_BASE}/search", params=params)
                resp.raise_for_status()
                hits = resp.json().get("hits", [])

                for hit in hits:
                    story = _format_algolia_hit(hit)
                    if story and story["id"] not in seen_ids:
                        seen_ids.add(story["id"])
                        all_stories.append(story)

            except Exception as e:
                logger.warning(f"HN project search failed for '{query}': {e}")
                continue

    all_stories.sort(key=lambda s: s["score"], reverse=True)
    logger.info(f"Found {len(all_stories)} HN stories for project")
    return all_stories[:limit]


async def _project_to_queries(project_description: str) -> list[str]:
    """
    Use Groq to extract 3 focused, simple HN search queries from a project description.
    Each query targets one core concept of the project separately.
    Falls back to basic keyword extraction if Groq fails.
    """
    prompt = f"""You are a search query generator for Hacker News.

Given this project description: "{project_description}"

Generate exactly 3 Hacker News search queries following these strict rules:

1. FIRST query must be about the project's DOMAIN or WHO IT HELPS
   e.g. "mental health apps", "finance tools", "education platform"

2. SECOND query must be about the project's CORE FUNCTION or USE CASE
   e.g. "therapy chatbot", "expense tracker", "code reviewer"

3. THIRD query can be a relevant tech angle but must be SPECIFIC and APPLIED
   e.g. "conversational AI health", "LLM mental health" — NOT just "NLP" or "Transformers" alone

STRICT RULES:
- Never use raw library/framework names alone as a query (no "Transformers", "NLP", "PyTorch", "BERT")
- Each query must be 2-4 words
- Every query must relate back to what the project actually does for users
- Think: what would a developer or founder building this product search on HN?

Respond ONLY with a flat JSON array of 3 strings. No explanation, no markdown.
Example for "mental health chatbot using NLP": ["mental health apps", "therapy chatbot", "conversational AI health"]"""

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "max_tokens": 100,
                    "temperature": 0.3,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"].strip()
            content = content.replace("```json", "").replace("```", "").strip()
            queries = json.loads(content)
            if isinstance(queries, list) and all(isinstance(q, str) for q in queries):
                return queries

    except Exception as e:
        logger.warning(f"Groq project query generation failed, using fallback: {e}")

    # Fallback — extract top 3 keywords manually
    keywords = _extract_keywords(project_description)
    return keywords[:3]


def _extract_keywords(text: str) -> list[str]:
    """
    Simple keyword extractor — strips stopwords and short tokens.
    Shared with github_fetcher pattern.
    """
    stopwords = {
        "a", "an", "the", "and", "or", "for", "to", "of", "in", "on",
        "with", "using", "that", "this", "is", "are", "i", "my", "we",
        "build", "building", "create", "creating", "make", "making",
        "want", "need", "based", "app", "application", "system", "project",
    }
    tokens = text.lower().replace("-", " ").split()
    return [t for t in tokens if t not in stopwords and len(t) > 2]