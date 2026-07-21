from fastapi import APIRouter, HTTPException, Query

from app.config import get_settings
from app.models.schemas import QuranSearchResult, SurahDetail, SurahMeta
from app.services.embedding_service import get_embedding_service
from app.services.quran_browse_service import get_surah, list_surahs
from app.services.vector_store import get_quran_store

router = APIRouter(prefix="/quran", tags=["quran"])


@router.get("/search", response_model=list[QuranSearchResult])
def search_quran(q: str = Query(..., min_length=2)) -> list[QuranSearchResult]:
    settings = get_settings()
    embedder = get_embedding_service()
    vec = embedder.embed_one(q)
    hits = get_quran_store().search(vec, settings.top_k_retrieval)
    return [
        QuranSearchResult(
            surah=h["surah"],
            ayah=h["ayah"],
            arabic_text=h.get("arabic_text", ""),
            translation=h["translation"],
            score=h["score"],
        )
        for h in hits
    ]


@router.get("/surahs", response_model=list[SurahMeta])
def browse_surahs() -> list[SurahMeta]:
    try:
        return list_surahs()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not fetch surah list: {exc}")


@router.get("/surahs/{surah_number}", response_model=SurahDetail)
def read_surah(surah_number: int) -> SurahDetail:
    if not (1 <= surah_number <= 114):
        raise HTTPException(status_code=400, detail="Surah number must be between 1 and 114.")
    try:
        return get_surah(surah_number)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not fetch surah: {exc}")
