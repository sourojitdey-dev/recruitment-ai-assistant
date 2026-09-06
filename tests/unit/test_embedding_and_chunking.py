from app.services.chunking import chunk_text, clean_text
from app.services.embedding import get_embedding_service
from app.services.match_service import calculate_skill_breakdown, extract_skills_from_text


def test_clean_and_chunk_text():
    raw_text = "This is paragraph 1 with some text.\n\nThis is paragraph 2 with more text. It has multiple sentences."
    cleaned = clean_text(raw_text)
    assert "\n\n" in cleaned

    chunks = chunk_text(cleaned, chunk_size=50, chunk_overlap=10)
    assert len(chunks) >= 1
    for c in chunks:
        assert "text" in c
        assert "index" in c


def test_embedding_service_dimension():
    embedder = get_embedding_service()
    vec = embedder.embed_text("FastAPI backend recruitment system")
    assert isinstance(vec, list)
    assert len(vec) == 384


def test_skill_extraction_and_breakdown():
    job_desc = "We need a Senior Engineer with Python, FastAPI, PostgreSQL, and AWS expertise."
    resume_text = "Experienced in Python, FastAPI, Docker, and PostgreSQL databases."

    job_skills = extract_skills_from_text(job_desc)
    assert "Python" in job_skills or "PYTHON" in job_skills
    assert "Fastapi" in job_skills or "FASTAPI" in job_skills

    strong, partial, gaps = calculate_skill_breakdown(job_desc, resume_text)
    assert any("python" in s.lower() for s in strong)
    assert any("fastapi" in s.lower() for s in strong)
    assert any("aws" in g.lower() for g in gaps)
