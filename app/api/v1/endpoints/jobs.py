from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.models.company import Company
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreate, JobResponse, JobUpdate


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)


@router.post(
    "/",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job(
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recruiter is not associated with a company",
        )

    company = (
        db.query(Company)
        .filter(
            Company.id == current_user.company_id,
            Company.is_active.is_(True),
        )
        .first()
    )

    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recruiter's company not found",
        )

    new_job = Job(
        title=job_data.title,
        description=job_data.description,
        location=job_data.location,
        company_name=company.name,
        company_id=company.id,
        is_active=True,
        recruiter_id=current_user.id,
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    try:
        from app.services.vector_store import index_job
        index_job(db, new_job)
    except Exception:
        pass

    return new_job



@router.get(
    "/",
    response_model=list[JobResponse],
)
def list_jobs(
    db: Session = Depends(get_db),
):
    jobs = (
        db.query(Job)
        .filter(Job.is_active.is_(True))
        .all()
    )

    return jobs


@router.get(
    "/company/me",
    response_model=list[JobResponse],
)
def list_company_jobs(
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recruiter is not associated with a company",
        )

    jobs = (
        db.query(Job)
        .filter(Job.company_id == current_user.company_id)
        .order_by(Job.id.desc())
        .all()
    )

    return jobs


@router.get(
    "/{job_id}",
    response_model=JobResponse,
)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.is_active.is_(True),
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return job


@router.put(
    "/{job_id}",
    response_model=JobResponse,
)
def update_job(
    job_id: int,
    job_data: JobUpdate,
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.company_id == current_user.company_id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found in your company",
        )

    if job_data.title is not None:
        job.title = job_data.title
    if job_data.description is not None:
        job.description = job_data.description
    if job_data.location is not None:
        job.location = job_data.location
    if job_data.is_active is not None:
        job.is_active = job_data.is_active

    db.commit()
    db.refresh(job)
    return job


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_job(
    job_id: int,
    current_user: User = Depends(
        require_roles("recruiter", "admin")
    ),
    db: Session = Depends(get_db),
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.company_id == current_user.company_id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found in your company",
        )

    db.delete(job)
    db.commit()
    return None