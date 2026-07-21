from fastapi import APIRouter, HTTPException

from app.models.schemas import Dua
from app.services.dua_service import get_dua, list_categories, list_duas

router = APIRouter(prefix="/duas", tags=["duas"])


@router.get("", response_model=list[Dua])
def browse(category: str | None = None) -> list[Dua]:
    return list_duas(category)


@router.get("/categories", response_model=list[str])
def categories() -> list[str]:
    return list_categories()


@router.get("/{dua_id}", response_model=Dua)
def get_one(dua_id: str) -> Dua:
    dua = get_dua(dua_id)
    if not dua:
        raise HTTPException(status_code=404, detail="Dua not found")
    return dua
