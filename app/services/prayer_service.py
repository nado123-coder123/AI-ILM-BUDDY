"""
Prayer timings via the Aladhan API (free, no key). Aladhan handles the
actual astronomical calculation (sun position, calculation-method
conventions like ISNA/MWL/Umm al-Qura) so we don't reimplement solar
calculations — that's exactly the kind of domain-specific correctness
work worth outsourcing to a maintained, widely-used service.
"""
import httpx

from app.config import get_settings
from app.models.schemas import MonthlyPrayerDay, PrayerTimings


def _extract_timings(day_data: dict) -> dict:
    timings = day_data["timings"]
    # Aladhan returns values like "05:12 (+05)" — strip the timezone suffix
    clean = {k: v.split(" ")[0] for k, v in timings.items()}
    return clean


def get_daily_timings(
    latitude: float, longitude: float, date: str | None = None, method: int | None = None
) -> PrayerTimings:
    settings = get_settings()
    method = method or settings.default_calculation_method
    endpoint = f"{settings.aladhan_api_base}/timings/{date}" if date else f"{settings.aladhan_api_base}/timings"

    resp = httpx.get(
        endpoint,
        params={"latitude": latitude, "longitude": longitude, "method": method},
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()["data"]
    timings = _extract_timings(data)

    return PrayerTimings(
        fajr=timings["Fajr"],
        dhuhr=timings["Dhuhr"],
        asr=timings["Asr"],
        maghrib=timings["Maghrib"],
        isha=timings["Isha"],
        sunrise=timings.get("Sunrise"),
        date_gregorian=data["date"]["gregorian"]["date"],
        date_hijri=data["date"]["hijri"]["date"],
        timezone=data["meta"]["timezone"],
    )


def get_monthly_timings(
    latitude: float, longitude: float, month: int, year: int, method: int | None = None
) -> list[MonthlyPrayerDay]:
    settings = get_settings()
    method = method or settings.default_calculation_method

    resp = httpx.get(
        f"{settings.aladhan_api_base}/calendar/{year}/{month}",
        params={"latitude": latitude, "longitude": longitude, "method": method},
        timeout=15,
    )
    resp.raise_for_status()
    days = resp.json()["data"]

    result = []
    for day_data in days:
        timings = _extract_timings(day_data)
        result.append(
            MonthlyPrayerDay(
                date_gregorian=day_data["date"]["gregorian"]["date"],
                date_hijri=day_data["date"]["hijri"]["date"],
                fajr=timings["Fajr"],
                dhuhr=timings["Dhuhr"],
                asr=timings["Asr"],
                maghrib=timings["Maghrib"],
                isha=timings["Isha"],
            )
        )
    return result
