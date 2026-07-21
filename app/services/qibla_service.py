"""
Qibla direction computed locally via the great-circle initial bearing
formula — no external API call, no rate limits, always available offline
once the mobile app has the user's coordinates. Kaaba coordinates are a
fixed, well-known constant, so this needs no external dependency at all.
"""
import math

from app.models.schemas import QiblaResponse

KAABA_LAT = 21.4225
KAABA_LNG = 39.8262
EARTH_RADIUS_KM = 6371.0


def _to_radians(deg: float) -> float:
    return deg * math.pi / 180.0


def compute_qibla(latitude: float, longitude: float) -> QiblaResponse:
    lat1, lng1 = _to_radians(latitude), _to_radians(longitude)
    lat2, lng2 = _to_radians(KAABA_LAT), _to_radians(KAABA_LNG)
    delta_lng = lng2 - lng1

    # Initial bearing (forward azimuth) along the great circle to the Kaaba
    y = math.sin(delta_lng) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(delta_lng)
    bearing_rad = math.atan2(y, x)
    bearing_deg = (math.degrees(bearing_rad) + 360) % 360

    # Haversine great-circle distance
    a = (
        math.sin((lat2 - lat1) / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance_km = EARTH_RADIUS_KM * c

    return QiblaResponse(
        direction_degrees=round(bearing_deg, 2),
        distance_km=round(distance_km, 1),
        latitude=latitude,
        longitude=longitude,
    )
