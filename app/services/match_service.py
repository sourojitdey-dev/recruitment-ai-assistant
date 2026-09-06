import re
from typing import Any
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.services.embedding import get_embedding_service
from app.services.vector_store import cosine_similarity, index_job, index_resume

COMMON_SKILLS = [
    "python", "fastapi", "flask", "django", "postgresql", "mysql", "mongodb", "redis",
    "docker", "kubernetes", "aws", "gcp", "azure", "git", "github", "ci/cd", "rest", "restful",
    "graphql", "react", "react.js", "javascript", "typescript", "html", "css", "tailwind",
    "node", "node.js", "express", "sql", "nosql", "sqlalchemy", "alembic", "pytest",
    "machine learning", "deep learning", "nlp", "rag", "langchain", "pgvector", "embeddings",
    "microservices", "linux", "agile", "scrum", "pandas", "numpy", "scikit-learn", "pytorch"
]


def extract_skills_from_text(text: str) -> set[str]:
    """Extract known technical skills from text using regex boundary matching."""
    if not text:
        return set()
    lowered = text.lower()
    found = set()
    for skill in COMMON_SKILLS:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, lowered):
            # Capitalize nicely
            found.add(skill.title() if len(skill) > 3 else skill.upper())
    return found


def calculate_skill_breakdown(job_text: str, candidate_text: str) -> tuple[list[str], list[str], list[str]]:
    job_skills = extract_skills_from_text(job_text)
    candidate_skills = extract_skills_from_text(candidate_text)

    if not job_skills:
        # Default fallback extraction if no predetermined skills matched
        job_words = set(re.findall(r"\b[A-Za-z]{3,}\b", job_text.lower()))
        cand_words = set(re.findall(r"\b[A-Za-z]{3,}\b", candidate_text.lower()))
        common = job_words.intersection(cand_words)
        return list(common)[:4], [], []

    strong = sorted(list(job_skills.intersection(candidate_skills)))
    gaps = sorted(list(job_skills.difference(candidate_skills)))
    # Partial matches: candidate skills that are valuable but not explicitly listed in the job
    partial = sorted(list(candidate_skills.difference(job_skills)))[:3]

    return strong, partial, gaps


def compute_match_score(job: Job, candidate: Candidate, resume: Resume | None) -> tuple[float, list[str], list[str], list[str], str]:
    embedder = get_embedding_service()

    job_text = f"{job.title}\n{job.description}\n{job.location}"
    cand_text = f"{candidate.location or ''}\n{candidate.bio or ''}\n{resume.extracted_text if resume else ''}"

    job_emb = embedder.embed_text(job_text)
    cand_emb = embedder.embed_text(cand_text)

    raw_sim = cosine_similarity(job_emb, cand_emb)
    # Calibrate raw cosine similarity (typically 0.3-0.85) to percentage (40% - 98%)
    normalized_score = max(0.0, min(100.0, ((raw_sim - 0.2) / 0.65) * 60.0 + 38.0))
    match_percentage = round(normalized_score, 1)

    strong, partial, gaps = calculate_skill_breakdown(job_text, cand_text)

    # If there are strong matches, boost slightly
    if strong and match_percentage < 95.0:
        match_percentage = min(98.0, round(match_percentage + len(strong) * 2.5, 1))

    explanation_parts = []
    if strong:
        explanation_parts.append(f"Strong alignment in core requirements: {', '.join(strong)}.")
    if partial:
        explanation_parts.append(f"Complementary competencies identified: {', '.join(partial)}.")
    if gaps:
        explanation_parts.append(f"Potential skill gap areas to evaluate or develop: {', '.join(gaps)}.")
    else:
        explanation_parts.append("Candidate demonstrates comprehensive coverage of stated requirements.")

    explanation = " ".join(explanation_parts)
    return match_percentage, strong, partial, gaps, explanation


def match_candidate_to_all_jobs(db: Session, candidate_id: int) -> list[dict[str, Any]]:
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        return []

    resume = db.query(Resume).filter(Resume.candidate_id == candidate.id).order_by(Resume.id.desc()).first()
    active_jobs = db.query(Job).filter(Job.is_active.is_(True)).all()

    matches = []
    for job in active_jobs:
        score, strong, partial, gaps, explanation = compute_match_score(job, candidate, resume)
        matches.append({
            "job_id": job.id,
            "job_title": job.title,
            "company_name": job.company_name,
            "location": job.location,
            "match_percentage": score,
            "breakdown": {
                "strong_matches": strong,
                "partial_matches": partial,
                "potential_gaps": gaps,
            },
            "explanation": explanation,
            "advisory_disclaimer": "This match score and explanation are AI-assisted recommendations and do not represent automated employment decisions.",
        })

    matches.sort(key=lambda m: m["match_percentage"], reverse=True)
    return matches


def match_job_to_candidates_for_recruiter(db: Session, job_id: int, company_id: int) -> list[dict[str, Any]]:
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == company_id).first()
    if not job:
        return []

    # Match against all candidates or applied candidates
    applications = db.query(Application).filter(Application.job_id == job.id).all()
    candidate_ids = [app.candidate_id for app in applications]

    # Also include other registered candidates who uploaded resumes for recommendation
    all_candidates = db.query(Candidate).all()

    matches = []
    for candidate in all_candidates:
        user = db.query(User).filter(User.id == candidate.user_id).first()
        if not user or not user.is_active:
            continue

        resume = db.query(Resume).filter(Resume.candidate_id == candidate.id).order_by(Resume.id.desc()).first()
        score, strong, partial, gaps, explanation = compute_match_score(job, candidate, resume)

        matches.append({
            "candidate_id": candidate.id,
            "candidate_name": user.name,
            "candidate_email": user.email,
            "has_applied": candidate.id in candidate_ids,
            "match_percentage": score,
            "breakdown": {
                "strong_matches": strong,
                "partial_matches": partial,
                "potential_gaps": gaps,
            },
            "explanation": explanation,
            "advisory_disclaimer": "This match score and explanation are AI-assisted recommendations and do not represent automated employment decisions.",
        })

    matches.sort(key=lambda m: m["match_percentage"], reverse=True)
    return matches
