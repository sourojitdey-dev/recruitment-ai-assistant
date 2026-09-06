from sqlalchemy.orm import Session

from app.models.user import User
from app.services.chat_service import answer_user_query
from app.services.retriever import retrieve_authorized_context


class RAGService:
    @staticmethod
    def answer_query(
        db: Session,
        current_user: User,
        query: str,
        session_id: str | None = None,
        job_id: int | None = None,
    ):
        return answer_user_query(
            db=db,
            current_user=current_user,
            message=query,
            session_id=session_id,
            job_id=job_id,
        )

    @staticmethod
    def get_context(
        db: Session,
        current_user: User,
        query: str,
        top_k: int = 5,
        job_id: int | None = None,
    ):
        return retrieve_authorized_context(
            db=db,
            current_user=current_user,
            query_text=query,
            top_k=top_k,
            job_id=job_id,
        )
