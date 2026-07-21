from fastapi import APIRouter

from app.models.schemas import ZakatRequest, ZakatResponse
from app.services.zakat_service import calculate_zakat

router = APIRouter(prefix="/zakat", tags=["zakat"])


@router.post("/calculate", response_model=ZakatResponse)
def calculate(request: ZakatRequest) -> ZakatResponse:
    return calculate_zakat(request)
