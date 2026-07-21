from fastapi import APIRouter, HTTPException, Query

from app.config import get_settings
from app.models.schemas import (
    HadithBookMeta,
    HadithCollectionMeta,
    HadithDetail,
    HadithSearchResult,
)
from app.services.embedding_service import get_embedding_service
from app.services.hadith_browse_service import (
    list_books,
    list_collections,
    list_hadiths_in_book,
)
from app.services.vector_store import get_hadith_store

router = APIRouter(prefix="/hadith", tags=["hadith"])


@router.get("/search", response_model=list[HadithSearchResult])
def search_hadith(q: str = Query(..., min_length=2)) -> list[HadithSearchResult]:
    settings = get_settings()
    embedder = get_embedding_service()
    vec = embedder.embed_one(q)
    hits = get_hadith_store().search(vec, settings.top_k_retrieval)
    return [
        HadithSearchResult(
            collection=h["collection"],
            book=h.get("book", ""),
            hadith_number=h["hadith_number"],
            arabic_text=h.get("arabic_text"),
            translation=h["translation"],
            narrator=h.get("narrator"),
            authenticity=h.get("authenticity"),
            score=h["score"],
        )
        for h in hits
    ]


@router.get("/collections", response_model=list[HadithCollectionMeta])
def browse_collections() -> list[HadithCollectionMeta]:
    try:
        return list_collections()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not fetch collections: {exc}")


@router.get("/collections/{collection}/books", response_model=list[HadithBookMeta])
def browse_books(collection: str) -> list[HadithBookMeta]:
    try:
        return list_books(collection)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not fetch books: {exc}")


@router.get(
    "/collections/{collection}/books/{book_number}/hadiths",
    response_model=list[HadithDetail],
)
def browse_hadiths(collection: str, book_number: str) -> list[HadithDetail]:
    try:
        return list_hadiths_in_book(collection, book_number)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Could not fetch hadiths: {exc}")
