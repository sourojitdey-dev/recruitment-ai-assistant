from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    content_type: str
    document_type: str
    company_id: int | None
    uploaded_by: int
    indexing_status: str
    created_at: datetime
    extracted_text_preview: str | None = None

    model_config = {
        "from_attributes": True
    }


class DocumentIndexResponse(BaseModel):
    document_id: int
    indexing_status: str
    chunks_created: int
    message: str
