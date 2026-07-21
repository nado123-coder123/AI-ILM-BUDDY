"""
Browse endpoints for the Hadith Library screen — collections, books
within a collection, and hadiths within a book. Separate from the RAG
search in hadith.py's /search route, same reasoning as the Quran reader:
sequential browsing isn't a similarity search, and proxying Sunnah.com
directly means this works even before ingestion has run.
"""
import httpx

from app.config import get_settings
from app.models.schemas import HadithBookMeta, HadithCollectionMeta, HadithDetail


def _headers(api_key: str) -> dict:
    return {"x-api-key": api_key}


def list_collections() -> list[HadithCollectionMeta]:
    settings = get_settings()
    if not settings.sunnah_api_key:
        raise RuntimeError("SUNNAH_API_KEY not configured — register at sunnah.com/developers")

    resp = httpx.get(
        f"{settings.sunnah_api_base}/collections",
        headers=_headers(settings.sunnah_api_key),
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()["data"]

    return [
        HadithCollectionMeta(
            name=c["name"],
            title=c.get("title", c["name"]),
            total_hadiths=c.get("totalHadith"),
            total_books=c.get("totalAvailableHadith"),
        )
        for c in data
    ]


def list_books(collection: str) -> list[HadithBookMeta]:
    settings = get_settings()
    if not settings.sunnah_api_key:
        raise RuntimeError("SUNNAH_API_KEY not configured — register at sunnah.com/developers")

    resp = httpx.get(
        f"{settings.sunnah_api_base}/collections/{collection}/books",
        headers=_headers(settings.sunnah_api_key),
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()["data"]

    return [
        HadithBookMeta(
            book_number=str(b["bookNumber"]),
            name=b.get("book", [{}])[0].get("name", f"Book {b['bookNumber']}"),
            number_of_hadiths=b.get("numberOfHadith"),
        )
        for b in data
    ]


def list_hadiths_in_book(collection: str, book_number: str) -> list[HadithDetail]:
    settings = get_settings()
    if not settings.sunnah_api_key:
        raise RuntimeError("SUNNAH_API_KEY not configured — register at sunnah.com/developers")

    resp = httpx.get(
        f"{settings.sunnah_api_base}/collections/{collection}/books/{book_number}/hadiths",
        headers=_headers(settings.sunnah_api_key),
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()["data"]

    results = []
    for h in data:
        english = next((c for c in h.get("hadith", []) if c.get("lang") == "en"), {})
        arabic = next((c for c in h.get("hadith", []) if c.get("lang") == "ar"), {})
        results.append(
            HadithDetail(
                collection=collection,
                book_number=str(book_number),
                hadith_number=str(h.get("hadithNumber", "")),
                arabic_text=arabic.get("body"),
                translation=english.get("body", ""),
                narrator=english.get("chapter", {}).get("chapterEnglish"),
                authenticity=english.get("grades", [{}])[0].get("grade")
                if english.get("grades") else None,
            )
        )
    return results
