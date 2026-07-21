from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import HijriDateResponse, RamadanCountdown, SehriIftarTimes
from app.services.calendar_service import (
    get_hijri_date,
    get_ramadan_countdown,
    get_sehri_iftar,
)

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/hijri-date", response_model=HijriDateResponse)
def hijri_date(
    date: str | None = Query(None, description="DD-MM-YYYY, defaults to today"),
) -> HijriDateResponse:
    try:
        return get_hijri_date(date)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not convert date: {exc}")


@router.get("/ramadan-countdown", response_model=RamadanCountdown)
def ramadan_countdown() -> RamadanCountdown:
    try:
        return get_ramadan_countdown()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not compute countdown: {exc}")


@router.get("/sehri-iftar", response_model=SehriIftarTimes)
def sehri_iftar(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    date: str | None = Query(None, description="DD-MM-YYYY, defaults to today"),
) -> SehriIftarTimes:
    try:
        return get_sehri_iftar(lat, lng, date)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not fetch timings: {exc}")
