from typing import Sequence
import sys

# Safeguard against Windows Application Control blocking experimental scipy C-extensions on Python 3.14
for _blocked_mod in ("scipy", "scipy.sparse", "scipy.stats", "sklearn"):
    if _blocked_mod not in sys.modules:
        sys.modules[_blocked_mod] = None

import torch
import torch.nn.functional as F
from transformers import AutoModel, AutoTokenizer


def _mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, dim=1)
    sum_mask = torch.clamp(input_mask_expanded.sum(dim=1), min=1e-9)
    return sum_embeddings / sum_mask


class EmbeddingService:
    _instance: "EmbeddingService | None" = None
    _tokenizer: AutoTokenizer | None = None
    _model: AutoModel | None = None
    MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
    DIMENSION = 384

    def __new__(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _get_model(self):
        if self._model is None or self._tokenizer is None:
            self._tokenizer = AutoTokenizer.from_pretrained(self.MODEL_NAME)
            self._model = AutoModel.from_pretrained(self.MODEL_NAME)
            self._model.eval()
        return self._tokenizer, self._model

    def embed_text(self, text: str) -> list[float]:
        """Embed a single string into a 384-dimensional float vector."""
        if not text or not text.strip():
            return [0.0] * self.DIMENSION
        return self.embed_texts([text])[0]

    def embed_texts(self, texts: Sequence[str]) -> list[list[float]]:
        """Batch embed multiple strings into 384-dimensional normalized float vectors."""
        if not texts:
            return []
        cleaned_texts = [t.strip() if t and t.strip() else " " for t in texts]
        tokenizer, model = self._get_model()

        encoded_input = tokenizer(
            cleaned_texts,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt",
        )

        with torch.no_grad():
            model_output = model(**encoded_input)

        sentence_embeddings = _mean_pooling(model_output, encoded_input["attention_mask"])
        sentence_embeddings = F.normalize(sentence_embeddings, p=2, dim=1)
        return sentence_embeddings.tolist()


def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()
