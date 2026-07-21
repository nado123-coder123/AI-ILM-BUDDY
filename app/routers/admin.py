"""
Content moderation for the admin dashboard. Every route requires a
verified Firebase ID token carrying the 'admin' custom claim (set via
`firebase_admin.auth.set_custom_user_claims(uid, {"admin": True})` from
a trusted context — never expose an endpoint that lets a client set this
on themselves).
"""
from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import AuthenticatedUser, get_current_user, require_admin
from app.services.firebase_service import get_firebase_service

router = APIRouter(prefix="/admin", tags=["admin"])


def _admin(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    return require_admin(user)


@router.get("/quran/{doc_id}")
def get_ayah_record(doc_id: str, admin: AuthenticatedUser = Depends(_admin)) -> dict:
    record = get_firebase_service().get_ayah(doc_id)
    if not record:
        raise HTTPException(status_code=404, detail="Ayah record not found")
    return record


@router.put("/quran/{doc_id}")
def update_ayah_record(
    doc_id: str, data: dict, admin: AuthenticatedUser = Depends(_admin)
) -> dict:
    get_firebase_service().upsert_ayah(doc_id, data)
    return {"status": "updated", "doc_id": doc_id}


@router.get("/hadith/{doc_id}")
def get_hadith_record(doc_id: str, admin: AuthenticatedUser = Depends(_admin)) -> dict:
    record = get_firebase_service().get_hadith(doc_id)
    if not record:
        raise HTTPException(status_code=404, detail="Hadith record not found")
    return record


@router.put("/hadith/{doc_id}")
def update_hadith_record(
    doc_id: str, data: dict, admin: AuthenticatedUser = Depends(_admin)
) -> dict:
    get_firebase_service().upsert_hadith(doc_id, data)
    return {"status": "updated", "doc_id": doc_id}


@router.get("/chat-logs")
def recent_chat_logs(limit: int = 50, admin: AuthenticatedUser = Depends(_admin)) -> list[dict]:
    """Review recent chatbot answers for quality/hallucination spot-checks."""
    firebase = get_firebase_service()
    query = firebase.db.collection("chat_logs").order_by(
        "created_at", direction="DESCENDING"
    ).limit(limit)
    return [doc.to_dict() for doc in query.stream()]
