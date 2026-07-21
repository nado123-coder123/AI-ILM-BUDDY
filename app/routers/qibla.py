from fastapi import APIRouter, Query

from app.models.schemas import QiblaResponse
from app.services.qibla_service import compute_qibla

router = APIRouter(prefix="/qibla", tags=["qibla"])


@router.get("", response_model=QiblaResponse)
def qibla_direction(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
) -> QiblaResponse:
    return compute_qibla(lat, lng)
