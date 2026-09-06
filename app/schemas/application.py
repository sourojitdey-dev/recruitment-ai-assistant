from datetime import datetime

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    job_id: int
    notes: dict | None = None


class ApplicationStatusUpdate(BaseModel):
    status: str


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: str
    applied_at: datetime
    notes: dict | None

    model_config = {
        "from_attributes": True
    }