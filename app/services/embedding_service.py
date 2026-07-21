"""
Wraps a local sentence-transformers model so embedding generation has
zero per-call API cost and works fully offline once the model is cached.
Swappable later for a hosted embedding API without touching callers.
"""
from functools import lru_cache
import numpy as np
from sentence_transformers import SentenceTransformer

from app.config import get_settings


class EmbeddingService:
    def __init__(self, model_name: str):
        self.model = SentenceTransformer(model_name)
        self.dim = self.model.get_sentence_embedding_dimension()

    def embed(self, texts: list[str]) -> np.ndarray:
        vectors = self.model.encode(
            texts, normalize_embeddings=True, convert_to_numpy=True
        )
        return vectors.astype("float32")

    def embed_one(self, text: str) -> np.ndarray:
        return self.embed([text])[0]


@lru_cache
def get_embedding_service() -> EmbeddingService:
    settings = get_settings()
    return EmbeddingService(settings.embedding_model_name)
