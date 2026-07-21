"""
Mosque Finder via Google Places Nearby Search. Unlike every other service
in this backend, this genuinely needs a paid credential from you — Google
requires billing enabled on the project even within the free monthly
credit. Get a key at https://console.cloud.google.com/google/maps-apis
(enable "Places API"), set GOOGLE_PLACES_API_KEY, and restrict the key to
Places API + your server's IP in the Cloud Console for safety.

This endpoint could not be exercised against the real Google API in the
build/verification environment (googleapis.com isn't network-reachable
there) — the code below is correct against Google's documented response
shape, but you should smoke-test it once your key is in place.
"""
import math

import httpx

from app.config import get_settings
from app.models.schemas import Mosque


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_nearby_mosques(latitude: float, longitude: float, radius_meters: int | None = None) -> list[Mosque]:
    settings = get_settings()
    if not settings.google_places_api_key:
        raise RuntimeError(
            "GOOGLE_PLACES_API_KEY not configured — get one at "
            "console.cloud.google.com/google/maps-apis (enable Places API, billing required)"
        )

    radius = radius_meters or settings.mosque_search_radius_meters
    resp = httpx.get(
        f"{settings.google_places_api_base}/nearbysearch/json",
        params={
            "location": f"{latitude},{longitude}",
            "radius": radius,
            "keyword": "mosque",
            "type": "mosque",
            "key": settings.google_places_api_key,
        },
        timeout=15,
    )
    resp.raise_for_status()
    body = resp.json()

    if body.get("status") not in ("OK", "ZERO_RESULTS"):
        raise RuntimeError(f"Google Places error: {body.get('status')} — {body.get('error_message', '')}")

    mosques = []
    for place in body.get("results", []):
        loc = place["geometry"]["location"]
        mosques.append(
            Mosque(
                place_id=place["place_id"],
                name=place["name"],
                address=place.get("vicinity", ""),
                latitude=loc["lat"],
                longitude=loc["lng"],
                distance_km=round(_haversine_km(latitude, longitude, loc["lat"], loc["lng"]), 2),
                rating=place.get("rating"),
                is_open_now=place.get("opening_hours", {}).get("open_now"),
            )
        )

    mosques.sort(key=lambda m: m.distance_km or float("inf"))
    return mosques
