from typing import Any
from pydantic import BaseModel


class CustomPolicyItem(BaseModel):
    title: str
    document_type: str = "company_policy"
    content: str


class CompanyCreate(BaseModel):
    name: str
    description: str | None = None
    industry: str | None = None
    website: str | None = None
    location: str | None = None
    maternity_leave_policy: str | None = None
    remote_work_policy: str | None = None
    health_benefits: str | None = None
    culture_code_of_conduct: str | None = None
    custom_policies: list[CustomPolicyItem] | None = None


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
    documents_indexed: int = 0
    message: str = "Company registered successfully"