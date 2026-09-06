from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    filename: Mapped[str] = mapped_column(
        String(255)
    )

    file_path: Mapped[str] = mapped_column(
        String(500)
    )

    content_type: Mapped[str] = mapped_column(
        String(100)
    )

    document_type: Mapped[str] = mapped_column(
        String(50),
        default="company_policy",
        index=True
    )

    extracted_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    company_id: Mapped[int | None] = mapped_column(
        ForeignKey("companies.id"),
        nullable=True,
        index=True
    )

    uploaded_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True
    )

    indexing_status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )
