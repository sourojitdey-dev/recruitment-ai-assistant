from fastapi import FastAPI

from app.api.v1.endpoints.auth import router as auth_router

app = FastAPI(
    title="AI-Powered Recruitment, Resume and Career Assistant",
    version="1.0.0",
)

app.include_router(
    auth_router,
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