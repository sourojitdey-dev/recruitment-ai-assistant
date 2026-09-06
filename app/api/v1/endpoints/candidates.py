from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.models.candidate import Candidate
from app.models.user import User
from app.schemas.candidate import (
    CandidateCreate,
    CandidateResponse,
)


router = APIRouter(
    prefix="/candidates",
    tags=["Candidates"],
)


@router.post(
    "/",
    response_model=CandidateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_candidate_profile(
    candidate_data: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("candidate")
    ),
):
    existing_candidate = (
        db.query(Candidate)
        .filter(Candidate.user_id == current_user.id)
        .first()
    )

    if existing_candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate profile already exists",
        )

    new_candidate = Candidate(
        user_id=current_user.id,
        phone=candidate_data.phone,
        location=candidate_data.location,
        bio=candidate_data.bio,
    )

    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    return new_candidate


@router.get(
    "/me",
    response_model=CandidateResponse,
)
def get_my_candidate_profile(
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

    return candidate


@router.put(
    "/me",
    response_model=CandidateResponse,
)
def update_my_candidate_profile(
    candidate_data: CandidateCreate,
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

    candidate.phone = candidate_data.phone
    candidate.location = candidate_data.location
    candidate.bio = candidate_data.bio

    db.commit()
    db.refresh(candidate)

    return candidate