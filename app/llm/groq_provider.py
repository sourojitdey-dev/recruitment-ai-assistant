from collections.abc import Generator
from groq import Groq

from app.core.config import settings
from app.llm.base import BaseLLMProvider


class GroqProvider(BaseLLMProvider):
    def __init__(self, api_key: str | None = None, model: str = "qwen/qwen3.8-27b"):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model
        self.client = Groq(api_key=self.api_key) if self.api_key else None

    def generate_response(self, messages: list[dict]) -> str:
        if not self.client:
            raise ValueError("Groq API key is not configured.")

        models_to_try = [self.model, "qwen/qwen3.8-27b", "groq/compound-mini", "openai/gpt-oss-120b", "qwen/qwen3.6-27b"]
        last_err = None

        for m in models_to_try:
            try:
                response = self.client.chat.completions.create(
                    model=m,
                    messages=messages,
                    temperature=0.2,
                    max_tokens=2048,
                )
                return response.choices[0].message.content or ""
            except Exception as e:
                last_err = e
                continue

        raise RuntimeError(f"Groq generation failed across models: {last_err}")

    def generate_stream(self, messages: list[dict]) -> Generator[str, None, None]:
        if not self.client:
            raise ValueError("Groq API key is not configured.")

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.2,
            max_tokens=2048,
            stream=True,
        )
        for chunk in response:
            token = chunk.choices[0].delta.content or ""
            if token:
                yield token
