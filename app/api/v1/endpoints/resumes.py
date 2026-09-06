
from pathlib import Path
from uuid import uuid4

import pymupdf
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeResponse


router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


RESUME_STORAGE_DIR = Path("storage/resumes")


@router.post(
    "/",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("candidate")
    ),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resumes are supported",
        )

    candidate = (
        db.query(Candidate)
        .filter(Candidate.user_id == current_user.id)
        .first()
    )

    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    RESUME_STORAGE_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    original_filename = file.filename or "resume.pdf"

    stored_filename = (
        f"{uuid4()}_{original_filename}"
    )

    file_path = RESUME_STORAGE_DIR / stored_filename

    file_content = file.file.read()

    with open(file_path, "wb") as resume_file:
        resume_file.write(file_content)

    try:
        document = pymupdf.open(file_path)

        extracted_text = ""

        for page in document:
            extracted_text += page.get_text()

        document.close()

    except Exception:
        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read the PDF resume",
        )

    new_resume = Resume(
        candidate_id=candidate.id,
        filename=original_filename,
        file_path=str(file_path),
        content_type=file.content_type,
        extracted_text=extracted_text,
    )

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # Auto-index resume for AI Matching and RAG
    try:
        from app.services.vector_store import index_resume
        index_resume(db, new_resume, candidate)
    except Exception:
        pass

    return new_resume


@router.get(
    "/",
    response_model=list[ResumeResponse],
)
def list_my_resumes(
    current_user: User = Depends(
        require_roles("candidate")
    ),
    db: Session = Depends(get_db),
):
    candidate = (
        db.query(Candidate)
        .filter(Candidate.user_id == current_user.id)
        .first()
    )

    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    resumes = (
        db.query(Resume)
        .filter(Resume.candidate_id == candidate.id)
        .order_by(Resume.id.desc())
        .all()
    )

    return resumes
