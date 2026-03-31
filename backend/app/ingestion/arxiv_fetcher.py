import httpx
import xml.etree.ElementTree as ET
from datetime import datetime

ARXIV_API = "https://export.arxiv.org/api/query"

async def fetch_papers(field: str = "AI", user_query: str = "", max_results: int = 10):
    # Combine field and user description into search query
    # Restored to a more inclusive format to bring back quantity and diversity
    if user_query:
        search_query = f"all:{user_query} AND (all:{field} OR all:AI OR all:\"Computer Science\")"
    else:
        search_query = f"all:{field}" if " " not in field else f"all:\"{field}\""

    params = {
        "search_query": search_query,
        "start": 0,
        "max_results": max_results,
        "sortBy": "submittedDate",
        "sortOrder": "descending"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(ARXIV_API, params=params, timeout=30)
        response.raise_for_status()

    return parse_arxiv_response(response.text)


def parse_arxiv_response(xml_text: str):
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    root = ET.fromstring(xml_text)
    papers = []

    for entry in root.findall("atom:entry", ns):
        arxiv_id_full = entry.find("atom:id", ns).text
        arxiv_id = arxiv_id_full.split("/abs/")[-1]

        title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
        abstract = entry.find("atom:summary", ns).text.strip().replace("\n", " ")

        authors = [
            author.find("atom:name", ns).text
            for author in entry.findall("atom:author", ns)
        ]

        published_str = entry.find("atom:published", ns).text
        published_date = datetime.strptime(published_str, "%Y-%m-%dT%H:%M:%SZ")

        papers.append({
            "arxiv_id": arxiv_id,
            "title": title,
            "authors": authors,
            "abstract": abstract,
            "source_url": arxiv_id_full,
            "published_date": published_date.isoformat(),
        })

    return papers