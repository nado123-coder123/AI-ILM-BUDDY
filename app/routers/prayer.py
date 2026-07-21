from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import MonthlyPrayerDay, PrayerTimings
from app.services.prayer_service import get_daily_timings, get_monthly_timings

router = APIRouter(prefix="/prayer-times", tags=["prayer-times"])


@router.get("", response_model=PrayerTimings)
def daily_prayer_times(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    date: str | None = Query(None, description="DD-MM-YYYY, defaults to today"),
    method: int | None = Query(None, description="Aladhan calculation method ID"),
) -> PrayerTimings:
    try:
        return get_daily_timings(lat, lng, date, method)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not fetch prayer times: {exc}")


@router.get("/monthly", response_model=list[MonthlyPrayerDay])
def monthly_prayer_times(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=1900, le=2200),
    method: int | None = Query(None),
) -> list[MonthlyPrayerDay]:
    try:
        return get_monthly_timings(lat, lng, month, year, method)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not fetch monthly schedule: {exc}")
