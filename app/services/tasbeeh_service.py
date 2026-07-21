"""
Tasbeeh session logging. The counter itself is a pure client-side
increment (no round-trip needed for every tap — that would be wasteful
and fragile offline); the backend only persists *completed* sessions so
history and daily-goal progress survive app reinstalls / device changes.
"""
from datetime import date as date_cls

from app.models.schemas import TasbeehDay, TasbeehProgress, TasbeehSession
from app.services.firebase_service import get_firebase_service


def log_session(user_id: str, session: TasbeehSession) -> TasbeehDay:
    day = session.date or date_cls.today().isoformat()
    firebase = get_firebase_service()
    doc_id = f"{user_id}_{day}_{session.dhikr}"

    existing = firebase.db.collection("tasbeeh_sessions").document(doc_id).get()
    prior_count = existing.to_dict().get("count", 0) if existing.exists else 0

    record = {
        "user_id": user_id,
        "dhikr": session.dhikr,
        "date": day,
        "count": prior_count + session.count,
    }
    firebase.db.collection("tasbeeh_sessions").document(doc_id).set(record)
    return TasbeehDay(date=day, dhikr=session.dhikr, count=record["count"])


def get_progress(user_id: str, day: str | None, goal: int | None) -> TasbeehProgress:
    day = day or date_cls.today().isoformat()
    firebase = get_firebase_service()

    query = (
        firebase.db.collection("tasbeeh_sessions")
        .where("user_id", "==", user_id)
        .where("date", "==", day)
    )
    sessions = [
        TasbeehDay(date=day, dhikr=doc.get("dhikr"), count=doc.get("count"))
        for doc in query.stream()
    ]
    total = sum(s.count for s in sessions)

    return TasbeehProgress(
        date=day,
        total_count=total,
        goal=goal,
        goal_met=(total >= goal) if goal is not None else None,
        sessions=sessions,
    )


def get_history(user_id: str, limit: int = 30) -> list[TasbeehDay]:
    firebase = get_firebase_service()
    query = (
        firebase.db.collection("tasbeeh_sessions")
        .where("user_id", "==", user_id)
        .order_by("date", direction="DESCENDING")
        .limit(limit)
    )
    return [
        TasbeehDay(date=doc.get("date"), dhikr=doc.get("dhikr"), count=doc.get("count"))
        for doc in query.stream()
    ]
