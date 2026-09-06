from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str


class CompanyResponse(BaseModel):
    id: int
    name: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }


class CompanyCreateResponse(BaseModel):
    id: int
    name: str
    recruiter_code: str