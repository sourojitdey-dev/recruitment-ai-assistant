from fastapi import FastAPI

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.jobs import router as jobs_router
from app.api.v1.endpoints.companies import router as companies_router
from app.api.v1.endpoints.candidates import router as candidates_router
from app.api.v1.endpoints.resumes import router as resumes_router


app = FastAPI(
    title="AI-Powered Recruitment, Resume and Career Assistant",
    version="1.0.0",
)


app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    jobs_router,
    prefix="/api/v1",
)

app.include_router(
    companies_router,
    prefix="/api/v1",
)

app.include_router(
    candidates_router,
    prefix="/api/v1",
)

app.include_router(
    resumes_router,
    prefix="/api/v1",
)


@app.get("/")
def root():
    return {
        "message": "AI-Powered Recruitment, Resume and Career Assistant"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}