from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    document_id: Mapped[int | None] = mapped_column(
        ForeignKey("knowledge_documents.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    source_type: Mapped[str] = mapped_column(
        String(50),
        index=True
    )  # 'document', 'job', 'resume'

    source_id: Mapped[int] = mapped_column(
        Integer,
        index=True
    )

    company_id: Mapped[int | None] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    candidate_id: Mapped[int | None] = mapped_column(
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    job_id: Mapped[int | None] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    chunk_index: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    chunk_text: Mapped[str] = mapped_column(
        Text
    )

    embedding = mapped_column(
        Vector(384)
    )

    meta_data: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )
