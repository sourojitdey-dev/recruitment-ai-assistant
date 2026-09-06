from typing import Any
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.user import User
from app.services.vector_store import similarity_search


class RetrievedSnippet:
    def __init__(
        self,
        title: str,
        source_type: str,
        source_id: int,
        content: str,
        similarity: float,
        metadata: dict[str, Any] | None = None,
    ):
        self.title = title
        self.source_type = source_type
        self.source_id = source_id
        self.content = content
        self.similarity = similarity
        self.metadata = metadata or {}

    def to_dict(self) -> dict[str, Any]:
        return {
            "title": self.title,
            "source_type": self.source_type,
            "source_id": self.source_id,
            "snippet": self.content[:300] + ("..." if len(self.content) > 300 else ""),
            "similarity": round(self.similarity, 4),
            "metadata": self.metadata,
        }


def retrieve_authorized_context(
    db: Session,
    current_user: User,
    query_text: str,
    top_k: int = 5,
    job_id: int | None = None,
) -> list[RetrievedSnippet]:
    """
    Retrieve knowledge snippets strictly conforming to user role, ownership, and company boundaries.
    """
    snippets: list[RetrievedSnippet] = []

    if current_user.role == "candidate":
        candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        candidate_id = candidate.id if candidate else None

        # 1. Candidate's own resume
        if candidate_id:
            resume_results = similarity_search(
                db=db,
                query_text=query_text,
                top_k=3,
                source_type="resume",
                candidate_id=candidate_id,
            )
            for chunk, sim in resume_results:
                snippets.append(
                    RetrievedSnippet(
                        title="Candidate Resume & Profile",
                        source_type="resume",
                        source_id=chunk.source_id,
                        content=chunk.chunk_text,
                        similarity=sim,
                        metadata=chunk.meta_data or {},
                    )
                )

        # 2. Public / Active Jobs (or specific job if requested)
        job_results = similarity_search(
            db=db,
            query_text=query_text,
            top_k=3,
            source_type="job",
            job_id=job_id,
        )
        for chunk, sim in job_results:
            title = chunk.meta_data.get("title", f"Job #{chunk.source_id}") if chunk.meta_data else f"Job #{chunk.source_id}"
            snippets.append(
                RetrievedSnippet(
                    title=f"Job: {title}",
                    source_type="job",
                    source_id=chunk.source_id,
                    content=chunk.chunk_text,
                    similarity=sim,
                    metadata=chunk.meta_data or {},
                )
            )

        # 3. Approved documents for companies the candidate applied to
        if candidate_id:
            applied_job_ids = [
                app.job_id for app in db.query(Application.job_id).filter(Application.candidate_id == candidate_id).all()
            ]
            applied_company_ids = [
                j.company_id for j in db.query(Job.company_id).filter(Job.id.in_(applied_job_ids)).all() if j.company_id
            ]
            if applied_company_ids:
                doc_results = similarity_search(
                    db=db,
                    query_text=query_text,
                    top_k=2,
                    source_type="document",
                    allowed_company_ids=applied_company_ids,
                )
                for chunk, sim in doc_results:
                    filename = chunk.meta_data.get("filename", "Company Document") if chunk.meta_data else "Company Document"
                    snippets.append(
                        RetrievedSnippet(
                            title=f"Document: {filename}",
                            source_type="document",
                            source_id=chunk.source_id,
                            content=chunk.chunk_text,
                            similarity=sim,
                            metadata=chunk.meta_data or {},
                        )
                    )

    elif current_user.role in ("recruiter", "interviewer", "admin"):
        company_id = current_user.company_id

        # 1. Company's approved documents
        if company_id:
            doc_results = similarity_search(
                db=db,
                query_text=query_text,
                top_k=3,
                source_type="document",
                company_id=company_id,
            )
            for chunk, sim in doc_results:
                filename = chunk.meta_data.get("filename", "Company Document") if chunk.meta_data else "Company Document"
                snippets.append(
                    RetrievedSnippet(
                        title=f"Company Document: {filename}",
                        source_type="document",
                        source_id=chunk.source_id,
                        content=chunk.chunk_text,
                        similarity=sim,
                        metadata=chunk.meta_data or {},
                    )
                )

        # 2. Company's jobs
        job_results = similarity_search(
            db=db,
            query_text=query_text,
            top_k=3,
            source_type="job",
            company_id=company_id,
            job_id=job_id,
        )
        for chunk, sim in job_results:
            title = chunk.meta_data.get("title", f"Job #{chunk.source_id}") if chunk.meta_data else f"Job #{chunk.source_id}"
            snippets.append(
                RetrievedSnippet(
                    title=f"Company Job: {title}",
                    source_type="job",
                    source_id=chunk.source_id,
                    content=chunk.chunk_text,
                    similarity=sim,
                    metadata=chunk.meta_data or {},
                )
            )

        # 3. Applicants to company jobs
        if company_id:
            company_job_ids = [j.id for j in db.query(Job.id).filter(Job.company_id == company_id).all()]
            applicant_cand_ids = [
                app.candidate_id for app in db.query(Application.candidate_id).filter(Application.job_id.in_(company_job_ids)).all()
            ]
            if applicant_cand_ids:
                resume_results = similarity_search(
                    db=db,
                    query_text=query_text,
                    top_k=3,
                    source_type="resume",
                    allowed_candidate_ids=applicant_cand_ids,
                )
                for chunk, sim in resume_results:
                    snippets.append(
                        RetrievedSnippet(
                            title=f"Applicant Resume (Candidate #{chunk.candidate_id})",
                            source_type="resume",
                            source_id=chunk.source_id,
                            content=chunk.chunk_text,
                            similarity=sim,
                            metadata=chunk.meta_data or {},
                        )
                    )

    # Sort all snippets by similarity descending
    snippets.sort(key=lambda s: s.similarity, reverse=True)
    return snippets[:top_k]
