from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    favorite_book: str
    favorite_person: str
    phone: str | None = None
    location: str | None = None
    bio: str | None = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    favorite_book: str
    favorite_person: str
    new_password: str


class RecruiterRegister(UserRegister):
    company_name: str
    recruiter_code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }
class InterviewerRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_name: str
    recruiter_code: str