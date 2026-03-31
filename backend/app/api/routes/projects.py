import httpx
import json
import logging
import asyncio
import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.1-8b-instant"
GITHUB_API   = "https://api.github.com"

class ProjectGenerateRequest(BaseModel):
    user_id: str
    prompt: str
    exclude_titles: list[str] = []

async def _generate_ai_projects(prompt: str, skill_level: str, exclude_titles: list[str] = []) -> list[dict]:
    exclude_str = ""
    if exclude_titles:
        exclude_str = f"\nCRITICAL: DO NOT GENERATE ANY PROJECTS RESEMBLING THESE EXISTING TITLES:\n{', '.join(exclude_titles)}\nGenerate completely different product concepts."

    sys_prompt = f"""You are an elite expert software architect. The user wants to build something related to: "{prompt}".
Skill level: "{skill_level}".{exclude_str}

MANDATORY DIVERSITY RULE — THIS IS THE MOST IMPORTANT RULE:
You MUST generate EXACTLY 6 projects. Each project MUST occupy a DIFFERENT slot from this list:
  Slot 1: A real-time system (WebSockets, streaming, live data)
  Slot 2: A data analytics / visualization dashboard
  Slot 3: A mobile-first or cross-platform app
  Slot 4: An AI/ML-powered tool (training, inference, NLP, computer vision)
  Slot 5: A developer tool / CLI / API / SDK / browser extension
  Slot 6: A marketplace, social platform, or community-driven product

EACH PROJECT MUST HAVE:
- A COMPLETELY DIFFERENT problem_statement (different real-world pain point, NOT a rewording of the same problem)
- A COMPLETELY DIFFERENT proposed_solution (different product workflow, different user interaction model)
- A COMPLETELY DIFFERENT target_audience (e.g., therapists vs patients vs researchers vs hospital admins vs caregivers vs students)
- A COMPLETELY DIFFERENT tech_stack combination
- A COMPLETELY DIFFERENT set of core_features (no overlapping feature descriptions)

If two projects share the same core idea but differ only in wording, YOU HAVE FAILED. Each project must feel like it was designed by a different startup solving a different angle of "{prompt}".

Complexity must match a {skill_level} developer. Use realistic, specific technologies (not generic).

Return ONLY a valid JSON Array:
[
  {{
    "title": "Catchy short title (max 5 words)",
    "description": "2-3 sentence summary of the UNIQUE problem and UNIQUE technical approach.",
    "problem_statement": "1 sharp sentence: what SPECIFIC real-world problem does THIS project solve? Must be totally different from other 5 projects.",
    "target_audience": "1 sentence: who SPECIFICALLY uses this? Must be a different user group from other 5 projects.",
    "proposed_solution": "2-3 sentences: how does the product WORK from the user's perspective? Describe the unique workflow. Must be completely different from other 5 projects.",
    "core_features": ["Feature 1: unique 1-sentence description", "Feature 2: ...", "Feature 3: ...", "Feature 4: ..."],
    "tech_stack": [
        "Core Languages: <specific>",
        "Frontend: <specific>",
        "Backend & APIs: <specific>",
        "Database: <specific>",
        "AI / Specialized: <specific, not generic>"
    ],
    "novelty": "1 sentence: what makes this engineering approach novel?",
    "pitch": "1 sentence: why building this proves {skill_level} ability.",
    "difficulty_score": <integer 1-10>,
    "estimated_time": "e.g. '1-2 weeks'",
    "roadmap": ["Phase 1: <specific setup step>", "Phase 2: <architecture step>", "Phase 3: <implementation step>", "Phase 4: <deployment step>"]
  }}
]
CRITICAL OUTPUT RULES:
- Output ONLY the raw JSON array. No markdown fences. No explanation text before or after.
- ALL string values MUST use double quotes. No single quotes.
- No trailing commas in arrays or objects.
- Escape any double quotes inside string values with backslash.
- difficulty_score MUST be a raw integer, NOT a string.
"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "max_tokens": 4096,
                    "temperature": 0.7,
                    "messages": [{"role": "user", "content": sys_prompt}],
                },
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.error(f"Groq API HTTP error {e.response.status_code}: {e.response.text[:500]}")
            raise RuntimeError(f"Groq API returned {e.response.status_code}") from e
        except httpx.TimeoutException:
            logger.error("Groq API request timed out after 60s")
            raise RuntimeError("Groq API request timed out")

        content = resp.json()["choices"][0]["message"]["content"].strip()
        # Strip any markdown fences the model may add
        content = content.replace("```json", "").replace("```", "").strip()

        # Attempt direct JSON parse; fallback to regex extraction
        try:
            projects = json.loads(content)
        except json.JSONDecodeError:
            logger.warning("Direct JSON parse failed, attempting regex extraction...")
            match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
            if match:
                try:
                    projects = json.loads(match.group(0))
                except json.JSONDecodeError as e2:
                    logger.error(f"Regex-extracted JSON also invalid: {e2}\nRaw content (first 1000 chars): {content[:1000]}")
                    raise RuntimeError(f"AI returned unparsable JSON: {e2}") from e2
            else:
                logger.error(f"No JSON array found in AI response. Raw content (first 1000 chars): {content[:1000]}")
                raise RuntimeError("AI response contained no JSON array")

        if not isinstance(projects, list):
            logger.error(f"AI returned non-list JSON type: {type(projects).__name__}")
            raise RuntimeError("AI returned non-list JSON")

        valid_projects = []
        for p in projects:
            if isinstance(p, dict) and "title" in p and "description" in p:
                p["type"] = "ai"
                # Ensure difficulty_score is int
                if "difficulty_score" in p:
                    try:
                        p["difficulty_score"] = int(p["difficulty_score"])
                    except (ValueError, TypeError):
                        p["difficulty_score"] = 5
                valid_projects.append(p)

        logger.info(f"Successfully parsed {len(valid_projects)} AI projects")
        return valid_projects

async def _fetch_github_projects(prompt: str) -> list[dict]:
    # Extract keywords from prompt for GitHub search
    stopwords = {"build", "a", "an", "the", "i", "want", "to", "create", "make", "project", "using", "with", "system"}
    tokens = [t for t in prompt.lower().split() if t not in stopwords and len(t) > 2]
    query_str = " ".join(tokens) if tokens else prompt
    # Append stars:>10 limit to avoid junk repos, look in description and readme
    gh_query = f"{query_str} stars:>50 size:>100"

    headers = {"Accept": "application/vnd.github.v3+json"}
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{GITHUB_API}/search/repositories",
                params={"q": gh_query, "sort": "stars", "order": "desc", "per_page": 10},
                headers=headers
            )
            resp.raise_for_status()
            data = resp.json()
            items = data.get("items", [])
            
            gh_projects = []
            for item in items:
                description = item.get("description")
                if not description or len(description.strip()) < 10:
                    continue
                # Synthesise roadmap steps from repo specs
                steps = [
                    f"Clone the repository: git clone {item.get('clone_url')}",
                    "Read the primary documentation and architecture in the README.",
                    "Review the dependency file (e.g. package.json, requirements.txt, Cargo.toml).",
                    "Explore the main entrypoint file to understand the flow."
                ]
                gh_projects.append({
                    "title": item.get("full_name"),
                    "description": description,
                    "difficulty_score": 7, # Assume medium-advanced for actual enterprise codebases
                    "estimated_time": "Variable",
                    "roadmap": steps,
                    "url": item.get("html_url"),
                    "stars": item.get("stargazers_count"),
                    "language": item.get("language"),
                    "type": "github"
                })
            return gh_projects
    except Exception as e:
        logger.warning(f"Failed to fetch GitHub projects for '{query_str}': {e}")
        return []

@router.post("/generate")
async def generate_dynamic_projects(
    payload: ProjectGenerateRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    skill_level = user.skill_level or "intermediate"
    
    # Run both Groq generator and Github Search in parallel
    ai_future = _generate_ai_projects(payload.prompt, skill_level, payload.exclude_titles)
    
    # Only run GitHub search if we don't have too many local existing ones
    # or just run it alongside but only use top hits.
    gh_future = _fetch_github_projects(payload.prompt)
    
    results = await asyncio.gather(ai_future, gh_future, return_exceptions=True)
    
    if isinstance(results[0], Exception):
        logger.error(f"AI Generation failed: {results[0]}")
        raise HTTPException(status_code=500, detail="AI blueprint generation failed.")
    ai_projects = results[0]
    
    gh_projects = results[1] if not isinstance(results[1], Exception) else []
    
    # Filter GH projects against the exclude list too, roughly by checking substring titles
    if payload.exclude_titles:
        exclude_lower = [t.lower() for t in payload.exclude_titles]
        gh_projects = [g for g in gh_projects if not any(t in g["title"].lower() or g["title"].lower() in t for t in exclude_lower)]

    # Interleave results dynamically
    mixed_projects = []
    max_len = max(len(ai_projects), len(gh_projects))
    for i in range(max_len):
        if i < len(ai_projects):
            mixed_projects.append(ai_projects[i])
        if i < len(gh_projects):
            mixed_projects.append(gh_projects[i])

    return {
        "user_id": payload.user_id,
        "prompt": payload.prompt,
        "total_returned": len(mixed_projects),
        "projects": mixed_projects
    }

