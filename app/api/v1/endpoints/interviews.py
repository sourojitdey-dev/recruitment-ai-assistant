
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.models.application import Application
from app.models.candidate import Candidate
from app.models.company import Company
from app.models.interview import Interview
from app.models.job import Job
from app.models.user import User
from app.schemas.interview import (
    InterviewCreate,
    InterviewResponse,
    InterviewStatusUpdate,
    InterviewUpdate,
    InterviewerResponse,
)


router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)


def _format_interview(db: Session, interview: Interview) -> dict:
    app = db.query(Application).filter(Application.id == interview.application_id).first()
    job_title = None
    company_name = None
    candidate_id = None
    candidate_name = None
    job_id = None
    if app:
        job_id = app.job_id
        candidate_id = app.candidate_id
        job = db.query(Job).filter(Job.id == app.job_id).first()
        if job:
            job_title = job.title
            company_name = job.company_name
        candidate = db.query(Candidate).filter(Candidate.id == app.candidate_id).first()
        if candidate:
            user = db.query(User).filter(User.id == candidate.user_id).first()
            if user:
                candidate_name = user.name

    interviewer = db.query(User).filter(User.id == interview.interviewer_id).first()
    interviewer_name = interviewer.name if interviewer else None

    return {
        "id": interview.id,
        "application_id": interview.application_id,
        "interviewer_id": interview.interviewer_id,
        "scheduled_at": interview.scheduled_at,
        "status": interview.status,
        "job_id": job_id,
        "job_title": job_title,
        "company_name": company_name,
        "candidate_id": candidate_id,
        "candidate_name": candidate_name,
        "interviewer_name": interviewer_name,
    }


@router.get(
    "/interviewers",
    response_model=list[InterviewerResponse],
)
def get_interviewers(
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    interviewers = (
        db.query(User)
        .filter(
            User.role == "interviewer",
            User.is_active.is_(True),
            User.company_id == current_user.company_id,
        )
        .order_by(User.name.asc())
        .all()
    )

    return interviewers


@router.get(
    "/me",
    response_model=list[InterviewResponse],
)
def get_my_candidate_interviews(
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

    interviews = (
        db.query(Interview)
        .join(Application, Interview.application_id == Application.id)
        .filter(Application.candidate_id == candidate.id)
        .order_by(Interview.scheduled_at.asc())
        .all()
    )

    return [_format_interview(db, i) for i in interviews]


@router.post(
    "/",
    response_model=InterviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_interview(
    interview_data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
):
    application = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(
            Application.id == interview_data.application_id,
            Job.company_id == current_user.company_id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    interviewer = (
        db.query(User)
        .filter(
            User.id == interview_data.interviewer_id,
            User.is_active.is_(True),
            User.role == "interviewer",
        )
        .first()
    )

    if interviewer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interviewer not found",
        )

    if interviewer.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Interviewer does not belong to your company",
        )

    new_interview = Interview(
        application_id=interview_data.application_id,
        interviewer_id=interview_data.interviewer_id,
        scheduled_at=interview_data.scheduled_at,
        status="scheduled",
    )

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    return _format_interview(db, new_interview)


@router.get(
    "/",
    response_model=list[InterviewResponse],
)
def get_interviews(
    current_user: User = Depends(
        require_roles("recruiter", "admin", "interviewer")
    ),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Interview)
        .join(
            Application,
            Interview.application_id == Application.id,
        )
        .join(
            Job,
            Application.job_id == Job.id,
        )
    )

    if current_user.role == "interviewer":
        query = query.filter(
            Interview.interviewer_id == current_user.id
        )
    else:
        query = query.filter(
            Job.company_id == current_user.company_id
        )

    interviews = query.order_by(Interview.scheduled_at.asc()).all()
    return [_format_interview(db, i) for i in interviews]


@router.put(
    "/{interview_id}",
    response_model=InterviewResponse,
)
def update_interview(
    interview_id: int,
    update_data: InterviewUpdate,
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    interview = (
        db.query(Interview)
        .join(Application, Interview.application_id == Application.id)
        .join(Job, Application.job_id == Job.id)
        .filter(
            Interview.id == interview_id,
            Job.company_id == current_user.company_id,
        )
        .first()
    )

    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    if update_data.interviewer_id is not None:
        interviewer = (
            db.query(User)
            .filter(
                User.id == update_data.interviewer_id,
                User.is_active.is_(True),
                User.role == "interviewer",
            )
            .first()
        )
        if interviewer is None or interviewer.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid interviewer or interviewer belongs to another company",
            )
        interview.interviewer_id = update_data.interviewer_id

    if update_data.scheduled_at is not None:
        interview.scheduled_at = update_data.scheduled_at

    if update_data.status is not None:
        allowed_statuses = {"scheduled", "completed", "cancelled"}
        if update_data.status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid interview status",
            )
        interview.status = update_data.status

    db.commit()
    db.refresh(interview)
    return _format_interview(db, interview)


@router.put(
    "/{interview_id}/status",
    response_model=InterviewResponse,
)
def update_interview_status(
    interview_id: int,
    status_data: InterviewStatusUpdate,
    current_user: User = Depends(
        require_roles("recruiter", "admin", "interviewer")
    ),
    db: Session = Depends(get_db),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id
        )
        .first()
    )

    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    application = (
        db.query(Application)
        .filter(
            Application.id == interview.application_id
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    job = (
        db.query(Job)
        .filter(
            Job.id == application.job_id
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if current_user.role == "interviewer":
        if interview.interviewer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to this interview",
            )
    else:
        if job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this interview",
            )

    allowed_statuses = {
        "scheduled",
        "completed",
        "cancelled",
    }

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid interview status",
        )

    interview.status = status_data.status

    db.commit()
    db.refresh(interview)

    return _format_interview(db, interview)


@router.delete(
    "/{interview_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_interview(
    interview_id: int,
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    interview = (
        db.query(Interview)
        .join(Application, Interview.application_id == Application.id)
        .join(Job, Application.job_id == Job.id)
        .filter(
            Interview.id == interview_id,
            Job.company_id == current_user.company_id,
        )
        .first()
    )

    if interview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    db.delete(interview)
    db.commit()
    return None


