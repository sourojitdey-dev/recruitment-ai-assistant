# AI-Powered Recruitment, Resume and Career Assistant
**BCA(H) Final Capstone Project | Group-E | Python, FastAPI & AI Engineering**

---

## 📌 1. Project Overview & Objectives

**AI-Powered Recruitment, Resume and Career Assistant** is a modern, enterprise-grade AI platform designed to automate and augment recruitment workflows while providing candidates with grounded, privacy-preserving career guidance.

### 🎯 Key Objectives:
- **Role-Based Workflow Management**: Separate portals and dashboards for **Candidates**, **Recruiters**, **Interviewers**, and **Admins**.
- **Automated Resume & Document Processing**: Upload PDF resumes and company policy documents with PyMuPDF text extraction.
- **pgvector Vector Database & Embeddings**: Index jobs, candidate profiles, and company knowledge into 384-dimensional vector embeddings using `sentence-transformers/all-MiniLM-L6-v2`.
- **Grounded Semantic AI Matching**: Compute candidate-to-job match scores with transparent skill breakdowns (strong matches, partial matches, potential skill gaps) and source citations.
- **RAG Career Advisory Chatbot**: Real-time AI assistant (via REST and WebSockets) grounded strictly in authorized database records and company documents, with prompt safety guardrails and fallback modes.
- **Company-Level Multi-Tenant Isolation**: Enforce zero cross-company data leakage (applications, resumes, interviews, and vector chunks are strictly scoped).
- **Advisory Only / No Automated Hiring**: Clear compliance disclaimer that AI outputs are recommendations and never automated hiring decisions.

---

## 🏗️ 2. System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend (React + Vite + Glassmorphism UI)"]
        Landing["Landing & Auth Pages"]
        CandDash["Candidate Dashboard & Jobs"]
        RecDash["Recruiter Portal & Matching"]
        IntDash["Interviewer Schedules"]
        AIChat["AI Career Assistant (REST/WebSocket)"]
    end

    subgraph Backend["Backend (FastAPI + Python 3.12)"]
        AuthRouter["Auth & JWT RBAC (/api/v1/auth)"]
        JobRouter["Jobs CRUD & Scope (/api/v1/jobs)"]
        AppRouter["Applications & Timeline (/api/v1/applications)"]
        IntRouter["Interviews & Dropdown (/api/v1/interviews)"]
        DocRouter["Documents & Ingestion (/api/v1/documents)"]
        MatchRouter["Semantic Matcher (/api/v1/match)"]
        ChatRouter["RAG & WebSocket Chat (/api/v1/chat, /ws/chat)"]
    end

    subgraph AIServices["AI & Vector Pipeline"]
        Embedder["SentenceTransformer (all-MiniLM-L6-v2, 384-dim)"]
        Chunker["Boundary-Aware Text Chunker"]
        Retriever["Scoped Vector Retriever"]
        PrivacyGuard["Privacy & Safety Guardrails"]
        LLM["Groq LLM / RetrievalFallback"]
    end

    subgraph Storage["Data & Vector Persistence"]
        PG["PostgreSQL 16"]
        PGVec["pgvector Extension (cosine distance)"]
        Files["storage/ (PDF Resumes & Documents)"]
    end

    Client <-->|REST & WebSockets| Backend
    Backend <--> AIServices
    Backend <--> PG
    AIServices <--> PGVec
    Backend <--> Files
```

---

## 💻 3. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, pydantic-settings, Uvicorn |
| **Database & ORM** | PostgreSQL 16, SQLAlchemy 2.x, Alembic, pgvector |
| **Authentication** | JWT (PyJWT), pwdlib (Argon2 / Bcrypt), Role-Based Access Control (RBAC) |
| **Document Processing**| PyMuPDF (fitz), pypdf, python-docx |
| **AI / Embeddings** | SentenceTransformers (`sentence-transformers/all-MiniLM-L6-v2`, 384-dim) |
| **LLM & RAG** | Groq API (Llama-3.3-70b-versatile) with fallback `RetrievalOnlyProvider` |
| **Real-Time** | FastAPI WebSockets, websockets |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6 |
| **Testing** | pytest, httpx, TestClient (27 unit & integration tests) |
| **DevOps & Containers**| Docker, Docker Compose (multi-stage builds) |

---

## 📂 4. Project Folder Structure

```
recruitment-ai-assistant/
├── alembic/                      # Database migrations
│   ├── env.py
│   └── versions/                 # Alembic revision scripts
├── app/                          # FastAPI Backend Application
│   ├── api/
│   │   ├── deps.py               # Dependency injection (get_db, JWT, require_roles)
│   │   └── v1/
│   │       └── endpoints/        # API Routers
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
│   │   ├── config.py             # App settings from .env
│   │   └── security.py           # Password hashing & JWT generation
│   ├── db/
│   │   ├── base.py               # SQLAlchemy DeclarativeBase
│   │   └── session.py            # Engine & SessionLocal
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
│   ├── schemas/                  # Pydantic validation schemas
│   ├── services/                 # Business logic & AI algorithms
│   │   ├── chat_service.py
│   │   ├── chunking.py
│   │   ├── company.py
│   │   ├── document_loader.py
│   │   ├── embedding.py          # Singleton SentenceTransformer loader
│   │   ├── match_service.py      # Semantic matching & skill breakdown
│   │   ├── privacy_guard.py      # Safety checks & disclaimer injection
│   │   ├── prompt_builder.py     # RAG prompt construction
│   │   ├── rag_service.py
│   │   ├── retriever.py          # Scoped vector search
│   │   └── vector_store.py       # Chunk indexing & similarity search
│   ├── static/                   # Static HTML/JS chat test page
│   ├── websocket/                # WebSocket chat handler & connection manager
│   └── main.py                   # FastAPI app entry point & CORS
├── frontend/                     # React 18 + Vite Frontend
│   ├── src/
│   │   ├── api/client.js         # Axios HTTP client with JWT interceptor
│   │   ├── components/           # Reusable Glassmorphic UI components
│   │   │   ├── GlassButton.jsx
│   │   │   ├── GlassCard.jsx
│   │   │   ├── MatchScoreBadge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/                # 20 role-specific pages
│   │   ├── App.jsx               # Client routing & ProtectedRoute
│   │   └── index.css             # Glassmorphic dark styling
│   ├── package.json
│   └── vite.config.js
├── scripts/                      # Setup & Ingestion Scripts
│   ├── check_local_setup.py
│   ├── create_admin.py
│   └── ingest_knowledge_base.py
├── storage/                      # Uploaded files
│   ├── documents/
│   └── resumes/
├── tests/                        # Pytest test suite
│   ├── conftest.py               # SQLite in-memory fixtures & mock tokens
│   ├── integration/              # Integration test suites
│   └── unit/                     # Unit test suites
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # PostgreSQL with pgvector + Backend service
├── requirements.txt              # Pinned Python dependencies
├── pytest.ini
└── README.md
```

---

## ⚡ 5. Local Setup Guide (Step-by-Step)

### Prerequisites:
- **Python 3.11+** installed
- **Node.js 18+** and **npm** installed
- **PostgreSQL 15+** with `pgvector` installed (or use Docker)

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
*(Note: If `GROQ_API_KEY` is not supplied, the system automatically uses the offline `RetrievalOnlyProvider` without crashing!)*

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

### Step 6: Start FastAPI Backend
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Docs (Swagger UI): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### Step 7: Start React Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🧪 6. Running Automated Tests

Run the full automated test suite using `pytest`:
```bash
# Run all unit and integration tests:
python -m pytest -v

# Run with concise summary:
python -m pytest -q
```

### Verified Test Coverage (27 / 27 Passed):
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

Run the complete stack (PostgreSQL with pgvector + FastAPI backend) inside isolated containers:

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

### Stop Containers:
```bash
docker compose down
```

---

## 🔑 8. User Roles & Access Control

| Role | Access & Permissions |
| :--- | :--- |
| **Candidate** | Browse active jobs, apply to jobs, upload & manage PDF resume, view application statuses, view assigned interviews, and use the AI Career Assistant for resume & interview guidance. |
| **Recruiter** | Post & manage company jobs, view company applications, review candidate resumes, inspect AI match scores & explanations, update application statuses, schedule interviews via dynamic interviewer dropdown, upload & vector-index company policy documents. |
| **Interviewer**| View assigned interviews, inspect applicant candidate details, update interview status (`scheduled`, `completed`, `cancelled`). |
| **Admin** | System-wide administrative access, company management, and document indexing oversight. |

---

## 🤖 9. AI & RAG Pipeline Deep Dive

### 1. Vector Embeddings:
- Uses `sentence-transformers/all-MiniLM-L6-v2` loaded as an in-memory singleton.
- Embeds candidate profiles, job descriptions, and approved documents into **384-dimensional float vectors**.
- Runs efficiently on CPU without requiring a GPU.

### 2. Chunking Strategy:
- Text is normalized and split on sentence/paragraph boundaries with `chunk_size = 500` and `chunk_overlap = 100`.
- Chunks store metadata (document ID, company ID, candidate ID, job ID, source type).

### 3. Multi-Tenant Scoped Retrieval:
- Vector queries strictly filter records by `company_id` and `candidate_id` before similarity calculation to prevent cross-company data exposure.

### 4. Grounded Matching Engine:
- Combines cosine vector similarity with regex-based technical skill matching.
- Generates transparent breakdowns:
  - **Strong Matches**: Skills present in both job description and resume.
  - **Partial Matches**: Additional candidate skills.
  - **Potential Gaps**: Required skills not explicitly mentioned in the resume.
- Outputs an advisory disclaimer with every calculation.

### 5. Grounded Prompt Engineering & Safety:
- The system prompt instructs the LLM to answer **only** from authorized context documents.
- If information is missing, the LLM responds: *"The provided documents do not contain enough information to answer this question."*
- Guardrails detect prompt injection patterns and prevent automated hiring promises.

---

## 🎬 10. Live Classroom Demo Sequence

When presenting the live capstone demo:

1. **Show Directory Structure & `.env.example`**: Highlight modular structure separating routes, models, schemas, and AI services.
2. **Start Backend & Open `/docs`**: Execute `uvicorn app.main:app --reload` and call `/health`.
3. **Register Recruiter & Create Job**: Register under demo company, create a *"Senior Backend Engineer"* job.
4. **Register Candidate & Upload Resume**: Create a candidate profile, upload a sample PDF resume, and show extracted text.
5. **Candidate Applies to Job**: Apply to the active job and demonstrate duplicate application rejection.
6. **Recruiter Updates Status & Schedules Interview**: Move application from `applied` to `shortlisted`, select interviewer from dynamic dropdown, and schedule interview.
7. **Demonstrate Interviewer Portal**: Log in as the assigned interviewer and mark the interview as `completed`.
8. **Upload Company Policy & Vector Index**: Upload a remote work policy markdown document and trigger vector indexing.
9. **Show Semantic Candidate Matching**: Open AI Candidate Matcher to display match score, strong matches, and skill gaps.
10. **Test AI Career Assistant**: Ask a supported question (*"What are the engineering hiring rounds?"*) and an unsupported question to demonstrate no fabrication.
11. **Run Pytest**: Execute `pytest -q` to show 27/27 green test cases.

---

## 🎓 11. Viva Voce Preparation (Top 10 Questions & Answers)

### Q1: What problem does this project solve and who are its users?
> **Answer**: It bridges recruitment workflows with grounded AI assistance. Candidates get resume feedback and job recommendations; recruiters manage company jobs, applications, and AI candidate matching; interviewers conduct scheduled evaluations.

### Q2: Why is FastAPI chosen over Flask or Django for this backend?
> **Answer**: FastAPI offers native asynchronous support, automatic OpenAPI/Swagger documentation, high performance with Starlette/Uvicorn, and built-in type validation using Pydantic.

### Q3: Why are Pydantic schemas separated from SQLAlchemy models?
> **Answer**: SQLAlchemy models represent the database tables and relational mappings, while Pydantic schemas validate input data, sanitize outputs, and enforce API serialization contracts.

### Q4: How does JWT authentication work and how is role-based access enforced?
> **Answer**: Upon login, a signed HS256 JWT containing `user_id` and `role` in the payload is issued. Protected FastAPI endpoints use dependency injection (`require_roles("recruiter")`) to verify the token and enforce role permissions.

### Q5: How is company-level multi-tenant isolation guaranteed?
> **Answer**: Every recruiter and interviewer is linked to a `company_id`. All database queries and vector similarity searches explicitly filter by `company_id`, ensuring Company A cannot view or modify Company B's jobs, candidates, applications, or documents.

### Q6: What are chunking, embeddings, and vector search?
> **Answer**: Chunking splits large documents into manageable text blocks with overlap. Embeddings convert text chunks into dense 384-dimensional mathematical vectors. Vector search calculates cosine similarity between the query vector and chunk vectors to retrieve the most semantically relevant text.

### Q7: Why use pgvector instead of a separate vector database?
> **Answer**: pgvector embeds vector storage directly inside PostgreSQL. This eliminates data synchronization overhead, simplifies backups and transactions, and allows filtering vectors alongside standard relational metadata in a single ACID query.

### Q8: How does the RAG pipeline prevent hallucination and unsupported answers?
> **Answer**: The prompt builder feeds retrieved context snippets directly into the system prompt with strict instructions: *"Answer ONLY using the provided documents. If missing, state that documents do not contain enough information."*

### Q9: Why is the AI output labeled as advisory rather than an automated decision?
> **Answer**: AI recruitment systems must adhere to ethical AI practices. Match scores and chatbot responses are advisory recommendations to assist human decision-makers, avoiding biased or discriminatory automated hiring/rejection.

### Q10: How do Alembic database migrations benefit the development lifecycle?
> **Answer**: Alembic provides version-controlled schema migrations, allowing team members and deployment pipelines to reproduce database schema changes incrementally from a clean state without data loss.

---

## 🌐 12. Free Deployment Preparation

The application is structured for free-tier cloud deployment:
- **Backend**: Can be deployed on **Render / Railway / Fly.io** using the provided `Dockerfile`.
- **Database**: Free managed PostgreSQL with `pgvector` on **Supabase / Neon.tech / Render Postgres**.
- **Frontend**: Can be deployed on **Vercel / Netlify** by building the `frontend/` directory (`npm run build`).

---

## 👥 13. Group Contribution (Group-E)

- **Sourajit De**: Project architecture, database setup, JWT authentication, role-based access, and Alembic migrations.
- **Suhin Das**: Job, candidate profile, and resume APIs with PyMuPDF text extraction.
- **Sukanya Chandra**: Application and interview workflows, status transition rules, and automated test suites.
- **Somnath Mandal**: Vector chunking, pgvector indexing, semantic matching engine, RAG chatbot, WebSocket handler, and glassmorphic UI.

---
*Developed for BCA(H) Capstone Project - Web Skitters / University Evaluation.*
