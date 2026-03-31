# backend/app/ai/summarizer.py

from groq import Groq
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.models import Paper
import json

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"

# -------------------------------------------------------
# ROLE CONTEXT BUILDER
# -------------------------------------------------------

def get_role_context(designation: str, skill_level: str) -> str:
    role_map = {
        "school student":     "a curious high school student with basic programming knowledge",
        "college student":    "a college student with intermediate technical knowledge",
        "final year":         "a final year engineering student ready for real projects",
        "professional":       "a working professional with strong technical background",
        "research aspirant":  "someone preparing for research with deep technical interest"
    }
    skill_map = {
        "beginner":     "Use very simple language, avoid jargon, explain every concept from scratch.",
        "intermediate": "Use moderate technical language, briefly explain complex terms.",
        "advanced":     "Use full technical language, no need to simplify anything."
    }
    role = role_map.get(designation.lower(), "a college student")
    skill = skill_map.get(skill_level.lower(), "Use moderate technical language.")
    return f"You are explaining to {role}. {skill}"


# -------------------------------------------------------
# LIGHT SUMMARIZATION — for feed view (fast, low tokens)
# -------------------------------------------------------

def summarize_paper_light(
    paper: Paper,
    designation: str = "college student",
    skill_level: str = "intermediate",
    db: Session = None
) -> Paper:
    # cache check — if already summarized, return as is
    if paper.summary_one_min:
        return paper

    role_context = get_role_context(designation, skill_level)

    prompt = f"""
{role_context}

You are given a research paper. Your job is to return a JSON object only.
No explanation, no markdown, no extra text. Just raw JSON.

Paper Title: {paper.title}
Abstract: {paper.abstract}

Return exactly this JSON structure:
{{
  "summary_one_min": "A 3-4 sentence simple overview of what this paper is about and why it matters.",
  "difficulty_score": <a float between 1.0 and 10.0 representing how hard this is to understand or build upon>
}}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )

    raw = response.choices[0].message.content.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # if Groq returns extra text, try to extract JSON from it
        start = raw.find("{")
        end = raw.rfind("}") + 1
        data = json.loads(raw[start:end])

    paper.summary_one_min = data.get("summary_one_min", "")
    paper.difficulty_score = float(data.get("difficulty_score", 5.0))

    if db:
        db.commit()
        db.refresh(paper)

    return paper


# -------------------------------------------------------
# FULL SUMMARIZATION — for paper detail page (rich, complete)
# -------------------------------------------------------

def summarize_paper_full(
    paper: Paper,
    designation: str = "college student",
    skill_level: str = "intermediate",
    db: Session = None
) -> Paper:
    # cache check — if already fully summarized, return as is
    if paper.summary_deep and paper.build_ideas:
        return paper

    role_context = get_role_context(designation, skill_level)

    prompt = f"""
{role_context}

You are given a research paper. Your job is to return a JSON object only.
No explanation, no markdown, no extra text. Just raw JSON.

Paper Title: {paper.title}
Authors: {", ".join(paper.authors) if paper.authors else "Unknown"}
Abstract: {paper.abstract}

Return exactly this JSON structure:
{{
  "summary_one_min": "3-4 sentence simple overview of what this paper is about and why it matters.",
  "summary_five_min": "A detailed 8-10 sentence breakdown covering the problem, approach, methodology, results, and significance.",
  "summary_deep": "A thorough technical explanation covering background, core contributions, key findings, limitations, and future directions. Minimum 200 words.",
  "build_ideas": "3 specific, practical project ideas a student can build inspired by this paper. Each idea should include what to build and why it is useful.",
  "suggested_stack": ["technology1", "technology2", "technology3", "technology4"],
  "difficulty_score": <float between 1.0 and 10.0>,
  "estimated_build_time": "e.g. 2-3 weeks for a beginner, 4-5 days for an advanced developer"
}}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )

    raw = response.choices[0].message.content.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            try:
                data = json.loads(raw[start:end])
            except json.JSONDecodeError:
                data = {}
        else:
            data = {}

    paper.summary_one_min    = data.get("summary_one_min", paper.summary_one_min or "")
    paper.summary_five_min   = data.get("summary_five_min", "")
    paper.summary_deep       = data.get("summary_deep", "")
    paper.build_ideas        = data.get("build_ideas", "")
    paper.suggested_stack    = data.get("suggested_stack", [])
    
    # Safe float conversion
    try:
        score_raw = data.get("difficulty_score", 5.0)
        paper.difficulty_score = float(score_raw)
    except (ValueError, TypeError):
        paper.difficulty_score = 5.0

    paper.estimated_build_time = data.get("estimated_build_time", "")

    if db:
        db.commit()
        db.refresh(paper)

    return paper


# -------------------------------------------------------
# BATCH LIGHT SUMMARIZATION — for loading feed efficiently
# -------------------------------------------------------

def summarize_feed_batch(
    papers: list[Paper],
    designation: str = "college student",
    skill_level: str = "intermediate",
    db: Session = None
) -> list[Paper]:
    """
    Takes a list of papers, skips already summarized ones,
    summarizes the rest one by one and caches results.
    Returns all papers with summaries filled in.
    """
    for paper in papers:
        if not paper.summary_one_min:
            summarize_paper_light(paper, designation, skill_level, db)
    return papers
