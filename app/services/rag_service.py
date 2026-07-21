from app.config import get_settings
from app.core.prompts import NO_CONTEXT_FALLBACK
from app.models.schemas import ChatResponse, SourceRef
from app.services.embedding_service import get_embedding_service
from app.services.llm_service import get_llm_service
from app.services.vector_store import get_hadith_store, get_quran_store


def _format_context(quran_hits: list[dict], hadith_hits: list[dict]) -> str:
    lines = []
    for h in quran_hits:
        lines.append(
            f"[Quran {h['surah']}:{h['ayah']}] Arabic: {h.get('arabic_text', '')}\n"
            f"Translation: {h['translation']}"
        )
    for h in hadith_hits:
        lines.append(
            f"[{h['collection']} {h['hadith_number']}] "
            f"Narrator: {h.get('narrator', 'N/A')} | "
            f"Authenticity: {h.get('authenticity', 'unspecified')}\n"
            f"Translation: {h['translation']}"
        )
    return "\n\n".join(lines) if lines else "NONE FOUND"


def answer_question(question: str, language: str, session_id: str | None) -> ChatResponse:
    settings = get_settings()
    embedder = get_embedding_service()
    query_vec = embedder.embed_one(question)

    quran_hits = get_quran_store().search(query_vec, settings.top_k_retrieval)
    hadith_hits = get_hadith_store().search(query_vec, settings.top_k_retrieval)

    if not quran_hits and not hadith_hits:
        return ChatResponse(answer=NO_CONTEXT_FALLBACK, sources=[])

    context = _format_context(quran_hits, hadith_hits)
    llm = get_llm_service()
    answer_text = llm.generate_answer(question, context, language)

    sources = [
        SourceRef(
            type="quran",
            reference=f"Surah {h['surah']}:{h['ayah']}",
            arabic_text=h.get("arabic_text"),
            translation=h["translation"],
            score=h["score"],
        )
        for h in quran_hits
    ] + [
        SourceRef(
            type="hadith",
            reference=f"{h['collection']} #{h['hadith_number']}",
            translation=h["translation"],
            authenticity=h.get("authenticity"),
            score=h["score"],
        )
        for h in hadith_hits
    ]

    # Best-effort logging; never let analytics failures break the chat response
    try:
        from app.services.firebase_service import get_firebase_service
        get_firebase_service().log_chat(
            session_id or "anonymous", question, answer_text,
            [s.model_dump() for s in sources],
        )
    except Exception:
        pass

    return ChatResponse(answer=answer_text, sources=sources)
