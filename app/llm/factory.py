import logging
from app.core.config import settings
from app.llm.base import BaseLLMProvider
from app.llm.groq_provider import GroqProvider
from app.llm.retrieval_only import RetrievalOnlyProvider

logger = logging.getLogger(__name__)


def get_llm_provider() -> BaseLLMProvider:
    """Return GroqProvider if key is configured, otherwise fallback to RetrievalOnlyProvider."""
    key = settings.GROQ_API_KEY
    if key and key.strip() and not key.startswith("your-real-api-key"):
        try:
            return GroqProvider(api_key=key)
        except Exception as e:
            logger.warning("Could not initialize GroqProvider: %s. Using fallback.", e)
            return RetrievalOnlyProvider()
    return RetrievalOnlyProvider()
