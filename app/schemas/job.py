from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    description: str
    location: str


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