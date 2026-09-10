/* ==========================================================================
   Recruitment AI Assistant - SPA Hash Router & Role Gates
   ========================================================================== */

import { auth } from './auth.js';
import { renderNavbar, renderSidebar } from './components.js';

// Page Views & Controllers
import { renderLandingPage } from './pages/landing.js';
import {
  renderLoginPage,
  initLoginPage,
  renderRegisterCandidatePage,
  initRegisterCandidatePage,
  renderRegisterRecruiterPage,
  initRegisterRecruiterPage,
  renderRegisterInterviewerPage,
  initRegisterInterviewerPage,
  renderForgotPasswordPage,
  initForgotPasswordPage,
} from './pages/auth.js';

import {
  renderCandidateDashboard,
  initCandidateDashboard,
  renderCandidateJobsPage,
  initCandidateJobsPage,
  renderCandidateResumePage,
  initCandidateResumePage,
  renderCandidateApplicationsPage,
  initCandidateApplicationsPage,
  renderCandidateInterviewsPage,
  initCandidateInterviewsPage,
} from './pages/candidate.js';

import {
  renderRecruiterDashboard,
  initRecruiterDashboard,
  renderRecruiterJobsPage,
  initRecruiterJobsPage,
  renderRecruiterApplicationsPage,
  initRecruiterApplicationsPage,
  renderRecruiterInterviewsPage,
  initRecruiterInterviewsPage,
  renderRecruiterDocumentsPage,
  initRecruiterDocumentsPage,
  renderRecruiterAIMatchingPage,
  initRecruiterAIMatchingPage,
} from './pages/recruiter.js';

import {
  renderInterviewerDashboard,
  initInterviewerDashboard,
} from './pages/interviewer.js';

import { renderChatPage, initChatPage } from './pages/chat.js';
import { renderProfilePage, initProfilePage } from './pages/profile.js';

const routes = {
  // Public
  '/': { render: renderLandingPage, public: true },
  '/login': { render: renderLoginPage, init: initLoginPage, public: true, authOnly: false },
  '/register': { render: renderRegisterCandidatePage, init: initRegisterCandidatePage, public: true },
  '/register/candidate': { render: renderRegisterCandidatePage, init: initRegisterCandidatePage, public: true },
  '/register-recruiter': { render: renderRegisterRecruiterPage, init: initRegisterRecruiterPage, public: true },
  '/register/recruiter': { render: renderRegisterRecruiterPage, init: initRegisterRecruiterPage, public: true },
  '/register-interviewer': { render: renderRegisterInterviewerPage, init: initRegisterInterviewerPage, public: true },
  '/register/interviewer': { render: renderRegisterInterviewerPage, init: initRegisterInterviewerPage, public: true },
  '/forgot-password': { render: renderForgotPasswordPage, init: initForgotPasswordPage, public: true },
  '/jobs': { render: renderCandidateJobsPage, init: initCandidateJobsPage, public: true },

  // Common Authenticated
  '/dashboard': { dynamic: true },
  '/recruiter': { dynamic: true },
  '/interviewer': { dynamic: true },
  '/chat': { render: renderChatPage, init: initChatPage, roles: ['candidate', 'recruiter', 'admin', 'interviewer'] },
  '/profile': { render: renderProfilePage, init: initProfilePage, roles: ['candidate', 'recruiter', 'admin', 'interviewer'] },

  // Candidate
  '/resume': { render: renderCandidateResumePage, init: initCandidateResumePage, roles: ['candidate'] },
  '/applications': { render: renderCandidateApplicationsPage, init: initCandidateApplicationsPage, roles: ['candidate'] },
  '/interviews': { render: renderCandidateInterviewsPage, init: initCandidateInterviewsPage, roles: ['candidate'] },

  // Recruiter
  '/recruiter/jobs': { render: renderRecruiterJobsPage, init: initRecruiterJobsPage, roles: ['recruiter', 'admin'] },
  '/recruiter/applications': { render: renderRecruiterApplicationsPage, init: initRecruiterApplicationsPage, roles: ['recruiter', 'admin'] },
  '/recruiter/interviews': { render: renderRecruiterInterviewsPage, init: initRecruiterInterviewsPage, roles: ['recruiter', 'admin'] },
  '/recruiter/matching': { render: renderRecruiterAIMatchingPage, init: initRecruiterAIMatchingPage, roles: ['recruiter', 'admin'] },
  '/recruiter/documents': { render: renderRecruiterDocumentsPage, init: initRecruiterDocumentsPage, roles: ['recruiter', 'admin'] },

  // Interviewer
  '/interviewer/interviews': { render: renderInterviewerDashboard, init: initInterviewerDashboard, roles: ['interviewer'] },
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

  handleRoute() {
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
          this.renderView({ render: renderInterviewerDashboard, init: initInterviewerDashboard }, path);
        } else if (userRole === 'recruiter' || userRole === 'admin') {
          this.renderView({ render: renderRecruiterDashboard, init: initRecruiterDashboard }, path);
        } else {
          this.renderView({ render: renderCandidateDashboard, init: initCandidateDashboard }, path);
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

      this.renderView(route, path);
    } catch (routeErr) {
      console.error('Routing resolution error:', routeErr);
    }
  }

  renderView(route, path) {
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
      const mainHtml = typeof route.render === 'function' ? route.render() : '';

      this.appRoot.innerHTML = `
        ${navbarHtml}
        <main class="app-container">
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
      if (typeof route.init === 'function') {
        try {
          route.init();
        } catch (err) {
          console.error('Error during route init:', err);
        }
      }
    } catch (renderErr) {
      console.error('Fatal renderView error:', renderErr);
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
