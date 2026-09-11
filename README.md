# AI-Powered Recruitment, Resume and Career Assistant
**BCA(H) Final Capstone Project | Group-E | Python, FastAPI, pgvector & AI Engineering**

---

## 📌 1. Project Overview & Objectives

**AI-Powered Recruitment, Resume and Career Assistant** is an enterprise-grade AI platform designed to automate and streamline recruitment workflows while providing candidates with grounded, privacy-preserving career guidance. 

The application is built with a **high-performance, unified single-process architecture** where the FastAPI backend serves both the asynchronous REST / WebSocket APIs and the rich, responsive **Vanilla HTML5, CSS3 (Glassmorphism), and Modular ES6+ Single Page Application (SPA)** with zero Node.js or npm build dependencies.

### 🎯 Key Objectives:
- **Role-Based Workflow Management**: Dedicated portals and dashboards for **Candidates**, **Recruiters**, **Interviewers**, and **Admins**.
- **Automated Resume & Document Processing**: Upload PDF resumes and company policy documents with PyMuPDF text extraction.
- **pgvector Vector Database & Embeddings**: Index jobs, candidate profiles, and company knowledge into 384-dimensional vector embeddings using `sentence-transformers/all-MiniLM-L6-v2`.
- **Grounded Semantic AI Matching**: Compute candidate-to-job match scores with transparent skill breakdowns (strong matches, partial matches, potential skill gaps) and source citations.
- **RAG Career Advisory Chatbot**: Real-time AI assistant (via REST and WebSockets) grounded strictly in authorized database records and company documents, with prompt safety guardrails and fallback modes.
- **Company-Level Multi-Tenant Isolation**: Enforce zero cross-company data leakage (applications, resumes, interviews, and vector chunks are strictly scoped by company).
- **Advisory Only / Ethical AI Hiring**: Clear compliance disclaimer that AI outputs are recommendations to assist humans, never autonomous hiring decisions.
- **Unified Full-Stack Runtime**: Zero npm / Webpack / Vite build steps required. The complete glassmorphic web UI is rendered and routed entirely in the browser and served directly by FastAPI.

---

## 🏗️ 2. System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend (Vanilla HTML5 + CSS3 Glassmorphism + Modular ES6+ SPA)"]
        Landing["Landing & Public Showcase (#/)"]
        AuthPages["Authentication & Role Gate (#/login, #/register)"]
        CandDash["Candidate Portal (#/dashboard, #/jobs, #/resume)"]
        RecDash["Recruiter Portal & Matcher (#/recruiter/jobs, #/recruiter/match)"]
        IntDash["Interviewer Evaluations (#/interviewer/interviews)"]
        AIChat["AI Career Assistant (#/chat via REST / WebSockets)"]
    end

    subgraph Backend["Backend (FastAPI + Python 3.12 + Uvicorn)"]
        StaticServer["Static SPA Server (app/static/*)"]
        AuthRouter["Auth & JWT RBAC (/api/v1/auth, /api/v1/users)"]
        JobRouter["Jobs CRUD & Scope (/api/v1/jobs)"]
        AppRouter["Applications & Pipeline (/api/v1/applications)"]
        IntRouter["Interviews & Dropdown (/api/v1/interviews)"]
        DocRouter["Documents & Ingestion (/api/v1/documents)"]
        MatchRouter["Semantic Matcher (/api/v1/match)"]
        ChatRouter["RAG & WebSocket Chat (/api/v1/chat, /ws/chat)"]
    end

    subgraph AIServices["AI & Vector Pipeline"]
        Embedder["SentenceTransformer (all-MiniLM-L6-v2, 384-dim)"]
        Chunker["Boundary-Aware Text Chunker"]
        Retriever["Scoped Multi-Tenant Vector Retriever"]
        PrivacyGuard["Privacy & Safety Guardrails"]
        LLM["Groq LLM (Llama 3.3) / RetrievalOnlyProvider"]
    end

    subgraph Storage["Data & Vector Persistence"]
        PG["PostgreSQL 16"]
        PGVec["pgvector Extension (cosine similarity)"]
        Files["storage/ (PDF Resumes & Policy Documents)"]
    end

    Client <-->|REST & WebSockets| Backend
    Backend <--> AIServices
    Backend <--> PG
    AIServices <--> PGVec
    Backend <--> Files
```

---

## 💻 3. Technology Stack

| Layer | Technologies Used | Details |
| :--- | :--- | :--- |
| **Backend Framework** | Python 3.12, FastAPI, Uvicorn, Pydantic v2 | High-performance asynchronous API & Static Web Server |
| **Database & ORM** | PostgreSQL 16, SQLAlchemy 2.x, Alembic, pgvector | ACID relational persistence with 384-dim vector indexing |
| **Authentication** | JWT (PyJWT), pwdlib (Argon2 / Bcrypt) | Role-Based Access Control (RBAC) with secure hashed passwords |
| **Document Parsing**| PyMuPDF (fitz), pypdf, python-docx | High-fidelity text extraction from PDF & DOCX resumes |
| **Vector Embeddings**| SentenceTransformers (`all-MiniLM-L6-v2`) | In-memory singleton generating 384-dimensional dense vectors |
| **LLM & RAG Engine**| Groq Cloud API (`llama-3.3-70b-versatile`) | Cloud LLM with automatic offline `RetrievalOnlyProvider` fallback |
| **Real-Time Layer** | FastAPI WebSockets, Native Browser WebSocket API | Full-duplex streaming chat and live assistant guidance |
| **Frontend UI / SPA**| Vanilla HTML5, CSS3, Modern ES6+ JavaScript | Glassmorphic Dark UI, Hash Router, Fetch API Client, SVG Icons |
| **Automated Testing**| pytest, httpx, Starlette TestClient | 28 unit and integration tests with in-memory SQLite isolation |
| **DevOps & Containers**| Docker, Docker Compose | Multi-stage slim container packaging Python backend + pgvector DB |

---

## 📂 4. Project Folder Structure

```
recruitment-ai-assistant/
├── alembic/                      # Database migrations
│   ├── env.py                    # Alembic runtime environment
│   └── versions/                 # Revision migration scripts
├── app/                          # FastAPI Full-Stack Application
│   ├── api/
│   │   ├── deps.py               # Dependency injection (get_db, JWT, require_roles)
│   │   └── v1/
│   │       └── endpoints/        # REST API Routers
│   │           ├── applications.py
│   │           ├── auth.py
│   │           ├── candidates.py
│   │           ├── chat.py
│   │           ├── companies.py
│   │           ├── documents.py
│   │           ├── interviews.py
│   │           ├── jobs.py
│   │           ├── match.py
│   │           ├── resumes.py
│   │           └── users.py
│   ├── core/
│   │   ├── config.py             # Pydantic BaseSettings (.env loading)
│   │   └── security.py           # Password hashing & JWT generation
│   ├── db/
│   │   ├── base.py               # SQLAlchemy DeclarativeBase & Model Registry
│   │   └── session.py            # Engine & SessionLocal maker
│   ├── llm/
│   │   ├── base.py               # Abstract LLM Interface
│   │   ├── factory.py            # Provider factory (Groq vs. RetrievalOnly)
│   │   ├── groq_provider.py      # Groq cloud API provider
│   │   └── retrieval_only.py     # Deterministic offline RAG synthesizer
│   ├── models/                   # SQLAlchemy ORM Models
│   │   ├── application.py
│   │   ├── candidate.py
│   │   ├── chat_message.py
│   │   ├── chat_session.py
│   │   ├── company.py
│   │   ├── interview.py
│   │   ├── job.py
│   │   ├── knowledge_chunk.py    # Vector(384) pgvector chunks
│   │   ├── knowledge_document.py
│   │   ├── resume.py
│   │   └── user.py
│   ├── schemas/                  # Pydantic input/output validation schemas
│   ├── services/                 # Business logic & AI algorithms
│   │   ├── chat_service.py
│   │   ├── chunking.py           # Paragraph & sentence boundary chunker
│   │   ├── company.py
│   │   ├── document_loader.py
│   │   ├── embedding.py          # Singleton SentenceTransformer loader
│   │   ├── match_service.py      # Semantic matching & skill breakdown
│   │   ├── privacy_guard.py      # Safety checks & disclaimer injection
│   │   ├── prompt_builder.py     # RAG prompt construction
│   │   ├── rag_service.py
│   │   ├── retriever.py          # Multi-tenant scoped vector search
│   │   └── vector_store.py       # Chunk indexing & similarity search
│   ├── static/                   # Pure Vanilla HTML5 / CSS3 / ES6+ SPA Frontend
│   │   ├── css/
│   │   │   └── style.css         # Glassmorphism design system & responsive layout
│   │   ├── js/
│   │   │   ├── api.js            # Fetch API client with automatic JWT handling
│   │   │   ├── app.js            # SPA bootstrap and session initialization
│   │   │   ├── auth.js           # Auth state manager & session validator
│   │   │   ├── components.js     # Glass UI components (Navbar, Sidebar, Modals, Badges, Toasts)
│   │   │   ├── icons.js          # Clean inline SVG icon definitions
│   │   │   ├── router.js         # Hash SPA router with role-based route guards
│   │   │   └── pages/            # Role-specific SPA page views
│   │   │       ├── auth.js       # Login, Register, Password Reset
│   │   │       ├── candidate.js  # Candidate Dashboard, Jobs Explorer, Resume Manager
│   │   │       ├── chat.js       # Real-time WebSocket + REST Career Assistant Chat
│   │   │       ├── interviewer.js# Interviewer Dashboard & Status Updates
│   │   │       ├── landing.js    # Public Landing Page & Interactive Showcase
│   │   │       ├── profile.js    # User Profile & Competencies
│   │   │       └── recruiter.js  # Recruiter Dashboard, Jobs CRUD, Matcher, Document Store
│   │   ├── chat.html             # Standalone fallback chat UI
│   │   └── index.html            # Main single-page web application container
│   ├── websocket/                # WebSocket chat handler & connection manager
│   └── main.py                   # FastAPI app entry point, static mount & CORS
├── scripts/                      # Setup & Ingestion Utilities
│   ├── check_local_setup.py      # Environment health check script
│   ├── create_admin.py           # Administrator account generator
│   ├── ingest_knowledge_base.py  # Sample documents and vector seeding
│   └── seed_company_policies.py  # Company policy seeder
├── storage/                      # Uploaded files
│   ├── documents/                # Ingested company policy documents
│   └── resumes/                  # Uploaded PDF/DOCX candidate resumes
├── tests/                        # Automated Pytest Suite
│   ├── conftest.py               # SQLite in-memory fixtures & mock tokens
│   ├── integration/              # Integration test suites (Auth, Jobs, Match, Chat, etc.)
│   └── unit/                     # Unit test suites (Security, Embedding, Chunking)
├── Dockerfile                    # Multi-stage Python 3.12 Dockerfile
├── docker-compose.yml            # PostgreSQL with pgvector + Backend service
├── requirements.txt              # Pinned Python dependencies
├── pytest.ini                    # Pytest configuration
└── README.md                     # Comprehensive project documentation
```

---

## ⚡ 5. Local Setup Guide (Step-by-Step)

### Prerequisites:
- **Python 3.11+** installed
- **PostgreSQL 15+** with `pgvector` installed (or use Docker Compose)
- *Note: No Node.js or npm is required! The entire full-stack application runs with Python.*

---

### Step 1: Clone Repository & Create Virtual Environment
```bash
git clone <your-repository-url>
cd recruitment-ai-assistant

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux / macOS:
source .venv/bin/activate
```

---

### Step 2: Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Step 3: Configure Environment Variables
Copy the template configuration into `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your database credentials and optional Groq API key:
```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/recruitment_db
SECRET_KEY=your-secure-32-character-secret-key-here
GROQ_API_KEY=your_groq_api_key_or_leave_blank_for_local_fallback
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
> [!NOTE]
> If `GROQ_API_KEY` is omitted or empty, the system automatically uses the offline `RetrievalOnlyProvider` without errors, synthesizing responses directly from vector-retrieved company documents.

---

### Step 4: Run Database Migrations
Make sure your PostgreSQL server is running and the database exists:
```bash
# Apply all database migrations up to head (including pgvector extension)
alembic upgrade head
```

---

### Step 5: Seed Sample Knowledge Base & Create Admin
```bash
# Seed initial company, sample policy documents, and vector embeddings:
python scripts/ingest_knowledge_base.py

# Create system administrator account:
python scripts/create_admin.py
```

---

### Step 6: Start the Unified Application Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Now open your browser and navigate to:
- **Web Application (SPA Frontend)**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Interactive API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc API Docs**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check Endpoint**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🧪 6. Running Automated Tests

Run the full automated test suite using `pytest`:
```bash
# Run all unit and integration tests:
python -m pytest -v

# Run with concise summary:
python -m pytest -q
```

### Verified Test Coverage (28 / 28 Passed):
- `tests/unit/test_security_and_auth.py`: Password hashing, JWT token verification, recruiter code generator.
- `tests/unit/test_embedding_and_chunking.py`: Paragraph chunking, 384-dim SentenceTransformer, skill extraction.
- `tests/integration/test_auth_api.py`: Registration for candidate/recruiter/interviewer, login, security question password reset.
- `tests/integration/test_companies_and_jobs.py`: Company isolation, job creation, recruiter updating/deletion.
- `tests/integration/test_candidates_and_resumes.py`: Candidate profile CRUD, PDF resume upload and text extraction.
- `tests/integration/test_applications_and_interviews.py`: Job applications, duplicate prevention, recruiter status update, interviewer dropdown, interview scheduling, interviewer status updates.
- `tests/integration/test_documents_and_rag.py`: Recruiter document upload, multi-tenant isolation, vector re-indexing.
- `tests/integration/test_matching_and_chat.py`: Candidate-to-job matching, recruiter candidate ranking, match breakdown, AI RAG chat, prompt safety guardrails.

---

## 🐳 7. Docker & Docker Compose Setup

Run the complete full-stack platform (PostgreSQL 16 with pgvector + FastAPI unified backend and frontend) inside isolated Docker containers:

### Start with Docker Compose:
```bash
docker compose up --build -d
```

### Check Running Containers:
```bash
docker compose ps
```

### Apply Migrations inside Container:
```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/ingest_knowledge_base.py
```

### Access Application:
Visit **[http://localhost:8000](http://localhost:8000)** in your browser.

### Stop Containers:
```bash
docker compose down
```

---

## 🔑 8. User Roles & Access Control

| Role | Access & Permissions |
| :--- | :--- |
| **Candidate** | Browse active jobs, apply to jobs, upload & manage PDF/DOCX resume, view application statuses & history, view scheduled interviews, and interact with the AI Career Assistant for interview prep and resume enhancement. |
| **Recruiter** | Post & manage company job listings, review applicants, inspect AI semantic match scores & transparent skill breakdowns, update application statuses, schedule interviews via dynamic company interviewer dropdown, and upload & vector-index company policy documents. |
| **Interviewer**| View assigned candidate interviews, review applicant resume details, update interview status (`scheduled`, `completed`, `cancelled`) and provide structured feedback. |
| **Admin** | System-wide administrative oversight, company verification, user management, and document indexing oversight. |

---

## 🎨 9. Frontend Architecture & Design System

The application features a modern, high-performance **Vanilla HTML5, CSS3, and ES6+ JavaScript Single Page Application (SPA)**:

### 1. Hash-Based SPA Router (`app/static/js/router.js`):
- Listens to `hashchange` events for client-side navigation (`#/`, `#/login`, `#/dashboard`, `#/jobs`, `#/recruiter/jobs`, `#/chat`, etc.).
- Enforces role-based route guards (e.g., Candidates cannot access Recruiter URLs).
- Renders dynamic top Navigation and context-aware Sidebars without full page reloads.

### 2. Glassmorphic Design System (`app/static/css/style.css`):
- Sleek dark aesthetic with backdrop blur (`backdrop-filter: blur(16px)`), subtle translucent borders, and glowing purple/violet gradients.
- Responsive layout using CSS Grid and Flexbox with zero third-party UI framework bloat.
- Reusable components: Glass Buttons, Glass Cards, Match Score Badges, Status Badges, Dynamic Modals, and Toast Notifications.

### 3. API Client & Session Management (`app/static/js/api.js`, `auth.js`):
- Native Fetch API client automatically attaching `Authorization: Bearer <token>` from `localStorage`.
- Automatic 401 token expiration handling and graceful redirects.
- Supports both JSON REST payloads and `multipart/form-data` for resume/document uploads.

### 4. Real-Time Chat & Career Assistant (`app/static/js/pages/chat.js`):
- Dual-mode connection: connects via native WebSockets (`/ws/chat`) for real-time streaming and gracefully falls back to REST POST (`/api/v1/chat/`).
- Interactive source citations linking directly to indexed company policies.

---

## 🤖 10. AI & RAG Pipeline Deep Dive

```mermaid
sequenceDiagram
    autonumber
    actor User as Candidate / Recruiter
    participant Frontend as SPA Frontend
    participant API as FastAPI Router
    participant Retriever as Vector Retriever
    participant PGVec as PostgreSQL (pgvector)
    participant Guard as Privacy Guard
    participant LLM as Groq LLM / Offline Fallback

    User->>Frontend: Submit Chat Query / Job Match Request
    Frontend->>API: POST /api/v1/chat or /api/v1/match
    API->>Retriever: Scoped Query (query_text, company_id, candidate_id)
    Retriever->>PGVec: Cosine Distance Search (<=> 384-dim)
    PGVec-->>Retriever: Top-K Authorized Chunks
    Retriever-->>API: Filtered Context Documents
    API->>Guard: Validate Prompt Safety & Multi-Tenant Scope
    Guard-->>API: Safe Prompt + Context
    API->>LLM: Generate Answer (System Prompt + Strict Context)
    LLM-->>API: Grounded Response + Source Citations + Disclaimer
    API-->>Frontend: Stream / JSON Response
    Frontend-->>User: Render Glassmorphic Answer & Skill Breakdown
```

### 1. Vector Embeddings:
- Uses `sentence-transformers/all-MiniLM-L6-v2` loaded as an in-memory singleton.
- Generates **384-dimensional dense float vectors** for candidate resumes, job requirements, and policy documents.
- Runs with high efficiency on standard CPU environments.

### 2. Chunking Strategy:
- Text is split using boundary-aware paragraph and sentence detection (`chunk_size = 500`, `chunk_overlap = 100`).
- Chunks retain relational metadata (`document_id`, `company_id`, `candidate_id`, `source_type`).

### 3. Multi-Tenant Scoped Retrieval:
- Vector queries strictly filter records by `company_id` before similarity calculation to prevent cross-company data exposure.

### 4. Grounded Matching Engine:
- Combines cosine vector similarity with rule-based technical skill matching.
- Generates transparent breakdowns:
  - **Strong Matches**: Skills present in both job description and resume.
  - **Partial Matches**: Additional candidate competencies.
  - **Potential Gaps**: Required job skills not explicitly found in the resume.
- Outputs an advisory disclaimer with every calculation.

### 5. Grounded Prompt Engineering & Safety:
- Strict system prompt instructs the LLM to answer **only** from authorized context documents.
- If information is missing, the LLM responds: *"The provided documents do not contain enough information to answer this question."*
- Guardrails detect prompt injection attempts and enforce ethical recruitment guidelines.

---

## 🎬 11. Live Classroom Demo Sequence

When presenting the live capstone demo:

1. **Start Backend Server**: Execute `uvicorn app.main:app --reload --port 8000` and navigate to `http://127.0.0.1:8000/`.
2. **Explore Public Landing Page**: Showcase the Hero section, feature pillars, dynamic role cards, and responsive glassmorphism design.
3. **Register Recruiter & Post Job**: Register under demo company, create a *"Senior Backend Engineer"* job listing.
4. **Register Candidate & Upload Resume**: Create a candidate profile, upload a sample PDF resume, and inspect extracted skills.
5. **Candidate Applies to Job**: Apply to the active job and demonstrate duplicate application prevention.
6. **Recruiter Reviews & Schedules Interview**: Move application from `applied` to `shortlisted`, select interviewer from dynamic company dropdown, and schedule interview.
7. **Demonstrate Interviewer Portal**: Log in as the assigned interviewer and mark the interview as `completed`.
8. **Upload Company Policy & Vector Index**: Upload a company policy markdown/PDF document and trigger vector indexing.
9. **Show Semantic Candidate Matching**: Open AI Candidate Matcher to display match score, strong matches, and skill gaps.
10. **Test AI Career Assistant**: Ask a supported question (*"What are the engineering hiring rounds?"*) and an unsupported question to demonstrate zero hallucination.
11. **Run Pytest**: Execute `python -m pytest -q` in the terminal to show 28/28 green test cases.

---

## 🎓 12. Viva Voce Preparation (Top 12 Questions & Answers)

### Q1: What problem does this project solve and who are its users?
> **Answer**: It automates recruitment workflows while providing candidates with grounded, privacy-preserving AI career guidance. Candidates discover matched jobs and interview tips; recruiters manage listings, applications, and AI candidate matching; interviewers conduct scheduled evaluations.

### Q2: Why is FastAPI chosen over Flask or Django for this backend?
> **Answer**: FastAPI offers native asynchronous support, automatic OpenAPI/Swagger documentation, high performance with Starlette/Uvicorn, and built-in type validation using Pydantic.

### Q3: Why is the frontend built with Vanilla HTML5, CSS3, and ES6+ JS instead of a heavy framework like React?
> **Answer**: A native Vanilla JS SPA architecture eliminates build steps, npm dependency vulnerabilities, and bundle bloat. It allows FastAPI to serve the entire application as a unified, single-process service with instant page loads, native WebSockets, and full control over the glassmorphic design system.

### Q4: How does client-side routing work without React Router?
> **Answer**: It listens to the browser `hashchange` event (`#/jobs`, `#/dashboard`). The hash router checks user authentication and role permissions, dynamic components, and renders the view into the `#app-root` DOM container without full page reloads.

### Q5: How does JWT authentication work and how is role-based access enforced?
> **Answer**: Upon login, a signed HS256 JWT containing `user_id` and `role` in the payload is issued. Protected FastAPI endpoints use dependency injection (`require_roles("recruiter")`) to verify the token and enforce role permissions.

### Q6: How is company-level multi-tenant isolation guaranteed?
> **Answer**: Every recruiter and interviewer is linked to a `company_id`. All database queries and vector similarity searches explicitly filter by `company_id`, ensuring Company A cannot view or modify Company B's jobs, candidates, applications, or documents.

### Q7: What are chunking, embeddings, and vector search?
> **Answer**: Chunking splits large documents into manageable text blocks with overlap. Embeddings convert text chunks into dense 384-dimensional mathematical vectors. Vector search calculates cosine similarity between the query vector and chunk vectors to retrieve the most semantically relevant text.

### Q8: Why use pgvector instead of a separate vector database (like Pinecone or Chroma)?
> **Answer**: pgvector embeds vector storage directly inside PostgreSQL. This eliminates data synchronization overhead, simplifies backups and transactions, and allows filtering vectors alongside standard relational metadata in a single ACID query.

### Q9: How does the RAG pipeline prevent hallucination and unsupported answers?
> **Answer**: The prompt builder feeds retrieved context snippets directly into the system prompt with strict instructions: *"Answer ONLY using the provided documents. If missing, state that documents do not contain enough information."*

### Q10: Why is the AI output labeled as advisory rather than an automated decision?
> **Answer**: AI recruitment systems must adhere to ethical AI practices. Match scores and chatbot responses are advisory recommendations to assist human decision-makers, avoiding biased or discriminatory automated hiring/rejection.

### Q11: How do Alembic database migrations benefit the development lifecycle?
> **Answer**: Alembic provides version-controlled schema migrations, allowing team members and deployment pipelines to reproduce database schema changes incrementally from a clean state without data loss.

### Q12: How does real-time chat communicate with FastAPI?
> **Answer**: The browser establishes a standard `WebSocket` connection (`/ws/chat?token=<token>`). Messages sent as JSON are processed by the backend RAG pipeline and answers are streamed back in real-time, with automatic fallback to REST.

---

## 🌐 13. Free Deployment Preparation

The unified single-server architecture makes cloud deployment simple:
- **Unified Full-Stack App**: Deploy as a single service on **Render / Railway / Fly.io** using the provided `Dockerfile` (FastAPI serves both API and static frontend).
- **Managed Database**: Free managed PostgreSQL with `pgvector` on **Supabase / Neon.tech / Render Postgres**.
- **No separate frontend hosting needed**: Because the frontend is served directly as static files by FastAPI, no separate Vercel or Netlify frontend server is required.

---

## 👥 14. Group Contribution (Group-E)

- **Sourajit De**: Project architecture, database setup, JWT authentication, role-based access, Alembic migrations, and full-stack integration.
- **Suhin Das**: Job, candidate profile, and resume APIs with PyMuPDF text extraction.
- **Sukanya Chandra**: Application and interview workflows, status transition rules, and automated test suites.
- **Somnath Mandal**: Vector chunking, pgvector indexing, semantic matching engine, RAG chatbot, WebSocket handler, and glassmorphic UI.

---
*Developed for BCA(H) Capstone Project - University & Viva Evaluation.*
