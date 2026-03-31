"""
app/ingestion/github_fetcher.py

Three functions:
  1. fetch_github_trending()        — all trending repos (general feed)
  2. fetch_github_trending_multi()  — trending filtered by user interests (personalized feed)
  3. fetch_repos_for_project()      — repos related to a specific project (project detail page)

Person A (Satvick) — Phase 9
"""

import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)

GITHUB_TRENDING_URL = "https://github.com/trending"
GITHUB_SEARCH_API = "https://api.github.com/search/repositories"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

GITHUB_API_HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_trending_url(language: Optional[str] = None, since: str = "daily") -> str:
    url = GITHUB_TRENDING_URL
    if language:
        url += f"/{language.lower()}"
    url += f"?since={since}"
    return url


def parse_trending_page(html: str) -> list[dict]:
    """Parse GitHub Trending HTML and return list of structured repo dicts."""
    soup = BeautifulSoup(html, "html.parser")
    repos = []

    for article in soup.select("article.Box-row"):
        try:
            heading = article.select_one("h2 a")
            if not heading:
                continue

            raw_path = heading.get("href", "").strip().lstrip("/")
            title = raw_path
            url = f"https://github.com/{raw_path}"

            desc_tag = article.select_one("p")
            description = desc_tag.get_text(strip=True) if desc_tag else ""

            lang_tag = article.select_one("[itemprop='programmingLanguage']")
            language = lang_tag.get_text(strip=True) if lang_tag else None

            stars_total = 0
            star_link = article.select_one("a[href$='/stargazers']")
            if star_link:
                raw = star_link.get_text(strip=True).replace(",", "")
                try:
                    stars_total = int(raw)
                except ValueError:
                    pass

            forks = 0
            fork_link = article.select_one("a[href$='/forks']")
            if fork_link:
                raw = fork_link.get_text(strip=True).replace(",", "")
                try:
                    forks = int(raw)
                except ValueError:
                    pass

            stars_today = 0
            for span in article.select("span"):
                text = span.get_text(strip=True)
                if "stars today" in text or "star today" in text:
                    raw = text.split()[0].replace(",", "")
                    try:
                        stars_today = int(raw)
                    except ValueError:
                        pass
                    break

            topics = [language.lower()] if language else []

            repos.append({
                "source": "github",
                "type": "repo",
                "title": title,
                "url": url,
                "description": description,
                "language": language,
                "stars_total": stars_total,
                "stars_today": stars_today,
                "forks": forks,
                "topics": topics,
                "fetched_at": datetime.utcnow().isoformat(),
            })

        except Exception as e:
            logger.warning(f"Failed to parse a repo row: {e}")
            continue

    return repos


def format_search_result(item: dict) -> dict:
    """Convert a GitHub Search API result item into the standard repo dict."""
    language = item.get("language")
    topics = item.get("topics", [])
    if language and language.lower() not in topics:
        topics = [language.lower()] + topics

    return {
        "source": "github",
        "type": "repo",
        "title": item.get("full_name", ""),
        "url": item.get("html_url", ""),
        "description": item.get("description") or "",
        "language": language,
        "stars_total": item.get("stargazers_count", 0),
        "stars_today": 0,   # not available from search API
        "forks": item.get("forks_count", 0),
        "topics": topics,
        "fetched_at": datetime.utcnow().isoformat(),
    }


# ---------------------------------------------------------------------------
# Function 1 — General trending feed
# ---------------------------------------------------------------------------

async def fetch_github_trending(
    language: Optional[str] = None,
    since: str = "daily",
    limit: int = 25,
) -> list[dict]:
    """
    Fetch trending repos from GitHub Trending page.
    Used for the general (non-personalized) section of the feed.

    Args:
        language: Filter by language e.g. "python". None = all languages.
        since:    "daily" | "weekly" | "monthly"
        limit:    Max repos to return (GitHub shows up to 25 per page)
    """
    url = build_trending_url(language=language, since=since)
    logger.info(f"Fetching GitHub Trending: {url}")

    async with httpx.AsyncClient(headers=HEADERS, timeout=15.0, follow_redirects=True) as client:
        response = await client.get(url)
        response.raise_for_status()

    repos = parse_trending_page(response.text)
    logger.info(f"Fetched {len(repos)} trending repos")
    return repos[:limit]


# ---------------------------------------------------------------------------
# Function 2 — Personalized trending feed (by user interests)
# ---------------------------------------------------------------------------

async def fetch_github_trending_multi(
    topics: list[str],
    since: str = "daily",
    limit_per_topic: int = 10,
) -> list[dict]:
    """
    Fetch trending repos across multiple topics that match user interests.
    Used for the personalized feed. Uses the Search API instead of trending pages
    since trending pages only support programming languages natively.

    Args:
        topics:          User interest keywords e.g. ["python", "nlp", "ai"]
        since:           "daily" | "weekly" | "monthly" (Not strictly applied to search API to avoid 0 results)
        limit_per_topic: Repos to fetch per topic before merging

    Returns:
        Deduplicated repos sorted by stars descending.
    """
    seen_urls: set[str] = set()
    all_repos: list[dict] = []

    for topic in topics:
        try:
            query = topic if " " not in topic else f'"{topic}"'
            params = {
                "q": query,
                "sort": "stars",
                "order": "desc",
                "per_page": limit_per_topic,
            }
            async with httpx.AsyncClient(headers=GITHUB_API_HEADERS, timeout=15.0) as client:
                response = await client.get(GITHUB_SEARCH_API, params=params)
                response.raise_for_status()
                data = response.json()
            
            items = data.get("items", [])
            repos = [format_search_result(item) for item in items]
            
            for repo in repos:
                if repo["url"] not in seen_urls:
                    seen_urls.add(repo["url"])
                    all_repos.append(repo)
        except Exception as e:
            logger.warning(f"Failed to fetch search API for topic '{topic}': {e}")
            continue

    # Always include general trending and merge in to guarantee some results
    try:
        general = await fetch_github_trending(since=since, limit=limit_per_topic)
        for repo in general:
            if repo["url"] not in seen_urls:
                seen_urls.add(repo["url"])
                all_repos.append(repo)
    except Exception as e:
        logger.warning(f"Failed to fetch general trending: {e}")

    # sort by absolute stars since search doesn't return stars_today
    all_repos.sort(key=lambda r: r.get("stars_total", 0), reverse=True)
    return all_repos


# ---------------------------------------------------------------------------
# Function 3 — Project detail page (related repos for a specific project)
# ---------------------------------------------------------------------------

async def fetch_repos_for_project(
    project_description: str,
    limit: int = 5,
) -> list[dict]:
    """
    Find GitHub repos relevant to a specific project.
    Called when a user opens a project detail page — mirrors get_papers_for_project().

    Uses the GitHub Search API (no auth required for basic usage, 10 req/min unauthenticated).
    Searches by keywords extracted from the project description,
    sorted by stars so the most established repos surface first.

    Args:
        project_description: Free-text project description e.g.
                             "mental health chatbot using NLP and transformers"
        limit:               Number of repos to return (default 5)

    Returns:
        List of repo dicts sorted by stars descending.
    """
    keywords = _extract_keywords(project_description)
    query = " ".join(keywords[:6])
    query = f"{query} stars:>50 size:>100"

    logger.info(f"Searching GitHub repos for project: '{query}'")

    params = {
        "q": query,
        "sort": "stars",
        "order": "desc",
        "per_page": limit,
    }

    async with httpx.AsyncClient(headers=GITHUB_API_HEADERS, timeout=15.0) as client:
        response = await client.get(GITHUB_SEARCH_API, params=params)
        response.raise_for_status()
        data = response.json()

    items = data.get("items", [])
    repos = []
    for item in items:
        if not item.get("description") or len(item.get("description").strip()) < 10:
            continue
        repos.append(format_search_result(item))
    logger.info(f"Found {len(repos)} repos for project query: '{query}'")
    return repos


def _extract_keywords(text: str) -> list[str]:
    """
    Simple keyword extractor — strips common stopwords and short tokens.
    No external library needed, keeps it lightweight.
    """
    stopwords = {
        "a", "an", "the", "and", "or", "for", "to", "of", "in", "on",
        "with", "using", "that", "this", "is", "are", "i", "my", "we",
        "build", "building", "create", "creating", "make", "making",
        "want", "need", "based", "app", "application", "system", "project",
    }
    tokens = text.lower().replace("-", " ").split()
    keywords = [t for t in tokens if t not in stopwords and len(t) > 2]
    return keywords