"""
Firebase Admin SDK wrapper. Firestore holds the canonical Quran/Hadith
text, user data, and app content so the mobile app and admin dashboard
can read/write through the standard Firebase client SDKs too — the
backend only needs this for ingestion and for enriching RAG results with
full record detail (tafsir, chapter titles, etc.) beyond what's cached in
the vector metadata.
"""
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore

from app.config import get_settings


class FirebaseService:
    def __init__(self, service_account_path: str):
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        self.db = firestore.client()

    # --- Quran ---
    def upsert_ayah(self, doc_id: str, data: dict) -> None:
        self.db.collection("quran_ayahs").document(doc_id).set(data, merge=True)

    def get_ayah(self, doc_id: str) -> dict | None:
        snap = self.db.collection("quran_ayahs").document(doc_id).get()
        return snap.to_dict() if snap.exists else None

    # --- Hadith ---
    def upsert_hadith(self, doc_id: str, data: dict) -> None:
        self.db.collection("hadiths").document(doc_id).set(data, merge=True)

    def get_hadith(self, doc_id: str) -> dict | None:
        snap = self.db.collection("hadiths").document(doc_id).get()
        return snap.to_dict() if snap.exists else None

    # --- Chat logs (for admin analytics / AI testing pipeline) ---
    def log_chat(self, session_id: str, question: str, answer: str, sources: list[dict]) -> None:
        self.db.collection("chat_logs").add(
            {
                "session_id": session_id,
                "question": question,
                "answer": answer,
                "sources": sources,
                "created_at": firestore.SERVER_TIMESTAMP,
            }
        )


@lru_cache
def get_firebase_service() -> FirebaseService:
    settings = get_settings()
    return FirebaseService(settings.firebase_service_account_path)
