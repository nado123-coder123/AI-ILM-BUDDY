from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import Mosque
from app.services.mosque_service import find_nearby_mosques

router = APIRouter(prefix="/mosques", tags=["mosques"])


@router.get("/nearby", response_model=list[Mosque])
def nearby(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius_m: int = Query(5000, ge=100, le=50000),
) -> list[Mosque]:
    try:
        return find_nearby_mosques(lat, lng, radius_m)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not fetch nearby mosques: {exc}")
