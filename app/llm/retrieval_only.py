from collections.abc import Generator
from app.llm.base import BaseLLMProvider


class RetrievalOnlyProvider(BaseLLMProvider):
    """
    Fallback deterministic provider when external LLM API is unavailable.
    Synthesizes answers directly from the retrieved context snippets.
    """

    def generate_response(self, messages: list[dict]) -> str:
        # Extract the user prompt
        user_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                user_msg = m.get("content", "")
                break

        if "No relevant context documents were retrieved" in user_msg:
            return (
                "Based on the authorized database records, no matching context documents were found "
                "to answer this question. Please ensure your resume or relevant company documents are uploaded."
            )

        # Parse out the context from user_msg
        if "Context from authorized documents:\n" in user_msg:
            context_section = user_msg.split("Context from authorized documents:\n")[1]
            if "User Role:" in context_section:
                context_section = context_section.split("User Role:")[0]

            return (
                "Here is the verified information retrieved from your authorized platform documents:\n\n"
                f"{context_section.strip()}\n\n"
                "*Note: This response is compiled directly from authorized platform records.*"
            )

        return "The provided documents do not contain enough information to answer this question."

    def generate_stream(self, messages: list[dict]) -> Generator[str, None, None]:
        full_text = self.generate_response(messages)
        words = full_text.split(" ")
        for w in words:
            yield w + " "
