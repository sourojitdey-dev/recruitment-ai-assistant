from pydantic import BaseModel


class CandidateCreate(BaseModel):
    phone: str | None = None
    location: str | None = None
    bio: str | None = None


class CandidateResponse(BaseModel):
    id: int
    user_id: int
    phone: str | None
    location: str | None
    bio: str | None

    model_config = {
        "from_attributes": True
    }