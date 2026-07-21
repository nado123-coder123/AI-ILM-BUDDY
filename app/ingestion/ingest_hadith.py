"""
Ingests Hadith collections from the Sunnah.com API (requires a free API
key from https://sunnah.com/developers). Run as:
    python -m app.ingestion.ingest_hadith --collection bukhari
"""
import argparse

import httpx

from app.config import get_settings
from app.services.embedding_service import get_embedding_service
from app.services.vector_store import get_hadith_store


def fetch_collection_books(collection: str, api_key: str, api_base: str) -> list[dict]:
    resp = httpx.get(
        f"{api_base}/collections/{collection}/books",
        headers={"x-api-key": api_key},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["data"]


def fetch_hadiths(collection: str, book_number: int, api_key: str, api_base: str) -> list[dict]:
    resp = httpx.get(
        f"{api_base}/collections/{collection}/books/{book_number}/hadiths",
        headers={"x-api-key": api_key},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["data"]


def run(collection: str, use_firestore: bool = True) -> None:
    settings = get_settings()
    if not settings.sunnah_api_key:
        raise RuntimeError("SUNNAH_API_KEY not set — register at sunnah.com/developers")

    embedder = get_embedding_service()
    store = get_hadith_store()

    firebase = None
    if use_firestore:
        from app.services.firebase_service import get_firebase_service
        firebase = get_firebase_service()

    books = fetch_collection_books(collection, settings.sunnah_api_key, settings.sunnah_api_base)

    for book in books:
        hadiths = fetch_hadiths(
            collection, book["bookNumber"], settings.sunnah_api_key, settings.sunnah_api_base
        )
        texts, metadatas = [], []
        for h in hadiths:
            english = next((c for c in h.get("hadith", []) if c.get("lang") == "en"), {})
            record = {
                "collection": collection,
                "book": book.get("book", [{}])[0].get("name", ""),
                "hadith_number": str(h.get("hadithNumber", "")),
                "arabic_text": None,
                "translation": english.get("body", ""),
                "narrator": english.get("chapter", {}).get("chapterEnglish"),
                "authenticity": english.get("grades", [{}])[0].get("grade")
                if english.get("grades") else None,
            }
            doc_id = f"{collection}_{record['hadith_number']}"

            if firebase and record["translation"]:
                firebase.upsert_hadith(doc_id, record)

            if record["translation"]:
                texts.append(record["translation"])
                metadatas.append(record)

        if texts:
            vectors = embedder.embed(texts)
            store.add(vectors, metadatas)
        print(f"Ingested book {book.get('bookNumber')} ({len(texts)} hadiths)")

    print(f"Hadith ingestion complete for {collection}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--collection", default="bukhari")
    args = parser.parse_args()
    run(args.collection)
