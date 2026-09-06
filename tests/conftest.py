import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.main import app
from app.models.application import Application
from app.models.candidate import Candidate
from app.models.company import Company
from app.models.interview import Interview
from app.models.job import Job
from app.models.knowledge_document import KnowledgeDocument
from app.models.resume import Resume
from app.models.user import User

# Use SQLite in-memory for fast, isolated, deterministic unit/integration testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_company(db_session):
    from app.services.company import hash_company_code
    company = Company(
        name="Acme Corp",
        recruiter_code_hash=hash_company_code("ACME-CODE-123"),
        is_active=True,
    )
    db_session.add(company)
    db_session.commit()
    db_session.refresh(company)
    return company


@pytest.fixture
def other_company(db_session):
    from app.services.company import hash_company_code
    company = Company(
        name="Beta Global",
        recruiter_code_hash=hash_company_code("BETA-CODE-456"),
        is_active=True,
    )
    db_session.add(company)
    db_session.commit()
    db_session.refresh(company)
    return company


@pytest.fixture
def candidate_user(db_session):
    user = User(
        name="Sagnik Saha",
        email="candidate@test.com",
        password_hash=hash_password("Candidate@123"),
        role="candidate",
        favorite_book_hash=hash_password("Clean Code"),
        favorite_person_hash=hash_password("Guido"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def candidate_token(candidate_user):
    return create_access_token(user_id=candidate_user.id, role=candidate_user.role)


@pytest.fixture
def candidate_profile(db_session, candidate_user):
    cand = Candidate(
        user_id=candidate_user.id,
        phone="+91-9876543210",
        location="Kolkata, India",
        bio="Backend engineer skilled in Python, FastAPI, PostgreSQL, Docker, and ML.",
    )
    db_session.add(cand)
    db_session.commit()
    db_session.refresh(cand)
    return cand


@pytest.fixture
def recruiter_user(db_session, test_company):
    user = User(
        name="Alice Recruiter",
        email="recruiter@acme.com",
        password_hash=hash_password("Recruiter@123"),
        role="recruiter",
        company_id=test_company.id,
        favorite_book_hash=hash_password("The Mythical Man-Month"),
        favorite_person_hash=hash_password("Ada Lovelace"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def recruiter_token(recruiter_user):
    return create_access_token(user_id=recruiter_user.id, role=recruiter_user.role)


@pytest.fixture
def other_recruiter_user(db_session, other_company):
    user = User(
        name="Bob Other Recruiter",
        email="recruiter@beta.com",
        password_hash=hash_password("Recruiter@456"),
        role="recruiter",
        company_id=other_company.id,
        favorite_book_hash=hash_password("Design Patterns"),
        favorite_person_hash=hash_password("Turing"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def other_recruiter_token(other_recruiter_user):
    return create_access_token(user_id=other_recruiter_user.id, role=other_recruiter_user.role)


@pytest.fixture
def interviewer_user(db_session, test_company):
    user = User(
        name="Charlie Interviewer",
        email="interviewer@acme.com",
        password_hash=hash_password("Interviewer@123"),
        role="interviewer",
        company_id=test_company.id,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def interviewer_token(interviewer_user):
    return create_access_token(user_id=interviewer_user.id, role=interviewer_user.role)


@pytest.fixture
def test_job(db_session, test_company, recruiter_user):
    job = Job(
        title="Senior Backend Engineer",
        description="We are looking for a Python and FastAPI developer with PostgreSQL, Docker, and AWS experience.",
        location="Remote",
        company_name=test_company.name,
        company_id=test_company.id,
        recruiter_id=recruiter_user.id,
        is_active=True,
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)
    return job
