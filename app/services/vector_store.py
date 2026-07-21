"""
Lightweight local vector index (FAISS) for Quran + Hadith semantic search.

Why FAISS next to Firebase: Firestore is the source of truth for the raw
verse/hadith documents (easy to edit via admin panel, scales for reads),
but Firestore has no native ANN vector search. FAISS gives sub-millisecond
similarity search over a few hundred thousand short passages, which is
comfortably within its sweet spot. The index only stores vectors + a
lightweight metadata sidecar (firebase doc id + type); full text always
comes from Firestore, so content edits never require a full index rebuild
of anything except that one row.
"""
import json
import os
import threading

import faiss
import numpy as np

from app.config import get_settings

_LOCK = threading.Lock()


class VectorStore:
    def __init__(self, dim: int, index_dir: str):
        self.dim = dim
        self.index_dir = index_dir
        os.makedirs(index_dir, exist_ok=True)
        self.index_path = os.path.join(index_dir, "index.faiss")
        self.meta_path = os.path.join(index_dir, "meta.json")

        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.meta_path, "r", encoding="utf-8") as f:
                self.metadata: list[dict] = json.load(f)
        else:
            # Inner product on normalized vectors == cosine similarity
            self.index = faiss.IndexFlatIP(dim)
            self.metadata = []

    def add(self, vectors: np.ndarray, metadatas: list[dict]) -> None:
        with _LOCK:
            self.index.add(vectors)
            self.metadata.extend(metadatas)
            self._persist()

    def search(self, query_vector: np.ndarray, top_k: int) -> list[dict]:
        if self.index.ntotal == 0:
            return []
        scores, indices = self.index.search(
            np.expand_dims(query_vector, axis=0), top_k
        )
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            meta = dict(self.metadata[idx])
            meta["score"] = float(score)
            results.append(meta)
        return results

    def _persist(self) -> None:
        faiss.write_index(self.index, self.index_path)
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, ensure_ascii=False)


_quran_store: VectorStore | None = None
_hadith_store: VectorStore | None = None


def get_quran_store() -> VectorStore:
    global _quran_store
    if _quran_store is None:
        settings = get_settings()
        from app.services.embedding_service import get_embedding_service
        dim = get_embedding_service().dim
        _quran_store = VectorStore(dim, os.path.join(settings.vector_index_dir, "quran"))
    return _quran_store


def get_hadith_store() -> VectorStore:
    global _hadith_store
    if _hadith_store is None:
        settings = get_settings()
        from app.services.embedding_service import get_embedding_service
        dim = get_embedding_service().dim
        _hadith_store = VectorStore(dim, os.path.join(settings.vector_index_dir, "hadith"))
    return _hadith_store
