# 🚀 Frontend Architecture & Viva Guide (For Beginners)

This guide explains the entire frontend structure in simple terms so you can understand and explain it during your viva or presentation within 10 minutes!

---

## 1. 🏗️ How the Frontend is Built

The frontend is built using **React 18** with **Vite** (for fast building) and **Tailwind CSS** (for styling).

It follows 3 simple layers:
1. **API Client (`src/api/client.js`)**: An Axios instance that automatically adds your JWT token (`Authorization: Bearer <token>`) to every request sent to the FastAPI backend at `/api/v1`.
2. **Auth Context (`src/context/AuthContext.jsx`)**: A single React Context that remembers who is currently logged in, their role (`candidate`, `recruiter`, `interviewer`, or `admin`), and provides `login()` and `logout()`.
3. **Pages (`src/pages/`) & Components (`src/components/`)**: Clean screens and building blocks.

---

## 2. 🧩 The 6 Core Reusable Components

| Component | File | What it Does |
| :--- | :--- | :--- |
| **Navbar** | `src/components/Navbar.jsx` | Top navigation bar showing brand logo, user role badge, AI Assistant link, and Logout button. |
| **Sidebar** | `src/components/Sidebar.jsx` | Left menu that automatically shows links matching your user role (`Candidate`, `Recruiter`, or `Interviewer`). |
| **GlassCard** | `src/components/GlassCard.jsx` | Translucent container box with a sleek purple/blue dark glassmorphic finish. |
| **GlassButton** | `src/components/GlassButton.jsx` | Buttons supporting `primary` (gradient purple), `secondary`, `outline`, and `danger` with built-in loading spinners. |
| **StatusBadge** | `src/components/StatusBadge.jsx` | Colored pills for statuses: `applied` (blue), `screening` (amber), `shortlisted` (purple), `hired` (green), `rejected` (red). |
| **MatchScoreBadge** | `src/components/MatchScoreBadge.jsx` | Glowing percentage badge (e.g. `92% Match`) based on AI cosine similarity. |
| **Modal** | `src/components/Modal.jsx` | Pop-up dialog for reviewing candidates, editing jobs, and scheduling interviews. |

---

## 3. 📄 Key Pages Explained (Role by Role)

### 👤 Candidate Workflow:
- **`CandidateDashboard.jsx`**: Summary card showing application count, interview count, resume upload status, and top recommended job matches.
- **`CandidateJobsPage.jsx`**: Lists all active jobs with search bar and location filter. Shows AI match score and an **"Apply Now"** button.
- **`CandidateResumePage.jsx`**: Allows candidate to upload a PDF resume. Calls `/api/v1/resumes/` which extracts text with PyMuPDF and indexes it with pgvector.
- **`CandidateApplicationsPage.jsx`**: Shows the status timeline of submitted applications (`Applied` ➔ `Screening` ➔ `Shortlisted` ➔ `Hired`).
- **`CandidateInterviewsPage.jsx`**: Shows scheduled technical interview dates and interviewer names.
- **`AICareerAssistantPage.jsx`**: Chat interface with ChatGPT-like bubbles, quick suggestion prompts, and source citations. Connects via real-time WebSocket `/ws/chat` with REST fallback.

### 🏢 Recruiter Workflow:
- **`RecruiterDashboard.jsx`**: Overview stats (Active Jobs, Candidates, Applications, Scheduled Interviews).
- **`RecruiterJobsPage.jsx`**: Create, edit, and delete job postings for their company.
- **`RecruiterApplicationsPage.jsx`**: Review applicants, inspect AI match scores & skill breakdowns, update application status, and schedule interviews.
- **`RecruiterInterviewsPage.jsx`**: Manage scheduled interviews using a dynamic dropdown of company interviewers (`GET /api/v1/interviews/interviewers`).
- **`RecruiterDocumentsPage.jsx`**: Upload company policies and FAQs, triggering automatic chunking and pgvector indexing.
- **`RecruiterAIMatchingPage.jsx`**: Select any job to see all candidates ranked by semantic compatibility with strong skills, partial matches, and gaps.

### 🧑‍💻 Interviewer Workflow:
- **`InterviewerDashboard.jsx`**: Clean view of interviews assigned exclusively to that interviewer with status updater (`Scheduled`, `Completed`, `Cancelled`).

---

## 4. 🎤 Viva Cheatsheet (Top 5 Frontend Questions & Answers)

**Q1: How does authentication persist across page reloads?**
> **Answer**: When you log in, the JWT token and user profile are saved in browser `localStorage`. On page load, `AuthContext` reads the token and calls `/api/v1/auth/me` to verify the session.

**Q2: How are routes protected by user role?**
> **Answer**: `ProtectedRoute` in `App.jsx` checks `isAuthenticated` and `allowedRoles`. If a candidate tries to access `/recruiter/jobs`, they are automatically redirected.

**Q3: How does the frontend communicate with the backend?**
> **Answer**: `api/client.js` uses Axios. In development, `vite.config.js` proxies `/api` requests to `http://127.0.0.1:8000` to avoid CORS issues.

**Q4: How does real-time chat work?**
> **Answer**: `AICareerAssistantPage.jsx` opens a WebSocket connection to `ws://127.0.0.1:8000/ws/chat`. If the WebSocket is unavailable, it gracefully falls back to the REST POST `/api/v1/chat/` endpoint.

**Q5: What is Glassmorphism?**
> **Answer**: A modern visual UI design style featuring background blur (`backdrop-filter: blur(16px)`), translucent dark panels, subtle glowing borders, and rounded corners for a futuristic aesthetic.
