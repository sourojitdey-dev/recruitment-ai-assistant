/* ==========================================================================
   Recruitment AI Assistant - SPA Hash Router with Code Splitting
   ========================================================================== */

import { auth } from './auth.js';
import { renderNavbar, renderSidebar } from './components.js';

// Route Definitions with Dynamic Chunk Loaders
const routes = {
  // Public
  '/': {
    load: () => import('./pages/landing.js'),
    renderName: 'renderLandingPage',
    public: true,
  },
  '/login': {
    load: () => import('./pages/auth.js'),
    renderName: 'renderLoginPage',
    initName: 'initLoginPage',
    public: true,
  },
  '/register': {
    load: () => import('./pages/auth.js'),
    renderName: 'renderRegisterCandidatePage',
    initName: 'initRegisterCandidatePage',
    public: true,
  },
  '/register/candidate': {
    load: () => import('./pages/auth.js'),
    renderName: 'renderRegisterCandidatePage',
    initName: 'initRegisterCandidatePage',
    public: true,
  },
  '/register-recruiter': {
    load: () => import('./pages/auth.js'),
    renderName: 'renderRegisterRecruiterPage',
    initName: 'initRegisterRecruiterPage',
    public: true,
  },
  '/register/recruiter': {
    load: () => import('./pages/auth.js'),
    renderName: 'renderRegisterRecruiterPage',
    initName: 'initRegisterRecruiterPage',
    public: true,
  },
  '/register-interviewer': {
    load: () => import('./pages/auth.js'),
    renderName: 'renderRegisterInterviewerPage',
    initName: 'initRegisterInterviewerPage',
    public: true,
  },
  '/register/interviewer': {
    load: () => import('./pages/auth.js'),
    renderName: 'renderRegisterInterviewerPage',
    initName: 'initRegisterInterviewerPage',
    public: true,
  },
  '/register-company': {
    load: () => import('./pages/auth.js'),
    renderName: 'renderRegisterCompanyPage',
    initName: 'initRegisterCompanyPage',
    public: true,
  },
  '/register/company': {
    load: () => import('./pages/auth.js'),
    renderName: 'renderRegisterCompanyPage',
    initName: 'initRegisterCompanyPage',
    public: true,
  },
  '/forgot-password': {
    load: () => import('./pages/auth.js'),
    renderName: 'renderForgotPasswordPage',
    initName: 'initForgotPasswordPage',
    public: true,
  },
  '/jobs': {
    load: () => import('./pages/candidate.js'),
    renderName: 'renderCandidateJobsPage',
    initName: 'initCandidateJobsPage',
    public: true,
  },

  // Common Authenticated
  '/dashboard': { dynamic: true },
  '/recruiter': { dynamic: true },
  '/interviewer': { dynamic: true },
  '/chat': {
    load: () => import('./pages/chat.js'),
    renderName: 'renderChatPage',
    initName: 'initChatPage',
    roles: ['candidate', 'recruiter', 'admin', 'interviewer'],
  },
  '/profile': {
    load: () => import('./pages/profile.js'),
    renderName: 'renderProfilePage',
    initName: 'initProfilePage',
    roles: ['candidate', 'recruiter', 'admin', 'interviewer'],
  },

  // Candidate
  '/resume': {
    load: () => import('./pages/candidate.js'),
    renderName: 'renderCandidateResumePage',
    initName: 'initCandidateResumePage',
    roles: ['candidate'],
  },
  '/applications': {
    load: () => import('./pages/candidate.js'),
    renderName: 'renderCandidateApplicationsPage',
    initName: 'initCandidateApplicationsPage',
    roles: ['candidate'],
  },
  '/interviews': {
    load: () => import('./pages/candidate.js'),
    renderName: 'renderCandidateInterviewsPage',
    initName: 'initCandidateInterviewsPage',
    roles: ['candidate'],
  },

  // Recruiter
  '/recruiter/jobs': {
    load: () => import('./pages/recruiter.js'),
    renderName: 'renderRecruiterJobsPage',
    initName: 'initRecruiterJobsPage',
    roles: ['recruiter', 'admin'],
  },
  '/recruiter/applications': {
    load: () => import('./pages/recruiter.js'),
    renderName: 'renderRecruiterApplicationsPage',
    initName: 'initRecruiterApplicationsPage',
    roles: ['recruiter', 'admin'],
  },
  '/recruiter/interviews': {
    load: () => import('./pages/recruiter.js'),
    renderName: 'renderRecruiterInterviewsPage',
    initName: 'initRecruiterInterviewsPage',
    roles: ['recruiter', 'admin'],
  },
  '/recruiter/matching': {
    load: () => import('./pages/recruiter.js'),
    renderName: 'renderRecruiterAIMatchingPage',
    initName: 'initRecruiterAIMatchingPage',
    roles: ['recruiter', 'admin'],
  },
  '/recruiter/documents': {
    load: () => import('./pages/recruiter.js'),
    renderName: 'renderRecruiterDocumentsPage',
    initName: 'initRecruiterDocumentsPage',
    roles: ['recruiter', 'admin'],
  },

  // Interviewer
  '/interviewer/interviews': {
    load: () => import('./pages/interviewer.js'),
    renderName: 'renderInterviewerDashboard',
    initName: 'initInterviewerDashboard',
    roles: ['interviewer'],
  },
};

export class Router {
  constructor(appRootSelector = '#app-root') {
    this.appRootSelector = appRootSelector;
    this.appRoot = document.querySelector(appRootSelector);
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  start() {
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '') {
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#/');
        } else {
          window.location.hash = '#/';
        }
      } catch {
        window.location.hash = '#/';
      }
    }
    this.handleRoute();
  }

  async handleRoute() {
    try {
      if (!this.appRoot) {
        this.appRoot = document.querySelector(this.appRootSelector) || document.getElementById('app-root');
      }

      const rawHash = window.location.hash || '#/';
      let path = rawHash.replace(/^#/, '').split('?')[0] || '/';
      if (!path.startsWith('/')) {
        path = '/' + path;
      }

      const isAuth = auth.isAuthenticated();
      const userRole = auth.getRole();

      // Dynamic dashboard resolver
      if (path === '/dashboard' || path === '/recruiter' || path === '/interviewer') {
        if (!isAuth) {
          window.location.hash = '#/login';
          return;
        }
        if (userRole === 'interviewer') {
          const mod = await import('./pages/interviewer.js');
          await this.renderModuleView(mod.renderInterviewerDashboard, mod.initInterviewerDashboard, path);
        } else if (userRole === 'recruiter' || userRole === 'admin') {
          const mod = await import('./pages/recruiter.js');
          await this.renderModuleView(mod.renderRecruiterDashboard, mod.initRecruiterDashboard, path);
        } else {
          const mod = await import('./pages/candidate.js');
          await this.renderModuleView(mod.renderCandidateDashboard, mod.initCandidateDashboard, path);
        }
        return;
      }

      const route = routes[path];

      if (!route) {
        // Fallback
        window.location.hash = isAuth ? '#/dashboard' : '#/';
        return;
      }

      // Auth gate check
      if (!route.public && !isAuth) {
        window.location.hash = '#/login';
        return;
      }

      // Role gate check
      if (route.roles && !route.roles.includes(userRole)) {
        window.location.hash = '#/dashboard';
        return;
      }

      // Load view module dynamically
      if (typeof route.load === 'function') {
        const mod = await route.load();
        const renderFn = mod[route.renderName];
        const initFn = route.initName ? mod[route.initName] : null;
        await this.renderModuleView(renderFn, initFn, path);
      } else if (typeof route.render === 'function') {
        await this.renderModuleView(route.render, route.init, path);
      }
    } catch (routeErr) {
      console.error('Routing resolution error:', routeErr);
    }
  }

  async renderModuleView(renderFn, initFn, path) {
    try {
      if (!this.appRoot) {
        this.appRoot = document.querySelector(this.appRootSelector) || document.getElementById('app-root');
      }
      if (!this.appRoot) return;

      window.scrollTo(0, 0);
      const isAuth = auth.isAuthenticated();
      const isAuthOrLandingPage =
        path === '/' ||
        path === '/login' ||
        path.startsWith('/register') ||
        path === '/forgot-password';

      const showSidebar = isAuth && !isAuthOrLandingPage;

      const navbarHtml = renderNavbar();
      const sidebarHtml = showSidebar ? renderSidebar() : '';
      const mainHtml = typeof renderFn === 'function' ? renderFn() : '';

      this.appRoot.innerHTML = `
        ${navbarHtml}
        <main class="app-container" id="main-content">
          ${
            showSidebar
              ? `
            <div class="app-layout-grid">
              ${sidebarHtml}
              <div class="app-main-content">${mainHtml}</div>
            </div>
          `
              : `
            <div class="app-main-content">${mainHtml}</div>
          `
          }
        </main>
      `;

      // Wire navbar events (logout)
      document.getElementById('nav-logout-btn')?.addEventListener('click', () => {
        auth.logout();
        window.location.hash = '#/login';
      });

      // Run controller init hook safely
      if (typeof initFn === 'function') {
        try {
          initFn();
        } catch (err) {
          console.error('Error during route init:', err);
        }
      }
    } catch (renderErr) {
      console.error('Fatal renderModuleView error:', renderErr);
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
}
