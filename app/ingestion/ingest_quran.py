"""
One-time / rerunnable ingestion: pulls the full Quran (Arabic + an English
translation) from AlQuran Cloud, stores canonical records in Firestore, and
builds embeddings for semantic search. Run as: python -m app.ingestion.ingest_quran
"""
import httpx

from app.config import get_settings
from app.services.embedding_service import get_embedding_service
from app.services.vector_store import get_quran_store

ARABIC_EDITION = "quran-uthmani"
TRANSLATION_EDITION = "en.sahih"  # Saheeh International


def fetch_surah(surah_number: int, edition: str) -> dict:
    settings = get_settings()
    url = f"{settings.quran_api_base}/surah/{surah_number}/{edition}"
    resp = httpx.get(url, timeout=30)
    resp.raise_for_status()
    return resp.json()["data"]


def run(use_firestore: bool = True) -> None:
    embedder = get_embedding_service()
    store = get_quran_store()

    firebase = None
    if use_firestore:
        from app.services.firebase_service import get_firebase_service
        firebase = get_firebase_service()

    for surah_number in range(1, 115):
        arabic_data = fetch_surah(surah_number, ARABIC_EDITION)
        translation_data = fetch_surah(surah_number, TRANSLATION_EDITION)

        texts, metadatas = [], []
        for ar_ayah, tr_ayah in zip(arabic_data["ayahs"], translation_data["ayahs"]):
            record = {
                "surah": surah_number,
                "surah_name": arabic_data["englishName"],
                "ayah": ar_ayah["numberInSurah"],
                "arabic_text": ar_ayah["text"],
                "translation": tr_ayah["text"],
            }
            doc_id = f"{surah_number}_{ar_ayah['numberInSurah']}"

            if firebase:
                firebase.upsert_ayah(doc_id, record)

            texts.append(f"{record['translation']} ({record['surah_name']})")
            metadatas.append(record)

        vectors = embedder.embed(texts)
        store.add(vectors, metadatas)
        print(f"Ingested Surah {surah_number} ({len(texts)} ayahs)")

    print("Quran ingestion complete.")


if __name__ == "__main__":
    run()
