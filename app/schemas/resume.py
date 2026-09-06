from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: int
    candidate_id: int
    filename: str
    file_path: str
    content_type: str
    extracted_text: str | None

    model_config = {
        "from_attributes": True
    }