/* ==========================================================================
   Recruitment AI Assistant - Interviewer Portal View
   ========================================================================== */

import { api } from '../api.js';
import { auth } from '../auth.js';
import { Icons } from '../icons.js';
import { showToast, StatusBadge } from '../components.js';

export function renderInterviewerDashboard() {
  const user = auth.getUser();
  return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <!-- Header -->
      <div class="glass-panel" style="padding: 2rem; border-color: rgba(6, 182, 212, 0.25); display: flex; flex-direction: column; gap: 0.5rem;">
        <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 9999px; background: rgba(6, 182, 212, 0.15); color: #38bdf8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
          ${Icons.UserCheck('w-3.5 h-3.5')}
          Technical Interviewer Portal
        </div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">
          Assigned Interviews • <span class="text-gradient">${user?.name || 'Interviewer'}</span>
        </h1>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">
          Company: <strong style="color: #c084fc;">Company ID #${user?.company_id || 'N/A'}</strong> (Assigned interviews exclusively)
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
            ${Icons.Clock('w-5 h-5')}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Completed Evaluations</p>
            <h3 id="int-dash-comp-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center;">
            ${Icons.CheckCircle2('w-5 h-5')}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Total Assigned</p>
            <h3 id="int-dash-total-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${Icons.Calendar('w-5 h-5')}
          </div>
        </div>
      </div>

      <!-- Assigned Interviews List -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.Calendar('w-5 h-5 text-purple-400')}
          My Assigned Evaluations
        </h3>

        <div id="interviewer-items-container" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading assigned interviews...</div>
        </div>
      </div>
    </div>
  `;
}

export async function initInterviewerDashboard() {
  const container = document.getElementById('interviewer-items-container');
  let assignedInterviews = [];

  async function loadData() {
    try {
      assignedInterviews = await api.get('/interviews/');
      const scheduled = assignedInterviews.filter((i) => i.status === 'scheduled').length;
      const completed = assignedInterviews.filter((i) => i.status === 'completed').length;

      document.getElementById('int-dash-sched-count').textContent = scheduled;
      document.getElementById('int-dash-comp-count').textContent = completed;
      document.getElementById('int-dash-total-count').textContent = assignedInterviews.length;

      if (assignedInterviews.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 3rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            ${Icons.Calendar('w-10 h-10 text-muted')}
            <p>You have no technical interviews assigned currently.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = assignedInterviews
        .map(
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
                ${Icons.Clock('w-4 h-4')}
                ${new Date(item.scheduled_at).toLocaleString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              ${
                item.candidate_name
                  ? `<span style="color: var(--text-primary); font-weight: 600;">Candidate: ${item.candidate_name}</span>`
                  : ''
              }
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${
              item.status === 'scheduled'
                ? `
              <button class="glass-btn glass-btn-success glass-btn-sm btn-int-status" data-id="${item.id}" data-status="completed">
                ${Icons.CheckCircle2('w-3.5 h-3.5')} Mark Complete
              </button>
              <button class="glass-btn glass-btn-danger glass-btn-sm btn-int-status" data-id="${item.id}" data-status="cancelled">
                ${Icons.XCircle('w-3.5 h-3.5')} Cancel
              </button>
            `
                : `
              <button class="glass-btn glass-btn-outline glass-btn-sm btn-int-status" data-id="${item.id}" data-status="scheduled">
                Re-open
              </button>
            `
            }
          </div>
        </div>
      `
        )
        .join('');

      container.querySelectorAll('.btn-int-status').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const status = btn.dataset.status;
          try {
            await api.put(`/interviews/${id}/status`, { status });
            showToast(`Interview marked as ${status}`);
            loadData();
          } catch (err) {
            showToast(err.message || 'Failed to update status', 'error');
          }
        });
      });
    } catch (err) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load interviews.</div>`;
    }
  }

  loadData();
}
