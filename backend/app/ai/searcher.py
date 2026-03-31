# backend/app/ai/searcher.py

from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Filter
from app.core.config import settings
from app.db.models import Paper
from sqlalchemy.orm import Session

# reuse same model as embedder.py — no double loading
model = SentenceTransformer("all-MiniLM-L6-v2")

client = QdrantClient(
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
)

COLLECTION_NAME = settings.QDRANT_COLLECTION


# -------------------------------------------------------
# CORE SEARCH — vectorize interests, search Qdrant
# -------------------------------------------------------

def search_papers_by_interest(
    interests: list[str],
    top_k: int = 20
) -> list[str]:
    """
    Takes a list of interest strings from user profile.
    Combines them into one string, vectorizes it,
    searches Qdrant for top_k most similar papers.
    Returns list of paper_ids (PostgreSQL UUIDs).
    """

    # combine interests into one meaningful query string
    query_text = ", ".join(interests)

    # embed the query
    query_vector = model.encode(query_text).tolist()

    # query_vector = ... (embedding done above)

    from qdrant_client.models import QueryRequest
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        with_payload=True,
    ).points

    # extract paper_ids from payload
    paper_ids = []
    for hit in results:
        paper_id = hit.payload.get("paper_id")
        if paper_id:
            paper_ids.append(paper_id)

    return paper_ids


def search_papers_semantically(
    query: str,
    interests: list[str],
    db: Session,
    top_k: int = 20
) -> list[Paper]:
    """
    Advanced semantic search:
    Combines the user's profile interests with their specific search query.
    Ensures that "narrows things down" logic is applied.
    """
    # Combine interest context with the specific search term
    # Re-balanced to ensure broader interest discovery is not blocked by strict query intent
    combined_query = f"Searching for: {query}. Related context: {', '.join(interests)}"
    
    query_vector = model.encode(combined_query).tolist()
    
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        with_payload=True,
    ).points

    paper_ids = [
        hit.payload.get("paper_id")
        for hit in results
        if hit.payload.get("paper_id")
    ]

    if not paper_ids:
        return []

    papers = db.query(Paper).filter(Paper.id.in_(paper_ids)).all()
    paper_map = {str(p.id): p for p in papers}
    return [paper_map[pid] for pid in paper_ids if pid in paper_map]


# -------------------------------------------------------
# FETCH MATCHED PAPERS FROM POSTGRESQL
# -------------------------------------------------------

def get_relevant_papers(
    interests: list[str],
    db: Session,
    top_k: int = 20
) -> list[Paper]:
    """
    Full pipeline:
    interests → vector → Qdrant search → paper_ids → PostgreSQL fetch
    Returns list of Paper objects ordered by relevance.
    """

    paper_ids = search_papers_by_interest(interests, top_k)

    if not paper_ids:
        return []

    # fetch from PostgreSQL in one query
    papers = db.query(Paper).filter(
        Paper.id.in_(paper_ids)
    ).all()

    # reorder to match Qdrant relevance order
    paper_map = {str(p.id): p for p in papers}
    ordered_papers = [
        paper_map[pid]
        for pid in paper_ids
        if pid in paper_map
    ]

    return ordered_papers


# -------------------------------------------------------
# SEARCH BY SINGLE PROJECT CONTEXT
# used when user opens a project detail page
# finds related papers for that specific project
# -------------------------------------------------------

def get_papers_for_project(
    project_description: str,
    db: Session,
    top_k: int = 5
) -> list[Paper]:
    """
    Takes a project description string.
    Finds top 5 most relevant papers from Qdrant.
    Used on project detail page to show related research.
    """

    query_vector = model.encode(project_description).tolist()

    results = client.query_points(
    collection_name=COLLECTION_NAME,
    query=query_vector,
    limit=top_k,
    with_payload=True,
).points

    paper_ids = [
        hit.payload.get("paper_id")
        for hit in results
        if hit.payload.get("paper_id")
    ]

    if not paper_ids:
        return []

    papers = db.query(Paper).filter(
        Paper.id.in_(paper_ids)
    ).all()

    paper_map = {str(p.id): p for p in papers}
    return [paper_map[pid] for pid in paper_ids if pid in paper_map]