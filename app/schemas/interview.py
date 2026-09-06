from datetime import datetime

from pydantic import BaseModel


class InterviewCreate(BaseModel):
    application_id: int
    interviewer_id: int
    scheduled_at: datetime


class InterviewUpdate(BaseModel):
    interviewer_id: int | None = None
    scheduled_at: datetime | None = None
    status: str | None = None


class InterviewStatusUpdate(BaseModel):
    status: str


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    interviewer_id: int
    scheduled_at: datetime
    status: str
    job_id: int | None = None
    job_title: str | None = None
    company_name: str | None = None
    candidate_id: int | None = None
    candidate_name: str | None = None
    interviewer_name: str | None = None

    model_config = {
        "from_attributes": True
    }


class InterviewerResponse(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}