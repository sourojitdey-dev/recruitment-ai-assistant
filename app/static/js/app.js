/* ==========================================================================
   Recruitment AI Assistant - App Bootstrap & Initialization
   ========================================================================== */

import { auth } from './auth.js';
import { Router } from './router.js';

function bootstrap() {
  try {
    const router = new Router('#app-root');

    // Start the router immediately so page renders with 0ms delay!
    router.start();

    // Listen for auth changes and re-render/re-route
    auth.onChange(() => {
      router.handleRoute();
    });

    // Verify stored session in background
    auth.verifySession().catch((err) => {
      console.warn('Session verification notice:', err);
    });

    console.log('%c[RecruitAI]%c Frontend SPA initialized successfully', 'color: #a855f7; font-weight: bold;', 'color: #34d399;');
  } catch (err) {
    console.error('Fatal bootstrap error:', err);
    const root = document.querySelector('#app-root');
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

// Ensure bootstrap runs whether DOM is already loaded or still loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
