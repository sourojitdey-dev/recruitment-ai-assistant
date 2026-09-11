from pathlib import Path
from fastapi import FastAPI, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles

from app.api.v1.endpoints.applications import router as applications_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.candidates import router as candidates_router
from app.api.v1.endpoints.chat import router as chat_router
from app.api.v1.endpoints.companies import router as companies_router
from app.api.v1.endpoints.documents import router as documents_router
from app.api.v1.endpoints.interviews import router as interviews_router
from app.api.v1.endpoints.jobs import router as jobs_router
from app.api.v1.endpoints.match import router as match_router
from app.api.v1.endpoints.resumes import router as resumes_router
from app.api.v1.endpoints.users import router as users_router
from app.websocket.chat_handler import handle_chat_websocket


app = FastAPI(
    title="AI-Powered Recruitment, Resume and Career Assistant",
    version="1.0.0",
    description="Enterprise AI Recruitment, Resume Matching, and Career Guidance API",
)

# GZip Compression Middleware (compresses responses > 500 bytes by ~75-80%)
app.add_middleware(GZipMiddleware, minimum_size=500)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def optimize_cache_headers(request, call_next):
    response = await call_next(request)
    path = request.url.path
    if path.startswith("/static"):
        # Cache static JS/CSS/images for 1 day with stale-while-revalidate
        response.headers["Cache-Control"] = "public, max-age=86400, stale-while-revalidate=604800"
    elif path in ("/", "/chat"):
        # Allow instant revalidation for HTML entrypoints
        response.headers["Cache-Control"] = "no-cache, must-revalidate"
    return response


# Mount Static Files
static_dir = Path("app/static")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Mount API Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(jobs_router, prefix="/api/v1")
app.include_router(companies_router, prefix="/api/v1")
app.include_router(candidates_router, prefix="/api/v1")
app.include_router(resumes_router, prefix="/api/v1")
app.include_router(applications_router, prefix="/api/v1")
app.include_router(interviews_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(match_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")


# WebSocket Endpoint
@app.websocket("/ws/chat")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    token: str | None = Query(None),
):
    await handle_chat_websocket(websocket, token)


@app.get("/robots.txt", response_class=PlainTextResponse)
def get_robots_txt():
    return "User-agent: *\nAllow: /\nSitemap: https://recruitai.io/sitemap.xml\n"


@app.get("/sitemap.xml")
def get_sitemap():
    content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://recruitai.io/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://recruitai.io/#/jobs</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://recruitai.io/#/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://recruitai.io/#/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>"""
    return Response(content=content, media_type="application/xml")


@app.get("/chat", response_class=HTMLResponse)
def serve_chat_page():
    index_file = Path("app/static/index.html")
    if index_file.exists():
        return FileResponse(index_file)
    chat_file = Path("app/static/chat.html")
    if chat_file.exists():
        return FileResponse(chat_file)
    return HTMLResponse("<h2>Chat interface static page not found.</h2>")


@app.get("/", response_class=HTMLResponse)
def root():
    index_file = Path("app/static/index.html")
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "message": "AI-Powered Recruitment, Resume and Career Assistant",
        "docs": "/docs",
        "health": "/health",
        "chat_ui": "/chat",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "recruitment-ai-assistant",
        "version": "1.0.0",
    }