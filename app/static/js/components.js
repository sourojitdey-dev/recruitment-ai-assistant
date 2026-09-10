/* ==========================================================================
   Recruitment AI Assistant - Reusable Components & UI Utilities
   ========================================================================== */

import { auth } from './auth.js';
import { Icons } from './icons.js';

// Toast Notification System
export function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconHtml =
    type === 'success'
      ? Icons.CheckCircle2('w-5 h-5 shrink-0 text-emerald-400')
      : type === 'error'
      ? Icons.AlertCircle('w-5 h-5 shrink-0 text-rose-400')
      : Icons.Sparkles('w-5 h-5 shrink-0 text-indigo-400');

  toast.innerHTML = `
    ${iconHtml}
    <span style="flex: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Modal Dialog System
let currentModalCloseHandler = null;

export function openModal({ title, contentHtml, maxWidth = '600px', onClose = null }) {
  closeModal(); // close existing if any

  currentModalCloseHandler = onClose;

  const backdrop = document.createElement('div');
  backdrop.id = 'active-modal-backdrop';
  backdrop.className = 'modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal-container" style="max-width: ${maxWidth};" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close-btn" id="modal-close-action" aria-label="Close">
          ${Icons.X('w-5 h-5')}
        </button>
      </div>
      <div class="modal-body">
        ${contentHtml}
      </div>
    </div>
  `;

  backdrop.addEventListener('click', () => closeModal());
  document.body.appendChild(backdrop);

  // Trigger smooth enter animation
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
  });

  document.getElementById('modal-close-action')?.addEventListener('click', () => closeModal());
}

export function closeModal() {
  const backdrop = document.getElementById('active-modal-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    if (typeof currentModalCloseHandler === 'function') {
      currentModalCloseHandler();
      currentModalCloseHandler = null;
    }
    setTimeout(() => backdrop.remove(), 200);
  }
}

// Status Badge Helper
export function StatusBadge(status) {
  const s = (status || 'unknown').toLowerCase();
  let label = s.charAt(0).toUpperCase() + s.slice(1);
  return `<span class="status-badge status-${s}">${label}</span>`;
}

// Match Score Badge Helper
export function MatchScoreBadge(score, size = 'sm') {
  const num = Math.round(score || 0);
  let colorClass = 'match-medium';
  if (num >= 80) colorClass = 'match-high';
  else if (num < 50) colorClass = 'match-low';

  const sizeClass = `match-badge-${size}`;

  return `
    <div class="match-score-badge ${colorClass} ${sizeClass}">
      ${Icons.Sparkles(size === 'lg' ? 'w-4 h-4' : 'w-3 h-3')}
      <span>${num}% Match</span>
    </div>
  `;
}

// Top Navbar
export function renderNavbar() {
  const user = auth.getUser();
  const isAuth = auth.isAuthenticated();
  const currentHash = window.location.hash || '#/';

  return `
    <header class="app-navbar">
      <div class="navbar-inner">
        <!-- Logo -->
        <a href="#/" class="brand-logo">
          <div class="brand-icon-box">
            ${Icons.Sparkles('w-5 h-5 text-white')}
          </div>
          <div>
            <span class="brand-title">Recruit<span class="text-gradient">AI</span></span>
            <span class="brand-subtitle">Career Intelligence</span>
          </div>
        </a>

        <!-- Right Side Actions -->
        <div style="display: flex; align-items: center; gap: 1rem;">
          ${
            isAuth && user
              ? `
              <!-- Role Badge -->
              <div class="status-badge status-${user.role || 'applied'} hidden-mobile">
                ${Icons.Shield('w-3 h-3')}
                <span>${user.role}</span>
              </div>

              <!-- Profile Link -->
              <a href="#/profile" style="display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: var(--text-primary);">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                  ${(user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span style="font-weight: 600; font-size: 0.875rem;">${user.name}</span>
              </a>

              <!-- AI Assistant Shortcut -->
              <a href="#/chat" class="glass-btn glass-btn-secondary glass-btn-sm hidden-mobile">
                ${Icons.Bot('w-4 h-4 text-accent')}
                <span>AI Assistant</span>
              </a>

              <!-- Logout -->
              <button id="nav-logout-btn" class="glass-btn glass-btn-outline glass-btn-sm" title="Sign Out" style="padding: 0.4rem 0.6rem;">
                ${Icons.LogOut('w-4 h-4 text-muted')}
              </button>
            `
              : `
              <a href="#/login" class="glass-btn glass-btn-outline glass-btn-sm">Sign In</a>
              <a href="#/register" class="glass-btn glass-btn-primary glass-btn-sm">Get Started</a>
            `
          }
        </div>
      </div>
    </header>
  `;
}

// Sidebar Navigation
export function renderSidebar() {
  const user = auth.getUser();
  if (!user) return '';

  const role = (user.role || 'candidate').toLowerCase();
  const currentHash = window.location.hash || '#/dashboard';

  const candidateLinks = [
    { to: '#/dashboard', label: 'Dashboard', icon: Icons.LayoutDashboard },
    { to: '#/jobs', label: 'Explore Jobs', icon: Icons.Briefcase },
    { to: '#/resume', label: 'My Resume', icon: Icons.FileText },
    { to: '#/applications', label: 'My Applications', icon: Icons.Send },
    { to: '#/interviews', label: 'My Interviews', icon: Icons.Calendar },
    { to: '#/chat', label: 'AI Career Assistant', icon: Icons.Bot, highlight: true },
  ];

  const recruiterLinks = [
    { to: '#/dashboard', label: 'Dashboard', icon: Icons.LayoutDashboard },
    { to: '#/recruiter/jobs', label: 'Job Postings', icon: Icons.Briefcase },
    { to: '#/recruiter/applications', label: 'Applications & Review', icon: Icons.Users },
    { to: '#/recruiter/interviews', label: 'Interviews & Schedules', icon: Icons.Calendar },
    { to: '#/recruiter/matching', label: 'AI Candidate Matcher', icon: Icons.Sparkles, highlight: true },
    { to: '#/recruiter/documents', label: 'Company Documents', icon: Icons.FolderLock },
    { to: '#/chat', label: 'AI Recruiter Assistant', icon: Icons.Bot },
  ];

  const interviewerLinks = [
    { to: '#/dashboard', label: 'Dashboard', icon: Icons.LayoutDashboard },
    { to: '#/interviewer/interviews', label: 'Assigned Interviews', icon: Icons.Calendar },
    { to: '#/profile', label: 'My Profile', icon: Icons.UserCheck },
  ];

  let links = candidateLinks;
  if (role === 'recruiter' || role === 'admin') {
    links = recruiterLinks;
  } else if (role === 'interviewer') {
    links = interviewerLinks;
  }

  return `
    <aside class="app-sidebar">
      <div class="sidebar-sticky">
        <div class="sidebar-header">
          Navigation • ${role}
        </div>
        ${links
          .map((item) => {
            const isActive = currentHash === item.to || (item.to === '#/dashboard' && currentHash === '#/');
            return `
              <a href="${item.to}" class="sidebar-link ${isActive ? 'active' : ''} ${item.highlight && !isActive ? 'highlight' : ''}">
                ${item.icon('w-4 h-4 shrink-0')}
                <span>${item.label}</span>
              </a>
            `;
          })
          .join('')}
      </div>
    </aside>
  `;
}
