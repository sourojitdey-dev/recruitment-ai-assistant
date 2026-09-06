from typing import Sequence
import numpy as np
from sentence_transformers import SentenceTransformer


class EmbeddingService:
    _instance: "EmbeddingService | None" = None
    _model: SentenceTransformer | None = None
    MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
    DIMENSION = 384

    def __new__(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _get_model(self) -> SentenceTransformer:
        if self._model is None:
            # Explicitly load on CPU without requiring GPU
            self._model = SentenceTransformer(self.MODEL_NAME, device="cpu")
        return self._model

    def embed_text(self, text: str) -> list[float]:
        """Embed a single string into a 384-dimensional float vector."""
        if not text or not text.strip():
            return [0.0] * self.DIMENSION
        model = self._get_model()
        embedding = model.encode(text.strip(), normalize_embeddings=True, show_progress_bar=False)
        return embedding.tolist()

    def embed_texts(self, texts: Sequence[str]) -> list[list[float]]:
        """Batch embed multiple strings."""
        if not texts:
            return []
        cleaned_texts = [t.strip() if t and t.strip() else " " for t in texts]
        model = self._get_model()
        embeddings = model.encode(cleaned_texts, normalize_embeddings=True, show_progress_bar=False)
        return embeddings.tolist()


def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()
