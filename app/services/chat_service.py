import uuid
from typing import Any
from sqlalchemy.orm import Session

from app.llm.factory import get_llm_provider
from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.models.user import User
from app.services.privacy_guard import ADVISORY_DISCLAIMER, check_query_safety, sanitize_response
from app.services.prompt_builder import build_rag_prompt
from app.services.retriever import retrieve_authorized_context


def get_or_create_session(db: Session, user: User, session_id: str | None = None) -> ChatSession:
    if session_id:
        existing = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user.id,
        ).first()
        if existing:
            return existing

    new_session = ChatSession(
        id=str(uuid.uuid4()),
        user_id=user.id,
        title="Career Conversation",
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


def answer_user_query(
    db: Session,
    current_user: User,
    message: str,
    session_id: str | None = None,
    job_id: int | None = None,
) -> dict[str, Any]:
    # 1. Safety & Privacy check
    is_safe, safety_err = check_query_safety(message)
    session = get_or_create_session(db, current_user, session_id)

    if not is_safe:
        return {
            "answer": safety_err or "Query rejected by platform safety policy.",
            "session_id": session.id,
            "sources": [],
            "advisory_disclaimer": ADVISORY_DISCLAIMER,
        }

    # 2. Retrieve authorized context snippets
    snippets = retrieve_authorized_context(
        db=db,
        current_user=current_user,
        query_text=message,
        top_k=5,
        job_id=job_id,
    )

    # 3. Load recent session history
    recent_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.id.desc())
        .limit(6)
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in reversed(recent_messages)]

    # 4. Build grounded RAG prompt
    prompt_messages = build_rag_prompt(
        query=message,
        snippets=snippets,
        user_role=current_user.role,
        conversation_history=history,
    )

    # 5. Generate LLM response
    llm = get_llm_provider()
    try:
        raw_response = llm.generate_response(prompt_messages)
    except Exception as e:
        raw_response = f"Could not generate AI response at this moment: {e}"

    # 6. Sanitize response
    cleaned_response = sanitize_response(raw_response)

    # 7. Store user and assistant messages in DB
    user_msg_obj = ChatMessage(
        session_id=session.id,
        user_id=current_user.id,
        role="user",
        content=message,
        sources=None,
    )
    db.add(user_msg_obj)

    sources_data = [s.to_dict() for s in snippets]
    bot_msg_obj = ChatMessage(
        session_id=session.id,
        user_id=current_user.id,
        role="assistant",
        content=cleaned_response,
        sources=sources_data,
    )
    db.add(bot_msg_obj)

    # Update session title if first turn
    if len(history) == 0:
        session.title = message[:40] + ("..." if len(message) > 40 else "")

    db.commit()

    return {
        "answer": cleaned_response,
        "session_id": session.id,
        "sources": sources_data,
        "advisory_disclaimer": ADVISORY_DISCLAIMER,
    }
