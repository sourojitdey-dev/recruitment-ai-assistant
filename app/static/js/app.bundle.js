(() => {
  // app/static/js/api.js
  var API_BASE = "/api/v1";
  var ApiError = class extends Error {
    constructor(message, status, data) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.data = data;
    }
  };
  async function request(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = options.headers || {};
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
      headers["Content-Type"] = "application/json";
    }
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers
    });
    if (response.status === 401) {
      const currentHash = window.location.hash;
      if (currentHash !== "#/login" && currentHash !== "#/" && !currentHash.startsWith("#/register") && currentHash !== "#/forgot-password") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.hash = "#/login";
      }
    }
    let data = null;
    if (response.status !== 204 && response.status !== 205) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        try {
          data = await response.text();
        } catch {
          data = null;
        }
      }
    }
    if (!response.ok) {
      let errorMsg = "An unexpected error occurred";
      if (data && typeof data === "object") {
        errorMsg = data.detail || data.message || JSON.stringify(data);
      } else if (typeof data === "string" && data.length > 0) {
        errorMsg = data;
      }
      throw new ApiError(errorMsg, response.status, data);
    }
    return data;
  }
  var api = {
    get: (endpoint, params = null) => {
      let url = endpoint;
      if (params) {
        const query = new URLSearchParams(params).toString();
        url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${query}`;
      }
      return request(url, { method: "GET" });
    },
    post: (endpoint, data, isForm = false) => {
      let body = data;
      if (isForm && !(data instanceof FormData) && !(data instanceof URLSearchParams)) {
        body = new URLSearchParams(data);
      } else if (!isForm && !(data instanceof FormData)) {
        body = JSON.stringify(data);
      }
      return request(endpoint, {
        method: "POST",
        body
      });
    },
    put: (endpoint, data) => {
      return request(endpoint, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    },
    delete: (endpoint) => {
      return request(endpoint, {
        method: "DELETE"
      });
    }
  };

  // app/static/js/auth.js
  var AuthManager = class {
    constructor() {
      this.token = localStorage.getItem("token") || null;
      this.user = this.loadStoredUser();
      this.listeners = [];
    }
    loadStoredUser() {
      try {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    onChange(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter((l) => l !== listener);
      };
    }
    notify() {
      this.listeners.forEach((listener) => listener(this.user, this.token));
    }
    isAuthenticated() {
      return !!this.token && !!this.user;
    }
    getUser() {
      return this.user;
    }
    getRole() {
      return this.user ? (this.user.role || "candidate").toLowerCase() : null;
    }
    getToken() {
      return this.token;
    }
    async verifySession() {
      if (!this.token) {
        this.user = null;
        this.notify();
        return null;
      }
      try {
        const user = await api.get("/auth/me");
        this.user = user;
        localStorage.setItem("user", JSON.stringify(user));
        this.notify();
        return user;
      } catch (err) {
        console.warn("Session verification failed, logging out:", err);
        this.logout();
        return null;
      }
    }
    async login(email, password) {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);
      const tokenRes = await api.post("/auth/login", formData, true);
      const accessToken = tokenRes.access_token;
      this.token = accessToken;
      localStorage.setItem("token", accessToken);
      const userRes = await api.get("/auth/me");
      this.user = userRes;
      localStorage.setItem("user", JSON.stringify(userRes));
      this.notify();
      return userRes;
    }
    async registerCandidate(data) {
      return await api.post("/auth/register", data);
    }
    async registerRecruiter(data) {
      return await api.post("/auth/register/recruiter", data);
    }
    async registerInterviewer(data) {
      return await api.post("/auth/register/interviewer", data);
    }
    async forgotPassword(data) {
      return await api.post("/auth/forgot-password", data);
    }
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.notify();
    }
  };
  var auth = new AuthManager();

  // app/static/js/icons.js
  var Icons = {
    Sparkles: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>`,
    Briefcase: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>`,
    FileText: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      <path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
    </svg>`,
    FileCheck: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      <path d="m9 15 2 2 4-4"/>
    </svg>`,
    Send: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/>
      <path d="M22 2 11 13"/>
    </svg>`,
    Calendar: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/>
      <path d="M3 10h18"/>
    </svg>`,
    Bot: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
      <path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>`,
    Shield: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>`,
    ShieldCheck: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>`,
    Users: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
    User: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>`,
    UserCheck: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <polyline points="16 11 18 13 22 9"/>
    </svg>`,
    FolderLock: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2.5"/>
      <rect width="8" height="5" x="14" y="17" rx="1"/>
      <path d="M18 17v-2a2 2 0 1 0-4 0v2"/>
    </svg>`,
    Lock: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`,
    Mail: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>`,
    BookOpen: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>`,
    Heart: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>`,
    KeyRound: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/>
      <circle cx="16.5" cy="7.5" r=".5"/>
    </svg>`,
    Building2: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>`,
    Search: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>`,
    MapPin: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>`,
    CheckCircle2: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>`,
    AlertCircle: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>`,
    Edit2: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
    </svg>`,
    Trash2: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
    </svg>`,
    Plus: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>`,
    ArrowRight: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>`,
    Check: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`,
    Copy: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>`,
    RefreshCw: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>`,
    XCircle: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>`,
    Clock: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>`,
    Upload: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
    </svg>`,
    LogOut: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>`,
    TrendingUp: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>`,
    Phone: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>`,
    LayoutDashboard: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>`,
    X: (cls = "w-5 h-5") => `
    <svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>`
  };

  // app/static/js/components.js
  function showToast(message, type = "success", duration = 3500) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const iconHtml = type === "success" ? Icons.CheckCircle2("w-5 h-5 shrink-0 text-emerald-400") : type === "error" ? Icons.AlertCircle("w-5 h-5 shrink-0 text-rose-400") : Icons.Sparkles("w-5 h-5 shrink-0 text-indigo-400");
    toast.innerHTML = `
    ${iconHtml}
    <span style="flex: 1;">${message}</span>
  `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px) scale(0.95)";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  var currentModalCloseHandler = null;
  function openModal({ title, contentHtml, maxWidth = "600px", onClose = null }) {
    closeModal();
    currentModalCloseHandler = onClose;
    const backdrop = document.createElement("div");
    backdrop.id = "active-modal-backdrop";
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `
    <div class="modal-container" style="max-width: ${maxWidth};" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close-btn" id="modal-close-action" aria-label="Close">
          ${Icons.X("w-5 h-5")}
        </button>
      </div>
      <div class="modal-body">
        ${contentHtml}
      </div>
    </div>
  `;
    backdrop.addEventListener("click", () => closeModal());
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => {
      backdrop.classList.add("open");
    });
    document.getElementById("modal-close-action")?.addEventListener("click", () => closeModal());
  }
  function closeModal() {
    const backdrop = document.getElementById("active-modal-backdrop");
    if (backdrop) {
      backdrop.classList.remove("open");
      if (typeof currentModalCloseHandler === "function") {
        currentModalCloseHandler();
        currentModalCloseHandler = null;
      }
      setTimeout(() => backdrop.remove(), 200);
    }
  }
  function StatusBadge(status) {
    const s = (status || "unknown").toLowerCase();
    let label = s.charAt(0).toUpperCase() + s.slice(1);
    return `<span class="status-badge status-${s}">${label}</span>`;
  }
  function MatchScoreBadge(score, size = "sm") {
    const num = Math.round(score || 0);
    let colorClass = "match-medium";
    if (num >= 80) colorClass = "match-high";
    else if (num < 50) colorClass = "match-low";
    const sizeClass = `match-badge-${size}`;
    return `
    <div class="match-score-badge ${colorClass} ${sizeClass}">
      ${Icons.Sparkles(size === "lg" ? "w-4 h-4" : "w-3 h-3")}
      <span>${num}% Match</span>
    </div>
  `;
  }
  function renderNavbar() {
    const user = auth.getUser();
    const isAuth = auth.isAuthenticated();
    const currentHash = window.location.hash || "#/";
    return `
    <header class="app-navbar">
      <div class="navbar-inner">
        <!-- Logo -->
        <a href="#/" class="brand-logo">
          <div class="brand-icon-box">
            ${Icons.Sparkles("w-5 h-5 text-white")}
          </div>
          <div>
            <span class="brand-title">Recruit<span class="text-gradient">AI</span></span>
            <span class="brand-subtitle">Career Intelligence</span>
          </div>
        </a>

        <!-- Right Side Actions -->
        <div style="display: flex; align-items: center; gap: 1rem;">
          ${isAuth && user ? `
              <!-- Role Badge -->
              <div class="status-badge status-${user.role || "applied"} hidden-mobile">
                ${Icons.Shield("w-3 h-3")}
                <span>${user.role}</span>
              </div>

              <!-- Profile Link -->
              <a href="#/profile" style="display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: var(--text-primary);">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                  ${(user.name || "U").charAt(0).toUpperCase()}
                </div>
                <span style="font-weight: 600; font-size: 0.875rem;">${user.name}</span>
              </a>

              <!-- AI Assistant Shortcut -->
              <a href="#/chat" class="glass-btn glass-btn-secondary glass-btn-sm hidden-mobile">
                ${Icons.Bot("w-4 h-4 text-accent")}
                <span>AI Assistant</span>
              </a>

              <!-- Logout -->
              <button id="nav-logout-btn" class="glass-btn glass-btn-outline glass-btn-sm" title="Sign Out" style="padding: 0.4rem 0.6rem;">
                ${Icons.LogOut("w-4 h-4 text-muted")}
              </button>
            ` : `
              <a href="#/login" class="glass-btn glass-btn-outline glass-btn-sm">Sign In</a>
              <a href="#/register" class="glass-btn glass-btn-primary glass-btn-sm">Get Started</a>
            `}
        </div>
      </div>
    </header>
  `;
  }
  function renderSidebar() {
    const user = auth.getUser();
    if (!user) return "";
    const role = (user.role || "candidate").toLowerCase();
    const currentHash = window.location.hash || "#/dashboard";
    const candidateLinks = [
      { to: "#/dashboard", label: "Dashboard", icon: Icons.LayoutDashboard },
      { to: "#/jobs", label: "Explore Jobs", icon: Icons.Briefcase },
      { to: "#/resume", label: "My Resume", icon: Icons.FileText },
      { to: "#/applications", label: "My Applications", icon: Icons.Send },
      { to: "#/interviews", label: "My Interviews", icon: Icons.Calendar },
      { to: "#/chat", label: "AI Career Assistant", icon: Icons.Bot, highlight: true }
    ];
    const recruiterLinks = [
      { to: "#/dashboard", label: "Dashboard", icon: Icons.LayoutDashboard },
      { to: "#/recruiter/jobs", label: "Job Postings", icon: Icons.Briefcase },
      { to: "#/recruiter/applications", label: "Applications & Review", icon: Icons.Users },
      { to: "#/recruiter/interviews", label: "Interviews & Schedules", icon: Icons.Calendar },
      { to: "#/recruiter/matching", label: "AI Candidate Matcher", icon: Icons.Sparkles, highlight: true },
      { to: "#/recruiter/documents", label: "Company Documents", icon: Icons.FolderLock },
      { to: "#/chat", label: "AI Recruiter Assistant", icon: Icons.Bot }
    ];
    const interviewerLinks = [
      { to: "#/dashboard", label: "Dashboard", icon: Icons.LayoutDashboard },
      { to: "#/interviewer/interviews", label: "Assigned Interviews", icon: Icons.Calendar },
      { to: "#/profile", label: "My Profile", icon: Icons.UserCheck }
    ];
    let links = candidateLinks;
    if (role === "recruiter" || role === "admin") {
      links = recruiterLinks;
    } else if (role === "interviewer") {
      links = interviewerLinks;
    }
    return `
    <aside class="app-sidebar">
      <div class="sidebar-sticky">
        <div class="sidebar-header">
          Navigation \u2022 ${role}
        </div>
        ${links.map((item) => {
      const isActive = currentHash === item.to || item.to === "#/dashboard" && currentHash === "#/";
      return `
              <a href="${item.to}" class="sidebar-link ${isActive ? "active" : ""} ${item.highlight && !isActive ? "highlight" : ""}">
                ${item.icon("w-4 h-4 shrink-0")}
                <span>${item.label}</span>
              </a>
            `;
    }).join("")}
      </div>
    </aside>
  `;
  }

  // app/static/js/pages/landing.js
  function renderLandingPage() {
    return `
    <div style="display: flex; flex-direction: column; gap: 5rem; padding: 2.5rem 0 5rem 0;">
      <!-- Hero Section -->
      <section style="text-align: center; max-width: 850px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 1rem; border-radius: 9999px; background: rgba(79, 70, 229, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); color: #c084fc; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
          ${Icons.Sparkles("w-4 h-4 text-cyan-400")}
          Next-Gen AI Recruitment & Career Intelligence
        </div>

        <h1 style="font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.02em; color: #ffffff;">
          Smarter Recruitment. <br />
          <span class="text-gradient">Grounded Career Guidance.</span>
        </h1>

        <p style="font-size: 1.15rem; color: var(--text-secondary); max-width: 650px; line-height: 1.6;">
          An enterprise-grade platform connecting candidates, recruiters, and interviewers with 384-dimensional semantic matching, automated PDF resume parsing, and privacy-first RAG career assistance.
        </p>

        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; padding-top: 1rem;">
          <a href="#/register" class="glass-btn glass-btn-primary glass-btn-lg">
            <span>Get Started Free</span>
            ${Icons.ArrowRight("w-5 h-5")}
          </a>
          <a href="#/jobs" class="glass-btn glass-btn-secondary glass-btn-lg">
            ${Icons.Briefcase("w-5 h-5 text-indigo-400")}
            <span>Explore Active Jobs</span>
          </a>
          <a href="#/chat" class="glass-btn glass-btn-outline glass-btn-lg">
            ${Icons.Bot("w-5 h-5 text-cyan-400")}
            <span>Try AI Career Assistant</span>
          </a>
        </div>
      </section>

      <!-- Feature Pillars -->
      <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.18); border: 1px solid rgba(99, 102, 241, 0.3); display: flex; align-items: center; justify-content: center; color: #818cf8;">
            ${Icons.FileCheck("w-6 h-6")}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">Semantic AI Matching</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            384-dimensional vector embeddings with pgvector compute deep semantic compatibility, extracting strong skills, partial matches, and potential gaps without hallucination.
          </p>
        </div>

        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(168, 85, 247, 0.18); border: 1px solid rgba(168, 85, 247, 0.3); display: flex; align-items: center; justify-content: center; color: #c084fc;">
            ${Icons.Bot("w-6 h-6")}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">RAG Career Advisory</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            Candidates receive actionable advice grounded only in verified company policies and their own uploaded resume, backed by Groq LLM and real-time WebSockets.
          </p>
        </div>

        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(6, 182, 212, 0.18); border: 1px solid rgba(6, 182, 212, 0.3); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
            ${Icons.ShieldCheck("w-6 h-6")}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">Strict Company Isolation</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            Multi-tenant architecture guarantees recruiters cannot access other companies' candidates, documents, or interview pipelines. Zero cross-tenant leakage.
          </p>
        </div>
      </section>

      <!-- Roles Section -->
      <section style="display: flex; flex-direction: column; gap: 2rem;">
        <div style="text-align: center;">
          <h2 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Tailored for Every Recruitment Role</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.4rem;">Unified workflows with strict permission scoping</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          <!-- Candidate Role Card -->
          <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; border-color: rgba(99, 102, 241, 0.25);">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em;">For Candidates</span>
              <h4 style="font-size: 1.2rem; font-weight: 700; color: #ffffff;">Manage Career & Resumes</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} PDF Resume Parsing</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} AI Match Percentage Breakdown</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} Application Pipeline Tracker</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} AI Interview Preparations</li>
              </ul>
            </div>
            <a href="#/register" class="glass-btn glass-btn-secondary" style="width: 100%;">Candidate Sign Up</a>
          </div>

          <!-- Recruiter Role Card -->
          <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.25);">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #c084fc; text-transform: uppercase; letter-spacing: 0.05em;">For Recruiters</span>
              <h4 style="font-size: 1.2rem; font-weight: 700; color: #ffffff;">Source, Match & Schedule</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} Company Job Posting Management</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} Semantic AI Candidate Ranking</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} Interviewer Dropdown Scheduling</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} Company Knowledge Vector Store</li>
              </ul>
            </div>
            <a href="#/register-recruiter" class="glass-btn glass-btn-primary" style="width: 100%;">Recruiter Sign Up</a>
          </div>

          <!-- Interviewer Role Card -->
          <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; border-color: rgba(6, 182, 212, 0.25);">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">For Interviewers</span>
              <h4 style="font-size: 1.2rem; font-weight: 700; color: #ffffff;">Execute Evaluations</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} Assigned Interviews Exclusively</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} Candidate & Job Context</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} Mark Complete or Cancel</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2("w-4 h-4 text-emerald-400")} Clean Focused Interface</li>
              </ul>
            </div>
            <a href="#/register-interviewer" class="glass-btn glass-btn-outline" style="width: 100%;">Interviewer Sign Up</a>
          </div>
        </div>
      </section>
    </div>
  `;
  }

  // app/static/js/pages/auth.js
  function renderLoginPage() {
    return `
    <div style="max-width: 440px; margin: 3rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Sparkles("w-6 h-6")}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Welcome Back</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Sign in to your Recruitment AI account</p>
        </div>

        <div id="auth-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle("w-4 h-4 shrink-0")}
          <span id="auth-error-msg"></span>
        </div>

        <form id="login-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
              Email Address
            </label>
            <div style="position: relative;">
              <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                ${Icons.Mail("w-4 h-4")}
              </span>
              <input type="email" id="login-email" required placeholder="name@example.com" class="glass-input" style="padding-left: 2.75rem;" />
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
                Password
              </label>
              <a href="#/forgot-password" style="font-size: 0.75rem; color: #c084fc; text-decoration: none; font-weight: 600;">
                Forgot password?
              </a>
            </div>
            <div style="position: relative;">
              <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                ${Icons.Lock("w-4 h-4")}
              </span>
              <input type="password" id="login-password" required placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" class="glass-input" style="padding-left: 2.75rem;" />
            </div>
          </div>

          <button type="submit" id="login-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.75rem;">
            Sign In
          </button>
        </form>

        <div style="text-align: center; border-top: 1px solid rgba(139, 92, 246, 0.15); padding-top: 1.25rem; font-size: 0.8rem; color: var(--text-muted);">
          <p style="margin-bottom: 0.6rem;">Don't have an account? Register as:</p>
          <div style="display: flex; justify-content: center; gap: 0.75rem; font-weight: 600;">
            <a href="#/register" style="color: #c084fc; text-decoration: underline;">Candidate</a>
            <span>\u2022</span>
            <a href="#/register-recruiter" style="color: #818cf8; text-decoration: underline;">Recruiter</a>
            <span>\u2022</span>
            <a href="#/register-interviewer" style="color: #38bdf8; text-decoration: underline;">Interviewer</a>
          </div>
        </div>
      </div>
    </div>
  `;
  }
  function initLoginPage() {
    const form = document.getElementById("login-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      const btn = document.getElementById("login-submit-btn");
      const errorBox = document.getElementById("auth-error-box");
      const errorMsg = document.getElementById("auth-error-msg");
      errorBox.style.display = "none";
      btn.disabled = true;
      btn.innerHTML = `<span class="animate-spin" style="display:inline-block;">\u26A1</span> Signing in...`;
      try {
        const user = await auth.login(email, password);
        showToast(`Welcome back, ${user.name}!`);
        if (user.role === "interviewer") {
          window.location.hash = "#/interviewer/interviews";
        } else {
          window.location.hash = "#/dashboard";
        }
      } catch (err) {
        errorBox.style.display = "flex";
        errorMsg.textContent = err.message || "Invalid email or password. Please try again.";
        btn.disabled = false;
        btn.textContent = "Sign In";
      }
    });
  }
  function renderRegisterCandidatePage() {
    return `
    <div style="max-width: 540px; margin: 2rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.User("w-6 h-6")}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Candidate Registration</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Create your profile to explore AI-matched jobs & upload resumes</p>
        </div>

        <div id="register-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle("w-4 h-4 shrink-0")}
          <span id="register-error-msg"></span>
        </div>

        <form id="register-candidate-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Full Name *</label>
              <input type="text" id="reg-name" required placeholder="e.g. Sagnik Saha" class="glass-input" />
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Email Address *</label>
              <input type="email" id="reg-email" required placeholder="name@example.com" class="glass-input" />
            </div>
          </div>

          <!-- Profile Details Section -->
          <div style="padding: 1rem; border-radius: 14px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.4rem;">
              ${Icons.UserCheck("w-4 h-4 text-indigo-400")} Profile Details (For Job Matching & Resume)
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Phone Number *</label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                    ${Icons.Phone("w-3.5 h-3.5")}
                  </span>
                  <input type="tel" id="reg-phone" required placeholder="+91 9876543210" class="glass-input" style="padding-left: 2.25rem;" />
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Location / City *</label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                    ${Icons.MapPin("w-3.5 h-3.5")}
                  </span>
                  <input type="text" id="reg-location" required placeholder="e.g. Kolkata, India / Remote" class="glass-input" style="padding-left: 2.25rem;" />
                </div>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Professional Bio / Headline</label>
              <input type="text" id="reg-bio" placeholder="e.g. Full Stack Python & AI Developer with 2+ years experience" class="glass-input" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Password *</label>
            <input type="password" id="reg-password" required placeholder="Create strong password" class="glass-input" />
          </div>

          <div style="padding: 1rem; border-radius: 14px; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #c084fc; text-transform: uppercase; letter-spacing: 0.05em;">
              Security Questions (For Password Recovery)
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Favorite Book *</label>
                <input type="text" id="reg-book" required placeholder="e.g. Clean Code" class="glass-input" />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Favorite Person / Role Model *</label>
                <input type="text" id="reg-person" required placeholder="e.g. Alan Turing" class="glass-input" />
              </div>
            </div>
          </div>

          <button type="submit" id="reg-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.75rem;">
            Register & Open Dashboard
          </button>
        </form>

        <div style="text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          Already have an account? <a href="#/login" style="color: #c084fc; font-weight: 600; text-decoration: underline;">Sign In</a>
        </div>
      </div>
    </div>
  `;
  }
  function initRegisterCandidatePage() {
    const form = document.getElementById("register-candidate-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("reg-submit-btn");
      const errorBox = document.getElementById("register-error-box");
      const errorMsg = document.getElementById("register-error-msg");
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      const data = {
        name: document.getElementById("reg-name").value.trim(),
        email,
        password,
        phone: document.getElementById("reg-phone")?.value.trim() || null,
        location: document.getElementById("reg-location")?.value.trim() || null,
        bio: document.getElementById("reg-bio")?.value.trim() || null,
        favorite_book: document.getElementById("reg-book").value.trim(),
        favorite_person: document.getElementById("reg-person").value.trim()
      };
      errorBox.style.display = "none";
      btn.disabled = true;
      btn.innerHTML = `<span class="animate-spin" style="display:inline-block;">\u26A1</span> Creating profile & logging in...`;
      try {
        await auth.registerCandidate(data);
        showToast("Registration successful! Logging you in...");
        const user = await auth.login(email, password);
        showToast(`Welcome to RecruitAI, ${user.name}!`);
        window.location.hash = "#/dashboard";
      } catch (err) {
        errorBox.style.display = "flex";
        errorMsg.textContent = err.message || "Registration failed. Please check your information.";
        btn.disabled = false;
        btn.textContent = "Register & Open Dashboard";
      }
    });
  }
  function renderRegisterRecruiterPage() {
    return `
    <div style="max-width: 540px; margin: 2rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(99, 102, 241, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Briefcase("w-6 h-6")}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Recruiter Registration</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Join your organization to manage jobs and source candidates</p>
        </div>

        <div id="recruiter-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle("w-4 h-4 shrink-0")}
          <span id="recruiter-error-msg"></span>
        </div>

        <form id="register-recruiter-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Full Name</label>
              <input type="text" id="rec-name" required placeholder="e.g. Alice Recruiter" class="glass-input" />
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Work Email</label>
              <input type="email" id="rec-email" required placeholder="recruiter@company.com" class="glass-input" />
            </div>
          </div>

          <div style="padding: 1rem; border-radius: 14px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em;">Company Verification</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Company Name</label>
                <input type="text" id="rec-company" required placeholder="e.g. NexusTech" class="glass-input" />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Recruiter Code</label>
                <input type="password" id="rec-code" required placeholder="Company security code" class="glass-input" />
              </div>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Password</label>
            <input type="password" id="rec-password" required placeholder="Create password" class="glass-input" />
          </div>

          <div style="padding: 1rem; border-radius: 14px; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #c084fc; text-transform: uppercase; letter-spacing: 0.05em;">Security Questions</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Favorite Book</label>
                <input type="text" id="rec-book" required placeholder="e.g. Mythical Man-Month" class="glass-input" />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Favorite Person</label>
                <input type="text" id="rec-person" required placeholder="e.g. Ada Lovelace" class="glass-input" />
              </div>
            </div>
          </div>

          <button type="submit" id="rec-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.75rem;">
            Register & Open Portal
          </button>
        </form>

        <div style="text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          Already registered? <a href="#/login" style="color: #818cf8; font-weight: 600; text-decoration: underline;">Sign In</a>
        </div>
      </div>
    </div>
  `;
  }
  function initRegisterRecruiterPage() {
    const form = document.getElementById("register-recruiter-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("rec-submit-btn");
      const errorBox = document.getElementById("recruiter-error-box");
      const errorMsg = document.getElementById("recruiter-error-msg");
      const email = document.getElementById("rec-email").value.trim();
      const password = document.getElementById("rec-password").value;
      const data = {
        name: document.getElementById("rec-name").value.trim(),
        email,
        password,
        company_name: document.getElementById("rec-company").value.trim(),
        recruiter_code: document.getElementById("rec-code").value.trim(),
        favorite_book: document.getElementById("rec-book").value.trim(),
        favorite_person: document.getElementById("rec-person").value.trim()
      };
      errorBox.style.display = "none";
      btn.disabled = true;
      btn.innerHTML = `<span class="animate-spin" style="display:inline-block;">\u26A1</span> Registering & logging in...`;
      try {
        await auth.registerRecruiter(data);
        showToast("Recruiter registered successfully! Logging you in...");
        const user = await auth.login(email, password);
        showToast(`Welcome, ${user.name}!`);
        window.location.hash = "#/recruiter";
      } catch (err) {
        errorBox.style.display = "flex";
        errorMsg.textContent = err.message || "Recruiter registration failed. Check company code.";
        btn.disabled = false;
        btn.textContent = "Register & Open Portal";
      }
    });
  }
  function renderRegisterInterviewerPage() {
    return `
    <div style="max-width: 500px; margin: 2rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(6, 182, 212, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.UserCheck("w-6 h-6")}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Interviewer Registration</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Join your company team to conduct technical interviews</p>
        </div>

        <div id="interviewer-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle("w-4 h-4 shrink-0")}
          <span id="interviewer-error-msg"></span>
        </div>

        <form id="register-interviewer-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Full Name</label>
            <input type="text" id="int-name" required placeholder="e.g. Charlie Tech Lead" class="glass-input" />
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Work Email</label>
            <input type="email" id="int-email" required placeholder="interviewer@company.com" class="glass-input" />
          </div>

          <div style="padding: 1rem; border-radius: 14px; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">Company Assignment</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Company Name</label>
                <input type="text" id="int-company" required placeholder="e.g. NexusTech" class="glass-input" />
              </div>
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Recruiter Code</label>
                <input type="password" id="int-code" required placeholder="Company code" class="glass-input" />
              </div>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Password</label>
            <input type="password" id="int-password" required placeholder="Create password" class="glass-input" />
          </div>

          <button type="submit" id="int-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.75rem;">
            Register & Open Portal
          </button>
        </form>

        <div style="text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          Already registered? <a href="#/login" style="color: #38bdf8; font-weight: 600; text-decoration: underline;">Sign In</a>
        </div>
      </div>
    </div>
  `;
  }
  function initRegisterInterviewerPage() {
    const form = document.getElementById("register-interviewer-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("int-submit-btn");
      const errorBox = document.getElementById("interviewer-error-box");
      const errorMsg = document.getElementById("interviewer-error-msg");
      const email = document.getElementById("int-email").value.trim();
      const password = document.getElementById("int-password").value;
      const data = {
        name: document.getElementById("int-name").value.trim(),
        email,
        password,
        company_name: document.getElementById("int-company").value.trim(),
        recruiter_code: document.getElementById("int-code").value.trim()
      };
      errorBox.style.display = "none";
      btn.disabled = true;
      btn.innerHTML = `<span class="animate-spin" style="display:inline-block;">\u26A1</span> Registering & logging in...`;
      try {
        await auth.registerInterviewer(data);
        showToast("Interviewer registered successfully! Logging you in...");
        const user = await auth.login(email, password);
        showToast(`Welcome, ${user.name}!`);
        window.location.hash = "#/interviewer/interviews";
      } catch (err) {
        errorBox.style.display = "flex";
        errorMsg.textContent = err.message || "Interviewer registration failed.";
        btn.disabled = false;
        btn.textContent = "Register & Open Portal";
      }
    });
  }
  function renderForgotPasswordPage() {
    return `
    <div style="max-width: 440px; margin: 3rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${Icons.KeyRound("w-6 h-6")}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Reset Password</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Verify your security answers to set a new password</p>
        </div>

        <div id="reset-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle("w-4 h-4 shrink-0")}
          <span id="reset-error-msg"></span>
        </div>

        <div id="reset-success-box" style="display: none; padding: 1.25rem; text-align: center; flex-direction: column; align-items: center; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center;">
            ${Icons.CheckCircle2("w-8 h-8")}
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff;">Password Reset Successful!</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Your password has been updated. You can now log in with your new credentials.</p>
          <a href="#/login" class="glass-btn glass-btn-primary" style="width: 100%; margin-top: 0.5rem;">Proceed to Sign In</a>
        </div>

        <form id="forgot-password-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Email Address</label>
            <input type="email" id="fp-email" required placeholder="name@example.com" class="glass-input" />
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Favorite Book</label>
            <input type="text" id="fp-book" required placeholder="Your security answer" class="glass-input" />
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Favorite Person / Role Model</label>
            <input type="text" id="fp-person" required placeholder="Your security answer" class="glass-input" />
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">New Password</label>
            <input type="password" id="fp-password" required placeholder="Enter new password" class="glass-input" />
          </div>

          <button type="submit" id="fp-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.75rem;">
            Reset Password
          </button>
        </form>

        <div style="text-align: center; border-top: 1px solid rgba(139, 92, 246, 0.15); padding-top: 1rem; font-size: 0.8rem;">
          <a href="#/login" style="color: #c084fc; font-weight: 600; text-decoration: underline;">Back to Sign In</a>
        </div>
      </div>
    </div>
  `;
  }
  function initForgotPasswordPage() {
    const form = document.getElementById("forgot-password-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("fp-submit-btn");
      const errorBox = document.getElementById("reset-error-box");
      const errorMsg = document.getElementById("reset-error-msg");
      const successBox = document.getElementById("reset-success-box");
      const data = {
        email: document.getElementById("fp-email").value.trim(),
        favorite_book: document.getElementById("fp-book").value.trim(),
        favorite_person: document.getElementById("fp-person").value.trim(),
        new_password: document.getElementById("fp-password").value
      };
      errorBox.style.display = "none";
      btn.disabled = true;
      btn.innerHTML = `Verifying and updating...`;
      try {
        await auth.forgotPassword(data);
        form.style.display = "none";
        successBox.style.display = "flex";
        showToast("Password reset successfully!");
      } catch (err) {
        errorBox.style.display = "flex";
        errorMsg.textContent = err.message || "Password reset failed. Please check your answers.";
        btn.disabled = false;
        btn.textContent = "Reset Password";
      }
    });
  }

  // app/static/js/pages/candidate.js
  function renderCandidateDashboard() {
    const user = auth.getUser();
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <!-- Welcome Banner -->
      <div class="glass-panel" style="padding: 2rem; position: relative; overflow: hidden; border-color: rgba(168, 85, 247, 0.25);">
        <div style="position: relative; z-index: 2; display: flex; flex-direction: column; gap: 0.75rem; max-width: 650px;">
          <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #a5b4fc; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
            ${Icons.Sparkles("w-3.5 h-3.5 text-cyan-400")}
            Candidate Intelligence Portal
          </div>
          <h1 style="font-size: 2rem; font-weight: 800; color: #ffffff;">
            Welcome back, <span class="text-gradient">${user?.name || "Candidate"}</span>
          </h1>
          <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">
            Your personalized recruitment dashboard provides 384-d semantic job matching, resume extraction insights, and real-time interview tracking.
          </p>
        </div>
      </div>

      <!-- Metrics Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; border-color: rgba(99, 102, 241, 0.25);">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Applications</p>
            <h3 id="dash-apps-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/applications" style="font-size: 0.75rem; color: #818cf8; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              View pipeline ${Icons.ArrowRight("w-3 h-3")}
            </a>
          </div>
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Send("w-6 h-6")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; border-color: rgba(168, 85, 247, 0.25);">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Scheduled Interviews</p>
            <h3 id="dash-interviews-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/interviews" style="font-size: 0.75rem; color: #c084fc; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              View schedule ${Icons.ArrowRight("w-3 h-3")}
            </a>
          </div>
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${Icons.Calendar("w-6 h-6")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; border-color: rgba(6, 182, 212, 0.25);">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Resume Status</p>
            <h3 id="dash-resume-status" style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0.4rem 0; display: flex; align-items: center; gap: 0.4rem;">
              ...
            </h3>
            <a href="#/resume" id="dash-resume-link" style="font-size: 0.75rem; color: #38bdf8; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              Manage Resume ${Icons.ArrowRight("w-3 h-3")}
            </a>
          </div>
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.FileText("w-6 h-6")}
          </div>
        </div>
      </div>

      <!-- Main Grid: Top AI Recommendations & Assistant Shortcut -->
      <div class="grid-split-2-1">
        <!-- Top Recommended Jobs -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
              ${Icons.Sparkles("w-5 h-5 text-indigo-400")}
              AI Recommended Jobs
            </h2>
            <a href="#/jobs" style="font-size: 0.8rem; font-weight: 700; color: #c084fc; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              Browse all jobs ${Icons.ArrowRight("w-3 h-3")}
            </a>
          </div>

          <div id="dash-recommended-list" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="padding: 2rem; text-align: center; color: var(--text-muted);">Loading recommendations...</div>
          </div>
        </div>

        <!-- AI Assistant Shortcut -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            ${Icons.Bot("w-5 h-5 text-purple-400")}
            AI Career Advisor
          </h2>
          <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem; border-color: rgba(168, 85, 247, 0.3);">
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
              Ask questions about resume improvements, skill gaps, company interview rounds, or mock technical questions.
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              <a href="#/chat?prompt=How+can+I+improve+my+resume+for+Senior+Backend+roles%3F" style="padding: 0.75rem; border-radius: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(168, 85, 247, 0.2); font-size: 0.8rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;">
                \u{1F4A1} "How can I improve my resume?"
              </a>
              <a href="#/chat?prompt=What+skills+are+missing+for+full+stack+engineer+jobs%3F" style="padding: 0.75rem; border-radius: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(168, 85, 247, 0.2); font-size: 0.8rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;">
                \u{1F3AF} "What skills are missing from my resume?"
              </a>
              <a href="#/chat?prompt=Help+me+prepare+for+a+Python+and+FastAPI+technical+interview." style="padding: 0.75rem; border-radius: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(168, 85, 247, 0.2); font-size: 0.8rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;">
                \u26A1 "Help me prepare for FastAPI interview"
              </a>
            </div>
            <a href="#/chat" class="glass-btn glass-btn-primary" style="width: 100%; margin-top: 0.5rem;">
              Open AI Career Chat ${Icons.ArrowRight("w-4 h-4")}
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
  }
  async function initCandidateDashboard() {
    try {
      const [appsRes, interviewsRes, resumesRes, matchRes] = await Promise.allSettled([
        api.get("/applications/me"),
        api.get("/interviews/me"),
        api.get("/resumes/"),
        api.get("/match/candidate/jobs")
      ]);
      const appsCount = appsRes.status === "fulfilled" ? appsRes.value.length : 0;
      const appsEl = document.getElementById("dash-apps-count");
      if (appsEl) appsEl.textContent = appsCount;
      const intCount = interviewsRes.status === "fulfilled" ? interviewsRes.value.length : 0;
      const intEl = document.getElementById("dash-interviews-count");
      if (intEl) intEl.textContent = intCount;
      const hasResume = resumesRes.status === "fulfilled" && resumesRes.value.length > 0;
      const resEl = document.getElementById("dash-resume-status");
      const resLink = document.getElementById("dash-resume-link");
      if (resEl) {
        resEl.innerHTML = hasResume ? `${Icons.CheckCircle2("w-5 h-5 text-emerald-400")} Uploaded` : `${Icons.Clock("w-5 h-5 text-amber-400")} Pending`;
      }
      if (resLink) {
        resLink.innerHTML = hasResume ? `Manage Resume ${Icons.ArrowRight("w-3 h-3")}` : `Upload PDF ${Icons.ArrowRight("w-3 h-3")}`;
      }
      const recListEl = document.getElementById("dash-recommended-list");
      if (recListEl) {
        if (matchRes.status === "fulfilled" && matchRes.value.length > 0) {
          const topJobs = matchRes.value.slice(0, 3);
          recListEl.innerHTML = topJobs.map(
            (job) => `
          <div class="glass-card" style="display: flex; flex-direction: column; gap: 0.75rem; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 700; color: #ffffff;">${job.job_title}</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
                  ${job.company_name} \u2022 <span style="color: var(--text-muted);">${job.location}</span>
                </p>
              </div>
              ${MatchScoreBadge(job.match_percentage, "sm")}
            </div>

            ${job.breakdown?.strong_matches && job.breakdown.strong_matches.length > 0 ? `
              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
                ${job.breakdown.strong_matches.slice(0, 3).map(
              (s) => `
                  <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.15); color: #6ee7b7; font-size: 0.7rem; font-weight: 600;">
                    \u2713 ${s}
                  </span>
                `
            ).join("")}
              </div>
            ` : ""}

            <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid rgba(139, 92, 246, 0.15);">
              <a href="#/jobs" class="glass-btn glass-btn-outline glass-btn-sm">View Position</a>
            </div>
          </div>
        `
          ).join("");
        } else {
          recListEl.innerHTML = `
          <div class="glass-card" style="text-align: center; padding: 2.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${Icons.Briefcase("w-10 h-10 text-muted")}
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Upload your PDF resume to unlock personalized AI semantic job recommendations.</p>
            <a href="#/resume" class="glass-btn glass-btn-primary glass-btn-sm">
              ${Icons.Upload("w-4 h-4")} Upload Resume
            </a>
          </div>
        `;
        }
      }
    } catch (err) {
      console.error("Failed to load candidate dashboard:", err);
    }
  }
  var allJobs = [];
  var candidateMatchesMap = {};
  var appliedJobIdsSet = /* @__PURE__ */ new Set();
  function renderCandidateJobsPage() {
    return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Explore Job Opportunities</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Discover active positions with AI-powered candidate-job compatibility</p>
      </div>

      <!-- Search & Location Filters -->
      <div class="glass-card" style="padding: 1.25rem;">
        <div class="grid-split-search">
          <div style="position: relative;">
            <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
              ${Icons.Search("w-4 h-4")}
            </span>
            <input type="text" id="job-search-input" placeholder="Search by title, skill keywords, or company..." class="glass-input" style="padding-left: 2.75rem;" />
          </div>
          <div style="position: relative;">
            <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
              ${Icons.MapPin("w-4 h-4")}
            </span>
            <input type="text" id="job-location-input" placeholder="Filter by location (e.g. Remote)..." class="glass-input" style="padding-left: 2.75rem;" />
          </div>
        </div>
      </div>

      <!-- Jobs Grid -->
      <div id="jobs-grid-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">Loading active opportunities...</div>
      </div>
    </div>
  `;
  }
  async function initCandidateJobsPage() {
    const container = document.getElementById("jobs-grid-container");
    const searchInput = document.getElementById("job-search-input");
    const locInput = document.getElementById("job-location-input");
    async function loadData() {
      try {
        const [jobsRes, appsRes, matchesRes] = await Promise.allSettled([
          api.get("/jobs/"),
          api.get("/applications/me"),
          api.get("/match/candidate/jobs")
        ]);
        allJobs = jobsRes.status === "fulfilled" ? jobsRes.value : [];
        appliedJobIdsSet = new Set(
          appsRes.status === "fulfilled" ? appsRes.value.map((a) => a.job_id) : []
        );
        candidateMatchesMap = {};
        if (matchesRes.status === "fulfilled") {
          matchesRes.value.forEach((m) => {
            candidateMatchesMap[m.job_id] = m;
          });
        }
        renderJobsList();
      } catch (err) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load jobs.</div>`;
      }
    }
    function renderJobsList() {
      const searchVal = (searchInput?.value || "").toLowerCase().trim();
      const locVal = (locInput?.value || "").toLowerCase().trim();
      const filtered = allJobs.filter((job) => {
        const matchSearch = !searchVal || (job.title || "").toLowerCase().includes(searchVal) || (job.company_name || "").toLowerCase().includes(searchVal) || (job.description || "").toLowerCase().includes(searchVal);
        const matchLoc = !locVal || (job.location || "").toLowerCase().includes(locVal);
        return matchSearch && matchLoc;
      });
      if (filtered.length === 0) {
        container.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${Icons.Briefcase("w-12 h-12 text-muted")}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Jobs Found</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">Try adjusting your search keywords or location filters.</p>
        </div>
      `;
        return;
      }
      container.innerHTML = filtered.map((job) => {
        const matchInfo = candidateMatchesMap[job.id];
        const isApplied = appliedJobIdsSet.has(job.id);
        return `
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.25rem;">
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">${job.title}</h3>
                <p style="font-size: 0.85rem; color: #c084fc; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; margin-top: 0.2rem;">
                  ${Icons.Building2("w-3.5 h-3.5")} ${job.company_name}
                </p>
              </div>
              ${matchInfo ? MatchScoreBadge(matchInfo.match_percentage, "sm") : ""}
            </div>

            <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
              ${Icons.MapPin("w-3.5 h-3.5")} ${job.location}
            </p>

            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${job.description}
            </p>

            ${matchInfo?.breakdown?.strong_matches && matchInfo.breakdown.strong_matches.length > 0 ? `
              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; padding-top: 0.25rem;">
                ${matchInfo.breakdown.strong_matches.slice(0, 3).map(
          (s) => `
                  <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; font-size: 0.7rem; font-weight: 600;">
                    \u2713 ${s}
                  </span>
                `
        ).join("")}
              </div>
            ` : ""}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid rgba(139, 92, 246, 0.15);">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-job-details" data-id="${job.id}">
              View Details
            </button>

            ${isApplied ? `
              <span class="status-badge status-applied">
                ${Icons.CheckCircle2("w-3.5 h-3.5")} Applied
              </span>
            ` : `
              <button class="glass-btn glass-btn-primary glass-btn-sm btn-job-apply" data-id="${job.id}">
                ${Icons.Send("w-3.5 h-3.5")} Apply Now
              </button>
            `}
          </div>
        </div>
      `;
      }).join("");
      container.querySelectorAll(".btn-job-details").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.dataset.id);
          const job = allJobs.find((j) => j.id === id);
          if (job) openJobModal(job);
        });
      });
      container.querySelectorAll(".btn-job-apply").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = parseInt(btn.dataset.id);
          await applyToJob(id);
        });
      });
    }
    function openJobModal(job) {
      const matchInfo = candidateMatchesMap[job.id];
      const isApplied = appliedJobIdsSet.has(job.id);
      const content = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 1rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
          <div>
            <p style="font-size: 1rem; font-weight: 700; color: #c084fc; display: flex; align-items: center; gap: 0.4rem;">
              ${Icons.Building2("w-4 h-4")} ${job.company_name}
            </p>
            <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem;">
              ${Icons.MapPin("w-3.5 h-3.5")} ${job.location}
            </p>
          </div>
          ${matchInfo ? MatchScoreBadge(matchInfo.match_percentage, "lg") : ""}
        </div>

        ${matchInfo ? `
          <div style="padding: 1.25rem; border-radius: 16px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="font-size: 0.85rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.4rem;">
              ${Icons.Sparkles("w-4 h-4 text-cyan-400")} AI Grounded Compatibility Analysis
            </div>
            <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5;">${matchInfo.explanation}</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; margin-top: 0.5rem;">
              <div style="padding: 0.75rem; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);">
                <span style="font-size: 0.7rem; font-weight: 700; color: #6ee7b7; text-transform: uppercase;">Strong Matches</span>
                <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                  ${matchInfo.breakdown?.strong_matches?.length > 0 ? matchInfo.breakdown.strong_matches.join(", ") : "None listed"}
                </div>
              </div>
              <div style="padding: 0.75rem; border-radius: 10px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3);">
                <span style="font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Partial Matches</span>
                <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                  ${matchInfo.breakdown?.partial_matches?.length > 0 ? matchInfo.breakdown.partial_matches.join(", ") : "None"}
                </div>
              </div>
              <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
                <span style="font-size: 0.7rem; font-weight: 700; color: #fcd34d; text-transform: uppercase;">Potential Gaps</span>
                <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                  ${matchInfo.breakdown?.potential_gaps?.length > 0 ? matchInfo.breakdown.potential_gaps.join(", ") : "Comprehensive coverage"}
                </div>
              </div>
            </div>
          </div>
        ` : ""}

        <div>
          <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Job Description</h4>
          <div style="padding: 1rem; border-radius: 12px; background: rgba(10, 11, 20, 0.6); border: 1px solid rgba(255,255,255,0.08); font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; max-height: 250px; overflow-y: auto; white-space: pre-wrap;">${job.description}</div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button class="glass-btn glass-btn-outline" id="modal-close-secondary">Close</button>
          ${isApplied ? `<span class="status-badge status-applied" style="padding: 0.6rem 1rem;">${Icons.CheckCircle2("w-4 h-4")} Already Applied</span>` : `<button class="glass-btn glass-btn-primary" id="modal-apply-btn">${Icons.Send("w-4 h-4")} Submit Application</button>`}
        </div>
      </div>
    `;
      openModal({
        title: job.title,
        contentHtml: content,
        maxWidth: "680px"
      });
      document.getElementById("modal-close-secondary")?.addEventListener("click", () => closeModal());
      document.getElementById("modal-apply-btn")?.addEventListener("click", async () => {
        closeModal();
        await applyToJob(job.id);
      });
    }
    async function applyToJob(jobId) {
      try {
        await api.post("/applications/", { job_id: jobId });
        appliedJobIdsSet.add(jobId);
        showToast("Application submitted successfully!");
        renderJobsList();
      } catch (err) {
        showToast(err.message || "Failed to apply.", "error");
      }
    }
    searchInput?.addEventListener("input", renderJobsList);
    locInput?.addEventListener("input", renderJobsList);
    loadData();
  }
  function renderCandidateResumePage() {
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Resume Management</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Upload your PDF resume for PyMuPDF text extraction and pgvector indexing</p>
      </div>

      <!-- Upload Box -->
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.25rem; border-color: rgba(99, 102, 241, 0.35);">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.Upload("w-5 h-5 text-indigo-400")}
          Upload New PDF Resume
        </h3>

        <form id="resume-upload-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="border: 2px dashed rgba(168, 85, 247, 0.3); border-radius: 18px; padding: 2.5rem 1.5rem; text-align: center; background: rgba(168, 85, 247, 0.05); cursor: pointer; transition: all 0.2s;" id="dropzone-box">
            <input type="file" id="resume-file-input" accept="application/pdf" style="display: none;" />
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
              <div style="width: 56px; height: 56px; border-radius: 16px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
                ${Icons.FileText("w-8 h-8")}
              </div>
              <div>
                <span id="file-chosen-label" style="font-size: 0.95rem; font-weight: 600; color: #ffffff;">
                  Click to select or drag & drop your PDF resume here
                </span>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                  Accepts .pdf files up to 10MB
                </p>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button type="submit" id="resume-upload-btn" class="glass-btn glass-btn-primary" disabled>
              ${Icons.Upload("w-4 h-4")} Upload & Extract Text
            </button>
          </div>
        </form>
      </div>

      <!-- Active Resume Extracted Preview -->
      <div id="active-resume-container" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading resume records...</div>
      </div>
    </div>
  `;
  }
  async function initCandidateResumePage() {
    const form = document.getElementById("resume-upload-form");
    const fileInput = document.getElementById("resume-file-input");
    const dropzone = document.getElementById("dropzone-box");
    const chosenLabel = document.getElementById("file-chosen-label");
    const uploadBtn = document.getElementById("resume-upload-btn");
    const resumeContainer = document.getElementById("active-resume-container");
    let selectedFile = null;
    dropzone?.addEventListener("click", () => fileInput?.click());
    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.type !== "application/pdf") {
          showToast("Please select a valid .pdf resume file.", "error");
          return;
        }
        selectedFile = file;
        chosenLabel.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        uploadBtn.disabled = false;
      }
    });
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!selectedFile) return;
      uploadBtn.disabled = true;
      uploadBtn.innerHTML = `Extracting text & vector embeddings...`;
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        await api.post("/resumes/", formData);
        showToast("Resume uploaded and indexed successfully!");
        selectedFile = null;
        chosenLabel.textContent = "Click to select or drag & drop your PDF resume here";
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = `${Icons.Upload("w-4 h-4")} Upload & Extract Text`;
        loadResumes();
      } catch (err) {
        showToast(err.message || "Failed to upload resume.", "error");
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = `${Icons.Upload("w-4 h-4")} Upload & Extract Text`;
      }
    });
    async function loadResumes() {
      try {
        const resumes = await api.get("/resumes/");
        if (resumes.length > 0) {
          const latest = resumes[0];
          resumeContainer.innerHTML = `
          <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); color: #34d399; display: flex; align-items: center; justify-content: center;">
                  ${Icons.FileCheck("w-6 h-6")}
                </div>
                <div>
                  <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff;">${latest.filename}</h3>
                  <p style="font-size: 0.75rem; color: var(--text-muted);">Indexed in vector store with 384-d embeddings</p>
                </div>
              </div>
              <button id="copy-resume-btn" class="glass-btn glass-btn-outline glass-btn-sm">
                ${Icons.Copy("w-3.5 h-3.5")} Copy Extracted Text
              </button>
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
                Extracted Text (PyMuPDF)
              </label>
              <div id="resume-text-viewer" style="padding: 1rem; border-radius: 12px; background: rgba(10, 11, 20, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary); max-height: 380px; overflow-y: auto; white-space: pre-wrap; line-height: 1.6;">${latest.extracted_text || "No text extracted."}</div>
            </div>
          </div>
        `;
          document.getElementById("copy-resume-btn")?.addEventListener("click", () => {
            navigator.clipboard.writeText(latest.extracted_text || "");
            showToast("Resume text copied to clipboard!");
          });
        } else {
          resumeContainer.innerHTML = `
          <div class="glass-card" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            ${Icons.FileText("w-10 h-10 mx-auto")}
            <p style="margin-top: 0.5rem;">No resume uploaded yet. Upload a PDF above to get started.</p>
          </div>
        `;
        }
      } catch (err) {
        console.error("Failed to load resumes:", err);
      }
    }
    loadResumes();
  }
  function renderCandidateApplicationsPage() {
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">My Applications</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Track your submission stages and review pipeline progress</p>
      </div>

      <div id="applications-list-container" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Loading your applications...</div>
      </div>
    </div>
  `;
  }
  async function initCandidateApplicationsPage() {
    const container = document.getElementById("applications-list-container");
    const stages = ["applied", "screening", "shortlisted", "hired"];
    try {
      const [appsRes, jobsRes] = await Promise.all([
        api.get("/applications/me"),
        api.get("/jobs/")
      ]);
      const jobsMap = {};
      jobsRes.forEach((j) => jobsMap[j.id] = j);
      if (appsRes.length === 0) {
        container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${Icons.Send("w-12 h-12 text-muted")}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Applications Yet</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">You haven't submitted any job applications yet.</p>
          <a href="#/jobs" class="glass-btn glass-btn-primary">
            ${Icons.Briefcase("w-4 h-4")} Explore Jobs
          </a>
        </div>
      `;
        return;
      }
      container.innerHTML = appsRes.map((app) => {
        const job = jobsMap[app.job_id] || { title: `Job #${app.job_id}`, company_name: "Company" };
        const status = (app.status || "applied").toLowerCase();
        const isRejected = status === "rejected" || status === "cancelled";
        const currentIdx = isRejected ? -1 : Math.max(0, stages.indexOf(status));
        return `
        <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.15);">
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">${job.title}</h3>
              <p style="font-size: 0.85rem; color: #c084fc; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; margin-top: 0.2rem;">
                ${Icons.Building2("w-3.5 h-3.5")} ${job.company_name}
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;">
                ${Icons.Clock("w-3.5 h-3.5")} Applied: ${new Date(app.applied_at).toLocaleDateString()}
              </span>
              ${StatusBadge(app.status)}
            </div>
          </div>

          <!-- Pipeline Timeline -->
          ${!isRejected ? `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; padding: 0.5rem 0;">
              ${stages.map((st, idx) => {
          const isDone = idx <= currentIdx;
          const isCur = idx === currentIdx;
          return `
                  <div style="display: flex; flex-direction: column; gap: 0.4rem; text-align: center;">
                    <div style="height: 6px; border-radius: 9999px; background: ${isDone ? "linear-gradient(90deg, #6366f1, #a855f7)" : "rgba(255, 255, 255, 0.08)"}; box-shadow: ${isDone ? "0 0 10px rgba(99, 102, 241, 0.5)" : "none"};"></div>
                    <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${isCur ? "#c084fc" : isDone ? "var(--text-primary)" : "var(--text-muted)"};">${st}</span>
                  </div>
                `;
        }).join("")}
            </div>
          ` : `
            <div style="padding: 0.75rem 1rem; border-radius: 12px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.25); color: #fda4af; font-size: 0.8rem;">
              This application was not selected to proceed further. You can continue exploring other active positions.
            </div>
          `}
        </div>
      `;
      }).join("");
    } catch (err) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load applications.</div>`;
    }
  }
  function renderCandidateInterviewsPage() {
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">My Interviews</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">View upcoming and past technical interview appointments</p>
      </div>

      <div id="interviews-list-container" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Loading scheduled appointments...</div>
      </div>
    </div>
  `;
  }
  async function initCandidateInterviewsPage() {
    const container = document.getElementById("interviews-list-container");
    try {
      const interviews = await api.get("/interviews/me");
      if (interviews.length === 0) {
        container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${Icons.Calendar("w-12 h-12 text-muted")}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Interviews Scheduled</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">When recruiters schedule technical evaluations for your applications, they will appear here.</p>
        </div>
      `;
        return;
      }
      container.innerHTML = interviews.map(
        (item) => `
      <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">
              ${item.job_title || `Interview #${item.id}`}
            </h3>
            ${item.company_name ? `<span style="font-size: 0.85rem; color: #c084fc; font-weight: 600;">\u2022 ${item.company_name}</span>` : ""}
          </div>

          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem; font-size: 0.825rem; color: var(--text-secondary);">
            <span style="display: flex; align-items: center; gap: 0.35rem; color: #38bdf8; font-weight: 600;">
              ${Icons.Calendar("w-4 h-4")}
              ${new Date(item.scheduled_at).toLocaleString([], {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })}
            </span>
            ${item.interviewer_name ? `
              <span style="display: flex; align-items: center; gap: 0.35rem;">
                ${Icons.UserCheck("w-4 h-4 text-purple-400")} Interviewer: <strong>${item.interviewer_name}</strong>
              </span>
            ` : ""}
          </div>
        </div>

        <div>
          ${StatusBadge(item.status)}
        </div>
      </div>
    `
      ).join("");
    } catch (err) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load interviews.</div>`;
    }
  }

  // app/static/js/pages/recruiter.js
  function renderRecruiterDashboard() {
    const user = auth.getUser();
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <!-- Header Banner -->
      <div class="glass-panel" style="padding: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; border-color: rgba(99, 102, 241, 0.25);">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #a5b4fc; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
            ${Icons.Sparkles("w-3.5 h-3.5 text-cyan-400")}
            Recruiter Operations Hub
          </div>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">
            Talent Dashboard \u2022 <span class="text-gradient">${user?.name || "Recruiter"}</span>
          </h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">
            Company Scope: <strong style="color: #c084fc;">Company ID #${user?.company_id || "N/A"}</strong>
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="#/recruiter/jobs" class="glass-btn glass-btn-primary">
            ${Icons.Plus("w-4 h-4")} Post New Job
          </a>
          <a href="#/recruiter/matching" class="glass-btn glass-btn-secondary">
            ${Icons.Sparkles("w-4 h-4")} AI Matcher
          </a>
        </div>
      </div>

      <!-- Metrics Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Active Jobs</p>
            <h3 id="rec-dash-jobs-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/jobs" style="font-size: 0.75rem; color: #818cf8; font-weight: 600; text-decoration: none;">Manage jobs \u2192</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Briefcase("w-5 h-5")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Applications</p>
            <h3 id="rec-dash-apps-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/applications" style="font-size: 0.75rem; color: #c084fc; font-weight: 600; text-decoration: none;">Review applicants \u2192</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${Icons.Users("w-5 h-5")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Interviews</p>
            <h3 id="rec-dash-int-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/interviews" style="font-size: 0.75rem; color: #38bdf8; font-weight: 600; text-decoration: none;">View schedules \u2192</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Calendar("w-5 h-5")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Documents</p>
            <h3 id="rec-dash-docs-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/documents" style="font-size: 0.75rem; color: #34d399; font-weight: 600; text-decoration: none;">Vector knowledge \u2192</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center;">
            ${Icons.FolderLock("w-5 h-5")}
          </div>
        </div>
      </div>

      <!-- Recent Applications Table -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            ${Icons.TrendingUp("w-5 h-5 text-purple-400")}
            Recent Applications
          </h3>
          <a href="#/recruiter/applications" style="font-size: 0.8rem; font-weight: 700; color: #c084fc; text-decoration: none;">
            View All Applications \u2192
          </a>
        </div>

        <div id="rec-recent-apps-table-wrapper" style="overflow-x: auto;">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading pipeline...</div>
        </div>
      </div>
    </div>
  `;
  }
  async function initRecruiterDashboard() {
    try {
      const [jobsRes, appsRes, interviewsRes, docsRes] = await Promise.allSettled([
        api.get("/jobs/company/me"),
        api.get("/applications/"),
        api.get("/interviews/"),
        api.get("/documents/")
      ]);
      const jobs = jobsRes.status === "fulfilled" ? jobsRes.value : [];
      const apps = appsRes.status === "fulfilled" ? appsRes.value : [];
      const ints = interviewsRes.status === "fulfilled" ? interviewsRes.value : [];
      const docs = docsRes.status === "fulfilled" ? docsRes.value : [];
      const activeJobs = jobs.filter((j) => j.is_active);
      document.getElementById("rec-dash-jobs-count").textContent = activeJobs.length;
      document.getElementById("rec-dash-apps-count").textContent = apps.length;
      document.getElementById("rec-dash-int-count").textContent = ints.length;
      document.getElementById("rec-dash-docs-count").textContent = docs.length;
      const tableWrapper = document.getElementById("rec-recent-apps-table-wrapper");
      if (tableWrapper) {
        if (apps.length > 0) {
          tableWrapper.innerHTML = `
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(139, 92, 246, 0.2); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                <th style="padding: 0.75rem;">App ID</th>
                <th style="padding: 0.75rem;">Job ID</th>
                <th style="padding: 0.75rem;">Candidate ID</th>
                <th style="padding: 0.75rem;">Applied Date</th>
                <th style="padding: 0.75rem;">Status</th>
                <th style="padding: 0.75rem; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${apps.slice(0, 5).map(
            (app) => `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.04); transition: background 0.2s;">
                  <td style="padding: 0.85rem; font-family: var(--font-mono); font-size: 0.8rem; color: #818cf8;">#${app.id}</td>
                  <td style="padding: 0.85rem; font-weight: 600; color: #ffffff;">Job #${app.job_id}</td>
                  <td style="padding: 0.85rem; color: var(--text-secondary);">Candidate #${app.candidate_id}</td>
                  <td style="padding: 0.85rem; font-size: 0.8rem; color: var(--text-muted);">${new Date(app.applied_at).toLocaleDateString()}</td>
                  <td style="padding: 0.85rem;">${StatusBadge(app.status)}</td>
                  <td style="padding: 0.85rem; text-align: right;">
                    <a href="#/recruiter/applications" class="glass-btn glass-btn-outline glass-btn-sm">Review</a>
                  </td>
                </tr>
              `
          ).join("")}
            </tbody>
          </table>
        `;
        } else {
          tableWrapper.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">No applications received yet.</div>`;
        }
      }
    } catch (err) {
      console.error("Failed to load recruiter dashboard:", err);
    }
  }
  function renderRecruiterJobsPage() {
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Company Job Postings</h1>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Create, update, and manage vacancies for your organization</p>
        </div>
        <button id="btn-open-create-job" class="glass-btn glass-btn-primary">
          ${Icons.Plus("w-4 h-4")} Post New Vacancy
        </button>
      </div>

      <div id="recruiter-jobs-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">Loading company jobs...</div>
      </div>
    </div>
  `;
  }
  async function initRecruiterJobsPage() {
    const container = document.getElementById("recruiter-jobs-grid");
    const createBtn = document.getElementById("btn-open-create-job");
    let companyJobs = [];
    createBtn?.addEventListener("click", () => openJobModal(null));
    async function loadCompanyJobs() {
      try {
        companyJobs = await api.get("/jobs/company/me");
        if (companyJobs.length === 0) {
          container.innerHTML = `
          <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${Icons.Briefcase("w-12 h-12 text-muted")}
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Jobs Posted Yet</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Post your first company opening to receive candidate applications and AI matches.</p>
            <button class="glass-btn glass-btn-primary" id="btn-empty-create-job">
              ${Icons.Plus("w-4 h-4")} Post Job
            </button>
          </div>
        `;
          document.getElementById("btn-empty-create-job")?.addEventListener("click", () => openJobModal(null));
          return;
        }
        container.innerHTML = companyJobs.map(
          (job) => `
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.25rem;">
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
              <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">${job.title}</h3>
              <span class="status-badge ${job.is_active ? "status-hired" : "status-screening"}">
                ${job.is_active ? "Active" : "Archived"}
              </span>
            </div>

            <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
              ${Icons.MapPin("w-3.5 h-3.5")} ${job.location}
            </p>

            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${job.description}
            </p>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.6rem; padding-top: 0.75rem; border-top: 1px solid rgba(139, 92, 246, 0.15);">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-edit-job" data-id="${job.id}">
              ${Icons.Edit2("w-3.5 h-3.5")} Edit
            </button>
            <button class="glass-btn glass-btn-danger glass-btn-sm btn-delete-job" data-id="${job.id}">
              ${Icons.Trash2("w-3.5 h-3.5")} Delete
            </button>
          </div>
        </div>
      `
        ).join("");
        container.querySelectorAll(".btn-edit-job").forEach((b) => {
          b.addEventListener("click", () => {
            const job = companyJobs.find((j) => j.id === parseInt(b.dataset.id));
            if (job) openJobModal(job);
          });
        });
        container.querySelectorAll(".btn-delete-job").forEach((b) => {
          b.addEventListener("click", async () => {
            if (confirm("Are you sure you want to delete this job posting?")) {
              try {
                await api.delete(`/jobs/${b.dataset.id}`);
                showToast("Job posting deleted.");
                loadCompanyJobs();
              } catch (err) {
                showToast(err.message || "Failed to delete job.", "error");
              }
            }
          });
        });
      } catch (err) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load jobs.</div>`;
      }
    }
    function openJobModal(job = null) {
      const isEdit = !!job;
      const content = `
      <form id="job-modal-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Job Title</label>
          <input type="text" id="jm-title" required value="${job ? job.title : ""}" placeholder="e.g. Senior Backend Engineer" class="glass-input" />
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Location</label>
          <input type="text" id="jm-location" required value="${job ? job.location : ""}" placeholder="e.g. Remote / New York, NY" class="glass-input" />
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Job Description & Requirements
          </label>
          <textarea id="jm-desc" required rows="6" placeholder="Describe roles, technical stack, required qualifications, and experience..." class="glass-input">${job ? job.description : ""}</textarea>
        </div>

        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <input type="checkbox" id="jm-active" ${!job || job.is_active ? "checked" : ""} style="width: 18px; height: 18px; accent-color: #6366f1;" />
          <label for="jm-active" style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); cursor: pointer;">
            Active Vacancy (Visible for candidate applications & vector matching)
          </label>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button type="button" class="glass-btn glass-btn-outline" id="jm-cancel">Cancel</button>
          <button type="submit" class="glass-btn glass-btn-primary" id="jm-submit">
            ${isEdit ? "Save Changes" : "Publish Job"}
          </button>
        </div>
      </form>
    `;
      openModal({
        title: isEdit ? "Edit Job Vacancy" : "Create New Job Vacancy",
        contentHtml: content,
        maxWidth: "650px"
      });
      document.getElementById("jm-cancel")?.addEventListener("click", () => closeModal());
      document.getElementById("job-modal-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("jm-submit");
        submitBtn.disabled = true;
        const payload = {
          title: document.getElementById("jm-title").value.trim(),
          location: document.getElementById("jm-location").value.trim(),
          description: document.getElementById("jm-desc").value.trim(),
          is_active: document.getElementById("jm-active").checked
        };
        try {
          if (isEdit) {
            await api.put(`/jobs/${job.id}`, payload);
            showToast("Job posting updated successfully!");
          } else {
            await api.post("/jobs/", payload);
            showToast("Job created & indexed in vector store!");
          }
          closeModal();
          loadCompanyJobs();
        } catch (err) {
          showToast(err.message || "Failed to save job.", "error");
          submitBtn.disabled = false;
        }
      });
    }
    loadCompanyJobs();
  }
  function renderRecruiterApplicationsPage() {
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Candidate Applications</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Review applicants, evaluate AI match scores, and schedule technical interviews</p>
      </div>

      <!-- Filters -->
      <div class="glass-card" style="padding: 1.25rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Filter by Job</label>
            <select id="filter-rec-job" class="glass-input">
              <option value="">All Company Jobs</option>
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Filter by Status</label>
            <select id="filter-rec-status" class="glass-input">
              <option value="">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div id="rec-apps-list-container" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Loading applications...</div>
      </div>
    </div>
  `;
  }
  async function initRecruiterApplicationsPage() {
    const container = document.getElementById("rec-apps-list-container");
    const jobFilterEl = document.getElementById("filter-rec-job");
    const statusFilterEl = document.getElementById("filter-rec-status");
    let allApps = [];
    let companyJobsMap = {};
    let companyInterviewers = [];
    async function loadData() {
      try {
        const [appsRes, jobsRes, interviewersRes] = await Promise.all([
          api.get("/applications/"),
          api.get("/jobs/company/me"),
          api.get("/interviews/interviewers")
        ]);
        allApps = appsRes;
        companyInterviewers = interviewersRes;
        companyJobsMap = {};
        jobsRes.forEach((j) => companyJobsMap[j.id] = j);
        if (jobFilterEl) {
          jobFilterEl.innerHTML = `<option value="">All Company Jobs</option>` + jobsRes.map((j) => `<option value="${j.id}">${j.title}</option>`).join("");
        }
        renderAppsList();
      } catch (err) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load applications.</div>`;
      }
    }
    function renderAppsList() {
      const jobFilter = jobFilterEl?.value || "";
      const statusFilter = (statusFilterEl?.value || "").toLowerCase();
      const filtered = allApps.filter((app) => {
        const matchJob = !jobFilter || String(app.job_id) === String(jobFilter);
        const matchStatus = !statusFilter || (app.status || "").toLowerCase() === statusFilter;
        return matchJob && matchStatus;
      });
      if (filtered.length === 0) {
        container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${Icons.Users("w-12 h-12 text-muted")}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Applications Found</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">Applications for your company's vacancies will appear here.</p>
        </div>
      `;
        return;
      }
      container.innerHTML = filtered.map((app) => {
        const job = companyJobsMap[app.job_id] || { title: `Job #${app.job_id}` };
        return `
        <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: #818cf8;">App #${app.id}</span>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">Candidate #${app.candidate_id}</h3>
              ${StatusBadge(app.status)}
            </div>

            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; font-size: 0.825rem; color: var(--text-secondary);">
              <span style="font-weight: 600; color: #c084fc;">Position: ${job.title}</span>
              <span style="color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;">
                ${Icons.Clock("w-3.5 h-3.5")} Applied: ${new Date(app.applied_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <!-- Status Dropdown -->
            <select class="glass-input select-app-status" data-id="${app.id}" style="width: auto; padding: 0.4rem 2rem 0.4rem 0.75rem; font-size: 0.75rem; font-weight: 700;">
              <option value="applied" ${app.status === "applied" ? "selected" : ""}>Applied</option>
              <option value="screening" ${app.status === "screening" ? "selected" : ""}>Screening</option>
              <option value="shortlisted" ${app.status === "shortlisted" ? "selected" : ""}>Shortlisted</option>
              <option value="hired" ${app.status === "hired" ? "selected" : ""}>Hired</option>
              <option value="rejected" ${app.status === "rejected" ? "selected" : ""}>Rejected</option>
            </select>

            <button class="glass-btn glass-btn-secondary glass-btn-sm btn-match-review" data-appid="${app.id}" data-jobid="${app.job_id}" data-candid="${app.candidate_id}">
              ${Icons.Sparkles("w-3.5 h-3.5")} AI Match Review
            </button>

            <button class="glass-btn glass-btn-primary glass-btn-sm btn-schedule-int" data-appid="${app.id}" data-jobid="${app.job_id}" data-candid="${app.candidate_id}">
              ${Icons.Calendar("w-3.5 h-3.5")} Schedule Interview
            </button>
          </div>
        </div>
      `;
      }).join("");
      container.querySelectorAll(".select-app-status").forEach((sel) => {
        sel.addEventListener("change", async () => {
          const appId = sel.dataset.id;
          const newStatus = sel.value;
          try {
            await api.put(`/applications/${appId}/status`, { status: newStatus });
            showToast(`Application #${appId} status updated to ${newStatus}`);
            const target = allApps.find((a) => a.id === parseInt(appId));
            if (target) target.status = newStatus;
            renderAppsList();
          } catch (err) {
            showToast(err.message || "Failed to update status", "error");
          }
        });
      });
      container.querySelectorAll(".btn-match-review").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const jobId = btn.dataset.jobid;
          const candId = btn.dataset.candid;
          const appId = btn.dataset.appid;
          await openMatchReviewModal(jobId, candId, appId);
        });
      });
      container.querySelectorAll(".btn-schedule-int").forEach((btn) => {
        btn.addEventListener("click", () => {
          const appId = parseInt(btn.dataset.appid);
          const candId = btn.dataset.candid;
          const jobId = btn.dataset.jobid;
          openScheduleModal(appId, candId, jobId);
        });
      });
    }
    async function openMatchReviewModal(jobId, candId, appId) {
      openModal({
        title: `Candidate Compatibility \u2022 Application #${appId}`,
        contentHtml: `<div style="text-align: center; padding: 2rem; color: var(--text-muted);"><span class="animate-spin" style="display:inline-block;">\u26A1</span> Computing vector compatibility...</div>`,
        maxWidth: "680px"
      });
      try {
        const match = await api.get(`/match/job/${jobId}/candidate/${candId}`);
        const content = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
            <div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">${match.candidate_name}</h4>
              <p style="font-size: 0.8rem; color: #c084fc;">Applying for: ${match.job_title}</p>
            </div>
            ${MatchScoreBadge(match.match_percentage, "lg")}
          </div>

          <div style="padding: 1.25rem; border-radius: 14px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 0.5rem;">
            <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; display: flex; align-items: center; gap: 0.35rem;">
              ${Icons.Sparkles("w-4 h-4")} Grounded AI Explanation
            </span>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${match.explanation}</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem;">
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);">
              <span style="font-size: 0.7rem; font-weight: 700; color: #6ee7b7; text-transform: uppercase;">Strong Matches</span>
              <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                ${match.breakdown?.strong_matches?.length > 0 ? match.breakdown.strong_matches.join(", ") : "None"}
              </div>
            </div>
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3);">
              <span style="font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Partial Matches</span>
              <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                ${match.breakdown?.partial_matches?.length > 0 ? match.breakdown.partial_matches.join(", ") : "None"}
              </div>
            </div>
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
              <span style="font-size: 0.7rem; font-weight: 700; color: #fcd34d; text-transform: uppercase;">Potential Gaps</span>
              <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                ${match.breakdown?.potential_gaps?.length > 0 ? match.breakdown.potential_gaps.join(", ") : "None detected"}
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
            <button class="glass-btn glass-btn-outline" onclick="document.getElementById('active-modal-backdrop')?.remove()">Close</button>
            <button class="glass-btn glass-btn-primary" id="modal-sched-shortcut">${Icons.Calendar("w-4 h-4")} Schedule Interview</button>
          </div>
        </div>
      `;
        openModal({
          title: `Candidate Compatibility \u2022 Application #${appId}`,
          contentHtml: content,
          maxWidth: "680px"
        });
        document.getElementById("modal-sched-shortcut")?.addEventListener("click", () => {
          closeModal();
          openScheduleModal(parseInt(appId), candId, jobId);
        });
      } catch (err) {
        openModal({
          title: "Error",
          contentHtml: `<div style="color: #fda4af; padding: 1rem;">Failed to load match: ${err.message}</div>`
        });
      }
    }
    function openScheduleModal(appId, candId, jobId) {
      const job = companyJobsMap[jobId] || { title: `Job #${jobId}` };
      const content = `
      <form id="schedule-interview-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <p style="font-size: 0.85rem; color: var(--text-secondary);">
          Scheduling technical evaluation for <strong>Candidate #${candId}</strong> applying for <strong>${job.title}</strong>.
        </p>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Select Assigned Interviewer
          </label>
          ${companyInterviewers.length > 0 ? `
            <select id="sch-interviewer-id" class="glass-input" required>
              ${companyInterviewers.map((i) => `<option value="${i.id}">${i.name} (${i.email})</option>`).join("")}
            </select>
          ` : `
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fcd34d; font-size: 0.8rem;">
              No interviewers found in your company. Please ask an interviewer to register with your company code first.
            </div>
          `}
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Interview Date & Time
          </label>
          <input type="datetime-local" id="sch-datetime" required class="glass-input" />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button type="button" class="glass-btn glass-btn-outline" id="sch-cancel-btn">Cancel</button>
          <button type="submit" class="glass-btn glass-btn-primary" id="sch-submit-btn" ${companyInterviewers.length === 0 ? "disabled" : ""}>
            Confirm Interview Schedule
          </button>
        </div>
      </form>
    `;
      openModal({
        title: "Schedule Technical Interview",
        contentHtml: content,
        maxWidth: "560px"
      });
      document.getElementById("sch-cancel-btn")?.addEventListener("click", () => closeModal());
      document.getElementById("schedule-interview-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const interviewerId = document.getElementById("sch-interviewer-id")?.value;
        const scheduledAt = document.getElementById("sch-datetime")?.value;
        const submitBtn = document.getElementById("sch-submit-btn");
        if (!interviewerId || !scheduledAt) {
          showToast("Please select interviewer and datetime.", "error");
          return;
        }
        submitBtn.disabled = true;
        try {
          await api.post("/interviews/", {
            application_id: appId,
            interviewer_id: parseInt(interviewerId),
            scheduled_at: new Date(scheduledAt).toISOString()
          });
          await api.put(`/applications/${appId}/status`, { status: "shortlisted" });
          showToast("Technical interview scheduled successfully!");
          closeModal();
          loadData();
        } catch (err) {
          showToast(err.message || "Failed to schedule interview.", "error");
          submitBtn.disabled = false;
        }
      });
    }
    jobFilterEl?.addEventListener("change", renderAppsList);
    statusFilterEl?.addEventListener("change", renderAppsList);
    loadData();
  }
  function renderRecruiterInterviewsPage() {
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Company Interviews & Schedules</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Manage upcoming technical evaluations across your organization</p>
      </div>

      <div id="recruiter-interviews-list" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Loading company interviews...</div>
      </div>
    </div>
  `;
  }
  async function initRecruiterInterviewsPage() {
    const container = document.getElementById("recruiter-interviews-list");
    let companyInterviews = [];
    let companyInterviewers = [];
    async function loadData() {
      try {
        const [intRes, interviewerRes] = await Promise.all([
          api.get("/interviews/"),
          api.get("/interviews/interviewers")
        ]);
        companyInterviews = intRes;
        companyInterviewers = interviewerRes;
        if (companyInterviews.length === 0) {
          container.innerHTML = `
          <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${Icons.Calendar("w-12 h-12 text-muted")}
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Interviews Scheduled</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Schedule interviews from the Applications page to manage them here.</p>
          </div>
        `;
          return;
        }
        container.innerHTML = companyInterviews.map(
          (item) => `
        <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: #818cf8;">#${item.id}</span>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">
                ${item.job_title || `Application #${item.application_id}`}
              </h3>
              ${item.candidate_name ? `<span style="font-size: 0.85rem; color: var(--text-secondary);">\u2022 Candidate: <strong style="color: #fff;">${item.candidate_name}</strong></span>` : ""}
              ${StatusBadge(item.status)}
            </div>

            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem; font-size: 0.825rem; color: var(--text-secondary);">
              <span style="display: flex; align-items: center; gap: 0.35rem; color: #38bdf8; font-weight: 600;">
                ${Icons.Clock("w-4 h-4")}
                ${new Date(item.scheduled_at).toLocaleString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
              </span>
              ${item.interviewer_name ? `<span style="display: flex; align-items: center; gap: 0.35rem; color: #c084fc;">
                      ${Icons.UserCheck("w-3.5 h-3.5")} Interviewer: ${item.interviewer_name}
                    </span>` : ""}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-resched-int" data-id="${item.id}">
              ${Icons.Edit2("w-3.5 h-3.5")} Reschedule
            </button>
            <button class="glass-btn glass-btn-danger glass-btn-sm btn-del-int" data-id="${item.id}">
              ${Icons.Trash2("w-3.5 h-3.5")}
            </button>
          </div>
        </div>
      `
        ).join("");
        container.querySelectorAll(".btn-resched-int").forEach((b) => {
          b.addEventListener("click", () => {
            const id = parseInt(b.dataset.id);
            const item = companyInterviews.find((i) => i.id === id);
            if (item) openRescheduleModal(item);
          });
        });
        container.querySelectorAll(".btn-del-int").forEach((b) => {
          b.addEventListener("click", async () => {
            if (confirm("Cancel and delete this interview appointment?")) {
              try {
                await api.delete(`/interviews/${b.dataset.id}`);
                showToast("Interview cancelled & deleted.");
                loadData();
              } catch (err) {
                showToast(err.message || "Failed to delete interview.", "error");
              }
            }
          });
        });
      } catch (err) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load interviews.</div>`;
      }
    }
    function openRescheduleModal(item) {
      const formattedDate = item.scheduled_at ? item.scheduled_at.substring(0, 16) : "";
      const content = `
      <form id="resched-modal-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Assigned Interviewer
          </label>
          <select id="resched-interviewer-id" class="glass-input">
            ${companyInterviewers.map(
        (i) => `
              <option value="${i.id}" ${i.id === item.interviewer_id ? "selected" : ""}>
                ${i.name} (${i.email})
              </option>
            `
      ).join("")}
          </select>
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            New Date & Time
          </label>
          <input type="datetime-local" id="resched-datetime" required value="${formattedDate}" class="glass-input" />
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Status
          </label>
          <select id="resched-status" class="glass-input">
            <option value="scheduled" ${item.status === "scheduled" ? "selected" : ""}>Scheduled</option>
            <option value="completed" ${item.status === "completed" ? "selected" : ""}>Completed</option>
            <option value="cancelled" ${item.status === "cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button type="button" class="glass-btn glass-btn-outline" id="resched-cancel">Cancel</button>
          <button type="submit" class="glass-btn glass-btn-primary" id="resched-submit">Save Changes</button>
        </div>
      </form>
    `;
      openModal({
        title: `Update Interview #${item.id}`,
        contentHtml: content,
        maxWidth: "520px"
      });
      document.getElementById("resched-cancel")?.addEventListener("click", () => closeModal());
      document.getElementById("resched-modal-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const interviewerId = document.getElementById("resched-interviewer-id").value;
        const scheduledAt = document.getElementById("resched-datetime").value;
        const status = document.getElementById("resched-status").value;
        const submitBtn = document.getElementById("resched-submit");
        submitBtn.disabled = true;
        try {
          await api.put(`/interviews/${item.id}`, {
            interviewer_id: interviewerId ? parseInt(interviewerId) : void 0,
            scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : void 0,
            status: status || void 0
          });
          showToast("Interview updated successfully!");
          closeModal();
          loadData();
        } catch (err) {
          showToast(err.message || "Failed to update interview", "error");
          submitBtn.disabled = false;
        }
      });
    }
    loadData();
  }
  function renderRecruiterDocumentsPage() {
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Approved Company Documents</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Upload and index verified policy, FAQ, and process files for privacy-scoped RAG retrieval</p>
      </div>

      <!-- Upload Document Box -->
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.25rem; border-color: rgba(99, 102, 241, 0.35);">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.Upload("w-5 h-5 text-indigo-400")} Upload Company Knowledge Document
        </h3>

        <form id="doc-upload-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="grid-split-search">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                Select File (.pdf, .docx, .txt, .md)
              </label>
              <input type="file" id="doc-file-input" accept=".pdf,.docx,.doc,.txt,.md" required class="glass-input" />
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                Document Category
              </label>
              <select id="doc-type-input" class="glass-input">
                <option value="company_policy">Company Policy</option>
                <option value="faq">Recruitment FAQ</option>
                <option value="process">Interview Process</option>
                <option value="general">General Knowledge</option>
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button type="submit" id="doc-upload-btn" class="glass-btn glass-btn-primary">
              ${Icons.Upload("w-4 h-4")} Upload & Index in PGVector
            </button>
          </div>
        </form>
      </div>

      <!-- Documents List -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.FolderLock("w-5 h-5 text-purple-400")}
          Indexed Knowledge Files
        </h3>

        <div id="rec-docs-list-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading company documents...</div>
        </div>
      </div>
    </div>
  `;
  }
  async function initRecruiterDocumentsPage() {
    const form = document.getElementById("doc-upload-form");
    const fileInput = document.getElementById("doc-file-input");
    const typeInput = document.getElementById("doc-type-input");
    const uploadBtn = document.getElementById("doc-upload-btn");
    const container = document.getElementById("rec-docs-list-container");
    let companyDocs = [];
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const file = fileInput?.files[0];
      if (!file) return;
      uploadBtn.disabled = true;
      uploadBtn.innerHTML = `Chunking & generating vector embeddings...`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", typeInput?.value || "company_policy");
      try {
        await api.post("/documents/", formData);
        showToast("Document indexed into pgvector knowledge base!");
        form.reset();
        loadDocs();
      } catch (err) {
        showToast(err.message || "Failed to upload document.", "error");
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = `${Icons.Upload("w-4 h-4")} Upload & Index in PGVector`;
      }
    });
    async function loadDocs() {
      try {
        companyDocs = await api.get("/documents/");
        if (companyDocs.length === 0) {
          container.innerHTML = `
          <div style="text-align: center; padding: 3rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            ${Icons.FolderLock("w-10 h-10 text-muted")}
            <p>No company documents uploaded yet. Upload a policy or FAQ above.</p>
          </div>
        `;
          return;
        }
        container.innerHTML = companyDocs.map(
          (doc) => `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.85rem; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(139, 92, 246, 0.15); flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              ${Icons.FileText("w-4 h-4 text-indigo-400")}
              <span style="font-weight: 700; color: #ffffff;">${doc.filename}</span>
              <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(168, 85, 247, 0.15); color: #c084fc; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">
                ${doc.document_type}
              </span>
              ${StatusBadge(doc.indexing_status)}
            </div>
            ${doc.extracted_text_preview ? `<p style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; max-width: 500px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    "${doc.extracted_text_preview}"
                   </p>` : ""}
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-doc-preview" data-id="${doc.id}">
              Preview
            </button>
            <button class="glass-btn glass-btn-secondary glass-btn-sm btn-doc-reindex" data-id="${doc.id}">
              ${Icons.RefreshCw("w-3.5 h-3.5")} Re-index
            </button>
            <button class="glass-btn glass-btn-danger glass-btn-sm btn-doc-del" data-id="${doc.id}">
              ${Icons.Trash2("w-3.5 h-3.5")}
            </button>
          </div>
        </div>
      `
        ).join("");
        container.querySelectorAll(".btn-doc-preview").forEach((b) => {
          b.addEventListener("click", () => {
            const doc = companyDocs.find((d) => d.id === parseInt(b.dataset.id));
            if (doc) {
              openModal({
                title: `Preview: ${doc.filename}`,
                contentHtml: `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                  <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Category: <strong style="color: #c084fc;">${doc.document_type}</strong> \u2022 Status: <strong style="color: #34d399;">${doc.indexing_status}</strong>
                  </div>
                  <div style="padding: 1rem; border-radius: 12px; background: rgba(10, 11, 20, 0.7); border: 1px solid rgba(255,255,255,0.08); font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary); max-height: 350px; overflow-y: auto; white-space: pre-wrap; line-height: 1.6;">${doc.extracted_text_preview || "No preview available."}</div>
                </div>
              `,
                maxWidth: "650px"
              });
            }
          });
        });
        container.querySelectorAll(".btn-doc-reindex").forEach((b) => {
          b.addEventListener("click", async () => {
            try {
              const res = await api.post(`/documents/${b.dataset.id}/index`);
              showToast(res.message || "Document re-indexed into pgvector chunks!");
              loadDocs();
            } catch (err) {
              showToast(err.message || "Re-indexing failed.", "error");
            }
          });
        });
        container.querySelectorAll(".btn-doc-del").forEach((b) => {
          b.addEventListener("click", async () => {
            if (confirm("Delete this document and all its pgvector chunks?")) {
              try {
                await api.delete(`/documents/${b.dataset.id}`);
                showToast("Document removed.");
                loadDocs();
              } catch (err) {
                showToast(err.message || "Failed to delete document.", "error");
              }
            }
          });
        });
      } catch (err) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load documents.</div>`;
      }
    }
    loadDocs();
  }
  function renderRecruiterAIMatchingPage() {
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">AI Candidate Matcher</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">
          Rank candidates using 384-dimensional vector similarity against company job descriptions
        </p>
      </div>

      <!-- Selector Box -->
      <div class="glass-card glass-card-glow" style="padding: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 1.25rem; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px;">
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
              Select Company Opening
            </label>
            <select id="matcher-job-select" class="glass-input">
              <option value="">Loading company positions...</option>
            </select>
          </div>

          <button id="btn-recompute-matches" class="glass-btn glass-btn-primary">
            ${Icons.Sparkles("w-4 h-4")} Calculate Matches
          </button>
        </div>
      </div>

      <!-- Ranked Candidates List -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.Sparkles("w-5 h-5 text-cyan-400")}
          Ranked Candidates
        </h3>

        <div id="matcher-results-container" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Select a company position above to compute AI rankings.</div>
        </div>
      </div>
    </div>
  `;
  }
  async function initRecruiterAIMatchingPage() {
    const selectEl = document.getElementById("matcher-job-select");
    const btnRecompute = document.getElementById("btn-recompute-matches");
    const container = document.getElementById("matcher-results-container");
    let candidateMatches = [];
    try {
      const jobs = await api.get("/jobs/company/me");
      if (jobs.length > 0) {
        selectEl.innerHTML = jobs.map((j) => `<option value="${j.id}">${j.title} (${j.location})</option>`).join("");
        runMatching(jobs[0].id);
      } else {
        selectEl.innerHTML = `<option value="">No company jobs available</option>`;
        container.innerHTML = `<div class="glass-card" style="text-align: center; padding: 3rem; color: var(--text-muted);">Please create a job posting first.</div>`;
      }
    } catch (err) {
      selectEl.innerHTML = `<option value="">Error loading jobs</option>`;
    }
    btnRecompute?.addEventListener("click", () => {
      const jobId = selectEl?.value;
      if (jobId) runMatching(jobId);
    });
    selectEl?.addEventListener("change", () => {
      const jobId = selectEl?.value;
      if (jobId) runMatching(jobId);
    });
    async function runMatching(jobId) {
      container.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
        <span class="animate-spin" style="font-size: 1.5rem;">\u26A1</span>
        <p>Computing 384-dimensional cosine similarity across all registered candidate resumes...</p>
      </div>
    `;
      try {
        candidateMatches = await api.get(`/match/job/${jobId}/candidates`);
        if (candidateMatches.length === 0) {
          container.innerHTML = `
          <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${Icons.User("w-12 h-12 text-muted")}
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Candidate Matches</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Ensure candidates have registered and uploaded resumes to compute matches.</p>
          </div>
        `;
          return;
        }
        container.innerHTML = candidateMatches.map((cand, idx) => {
          return `
          <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
            <div style="display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 280px;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; color: #fff;">
                  #${idx + 1}
                </div>
                <div>
                  <h4 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
                    ${cand.candidate_name}
                    ${cand.has_applied ? `<span class="status-badge status-hired" style="font-size: 0.65rem;">Applied</span>` : ""}
                  </h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;">
                    ${Icons.Mail("w-3.5 h-3.5")} ${cand.candidate_email}
                  </p>
                </div>
              </div>

              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; padding-left: 2.75rem;">
                ${cand.explanation}
              </p>

              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; padding-left: 2.75rem;">
                ${cand.breakdown?.strong_matches?.slice(0, 3).map(
            (s) => `
                  <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; font-size: 0.7rem; font-weight: 600;">
                    \u2713 ${s}
                  </span>
                `
          ).join("")}
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 1rem;">
              ${MatchScoreBadge(cand.match_percentage, "md")}
              <button class="glass-btn glass-btn-outline glass-btn-sm btn-view-cand-breakdown" data-candid="${cand.candidate_id}">
                View Breakdown
              </button>
            </div>
          </div>
        `;
        }).join("");
        container.querySelectorAll(".btn-view-cand-breakdown").forEach((b) => {
          b.addEventListener("click", () => {
            const candId = parseInt(b.dataset.candid);
            const cand = candidateMatches.find((c) => c.candidate_id === candId);
            if (cand) {
              openModal({
                title: `Match Analysis \u2022 ${cand.candidate_name}`,
                contentHtml: `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                    <div>
                      <h4 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">${cand.candidate_name}</h4>
                      <p style="font-size: 0.8rem; color: var(--text-muted);">${cand.candidate_email}</p>
                    </div>
                    ${MatchScoreBadge(cand.match_percentage, "lg")}
                  </div>

                  <div style="padding: 1rem; border-radius: 12px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 0.5rem;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">Grounded AI Explanation</span>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${cand.explanation}</p>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem;">
                    <div style="padding: 0.75rem; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);">
                      <span style="font-size: 0.7rem; font-weight: 700; color: #6ee7b7; text-transform: uppercase;">Strong Matches</span>
                      <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                        ${cand.breakdown?.strong_matches?.length > 0 ? cand.breakdown.strong_matches.join(", ") : "None"}
                      </div>
                    </div>
                    <div style="padding: 0.75rem; border-radius: 10px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3);">
                      <span style="font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Partial Matches</span>
                      <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                        ${cand.breakdown?.partial_matches?.length > 0 ? cand.breakdown.partial_matches.join(", ") : "None"}
                      </div>
                    </div>
                    <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
                      <span style="font-size: 0.7rem; font-weight: 700; color: #fcd34d; text-transform: uppercase;">Potential Gaps</span>
                      <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                        ${cand.breakdown?.potential_gaps?.length > 0 ? cand.breakdown.potential_gaps.join(", ") : "None detected"}
                      </div>
                    </div>
                  </div>

                  <div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">
                    * ${cand.advisory_disclaimer || "AI match scores are advisory suggestions."}
                  </div>
                </div>
              `,
                maxWidth: "650px"
              });
            }
          });
        });
      } catch (err) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to calculate matches: ${err.message}</div>`;
      }
    }
  }

  // app/static/js/pages/interviewer.js
  function renderInterviewerDashboard() {
    const user = auth.getUser();
    return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <!-- Header -->
      <div class="glass-panel" style="padding: 2rem; border-color: rgba(6, 182, 212, 0.25); display: flex; flex-direction: column; gap: 0.5rem;">
        <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 9999px; background: rgba(6, 182, 212, 0.15); color: #38bdf8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
          ${Icons.UserCheck("w-3.5 h-3.5")}
          Technical Interviewer Portal
        </div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">
          Assigned Interviews \u2022 <span class="text-gradient">${user?.name || "Interviewer"}</span>
        </h1>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">
          Company: <strong style="color: #c084fc;">Company ID #${user?.company_id || "N/A"}</strong> (Assigned interviews exclusively)
        </p>
      </div>

      <!-- Metrics -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Upcoming Scheduled</p>
            <h3 id="int-dash-sched-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Clock("w-5 h-5")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Completed Evaluations</p>
            <h3 id="int-dash-comp-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center;">
            ${Icons.CheckCircle2("w-5 h-5")}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Total Assigned</p>
            <h3 id="int-dash-total-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${Icons.Calendar("w-5 h-5")}
          </div>
        </div>
      </div>

      <!-- Assigned Interviews List -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.Calendar("w-5 h-5 text-purple-400")}
          My Assigned Evaluations
        </h3>

        <div id="interviewer-items-container" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading assigned interviews...</div>
        </div>
      </div>
    </div>
  `;
  }
  async function initInterviewerDashboard() {
    const container = document.getElementById("interviewer-items-container");
    let assignedInterviews = [];
    async function loadData() {
      try {
        assignedInterviews = await api.get("/interviews/");
        const scheduled = assignedInterviews.filter((i) => i.status === "scheduled").length;
        const completed = assignedInterviews.filter((i) => i.status === "completed").length;
        document.getElementById("int-dash-sched-count").textContent = scheduled;
        document.getElementById("int-dash-comp-count").textContent = completed;
        document.getElementById("int-dash-total-count").textContent = assignedInterviews.length;
        if (assignedInterviews.length === 0) {
          container.innerHTML = `
          <div style="text-align: center; padding: 3rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            ${Icons.Calendar("w-10 h-10 text-muted")}
            <p>You have no technical interviews assigned currently.</p>
          </div>
        `;
          return;
        }
        container.innerHTML = assignedInterviews.map(
          (item) => `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1.25rem; padding: 1rem; border-radius: 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(139, 92, 246, 0.15); flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: #818cf8;">Interview #${item.id}</span>
              <h4 style="font-size: 1.1rem; font-weight: 800; color: #ffffff;">
                ${item.job_title || `Application #${item.application_id}`}
              </h4>
              ${StatusBadge(item.status)}
            </div>

            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem; font-size: 0.825rem; color: var(--text-secondary);">
              <span style="display: flex; align-items: center; gap: 0.35rem; color: #38bdf8; font-weight: 600;">
                ${Icons.Clock("w-4 h-4")}
                ${new Date(item.scheduled_at).toLocaleString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
              </span>
              ${item.candidate_name ? `<span style="color: var(--text-primary); font-weight: 600;">Candidate: ${item.candidate_name}</span>` : ""}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${item.status === "scheduled" ? `
              <button class="glass-btn glass-btn-success glass-btn-sm btn-int-status" data-id="${item.id}" data-status="completed">
                ${Icons.CheckCircle2("w-3.5 h-3.5")} Mark Complete
              </button>
              <button class="glass-btn glass-btn-danger glass-btn-sm btn-int-status" data-id="${item.id}" data-status="cancelled">
                ${Icons.XCircle("w-3.5 h-3.5")} Cancel
              </button>
            ` : `
              <button class="glass-btn glass-btn-outline glass-btn-sm btn-int-status" data-id="${item.id}" data-status="scheduled">
                Re-open
              </button>
            `}
          </div>
        </div>
      `
        ).join("");
        container.querySelectorAll(".btn-int-status").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const status = btn.dataset.status;
            try {
              await api.put(`/interviews/${id}/status`, { status });
              showToast(`Interview marked as ${status}`);
              loadData();
            } catch (err) {
              showToast(err.message || "Failed to update status", "error");
            }
          });
        });
      } catch (err) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load interviews.</div>`;
      }
    }
    loadData();
  }

  // app/static/js/pages/chat.js
  function renderChatPage() {
    return `
    <div class="chat-container">
      <!-- Sessions Sidebar -->
      <div class="glass-card chat-sessions-sidebar">
        <div style="display: flex; flex-direction: column; gap: 1rem; overflow: hidden; flex: 1;">
          <button id="chat-new-btn" class="glass-btn glass-btn-primary glass-btn-sm" style="width: 100%; justify-content: flex-start;">
            ${Icons.Plus("w-4 h-4")} New Conversation
          </button>

          <div style="font-size: 0.68rem; font-family: var(--font-mono); color: rgba(192, 132, 252, 0.7); text-transform: uppercase; letter-spacing: 0.08em; padding: 0 0.5rem;">
            Conversation History
          </div>

          <div id="chat-sessions-list" style="overflow-y: auto; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; padding-right: 0.25rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem;">Loading sessions...</div>
          </div>
        </div>

        <div style="padding-top: 0.75rem; border-top: 1px solid rgba(139, 92, 246, 0.15); display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--text-muted);">
          <span>Protocol:</span>
          <span id="chat-conn-status" style="display: flex; align-items: center; gap: 0.35rem; color: #34d399; font-weight: 700;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #34d399; display: inline-block;"></span>
            Connecting...
          </span>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="glass-card chat-main-area">
        <!-- Messages Feed -->
        <div id="chat-messages-container" class="chat-messages-scroll">
          <div id="chat-empty-state" style="margin: auto; max-width: 520px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem;">
            <div style="width: 56px; height: 56px; border-radius: 18px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);">
              ${Icons.Bot("w-8 h-8")}
            </div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #ffffff;">AI Career & Recruitment Assistant</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              Grounded career guidance, resume improvements, skill gap analysis, and mock interview preparations based strictly on authorized database documents.
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; width: 100%; margin-top: 0.5rem;">
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                \u{1F4A1} "How can I improve my resume for Senior Backend roles?"
              </button>
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                \u{1F3AF} "What jobs in the database fit my skills?"
              </button>
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                \u26A1 "Help me prepare for a Python & FastAPI interview."
              </button>
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                \u{1F50D} "What skills are missing from my resume for ML positions?"
              </button>
            </div>
          </div>
        </div>

        <!-- Input Bar -->
        <div style="padding: 1rem 1.5rem; background: rgba(10, 11, 20, 0.85); border-top: 1px solid rgba(139, 92, 246, 0.15); display: flex; flex-direction: column; gap: 0.5rem;">
          <form id="chat-input-form" style="display: flex; gap: 0.75rem;">
            <input
              type="text"
              id="chat-input-field"
              placeholder="Ask about resume improvements, skill gaps, or interview questions..."
              class="glass-input"
              style="padding: 0.85rem 1.25rem; font-size: 0.9rem;"
              autocomplete="off"
            />
            <button type="submit" id="chat-send-btn" class="glass-btn glass-btn-primary" style="padding: 0.85rem 1.5rem;">
              ${Icons.Send("w-5 h-5")}
            </button>
          </form>

          <div style="text-align: center; font-size: 0.7rem; color: var(--text-muted);">
            Advisory Notice: Responses are AI-assisted guidance based on verified company documents and do not represent automated hiring decisions.
          </div>
        </div>
      </div>
    </div>
  `;
  }
  function initChatPage() {
    const container = document.getElementById("chat-messages-container");
    const emptyState = document.getElementById("chat-empty-state");
    const form = document.getElementById("chat-input-form");
    const input = document.getElementById("chat-input-field");
    const sendBtn = document.getElementById("chat-send-btn");
    const sessionsList = document.getElementById("chat-sessions-list");
    const newBtn = document.getElementById("chat-new-btn");
    const statusEl = document.getElementById("chat-conn-status");
    let currentSessionId = null;
    let chatSessions = [];
    let currentMessages = [];
    let isThinking = false;
    let ws = null;
    const hashParts = window.location.hash.split("?");
    if (hashParts.length > 1) {
      const params = new URLSearchParams(hashParts[1]);
      const initPrompt = params.get("prompt");
      if (initPrompt && input) {
        input.value = initPrompt;
      }
    }
    const token = auth.getToken();
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat${token ? `?token=${token}` : ""}`;
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        if (statusEl) {
          statusEl.innerHTML = `
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #34d399; display: inline-block;"></span>
          Real-time WS
        `;
        }
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "answer") {
            hideThinking();
            addMessage({
              role: "assistant",
              content: data.answer,
              sources: data.sources
            });
            currentSessionId = data.session_id;
            loadSessions();
          } else if (data.type === "status" && data.status === "thinking") {
            showThinking();
          }
        } catch (err) {
          console.error("Error parsing WS message:", err);
        }
      };
      ws.onerror = () => {
        if (statusEl) {
          statusEl.innerHTML = `
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
          REST Mode
        `;
        }
      };
      ws.onclose = () => {
        if (statusEl) {
          statusEl.innerHTML = `
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
          REST Mode
        `;
        }
      };
    } catch {
      if (statusEl) statusEl.textContent = "REST Mode";
    }
    async function loadSessions() {
      try {
        chatSessions = await api.get("/chat/sessions");
        if (sessionsList) {
          if (chatSessions.length === 0) {
            sessionsList.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem;">No conversations yet</div>`;
            return;
          }
          sessionsList.innerHTML = chatSessions.map(
            (s) => `
          <div class="chat-session-item" data-id="${s.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.75rem; border-radius: 10px; font-size: 0.78rem; cursor: pointer; transition: all 0.2s; background: ${currentSessionId === s.id ? "rgba(168, 85, 247, 0.25)" : "transparent"}; color: ${currentSessionId === s.id ? "#ffffff" : "var(--text-secondary)"}; border: 1px solid ${currentSessionId === s.id ? "rgba(168, 85, 247, 0.4)" : "transparent"};">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; max-width: 170px;">
              ${s.title}
            </span>
            <button class="btn-del-session" data-id="${s.id}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;" title="Delete">
              ${Icons.Trash2("w-3.5 h-3.5")}
            </button>
          </div>
        `
          ).join("");
          sessionsList.querySelectorAll(".chat-session-item").forEach((item) => {
            item.addEventListener("click", () => {
              const sid = item.dataset.id;
              if (sid) selectSession(sid);
            });
          });
          sessionsList.querySelectorAll(".btn-del-session").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const sid = btn.dataset.id;
              if (!sid) return;
              try {
                await api.delete(`/chat/sessions/${sid}`);
                if (currentSessionId === sid) {
                  newChat();
                }
                showToast("Conversation deleted");
                loadSessions();
              } catch (err) {
                showToast("Failed to delete session", "error");
              }
            });
          });
        }
      } catch (err) {
        console.error("Error loading chat sessions:", err);
      }
    }
    async function selectSession(sessionId) {
      if (!sessionId) return;
      currentSessionId = String(sessionId);
      loadSessions();
      try {
        const session = await api.get(`/chat/sessions/${sessionId}`);
        currentMessages = session.messages || [];
        renderMessagesFeed();
      } catch (err) {
        console.error("Failed to load session messages:", err);
        showToast("Failed to load conversation history", "error");
      }
    }
    function newChat() {
      currentSessionId = null;
      currentMessages = [];
      renderMessagesFeed();
      loadSessions();
    }
    newBtn?.addEventListener("click", newChat);
    function renderMessagesFeed() {
      if (currentMessages.length === 0) {
        container.innerHTML = "";
        if (emptyState) container.appendChild(emptyState);
        wirePromptChips();
        return;
      }
      container.innerHTML = currentMessages.map((m) => {
        const isUser = m.role === "user";
        return `
        <div style="display: flex; gap: 0.75rem; max-width: 900px; width: 100%; ${isUser ? "margin-left: auto; flex-direction: row-reverse;" : "margin-right: auto;"}">
          <div style="width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; ${isUser ? "background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff;" : "background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc;"}">
            ${isUser ? Icons.User("w-4 h-4") : Icons.Bot("w-4 h-4")}
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 85%;">
            <div class="${isUser ? "chat-bubble-user" : "chat-bubble-bot"}">
              ${isUser ? `<div style="white-space: pre-wrap;">${escapeHtml(m.content)}</div>` : formatChatMarkdown(m.content)}
            </div>

            ${!isUser ? renderSourcesBadges(m.sources) : ""}
          </div>
        </div>
      `;
      }).join("");
      scrollToBottom();
    }
    function addMessage(msg) {
      currentMessages.push(msg);
      renderMessagesFeed();
    }
    function showThinking() {
      if (isThinking) return;
      isThinking = true;
      const thinkingEl = document.createElement("div");
      thinkingEl.id = "chat-thinking-indicator";
      thinkingEl.style.cssText = "display: flex; gap: 0.75rem; margin-right: auto; max-width: 500px;";
      thinkingEl.innerHTML = `
      <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc; display: flex; align-items: center; justify-content: center;">
        ${Icons.Bot("w-4 h-4")}
      </div>
      <div class="chat-bubble-bot animate-pulse" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #c084fc;">
        <span class="animate-spin" style="display:inline-block;">\u26A1</span>
        <span>Searching vector knowledge base & generating response...</span>
      </div>
    `;
      container.appendChild(thinkingEl);
      scrollToBottom();
    }
    function hideThinking() {
      isThinking = false;
      document.getElementById("chat-thinking-indicator")?.remove();
    }
    function scrollToBottom() {
      container.scrollTop = container.scrollHeight;
    }
    function wirePromptChips() {
      document.querySelectorAll(".chat-prompt-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const text = chip.textContent.replace(/^[\s💡🎯⚡🔍"']+|["'\s]+$/g, "").trim();
          if (input) {
            input.value = text;
            form.dispatchEvent(new Event("submit"));
          }
        });
      });
    }
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = (input?.value || "").trim();
      if (!text) return;
      input.value = "";
      addMessage({ role: "user", content: text });
      showThinking();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            message: text,
            session_id: currentSessionId
          })
        );
      } else {
        try {
          const res = await api.post("/chat/", {
            message: text,
            session_id: currentSessionId
          });
          hideThinking();
          addMessage({
            role: "assistant",
            content: res.answer,
            sources: res.sources
          });
          currentSessionId = res.session_id;
          loadSessions();
        } catch (err) {
          hideThinking();
          addMessage({
            role: "assistant",
            content: "Could not connect to AI service. Please verify server status."
          });
        }
      }
    });
    function escapeHtml(str) {
      if (!str) return "";
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    function inlineFormat(str) {
      if (!str) return "";
      return escapeHtml(str).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/~~([^~]+)~~/g, "<del>$1</del>");
    }
    function renderSourcesBadges(sources) {
      if (!sources || sources.length === 0) return "";
      const seen = /* @__PURE__ */ new Set();
      const unique = [];
      for (const s of sources) {
        const key = `${s.title}_${s.source_type}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(s);
        }
      }
      if (unique.length === 0) return "";
      return `
      <div class="chat-sources-box">
        <div style="font-weight: 700; color: #c084fc; display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.45rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
          ${Icons.BookOpen("w-3.5 h-3.5")} Verified Sources Grounded
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
          ${unique.map(
        (s) => `
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.6rem; border-radius: 8px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); font-size: 0.72rem; color: #e0e7ff;">
              <strong style="color: #ffffff;">${escapeHtml(s.title || "Document")}</strong>
              <span style="opacity: 0.7; font-size: 0.68rem; text-transform: capitalize;">(${escapeHtml(s.source_type || "doc")})</span>
            </span>
          `
      ).join("")}
        </div>
      </div>
    `;
    }
    function formatChatMarkdown(text) {
      if (!text) return "";
      const codeBlocks = [];
      let temp = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push(`<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`);
        return `__CODE_BLOCK_${idx}__`;
      });
      const lines = temp.split("\n");
      const processedLines = [];
      let inTable = false;
      let tableHeader = [];
      let tableRows = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("|") && line.endsWith("|")) {
          const cells = line.slice(1, -1).split("|").map((c) => c.trim());
          if (cells.every((c) => /^:?-+:?$/.test(c))) {
            continue;
          }
          if (!inTable) {
            inTable = true;
            tableHeader = cells;
            tableRows = [];
          } else {
            tableRows.push(cells);
          }
        } else {
          if (inTable) {
            let tableHtml = `<div class="chat-table-wrapper"><table class="chat-markdown-table"><thead><tr>`;
            tableHeader.forEach((th) => {
              tableHtml += `<th>${inlineFormat(th)}</th>`;
            });
            tableHtml += `</tr></thead><tbody>`;
            tableRows.forEach((row) => {
              tableHtml += `<tr>`;
              row.forEach((td) => {
                tableHtml += `<td>${inlineFormat(td)}</td>`;
              });
              tableHtml += `</tr>`;
            });
            tableHtml += `</tbody></table></div>`;
            processedLines.push(tableHtml);
            inTable = false;
          }
          processedLines.push(line);
        }
      }
      if (inTable) {
        let tableHtml = `<div class="chat-table-wrapper"><table class="chat-markdown-table"><thead><tr>`;
        tableHeader.forEach((th) => {
          tableHtml += `<th>${inlineFormat(th)}</th>`;
        });
        tableHtml += `</tr></thead><tbody>`;
        tableRows.forEach((row) => {
          tableHtml += `<tr>`;
          row.forEach((td) => {
            tableHtml += `<td>${inlineFormat(td)}</td>`;
          });
          tableHtml += `</tr>`;
        });
        tableHtml += `</tbody></table></div>`;
        processedLines.push(tableHtml);
      }
      let result = [];
      let inList = false;
      let listType = "ul";
      for (let line of processedLines) {
        if (line.startsWith("__CODE_BLOCK_")) {
          if (inList) {
            result.push(`</${listType}>`);
            inList = false;
          }
          const match = line.match(/__CODE_BLOCK_(\d+)__/);
          if (match) {
            result.push(codeBlocks[parseInt(match[1])]);
          }
          continue;
        }
        if (line.startsWith('<div class="chat-table-wrapper"')) {
          if (inList) {
            result.push(`</${listType}>`);
            inList = false;
          }
          result.push(line);
          continue;
        }
        if (line.startsWith("#### ")) {
          if (inList) {
            result.push(`</${listType}>`);
            inList = false;
          }
          result.push(`<h4>${inlineFormat(line.slice(5))}</h4>`);
        } else if (line.startsWith("### ")) {
          if (inList) {
            result.push(`</${listType}>`);
            inList = false;
          }
          result.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
        } else if (line.startsWith("## ")) {
          if (inList) {
            result.push(`</${listType}>`);
            inList = false;
          }
          result.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
        } else if (line.startsWith("# ")) {
          if (inList) {
            result.push(`</${listType}>`);
            inList = false;
          }
          result.push(`<h1>${inlineFormat(line.slice(2))}</h1>`);
        } else if (/^[-*•]\s+/.test(line)) {
          if (!inList || listType !== "ul") {
            if (inList) result.push(`</${listType}>`);
            result.push("<ul>");
            inList = true;
            listType = "ul";
          }
          result.push(`<li>${inlineFormat(line.replace(/^[-*•]\s+/, ""))}</li>`);
        } else if (/^\d+\.\s+/.test(line)) {
          if (!inList || listType !== "ol") {
            if (inList) result.push(`</${listType}>`);
            result.push("<ol>");
            inList = true;
            listType = "ol";
          }
          result.push(`<li>${inlineFormat(line.replace(/^\d+\.\s+/, ""))}</li>`);
        } else if (line.startsWith("> ")) {
          if (inList) {
            result.push(`</${listType}>`);
            inList = false;
          }
          result.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
        } else if (line.trim() === "") {
          if (inList) {
            result.push(`</${listType}>`);
            inList = false;
          }
        } else {
          if (inList) {
            result.push(`</${listType}>`);
            inList = false;
          }
          result.push(`<p>${inlineFormat(line)}</p>`);
        }
      }
      if (inList) {
        result.push(`</${listType}>`);
      }
      return `<div class="chat-markdown">${result.join("")}</div>`;
    }
    loadSessions();
    wirePromptChips();
  }

  // app/static/js/pages/profile.js
  function renderProfilePage() {
    const user = auth.getUser();
    const isCandidate = user?.role === "candidate";
    return `
    <div style="max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Account Profile</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">View your credentials and role configuration</p>
      </div>

      <!-- Account Summary Card -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
          <div style="width: 64px; height: 64px; border-radius: 18px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);">
            ${(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #ffffff;">${user?.name || "User"}</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem;">
              ${Icons.Mail("w-3.5 h-3.5")} ${user?.email || "N/A"}
            </p>
            <div style="margin-top: 0.25rem;">
              <span class="status-badge status-${user?.role || "applied"}">
                ${Icons.Shield("w-3 h-3")} Role: ${user?.role || "candidate"}
              </span>
            </div>
          </div>
        </div>

        ${user?.company_id ? `
          <div style="padding: 1rem; border-radius: 12px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); display: flex; align-items: center; gap: 0.75rem;">
            ${Icons.Building2("w-5 h-5 text-indigo-400")}
            <div>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Associated Organization</p>
              <p style="font-size: 0.95rem; font-weight: 700; color: #ffffff;">Company ID #${user.company_id}</p>
            </div>
          </div>
        ` : ""}
      </div>

      <!-- Candidate Specific Details Form -->
      ${isCandidate ? `
        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.25rem; border-color: rgba(168, 85, 247, 0.35);">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            ${Icons.User("w-5 h-5 text-purple-400")}
            Candidate Contact & Bio
          </h3>

          <form id="candidate-profile-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div class="grid-split-form">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                  Phone Number
                </label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                    ${Icons.Phone("w-4 h-4")}
                  </span>
                  <input type="text" id="prof-phone" placeholder="+1 (555) 000-0000" class="glass-input" style="padding-left: 2.75rem;" />
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                  Location / City
                </label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                    ${Icons.MapPin("w-4 h-4")}
                  </span>
                  <input type="text" id="prof-location" placeholder="e.g. San Francisco, CA / Remote" class="glass-input" style="padding-left: 2.75rem;" />
                </div>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                Professional Bio & Core Competencies
              </label>
              <textarea id="prof-bio" rows="4" placeholder="Summary of engineering experience, preferred tech stack, and goals..." class="glass-input"></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end;">
              <button type="submit" id="prof-save-btn" class="glass-btn glass-btn-primary">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      ` : ""}
    </div>
  `;
  }
  async function initProfilePage() {
    const user = auth.getUser();
    if (user?.role !== "candidate") return;
    const phoneInput = document.getElementById("prof-phone");
    const locInput = document.getElementById("prof-location");
    const bioInput = document.getElementById("prof-bio");
    const form = document.getElementById("candidate-profile-form");
    const saveBtn = document.getElementById("prof-save-btn");
    let hasExistingProfile = false;
    try {
      const candidateData = await api.get("/candidates/me");
      if (candidateData) {
        hasExistingProfile = true;
        if (phoneInput) phoneInput.value = candidateData.phone || "";
        if (locInput) locInput.value = candidateData.location || "";
        if (bioInput) bioInput.value = candidateData.bio || "";
      }
    } catch {
      hasExistingProfile = false;
    }
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!saveBtn) return;
      saveBtn.disabled = true;
      saveBtn.innerHTML = `Saving changes...`;
      const payload = {
        phone: phoneInput?.value.trim() || "",
        location: locInput?.value.trim() || "",
        bio: bioInput?.value.trim() || ""
      };
      try {
        if (hasExistingProfile) {
          await api.put("/candidates/me", payload);
        } else {
          await api.post("/candidates/", payload);
          hasExistingProfile = true;
        }
        showToast("Profile saved successfully!");
      } catch (err) {
        showToast(err.message || "Failed to update profile", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "Save Profile";
      }
    });
  }

  // app/static/js/router.js
  var routes = {
    // Public
    "/": { render: renderLandingPage, public: true },
    "/login": { render: renderLoginPage, init: initLoginPage, public: true, authOnly: false },
    "/register": { render: renderRegisterCandidatePage, init: initRegisterCandidatePage, public: true },
    "/register/candidate": { render: renderRegisterCandidatePage, init: initRegisterCandidatePage, public: true },
    "/register-recruiter": { render: renderRegisterRecruiterPage, init: initRegisterRecruiterPage, public: true },
    "/register/recruiter": { render: renderRegisterRecruiterPage, init: initRegisterRecruiterPage, public: true },
    "/register-interviewer": { render: renderRegisterInterviewerPage, init: initRegisterInterviewerPage, public: true },
    "/register/interviewer": { render: renderRegisterInterviewerPage, init: initRegisterInterviewerPage, public: true },
    "/forgot-password": { render: renderForgotPasswordPage, init: initForgotPasswordPage, public: true },
    "/jobs": { render: renderCandidateJobsPage, init: initCandidateJobsPage, public: true },
    // Common Authenticated
    "/dashboard": { dynamic: true },
    "/recruiter": { dynamic: true },
    "/interviewer": { dynamic: true },
    "/chat": { render: renderChatPage, init: initChatPage, roles: ["candidate", "recruiter", "admin", "interviewer"] },
    "/profile": { render: renderProfilePage, init: initProfilePage, roles: ["candidate", "recruiter", "admin", "interviewer"] },
    // Candidate
    "/resume": { render: renderCandidateResumePage, init: initCandidateResumePage, roles: ["candidate"] },
    "/applications": { render: renderCandidateApplicationsPage, init: initCandidateApplicationsPage, roles: ["candidate"] },
    "/interviews": { render: renderCandidateInterviewsPage, init: initCandidateInterviewsPage, roles: ["candidate"] },
    // Recruiter
    "/recruiter/jobs": { render: renderRecruiterJobsPage, init: initRecruiterJobsPage, roles: ["recruiter", "admin"] },
    "/recruiter/applications": { render: renderRecruiterApplicationsPage, init: initRecruiterApplicationsPage, roles: ["recruiter", "admin"] },
    "/recruiter/interviews": { render: renderRecruiterInterviewsPage, init: initRecruiterInterviewsPage, roles: ["recruiter", "admin"] },
    "/recruiter/matching": { render: renderRecruiterAIMatchingPage, init: initRecruiterAIMatchingPage, roles: ["recruiter", "admin"] },
    "/recruiter/documents": { render: renderRecruiterDocumentsPage, init: initRecruiterDocumentsPage, roles: ["recruiter", "admin"] },
    // Interviewer
    "/interviewer/interviews": { render: renderInterviewerDashboard, init: initInterviewerDashboard, roles: ["interviewer"] }
  };
  var Router = class {
    constructor(appRootSelector = "#app-root") {
      this.appRootSelector = appRootSelector;
      this.appRoot = document.querySelector(appRootSelector);
      window.addEventListener("hashchange", () => this.handleRoute());
    }
    start() {
      if (!window.location.hash || window.location.hash === "#" || window.location.hash === "") {
        try {
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, "", "#/");
          } else {
            window.location.hash = "#/";
          }
        } catch {
          window.location.hash = "#/";
        }
      }
      this.handleRoute();
    }
    handleRoute() {
      try {
        if (!this.appRoot) {
          this.appRoot = document.querySelector(this.appRootSelector) || document.getElementById("app-root");
        }
        const rawHash = window.location.hash || "#/";
        let path = rawHash.replace(/^#/, "").split("?")[0] || "/";
        if (!path.startsWith("/")) {
          path = "/" + path;
        }
        const isAuth = auth.isAuthenticated();
        const userRole = auth.getRole();
        if (path === "/dashboard" || path === "/recruiter" || path === "/interviewer") {
          if (!isAuth) {
            window.location.hash = "#/login";
            return;
          }
          if (userRole === "interviewer") {
            this.renderView({ render: renderInterviewerDashboard, init: initInterviewerDashboard }, path);
          } else if (userRole === "recruiter" || userRole === "admin") {
            this.renderView({ render: renderRecruiterDashboard, init: initRecruiterDashboard }, path);
          } else {
            this.renderView({ render: renderCandidateDashboard, init: initCandidateDashboard }, path);
          }
          return;
        }
        const route = routes[path];
        if (!route) {
          window.location.hash = isAuth ? "#/dashboard" : "#/";
          return;
        }
        if (!route.public && !isAuth) {
          window.location.hash = "#/login";
          return;
        }
        if (route.roles && !route.roles.includes(userRole)) {
          window.location.hash = "#/dashboard";
          return;
        }
        this.renderView(route, path);
      } catch (routeErr) {
        console.error("Routing resolution error:", routeErr);
      }
    }
    renderView(route, path) {
      try {
        if (!this.appRoot) {
          this.appRoot = document.querySelector(this.appRootSelector) || document.getElementById("app-root");
        }
        if (!this.appRoot) return;
        window.scrollTo(0, 0);
        const isAuth = auth.isAuthenticated();
        const isAuthOrLandingPage = path === "/" || path === "/login" || path.startsWith("/register") || path === "/forgot-password";
        const showSidebar = isAuth && !isAuthOrLandingPage;
        const navbarHtml = renderNavbar();
        const sidebarHtml = showSidebar ? renderSidebar() : "";
        const mainHtml = typeof route.render === "function" ? route.render() : "";
        this.appRoot.innerHTML = `
        ${navbarHtml}
        <main class="app-container">
          ${showSidebar ? `
            <div class="app-layout-grid">
              ${sidebarHtml}
              <div class="app-main-content">${mainHtml}</div>
            </div>
          ` : `
            <div class="app-main-content">${mainHtml}</div>
          `}
        </main>
      `;
        document.getElementById("nav-logout-btn")?.addEventListener("click", () => {
          auth.logout();
          window.location.hash = "#/login";
        });
        if (typeof route.init === "function") {
          try {
            route.init();
          } catch (err) {
            console.error("Error during route init:", err);
          }
        }
      } catch (renderErr) {
        console.error("Fatal renderView error:", renderErr);
        if (this.appRoot) {
          this.appRoot.innerHTML = `
          <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
            <div class="glass-card" style="max-width: 500px; text-align: center; border-color: rgba(244,63,94,0.4);">
              <h3 style="color: #f43f5e; margin-bottom: 0.5rem;">View Render Error</h3>
              <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1.5rem;">${renderErr.message || String(renderErr)}</p>
              <a href="#/" class="glass-btn glass-btn-primary">Return to Home</a>
            </div>
          </div>
        `;
        }
      }
    }
  };

  // app/static/js/app.js
  function bootstrap() {
    try {
      const router = new Router("#app-root");
      router.start();
      auth.onChange(() => {
        router.handleRoute();
      });
      auth.verifySession().catch((err) => {
        console.warn("Session verification notice:", err);
      });
      console.log("%c[RecruitAI]%c Frontend SPA initialized successfully", "color: #a855f7; font-weight: bold;", "color: #34d399;");
    } catch (err) {
      console.error("Fatal bootstrap error:", err);
      const root = document.querySelector("#app-root");
      if (root) {
        root.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem;">
          <div class="glass-card" style="max-width: 520px; text-align: center; border-color: rgba(244,63,94,0.4); padding: 2rem;">
            <h2 style="color: #f43f5e; margin-bottom: 0.75rem;">Bootstrap Error</h2>
            <p style="color: #cbd5e1; font-size: 0.875rem; margin-bottom: 1.25rem;">${err.message || String(err)}</p>
            <button onclick="window.location.reload(true)" class="glass-btn glass-btn-primary">Retry</button>
          </div>
        </div>
      `;
      }
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
