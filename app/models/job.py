from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    title: Mapped[str] = mapped_column(
        String(200)
    )

    description: Mapped[str] = mapped_column(
        Text
    )

    location: Mapped[str] = mapped_column(
        String(200)
    )

    company_name: Mapped[str] = mapped_column(
        String(200)
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        index=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    recruiter_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )