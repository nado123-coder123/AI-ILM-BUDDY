from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import AuthenticatedUser, get_current_user
from app.models.schemas import TasbeehDay, TasbeehProgress, TasbeehSession
from app.services.tasbeeh_service import get_history, get_progress, log_session

router = APIRouter(prefix="/tasbeeh", tags=["tasbeeh"])


@router.post("/sessions", response_model=TasbeehDay)
def create_session(
    session: TasbeehSession, user: AuthenticatedUser = Depends(get_current_user)
) -> TasbeehDay:
    try:
        return log_session(user.uid, session)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Could not save session: {exc}")


@router.get("/progress", response_model=TasbeehProgress)
def progress(
    date: str | None = Query(None, description="YYYY-MM-DD, defaults to today"),
    goal: int | None = Query(None, description="Daily dhikr goal to check against"),
    user: AuthenticatedUser = Depends(get_current_user),
) -> TasbeehProgress:
    try:
        return get_progress(user.uid, date, goal)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Could not fetch progress: {exc}")


@router.get("/history", response_model=list[TasbeehDay])
def history(
    limit: int = Query(30, ge=1, le=365),
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[TasbeehDay]:
    try:
        return get_history(user.uid, limit)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Could not fetch history: {exc}")
