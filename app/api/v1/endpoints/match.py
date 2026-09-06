from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.schemas.match import (
    CandidateJobMatchResponse,
    JobCandidateMatchResponse,
    MatchExplanationDetail,
)
from app.services.match_service import (
    compute_match_score,
    match_candidate_to_all_jobs,
    match_job_to_candidates_for_recruiter,
)

router = APIRouter(
    prefix="/match",
    tags=["AI Matching"],
)


@router.get(
    "/candidate/jobs",
    response_model=list[CandidateJobMatchResponse],
)
def get_candidate_job_matches(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    return match_candidate_to_all_jobs(db, candidate.id)


@router.get(
    "/job/{job_id}/candidates",
    response_model=list[JobCandidateMatchResponse],
)
def get_job_candidate_matches(
    job_id: int,
    current_user: User = Depends(require_roles("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if current_user.role != "admin" and job.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view matches for another company's job",
        )

    return match_job_to_candidates_for_recruiter(db, job_id, job.company_id)


@router.get(
    "/job/{job_id}/candidate/{candidate_id}",
    response_model=MatchExplanationDetail,
)
def get_detailed_match_explanation(
    job_id: int,
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found",
        )

    cand_user = db.query(User).filter(User.id == candidate.user_id).first()
    candidate_name = cand_user.name if cand_user else f"Candidate #{candidate.id}"

    # Permission check: Candidate can only view own match; Recruiter can view if job belongs to their company
    if current_user.role == "candidate":
        if candidate.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot access another candidate's match analysis",
            )
    elif current_user.role in ("recruiter", "interviewer"):
        if job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to another company's job analysis",
            )

    resume = db.query(Resume).filter(Resume.candidate_id == candidate.id).order_by(Resume.id.desc()).first()
    score, strong, partial, gaps, explanation = compute_match_score(job, candidate, resume)

    sources = [
        {"title": f"Job: {job.title}", "company": job.company_name, "location": job.location},
        {"title": "Candidate Resume", "filename": resume.filename if resume else "N/A"},
    ]

    return MatchExplanationDetail(
        job_id=job.id,
        job_title=job.title,
        company_name=job.company_name,
        candidate_id=candidate.id,
        candidate_name=candidate_name,
        match_percentage=score,
        breakdown={
            "strong_matches": strong,
            "partial_matches": partial,
            "potential_gaps": gaps,
        },
        explanation=explanation,
        sources=sources,
        advisory_disclaimer="This match score and explanation are AI-assisted recommendations and do not represent automated employment decisions.",
    )
