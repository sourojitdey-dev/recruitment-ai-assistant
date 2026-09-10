# 🚀 Pure HTML, CSS & JavaScript Frontend Architecture & Viva Guide

This guide explains the entire recreated frontend built with **Vanilla HTML5, CSS3, and ES6+ JavaScript** without any React, Vite, or npm build dependencies!

---

## 1. 🏗️ How the Pure HTML/CSS/JS Frontend is Structured

The frontend is served directly by the FastAPI backend at `http://127.0.0.1:8000/` and located in `app/static/`.

```
app/static/
├── index.html                 # Single page HTML container with Plus Jakarta Sans & design tokens
├── css/
│   └── style.css              # Custom Glassmorphism design system, dark palette, animations & responsive grid
└── js/
    ├── api.js                 # Fetch API wrapper with auto JWT Authorization header & error handling
    ├── auth.js                # Auth state manager (token, user, role permissions, login, register, logout)
    ├── icons.js               # Clean SVG icon definitions (Lucide equivalents)
    ├── components.js          # Reusable UI components (Navbar, Sidebar, Modals, StatusBadges, MatchScoreBadges, Toasts)
    ├── router.js              # Hash-based SPA router with role-protected route guards
    ├── app.js                 # App bootstrap and session initialization
    └── pages/
        ├── landing.js         # Public landing page with feature pillars & role cards
        ├── auth.js            # Login, candidate/recruiter/interviewer register & password recovery
        ├── candidate.js       # Candidate Dashboard, Jobs Explorer (with AI scores), Resume Manager, Applications Pipeline, Interviews
        ├── recruiter.js       # Recruiter Dashboard, Job Manager (CRUD), Applications Review & Interview Scheduler, AI Candidate Matcher, Document Vector Store
        ├── interviewer.js     # Interviewer Dashboard (assigned interviews only, status updater)
        ├── chat.js            # Real-time WebSocket + REST AI Career Assistant chat interface with session history & source citations
        └── profile.js         # User profile & candidate competency editor
```

---

## 2. 🧩 Core Architecture Layers

1. **SPA Hash Router (`js/router.js`)**:
   - Manages client-side navigation using URL hashes (`#/`, `#/login`, `#/dashboard`, `#/jobs`, `#/chat`, etc.).
   - Enforces authentication and user role permissions (e.g., Candidates cannot access `#/recruiter/jobs`).
   - Automatically renders the top Navbar and dynamic role-specific Sidebar.

2. **API Client (`js/api.js`)**:
   - Sends requests to FastAPI at `/api/v1`.
   - Automatically injects `Authorization: Bearer <token>` from `localStorage`.
   - Handles 401 token expiration and supports both JSON payloads and `multipart/form-data` uploads.

3. **Real-Time WebSocket & AI Assistant (`js/pages/chat.js`)**:
   - Connects to `ws://127.0.0.1:8000/ws/chat?token=<token>` for instant streaming AI career guidance.
   - Gracefully falls back to REST POST `/api/v1/chat/` if WebSockets are unavailable.
   - Renders verified company policy document source citations.

---

## 3. 🎤 Viva Cheatsheet (Top Frontend Questions & Answers)

**Q1: How does a Single Page Application (SPA) work in pure HTML/CSS/JS without React Router?**
> **Answer**: It listens to the browser `hashchange` event. When the hash changes (e.g. `#/jobs`), `router.js` reads the path, checks permissions, and dynamically renders the corresponding view function into the `#app-root` DOM container.

**Q2: How does authentication persist across page refreshes?**
> **Answer**: Upon login, the JWT access token and user profile are stored in `localStorage`. On page load, `auth.verifySession()` sends a request to `/api/v1/auth/me` to validate the token and refresh user permissions.

**Q3: How is Glassmorphism implemented in CSS?**
> **Answer**: Using `backdrop-filter: blur(16px)`, translucent background RGBA colors (`rgba(18, 20, 38, 0.72)`), subtle glowing borders (`rgba(139, 92, 246, 0.16)`), and radial background gradient illumination.

**Q4: How does real-time chat communicate with FastAPI?**
> **Answer**: The browser establishes a standard `new WebSocket('ws://' + location.host + '/ws/chat?token=' + token)`. Messages sent as JSON are processed by the backend RAG pipeline and answers are streamed back in real-time.

