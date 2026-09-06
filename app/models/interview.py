from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id"),
        index=True,
    )

    interviewer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True,
    )

    scheduled_at: Mapped[datetime] = mapped_column(
        DateTime,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="scheduled",
        index=True,
    )