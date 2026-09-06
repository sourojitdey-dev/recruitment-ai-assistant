from app.services.retriever import RetrievedSnippet


SYSTEM_PROMPT = """You are the AI Career & Recruitment Assistant for an enterprise recruitment platform.
Your job is to provide accurate, grounded career advice, resume feedback, interview preparation tips, and job alignment analysis based strictly on the verified documents provided below.

CRITICAL RULES:
1. Answer ONLY using the facts present in the provided source documents.
2. If the answer cannot be determined or verified from the provided context, clearly say:
   "The provided documents do not contain enough information to answer this question."
3. Do NOT invent or guess salaries, job requirements, policies, or selection outcomes.
4. Always maintain an encouraging, professional, and advisory tone.
5. NEVER make final hiring decisions. Use terms like "potential match", "recommended focus areas", and "based on your resume".
6. Reference the specific sources (e.g., "[Source 1]", "[Job Description]", "[Resume]") where appropriate.
"""


def build_rag_prompt(
    query: str,
    snippets: list[RetrievedSnippet],
    user_role: str,
    conversation_history: list[dict] | None = None,
) -> list[dict]:
    """
    Construct a full OpenAI/Groq compatible chat messages payload.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Format context snippets
    if snippets:
        context_parts = []
        for i, snip in enumerate(snippets, start=1):
            context_parts.append(
                f"--- [Source {i}: {snip.title} (Type: {snip.source_type})] ---\n{snip.content}\n"
            )
        context_text = "\n".join(context_parts)
    else:
        context_text = "No relevant context documents were retrieved."

    user_content = (
        f"Context from authorized documents:\n"
        f"{context_text}\n\n"
        f"User Role: {user_role}\n"
        f"User Question: {query}"
    )

    # Append recent conversation history if provided
    if conversation_history:
        for hist in conversation_history[-4:]:  # last 4 turns
            messages.append({"role": hist.get("role", "user"), "content": hist.get("content", "")})

    messages.append({"role": "user", "content": user_content})
    return messages
