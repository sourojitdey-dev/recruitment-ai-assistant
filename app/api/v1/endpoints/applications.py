from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)


router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


@router.post(
    "/",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_application(
    application_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("candidate")
    ),
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

    job = (
        db.query(Job)
        .filter(
            Job.id == application_data.job_id,
            Job.is_active == True,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active job not found",
        )

    existing_application = (
        db.query(Application)
        .filter(
            Application.job_id == job.id,
            Application.candidate_id == candidate.id,
        )
        .first()
    )

    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this job",
        )

    new_application = Application(
        job_id=job.id,
        candidate_id=candidate.id,
        status="applied",
        notes=application_data.notes,
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return new_application


@router.get(
    "/me",
    response_model=list[ApplicationResponse],
)
def get_my_applications(
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

    applications = (
        db.query(Application)
        .filter(
            Application.candidate_id == candidate.id
        )
        .order_by(Application.id.desc())
        .all()
    )

    return applications


@router.get(
    "/",
    response_model=list[ApplicationResponse],
)
def get_all_applications(
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    applications = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(Job.company_id == current_user.company_id)
        .order_by(Application.id.desc())
        .all()
    )

    return applications


@router.put(
    "/{application_id}/status",
    response_model=ApplicationResponse,
)
def update_application_status(
    application_id: int,
    status_data: ApplicationStatusUpdate,
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    application = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(
            Application.id == application_id,
            Job.company_id == current_user.company_id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    allowed_statuses = {
        "applied",
        "screening",
        "shortlisted",
        "rejected",
        "hired",
    }

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid application status",
        )

    application.status = status_data.status

    db.commit()
    db.refresh(application)

    return application

@router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_application(
    application_id: int,
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    application = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(
            Application.id == application_id,
            Job.company_id == current_user.company_id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    db.delete(application)
    db.commit()

    return None