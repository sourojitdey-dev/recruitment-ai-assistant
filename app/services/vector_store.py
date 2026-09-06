from typing import Any
import numpy as np
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.models.job import Job
from app.models.knowledge_chunk import KnowledgeChunk
from app.models.knowledge_document import KnowledgeDocument
from app.models.resume import Resume
from app.services.chunking import chunk_text
from app.services.embedding import get_embedding_service


def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Calculate cosine similarity between two float vectors."""
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def index_knowledge_document(db: Session, document: KnowledgeDocument) -> int:
    """Chunk, embed, and store knowledge document text."""
    if not document.extracted_text or not document.extracted_text.strip():
        document.indexing_status = "failed"
        db.commit()
        return 0

    chunks = chunk_text(document.extracted_text, chunk_size=500, chunk_overlap=100)
    if not chunks:
        document.indexing_status = "failed"
        db.commit()
        return 0

    # Remove existing chunks for this document
    db.query(KnowledgeChunk).filter(
        KnowledgeChunk.document_id == document.id
    ).delete(synchronize_session=False)

    embedder = get_embedding_service()
    texts = [c["text"] for c in chunks]
    embeddings = embedder.embed_texts(texts)

    chunk_objects = []
    for c, emb in zip(chunks, embeddings):
        chunk_obj = KnowledgeChunk(
            document_id=document.id,
            source_type="document",
            source_id=document.id,
            company_id=document.company_id,
            candidate_id=None,
            job_id=None,
            chunk_index=c["index"],
            chunk_text=c["text"],
            embedding=emb,
            meta_data={
                "filename": document.filename,
                "document_type": document.document_type,
                "company_id": document.company_id,
            },
        )
        chunk_objects.append(chunk_obj)

    db.add_all(chunk_objects)
    document.indexing_status = "indexed"
    db.commit()
    return len(chunk_objects)


def index_job(db: Session, job: Job) -> int:
    """Chunk, embed, and store job description."""
    content = f"Job Title: {job.title}\nCompany: {job.company_name}\nLocation: {job.location}\nDescription:\n{job.description}"
    chunks = chunk_text(content, chunk_size=500, chunk_overlap=100)
    if not chunks:
        return 0

    db.query(KnowledgeChunk).filter(
        KnowledgeChunk.source_type == "job",
        KnowledgeChunk.source_id == job.id,
    ).delete(synchronize_session=False)

    embedder = get_embedding_service()
    texts = [c["text"] for c in chunks]
    embeddings = embedder.embed_texts(texts)

    chunk_objects = []
    for c, emb in zip(chunks, embeddings):
        chunk_obj = KnowledgeChunk(
            document_id=None,
            source_type="job",
            source_id=job.id,
            company_id=job.company_id,
            candidate_id=None,
            job_id=job.id,
            chunk_index=c["index"],
            chunk_text=c["text"],
            embedding=emb,
            meta_data={
                "title": job.title,
                "company_name": job.company_name,
                "location": job.location,
                "job_id": job.id,
            },
        )
        chunk_objects.append(chunk_obj)

    db.add_all(chunk_objects)
    db.commit()
    return len(chunk_objects)


def index_resume(db: Session, resume: Resume, candidate: Candidate) -> int:
    """Chunk, embed, and store candidate resume and profile."""
    content = f"Candidate Profile\nLocation: {candidate.location or 'Not specified'}\nBio: {candidate.bio or 'Not specified'}\nResume Content:\n{resume.extracted_text or ''}"
    chunks = chunk_text(content, chunk_size=500, chunk_overlap=100)
    if not chunks:
        return 0

    db.query(KnowledgeChunk).filter(
        KnowledgeChunk.source_type == "resume",
        KnowledgeChunk.candidate_id == candidate.id,
    ).delete(synchronize_session=False)

    embedder = get_embedding_service()
    texts = [c["text"] for c in chunks]
    embeddings = embedder.embed_texts(texts)

    chunk_objects = []
    for c, emb in zip(chunks, embeddings):
        chunk_obj = KnowledgeChunk(
            document_id=None,
            source_type="resume",
            source_id=resume.id,
            company_id=None,
            candidate_id=candidate.id,
            job_id=None,
            chunk_index=c["index"],
            chunk_text=c["text"],
            embedding=emb,
            meta_data={
                "candidate_id": candidate.id,
                "resume_id": resume.id,
                "filename": resume.filename,
            },
        )
        chunk_objects.append(chunk_obj)

    db.add_all(chunk_objects)
    db.commit()
    return len(chunk_objects)


def similarity_search(
    db: Session,
    query_text: str,
    top_k: int = 5,
    source_type: str | None = None,
    company_id: int | None = None,
    candidate_id: int | None = None,
    job_id: int | None = None,
    allowed_candidate_ids: list[int] | None = None,
    allowed_company_ids: list[int] | None = None,
    min_similarity: float = 0.0,
) -> list[tuple[KnowledgeChunk, float]]:
    """
    Search vector store for chunks matching the query_text embedding,
    applying strict permission and scope filters.
    """
    if not query_text or not query_text.strip():
        return []

    embedder = get_embedding_service()
    query_embedding = embedder.embed_text(query_text)

    query = db.query(KnowledgeChunk)

    if source_type is not None:
        query = query.filter(KnowledgeChunk.source_type == source_type)

    if company_id is not None:
        query = query.filter(KnowledgeChunk.company_id == company_id)

    if candidate_id is not None:
        query = query.filter(KnowledgeChunk.candidate_id == candidate_id)

    if job_id is not None:
        query = query.filter(KnowledgeChunk.job_id == job_id)

    if allowed_candidate_ids is not None:
        query = query.filter(
            or_(
                KnowledgeChunk.candidate_id.in_(allowed_candidate_ids),
                KnowledgeChunk.candidate_id.is_(None),
            )
        )

    if allowed_company_ids is not None:
        query = query.filter(
            or_(
                KnowledgeChunk.company_id.in_(allowed_company_ids),
                KnowledgeChunk.company_id.is_(None),
            )
        )

    chunks = query.all()
    if not chunks:
        return []

    # Compute cosine similarities
    results: list[tuple[KnowledgeChunk, float]] = []
    for chunk in chunks:
        if chunk.embedding is not None:
            # Handle both list and pgvector Vector type
            emb_list = list(chunk.embedding) if hasattr(chunk.embedding, "__iter__") else []
            sim = cosine_similarity(query_embedding, emb_list)
            if sim >= min_similarity:
                results.append((chunk, sim))

    # Sort descending by similarity
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]
