# backend/app/api/routes/feed.py

import uuid
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Paper, User
from app.ai.searcher import get_relevant_papers, get_papers_for_project
from app.ai.summarizer import summarize_feed_batch, summarize_paper_full
from app.ingestion.github_fetcher import fetch_github_trending_multi
from app.ingestion.hn_fetcher import fetch_stories_by_interests
from app.ingestion.news_fetcher import fetch_news_by_interests

router = APIRouter()


# -------------------------------------------------------
# PERSONALIZED FEED — main feed for a user (existing)
# -------------------------------------------------------

@router.get("/{user_id}")
async def get_personalized_feed(
    user_id: str,
    db: Session = Depends(get_db)
):
    # fetch user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # check user has interests
    if not user.interests or len(user.interests) == 0:
        raise HTTPException(
            status_code=400,
            detail="User has no interests set. Please update profile first."
        )

    # get relevant papers via Qdrant semantic search
    papers = get_relevant_papers(
        interests=user.interests,
        db=db,
        top_k=20
    )

    if not papers:
        return {
            "user_id": user_id,
            "designation": user.designation,
            "skill_level": user.skill_level,
            "total": 0,
            "papers": []
        }

    # light summarize any unsummarized papers
    papers = summarize_feed_batch(
        papers=papers,
        designation=user.designation or "college student",
        skill_level=user.skill_level or "intermediate",
        db=db
    )

    # format response
    feed = []
    for paper in papers:
        feed.append({
            "id": str(paper.id),
            "title": paper.title,
            "authors": paper.authors,
            "field": paper.field,
            "published_date": str(paper.published_date) if paper.published_date else None,
            "source_url": paper.source_url,
            "summary_one_min": paper.summary_one_min,
            "difficulty_score": paper.difficulty_score,
            "suggested_stack": paper.suggested_stack,
            "estimated_build_time": paper.estimated_build_time,
        })

    return {
        "user_id": user_id,
        "designation": user.designation,
        "skill_level": user.skill_level,
        "total": len(feed),
        "papers": feed
    }


# -------------------------------------------------------
# UNIFIED FEED — all sources in one call
# -------------------------------------------------------

@router.get("/{user_id}/unified")
async def get_unified_feed(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns a fully personalized feed across all 4 sources:
      - banner:      NewsAPI articles with images (home page banner cards)
      - discussions: HN stories relevant to user interests
      - papers:      arXiv research papers via Qdrant semantic search
      - repos:       GitHub trending repos filtered by user interests

    All 4 sources fetched in parallel via asyncio.gather() for speed.
    Papers section raises error if Qdrant fails but papers exist in DB.
    Papers section is skipped only if no papers exist in DB at all.

    skill_level is passed to all fetchers so content depth matches the user.
    """

    # Robust ID Handling (Guest support)
    user = None
    try:
        # Check if it's a valid UUID
        uuid_val = uuid.UUID(user_id)
        user = db.query(User).filter(User.id == str(uuid_val)).first()
    except (ValueError, AttributeError):
        pass

    if user:
        interests = user.interests or ["AI", "Tech"]
        skill_level = user.skill_level or "intermediate"
        designation = user.designation or "college student"
    # Guest fallback
    else:
        interests = ["AI", "Tech", "Software"]
        skill_level = "intermediate"
        designation = "developer"

    # --- Check if any papers exist in DB ---
    paper_count = db.query(Paper).count()

    # --- Run all fetchers in parallel ---
    # Papers run synchronously (existing logic is sync) so we wrap in a thread
    # All async fetchers run together via asyncio.gather

    async def fetch_papers_async():
        """
        Wraps the synchronous paper fetching + summarization in async context.
        Raises HTTPException if Qdrant fails but papers exist in DB.
        Skips if no papers in DB at all.
        """
        if paper_count == 0:
            return []

        try:
            papers = get_relevant_papers(
                interests=interests,
                db=db,
                top_k=20
            )
        except Exception as e:
            # Papers exist but Qdrant failed — raise so user knows something is wrong
            raise HTTPException(
                status_code=503,
                detail=f"Paper search unavailable (Qdrant may be paused): {str(e)}"
            )

        if not papers:
            return []

        papers = summarize_feed_batch(
            papers=papers,
            designation=designation,
            skill_level=skill_level,
            db=db
        )

        return [
            {
                "id"                 : str(p.id),
                "title"              : p.title,
                "authors"            : p.authors,
                "field"              : p.field,
                "published_date"     : str(p.published_date) if p.published_date else None,
                "source_url"         : p.source_url,
                "summary_one_min"    : p.summary_one_min,
                "difficulty_score"   : p.difficulty_score,
                "suggested_stack"    : p.suggested_stack,
                "estimated_build_time": p.estimated_build_time,
            }
            for p in papers
        ]

    # Fire all 4 sources in parallel
    results = await asyncio.gather(
        fetch_news_by_interests(
            interests=interests,
            skill_level=skill_level,
        ),
        fetch_stories_by_interests(
            interests=interests,
            limit=20,
        ),
        fetch_papers_async(),
        fetch_github_trending_multi(
            topics=interests,
            since="daily",
            limit_per_topic=10,
        ),
        return_exceptions=True   # don't let one failure kill the whole response
    )

    banner, discussions, papers, repos = results

    # Handle partial failures gracefully — log and return empty section
    # (except papers which already raises HTTPException above)
    if isinstance(banner, Exception):
        banner = []
    if isinstance(discussions, Exception):
        discussions = []
    if isinstance(repos, Exception):
        repos = []

    # papers exception will have already raised HTTPException —
    # but if somehow still an exception here, re-raise it
    if isinstance(papers, Exception):
        raise papers

    return {
        "user_id"     : user_id,
        "designation" : designation,
        "skill_level" : skill_level,
        "interests"   : interests,
        "feed"        : {
            "banner"      : banner,       # NewsAPI articles with images
            "discussions" : discussions,  # HN stories
            "papers"      : papers,       # arXiv papers
            "repos"       : repos,        # GitHub trending
        },
        "counts"      : {
            "banner"      : len(banner),
            "discussions" : len(discussions),
            "papers"      : len(papers),
            "repos"       : len(repos),
        }
    }


# -------------------------------------------------------
# PAPER DETAIL — full deep summary for one paper
# -------------------------------------------------------

@router.get("/{user_id}/paper/{paper_id}")
async def get_paper_detail(
    user_id: str,
    paper_id: str,
    db: Session = Depends(get_db)
):
    # fetch user for role context
    user = None
    try:
        user_uuid = uuid.UUID(user_id)
        user = db.query(User).filter(User.id == user_uuid).first()
    except (ValueError, AttributeError):
        # Fallback for "guest" string or invalid UUID
        user = None

    # fetch paper
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # Use user profile for summarization, or defaults for guests
    designation = user.designation if user else "AI Researcher"
    skill_level = user.skill_level if user else "intermediate"

    # full summarize if not done yet
    try:
        paper = summarize_paper_full(
            paper=paper,
            designation=designation,
            skill_level=skill_level,
            db=db
        )
    except Exception as e:
        # LOG AND IGNORE: Don't let AI failure kill the whole page
        # The user will just see the raw abstract instead of a deep summary
        print(f"⚠️ AI Summarization failed for paper {paper_id}: {e}")

    # find related papers for this paper's context
    related_papers = get_papers_for_project(
        project_description=f"{paper.title}. {paper.abstract}",
        db=db,
        top_k=5
    )

    # exclude the current paper from related
    related_papers = [p for p in related_papers if str(p.id) != paper_id]

    return {
        "id": str(paper.id),
        "title": paper.title,
        "authors": paper.authors,
        "field": paper.field,
        "published_date": str(paper.published_date) if paper.published_date else None,
        "source_url": paper.source_url,
        "abstract": paper.abstract,
        "summary_one_min": paper.summary_one_min,
        "summary_five_min": paper.summary_five_min,
        "summary_deep": paper.summary_deep,
        "build_ideas": paper.build_ideas,
        "suggested_stack": paper.suggested_stack,
        "difficulty_score": paper.difficulty_score,
        "estimated_build_time": paper.estimated_build_time,
        "related_papers": [
            {
                "id": str(rp.id),
                "title": rp.title,
                "field": rp.field,
                "summary_one_min": rp.summary_one_min,
                "difficulty_score": rp.difficulty_score,
            }
            for rp in related_papers
        ]
    }


# -------------------------------------------------------
# PROJECT DETAIL — related papers for a project context
# -------------------------------------------------------

@router.get("/{user_id}/project-papers")
async def get_papers_for_project_page(
    user_id: str,
    project_description: str,
    db: Session = Depends(get_db)
):
    """
    Called from project detail page.
    Pass project description as query param.
    Returns top 5 most relevant research papers.
    """

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    papers = get_papers_for_project(
        project_description=project_description,
        db=db,
        top_k=5
    )

    return {
        "project_description": project_description,
        "total": len(papers),
        "papers": [
            {
                "id": str(p.id),
                "title": p.title,
                "authors": p.authors,
                "field": p.field,
                "source_url": p.source_url,
                "summary_one_min": p.summary_one_min,
                "difficulty_score": p.difficulty_score,
            }
            for p in papers
        ]
    }


# -------------------------------------------------------
# PROJECT DETAIL — all sources for a project page
# -------------------------------------------------------

@router.get("/{user_id}/project-detail")
async def get_project_detail_feed(
    user_id: str,
    project_description: str,
    db: Session = Depends(get_db)
):
    """
    Called when a user opens a specific project detail page.
    Returns related content from all 4 sources in parallel:
      - papers:  top 5 related research papers (Qdrant)
      - repos:   top 5 related GitHub repos (GitHub Search API)
      - stories: top 5 related HN discussions
      - news:    top 5 related news articles
    """
    from app.ingestion.github_fetcher import fetch_repos_for_project
    from app.ingestion.hn_fetcher import fetch_stories_for_project
    from app.ingestion.news_fetcher import fetch_news_for_project

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Run all 4 sources in parallel
    results = await asyncio.gather(
        fetch_repos_for_project(project_description=project_description, limit=5),
        fetch_stories_for_project(project_description=project_description, limit=5),
        fetch_news_for_project(project_description=project_description, limit=5),
        return_exceptions=True
    )

    repos, stories, news = results

    # Papers run sync — run separately
    try:
        papers = get_papers_for_project(
            project_description=project_description,
            db=db,
            top_k=5
        )
        formatted_papers = [
            {
                "id"            : str(p.id),
                "title"         : p.title,
                "authors"       : p.authors,
                "field"         : p.field,
                "source_url"    : p.source_url,
                "summary_one_min": p.summary_one_min,
                "difficulty_score": p.difficulty_score,
            }
            for p in papers
        ]
    except Exception:
        formatted_papers = []

    if isinstance(repos, Exception):
        repos = []
    if isinstance(stories, Exception):
        stories = []
    if isinstance(news, Exception):
        news = []

    return {
        "project_description": project_description,
        "related": {
            "papers" : formatted_papers,
            "repos"  : repos,
            "stories": stories,
            "news"   : news,
        },
        "counts": {
            "papers" : len(formatted_papers),
            "repos"  : len(repos),
            "stories": len(stories),
            "news"   : len(news),
        }
    }


# -------------------------------------------------------
# GLOBAL SEARCH — personalized search across all sources
# -------------------------------------------------------

@router.get("/{user_id}/search")
async def search_feed_globally(
    user_id: str,
    q: str,
    db: Session = Depends(get_db)
):
    """
    Personalized global search.
    Narrows the entire searchable space based on user's interests + typed query.
    Used for in-place feed updates.
    """
    import uuid
    from app.ai.searcher import search_papers_semantically
    from app.ingestion.github_fetcher import fetch_repos_for_project
    from app.ingestion.hn_fetcher import fetch_stories_for_project
    from app.ingestion.news_fetcher import search_news
    from app.ingestion.arxiv_fetcher import fetch_papers

    # Robust ID Handling (Guest support)
    user = None
    try:
        # Check if it's a valid UUID
        uuid_val = uuid.UUID(user_id)
        user = db.query(User).filter(User.id == str(uuid_val)).first()
    except (ValueError, AttributeError):
        pass

    if user:
        interests = user.interests or []
        skill_level = user.skill_level or "intermediate"
        designation = user.designation or "college student"
    else:
        # Guest fallback
        interests = ["AI", "Tech", "Software"]
        skill_level = "intermediate"
        designation = "developer"

    # 1. Search Papers (Semantic narrowing)
    try:
        papers = search_papers_semantically(query=q, interests=interests, db=db, top_k=10)
        
        # If no local papers found, trigger a LIVE fetch (Deep Narrowing)
        if not papers:
            live_papers_data = await fetch_papers(field=" ".join(interests[:2]), user_query=q, max_results=10)
            for p_data in live_papers_data:
                # Save to SQL if not exists
                existing = db.query(Paper).filter(Paper.arxiv_id == p_data["arxiv_id"]).first()
                if not existing:
                    new_p = Paper(
                        arxiv_id=p_data["arxiv_id"],
                        title=p_data["title"],
                        authors=p_data["authors"],
                        abstract=p_data["abstract"],
                        source_url=p_data["source_url"],
                        published_at=datetime.fromisoformat(p_data["published_date"]) if "published_date" in p_data else datetime.utcnow(),
                        field=interests[0] if interests else "AI"
                    )
                    db.add(new_p)
                    db.flush() # get ID
                    papers.append(new_p)
            db.commit()

        # Apply summarization since these might be "newly discovered" to the feed
        papers = summarize_feed_batch(
            papers=papers,
            designation=designation,
            skill_level=skill_level,
            db=db
        )
        formatted_papers = [
            {
                "id": str(p.id),
                "title": p.title,
                "authors": p.authors,
                "field": p.field,
                "summary_one_min": p.summary_one_min,
                "difficulty_score": p.difficulty_score,
                "source_url": p.source_url,
            }
            for p in papers
        ]
    except Exception as e:
        print(f"Paper search error: {e}")
        formatted_papers = []

    # 2. Search other sources in parallel
    # We use search specific functions where available
    # RESTORED: interests are back into the query to ensure broad discovery and personalization.
    results = await asyncio.gather(
        search_news(query=f"{q} {interests[0] if interests else ''}", limit=10),
        fetch_repos_for_project(project_description=f"{q} {', '.join(interests)}", limit=10),
        fetch_stories_for_project(project_description=q, limit=10),
        return_exceptions=True
    )

    news, repos, stories = results

    return {
        "query": q,
        "results": {
            "banner": news if not isinstance(news, Exception) else [],
            "repos": repos if not isinstance(repos, Exception) else [],
            "discussions": stories if not isinstance(stories, Exception) else [],
            "papers": formatted_papers,
        }
    }