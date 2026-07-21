"""
Hijri date conversion and Ramadan countdown via Aladhan (same provider as
prayer times, so no new dependency). Sehri/Iftar are just Fajr/Maghrib
under different names, so this wraps prayer_service rather than
duplicating the calculation.
"""
from datetime import date as date_cls, datetime

import httpx

from app.config import get_settings
from app.models.schemas import HijriDateResponse, RamadanCountdown, SehriIftarTimes
from app.services.prayer_service import get_daily_timings

RAMADAN_MONTH_NUMBER = 9


def get_hijri_date(gregorian_date: str | None = None) -> HijriDateResponse:
    settings = get_settings()
    date_str = gregorian_date or date_cls.today().strftime("%d-%m-%Y")

    resp = httpx.get(f"{settings.aladhan_api_base}/gToH/{date_str}", timeout=15)
    resp.raise_for_status()
    hijri = resp.json()["data"]["hijri"]

    return HijriDateResponse(
        gregorian_date=date_str,
        hijri_date=hijri["date"],
        hijri_day=int(hijri["day"]),
        hijri_month_number=int(hijri["month"]["number"]),
        hijri_month_name=hijri["month"]["en"],
        hijri_year=int(hijri["year"]),
    )


def get_ramadan_countdown() -> RamadanCountdown:
    settings = get_settings()
    today = date_cls.today()
    today_str = today.strftime("%d-%m-%Y")

    current_hijri = get_hijri_date(today_str)
    is_ramadan_now = current_hijri.hijri_month_number == RAMADAN_MONTH_NUMBER

    # Find which Hijri year's Ramadan we're counting down to
    target_hijri_year = current_hijri.hijri_year
    if current_hijri.hijri_month_number > RAMADAN_MONTH_NUMBER:
        target_hijri_year += 1

    # Convert the 1st of that Ramadan back to a Gregorian date
    resp = httpx.get(
        f"{settings.aladhan_api_base}/hToG/01-{RAMADAN_MONTH_NUMBER:02d}-{target_hijri_year}",
        timeout=15,
    )
    resp.raise_for_status()
    gregorian = resp.json()["data"]["gregorian"]["date"]  # DD-MM-YYYY
    ramadan_start = datetime.strptime(gregorian, "%d-%m-%Y").date()

    days_remaining = max((ramadan_start - today).days, 0)

    return RamadanCountdown(
        today_gregorian=today.strftime("%d-%m-%Y"),
        ramadan_start_gregorian=gregorian,
        hijri_year=target_hijri_year,
        days_remaining=days_remaining,
        is_ramadan_now=is_ramadan_now,
    )


def get_sehri_iftar(latitude: float, longitude: float, date: str | None = None) -> SehriIftarTimes:
    timings = get_daily_timings(latitude, longitude, date)
    return SehriIftarTimes(
        date_gregorian=timings.date_gregorian,
        sehri_end=timings.fajr,
        iftar_time=timings.maghrib,
    )
