from abc import ABC, abstractmethod
from collections.abc import Generator


class BaseLLMProvider(ABC):
    @abstractmethod
    def generate_response(self, messages: list[dict]) -> str:
        """Generate full text response."""
        pass

    @abstractmethod
    def generate_stream(self, messages: list[dict]) -> Generator[str, None, None]:
        """Generate streaming text tokens."""
        pass
