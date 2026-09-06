from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    description: str
    location: str


class JobUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    is_active: bool | None = None


class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    location: str
    company_name: str
    company_id: int
    is_active: bool
    recruiter_id: int

    model_config = {
        "from_attributes": True
    }