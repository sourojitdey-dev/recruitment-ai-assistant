from datetime import datetime
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    job_id: int | None = None


class ChatSource(BaseModel):
    source_type: str
    title: str
    snippet: str | None = None
    source_id: int | None = None


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    sources: list[dict] | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[ChatMessageResponse] = []

    model_config = {
        "from_attributes": True
    }


class ChatResponse(BaseModel):
    answer: str
    session_id: str
    sources: list[dict] = []
    advisory_disclaimer: str = "This advisory response is generated with AI assistance based only on authorized source documents. It does not guarantee employment or hiring decisions."
