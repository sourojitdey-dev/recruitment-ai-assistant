/* ==========================================================================
   Recruitment AI Assistant - Recruiter Experience Views & Workflows
   ========================================================================== */

import { api } from '../api.js';
import { auth } from '../auth.js';
import { Icons } from '../icons.js';
import { showToast, openModal, closeModal, StatusBadge, MatchScoreBadge } from '../components.js';

// 1. Recruiter Dashboard
export function renderRecruiterDashboard() {
  const user = auth.getUser();
  return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <!-- Header Banner -->
      <div class="glass-panel" style="padding: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; border-color: rgba(99, 102, 241, 0.25);">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #a5b4fc; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
            ${Icons.Sparkles('w-3.5 h-3.5 text-cyan-400')}
            Recruiter Operations Hub
          </div>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">
            Talent Dashboard • <span class="text-gradient">${user?.name || 'Recruiter'}</span>
          </h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">
            Company Scope: <strong style="color: #c084fc;">Company ID #${user?.company_id || 'N/A'}</strong>
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="#/recruiter/jobs" class="glass-btn glass-btn-primary">
            ${Icons.Plus('w-4 h-4')} Post New Job
          </a>
          <a href="#/recruiter/matching" class="glass-btn glass-btn-secondary">
            ${Icons.Sparkles('w-4 h-4')} AI Matcher
          </a>
        </div>
      </div>

      <!-- Metrics Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Active Jobs</p>
            <h3 id="rec-dash-jobs-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/jobs" style="font-size: 0.75rem; color: #818cf8; font-weight: 600; text-decoration: none;">Manage jobs →</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Briefcase('w-5 h-5')}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Applications</p>
            <h3 id="rec-dash-apps-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/applications" style="font-size: 0.75rem; color: #c084fc; font-weight: 600; text-decoration: none;">Review applicants →</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${Icons.Users('w-5 h-5')}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Interviews</p>
            <h3 id="rec-dash-int-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/interviews" style="font-size: 0.75rem; color: #38bdf8; font-weight: 600; text-decoration: none;">View schedules →</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Calendar('w-5 h-5')}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Documents</p>
            <h3 id="rec-dash-docs-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/recruiter/documents" style="font-size: 0.75rem; color: #34d399; font-weight: 600; text-decoration: none;">Vector knowledge →</a>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center;">
            ${Icons.FolderLock('w-5 h-5')}
          </div>
        </div>
      </div>

      <!-- Recent Applications Table -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            ${Icons.TrendingUp('w-5 h-5 text-purple-400')}
            Recent Applications
          </h3>
          <a href="#/recruiter/applications" style="font-size: 0.8rem; font-weight: 700; color: #c084fc; text-decoration: none;">
            View All Applications →
          </a>
        </div>

        <div id="rec-recent-apps-table-wrapper" style="overflow-x: auto;">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading pipeline...</div>
        </div>
      </div>
    </div>
  `;
}

export async function initRecruiterDashboard() {
  try {
    const [jobsRes, appsRes, interviewsRes, docsRes] = await Promise.allSettled([
      api.get('/jobs/company/me'),
      api.get('/applications/'),
      api.get('/interviews/'),
      api.get('/documents/'),
    ]);

    const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value : [];
    const apps = appsRes.status === 'fulfilled' ? appsRes.value : [];
    const ints = interviewsRes.status === 'fulfilled' ? interviewsRes.value : [];
    const docs = docsRes.status === 'fulfilled' ? docsRes.value : [];

    const activeJobs = jobs.filter((j) => j.is_active);

    document.getElementById('rec-dash-jobs-count').textContent = activeJobs.length;
    document.getElementById('rec-dash-apps-count').textContent = apps.length;
    document.getElementById('rec-dash-int-count').textContent = ints.length;
    document.getElementById('rec-dash-docs-count').textContent = docs.length;

    const tableWrapper = document.getElementById('rec-recent-apps-table-wrapper');
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
              ${apps
                .slice(0, 5)
                .map(
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
                )
                .join('')}
            </tbody>
          </table>
        `;
      } else {
        tableWrapper.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">No applications received yet.</div>`;
      }
    }
  } catch (err) {
    console.error('Failed to load recruiter dashboard:', err);
  }
}

// 2. Recruiter Job Postings Manager
export function renderRecruiterJobsPage() {
  return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Company Job Postings</h1>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Create, update, and manage vacancies for your organization</p>
        </div>
        <button id="btn-open-create-job" class="glass-btn glass-btn-primary">
          ${Icons.Plus('w-4 h-4')} Post New Vacancy
        </button>
      </div>

      <div id="recruiter-jobs-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">Loading company jobs...</div>
      </div>
    </div>
  `;
}

export async function initRecruiterJobsPage() {
  const container = document.getElementById('recruiter-jobs-grid');
  const createBtn = document.getElementById('btn-open-create-job');
  let companyJobs = [];

  createBtn?.addEventListener('click', () => openJobModal(null));

  async function loadCompanyJobs() {
    try {
      companyJobs = await api.get('/jobs/company/me');
      if (companyJobs.length === 0) {
        container.innerHTML = `
          <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${Icons.Briefcase('w-12 h-12 text-muted')}
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Jobs Posted Yet</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Post your first company opening to receive candidate applications and AI matches.</p>
            <button class="glass-btn glass-btn-primary" id="btn-empty-create-job">
              ${Icons.Plus('w-4 h-4')} Post Job
            </button>
          </div>
        `;
        document.getElementById('btn-empty-create-job')?.addEventListener('click', () => openJobModal(null));
        return;
      }

      container.innerHTML = companyJobs
        .map(
          (job) => `
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.25rem;">
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
              <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">${job.title}</h3>
              <span class="status-badge ${job.is_active ? 'status-hired' : 'status-screening'}">
                ${job.is_active ? 'Active' : 'Archived'}
              </span>
            </div>

            <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
              ${Icons.MapPin('w-3.5 h-3.5')} ${job.location}
            </p>

            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${job.description}
            </p>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.6rem; padding-top: 0.75rem; border-top: 1px solid rgba(139, 92, 246, 0.15);">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-edit-job" data-id="${job.id}">
              ${Icons.Edit2('w-3.5 h-3.5')} Edit
            </button>
            <button class="glass-btn glass-btn-danger glass-btn-sm btn-delete-job" data-id="${job.id}">
              ${Icons.Trash2('w-3.5 h-3.5')} Delete
            </button>
          </div>
        </div>
      `
        )
        .join('');

      container.querySelectorAll('.btn-edit-job').forEach((b) => {
        b.addEventListener('click', () => {
          const job = companyJobs.find((j) => j.id === parseInt(b.dataset.id));
          if (job) openJobModal(job);
        });
      });

      container.querySelectorAll('.btn-delete-job').forEach((b) => {
        b.addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete this job posting?')) {
            try {
              await api.delete(`/jobs/${b.dataset.id}`);
              showToast('Job posting deleted.');
              loadCompanyJobs();
            } catch (err) {
              showToast(err.message || 'Failed to delete job.', 'error');
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
          <input type="text" id="jm-title" required value="${job ? job.title : ''}" placeholder="e.g. Senior Backend Engineer" class="glass-input" />
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">Location</label>
          <input type="text" id="jm-location" required value="${job ? job.location : ''}" placeholder="e.g. Remote / New York, NY" class="glass-input" />
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Job Description & Requirements
          </label>
          <textarea id="jm-desc" required rows="6" placeholder="Describe roles, technical stack, required qualifications, and experience..." class="glass-input">${job ? job.description : ''}</textarea>
        </div>

        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <input type="checkbox" id="jm-active" ${!job || job.is_active ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #6366f1;" />
          <label for="jm-active" style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); cursor: pointer;">
            Active Vacancy (Visible for candidate applications & vector matching)
          </label>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button type="button" class="glass-btn glass-btn-outline" id="jm-cancel">Cancel</button>
          <button type="submit" class="glass-btn glass-btn-primary" id="jm-submit">
            ${isEdit ? 'Save Changes' : 'Publish Job'}
          </button>
        </div>
      </form>
    `;

    openModal({
      title: isEdit ? 'Edit Job Vacancy' : 'Create New Job Vacancy',
      contentHtml: content,
      maxWidth: '650px',
    });

    document.getElementById('jm-cancel')?.addEventListener('click', () => closeModal());

    document.getElementById('job-modal-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('jm-submit');
      submitBtn.disabled = true;

      const payload = {
        title: document.getElementById('jm-title').value.trim(),
        location: document.getElementById('jm-location').value.trim(),
        description: document.getElementById('jm-desc').value.trim(),
        is_active: document.getElementById('jm-active').checked,
      };

      try {
        if (isEdit) {
          await api.put(`/jobs/${job.id}`, payload);
          showToast('Job posting updated successfully!');
        } else {
          await api.post('/jobs/', payload);
          showToast('Job created & indexed in vector store!');
        }
        closeModal();
        loadCompanyJobs();
      } catch (err) {
        showToast(err.message || 'Failed to save job.', 'error');
        submitBtn.disabled = false;
      }
    });
  }

  loadCompanyJobs();
}

// 3. Recruiter Applications Review & Scheduler
export function renderRecruiterApplicationsPage() {
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

export async function initRecruiterApplicationsPage() {
  const container = document.getElementById('rec-apps-list-container');
  const jobFilterEl = document.getElementById('filter-rec-job');
  const statusFilterEl = document.getElementById('filter-rec-status');

  let allApps = [];
  let companyJobsMap = {};
  let companyInterviewers = [];

  async function loadData() {
    try {
      const [appsRes, jobsRes, interviewersRes] = await Promise.all([
        api.get('/applications/'),
        api.get('/jobs/company/me'),
        api.get('/interviews/interviewers'),
      ]);

      allApps = appsRes;
      companyInterviewers = interviewersRes;
      companyJobsMap = {};
      jobsRes.forEach((j) => (companyJobsMap[j.id] = j));

      if (jobFilterEl) {
        jobFilterEl.innerHTML = `<option value="">All Company Jobs</option>` +
          jobsRes.map((j) => `<option value="${j.id}">${j.title}</option>`).join('');
      }

      renderAppsList();
    } catch (err) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load applications.</div>`;
    }
  }

  function renderAppsList() {
    const jobFilter = jobFilterEl?.value || '';
    const statusFilter = (statusFilterEl?.value || '').toLowerCase();

    const filtered = allApps.filter((app) => {
      const matchJob = !jobFilter || String(app.job_id) === String(jobFilter);
      const matchStatus = !statusFilter || (app.status || '').toLowerCase() === statusFilter;
      return matchJob && matchStatus;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${Icons.Users('w-12 h-12 text-muted')}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Applications Found</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">Applications for your company's vacancies will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
      .map((app) => {
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
                ${Icons.Clock('w-3.5 h-3.5')} Applied: ${new Date(app.applied_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <!-- Status Dropdown -->
            <select class="glass-input select-app-status" data-id="${app.id}" style="width: auto; padding: 0.4rem 2rem 0.4rem 0.75rem; font-size: 0.75rem; font-weight: 700;">
              <option value="applied" ${app.status === 'applied' ? 'selected' : ''}>Applied</option>
              <option value="screening" ${app.status === 'screening' ? 'selected' : ''}>Screening</option>
              <option value="shortlisted" ${app.status === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
              <option value="hired" ${app.status === 'hired' ? 'selected' : ''}>Hired</option>
              <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
            </select>

            <button class="glass-btn glass-btn-secondary glass-btn-sm btn-match-review" data-appid="${app.id}" data-jobid="${app.job_id}" data-candid="${app.candidate_id}">
              ${Icons.Sparkles('w-3.5 h-3.5')} AI Match Review
            </button>

            <button class="glass-btn glass-btn-primary glass-btn-sm btn-schedule-int" data-appid="${app.id}" data-jobid="${app.job_id}" data-candid="${app.candidate_id}">
              ${Icons.Calendar('w-3.5 h-3.5')} Schedule Interview
            </button>
          </div>
        </div>
      `;
      })
      .join('');

    // Status Selectors
    container.querySelectorAll('.select-app-status').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const appId = sel.dataset.id;
        const newStatus = sel.value;
        try {
          await api.put(`/applications/${appId}/status`, { status: newStatus });
          showToast(`Application #${appId} status updated to ${newStatus}`);
          const target = allApps.find((a) => a.id === parseInt(appId));
          if (target) target.status = newStatus;
          renderAppsList();
        } catch (err) {
          showToast(err.message || 'Failed to update status', 'error');
        }
      });
    });

    // AI Match Review
    container.querySelectorAll('.btn-match-review').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const jobId = btn.dataset.jobid;
        const candId = btn.dataset.candid;
        const appId = btn.dataset.appid;
        await openMatchReviewModal(jobId, candId, appId);
      });
    });

    // Schedule Interview
    container.querySelectorAll('.btn-schedule-int').forEach((btn) => {
      btn.addEventListener('click', () => {
        const appId = parseInt(btn.dataset.appid);
        const candId = btn.dataset.candid;
        const jobId = btn.dataset.jobid;
        openScheduleModal(appId, candId, jobId);
      });
    });
  }

  async function openMatchReviewModal(jobId, candId, appId) {
    openModal({
      title: `Candidate Compatibility • Application #${appId}`,
      contentHtml: `<div style="text-align: center; padding: 2rem; color: var(--text-muted);"><span class="animate-spin" style="display:inline-block;">⚡</span> Computing vector compatibility...</div>`,
      maxWidth: '680px',
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
            ${MatchScoreBadge(match.match_percentage, 'lg')}
          </div>

          <div style="padding: 1.25rem; border-radius: 14px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 0.5rem;">
            <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; display: flex; align-items: center; gap: 0.35rem;">
              ${Icons.Sparkles('w-4 h-4')} Grounded AI Explanation
            </span>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${match.explanation}</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem;">
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);">
              <span style="font-size: 0.7rem; font-weight: 700; color: #6ee7b7; text-transform: uppercase;">Strong Matches</span>
              <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                ${match.breakdown?.strong_matches?.length > 0 ? match.breakdown.strong_matches.join(', ') : 'None'}
              </div>
            </div>
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3);">
              <span style="font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Partial Matches</span>
              <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                ${match.breakdown?.partial_matches?.length > 0 ? match.breakdown.partial_matches.join(', ') : 'None'}
              </div>
            </div>
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
              <span style="font-size: 0.7rem; font-weight: 700; color: #fcd34d; text-transform: uppercase;">Potential Gaps</span>
              <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                ${match.breakdown?.potential_gaps?.length > 0 ? match.breakdown.potential_gaps.join(', ') : 'None detected'}
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
            <button class="glass-btn glass-btn-outline" onclick="document.getElementById('active-modal-backdrop')?.remove()">Close</button>
            <button class="glass-btn glass-btn-primary" id="modal-sched-shortcut">${Icons.Calendar('w-4 h-4')} Schedule Interview</button>
          </div>
        </div>
      `;

      openModal({
        title: `Candidate Compatibility • Application #${appId}`,
        contentHtml: content,
        maxWidth: '680px',
      });

      document.getElementById('modal-sched-shortcut')?.addEventListener('click', () => {
        closeModal();
        openScheduleModal(parseInt(appId), candId, jobId);
      });
    } catch (err) {
      openModal({
        title: 'Error',
        contentHtml: `<div style="color: #fda4af; padding: 1rem;">Failed to load match: ${err.message}</div>`,
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
          ${
            companyInterviewers.length > 0
              ? `
            <select id="sch-interviewer-id" class="glass-input" required>
              ${companyInterviewers
                .map((i) => `<option value="${i.id}">${i.name} (${i.email})</option>`)
                .join('')}
            </select>
          `
              : `
            <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fcd34d; font-size: 0.8rem;">
              No interviewers found in your company. Please ask an interviewer to register with your company code first.
            </div>
          `
          }
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Interview Date & Time
          </label>
          <input type="datetime-local" id="sch-datetime" required class="glass-input" />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button type="button" class="glass-btn glass-btn-outline" id="sch-cancel-btn">Cancel</button>
          <button type="submit" class="glass-btn glass-btn-primary" id="sch-submit-btn" ${companyInterviewers.length === 0 ? 'disabled' : ''}>
            Confirm Interview Schedule
          </button>
        </div>
      </form>
    `;

    openModal({
      title: 'Schedule Technical Interview',
      contentHtml: content,
      maxWidth: '560px',
    });

    document.getElementById('sch-cancel-btn')?.addEventListener('click', () => closeModal());

    document.getElementById('schedule-interview-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const interviewerId = document.getElementById('sch-interviewer-id')?.value;
      const scheduledAt = document.getElementById('sch-datetime')?.value;
      const submitBtn = document.getElementById('sch-submit-btn');

      if (!interviewerId || !scheduledAt) {
        showToast('Please select interviewer and datetime.', 'error');
        return;
      }

      submitBtn.disabled = true;

      try {
        await api.post('/interviews/', {
          application_id: appId,
          interviewer_id: parseInt(interviewerId),
          scheduled_at: new Date(scheduledAt).toISOString(),
        });
        // Auto-update app status to shortlisted
        await api.put(`/applications/${appId}/status`, { status: 'shortlisted' });
        showToast('Technical interview scheduled successfully!');
        closeModal();
        loadData();
      } catch (err) {
        showToast(err.message || 'Failed to schedule interview.', 'error');
        submitBtn.disabled = false;
      }
    });
  }

  jobFilterEl?.addEventListener('change', renderAppsList);
  statusFilterEl?.addEventListener('change', renderAppsList);

  loadData();
}

// 4. Recruiter Interviews Management
export function renderRecruiterInterviewsPage() {
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

export async function initRecruiterInterviewsPage() {
  const container = document.getElementById('recruiter-interviews-list');
  let companyInterviews = [];
  let companyInterviewers = [];

  async function loadData() {
    try {
      const [intRes, interviewerRes] = await Promise.all([
        api.get('/interviews/'),
        api.get('/interviews/interviewers'),
      ]);
      companyInterviews = intRes;
      companyInterviewers = interviewerRes;

      if (companyInterviews.length === 0) {
        container.innerHTML = `
          <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${Icons.Calendar('w-12 h-12 text-muted')}
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Interviews Scheduled</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Schedule interviews from the Applications page to manage them here.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = companyInterviews
        .map(
          (item) => `
        <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: #818cf8;">#${item.id}</span>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">
                ${item.job_title || `Application #${item.application_id}`}
              </h3>
              ${
                item.candidate_name
                  ? `<span style="font-size: 0.85rem; color: var(--text-secondary);">• Candidate: <strong style="color: #fff;">${item.candidate_name}</strong></span>`
                  : ''
              }
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
                item.interviewer_name
                  ? `<span style="display: flex; align-items: center; gap: 0.35rem; color: #c084fc;">
                      ${Icons.UserCheck('w-3.5 h-3.5')} Interviewer: ${item.interviewer_name}
                    </span>`
                  : ''
              }
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-resched-int" data-id="${item.id}">
              ${Icons.Edit2('w-3.5 h-3.5')} Reschedule
            </button>
            <button class="glass-btn glass-btn-danger glass-btn-sm btn-del-int" data-id="${item.id}">
              ${Icons.Trash2('w-3.5 h-3.5')}
            </button>
          </div>
        </div>
      `
        )
        .join('');

      container.querySelectorAll('.btn-resched-int').forEach((b) => {
        b.addEventListener('click', () => {
          const id = parseInt(b.dataset.id);
          const item = companyInterviews.find((i) => i.id === id);
          if (item) openRescheduleModal(item);
        });
      });

      container.querySelectorAll('.btn-del-int').forEach((b) => {
        b.addEventListener('click', async () => {
          if (confirm('Cancel and delete this interview appointment?')) {
            try {
              await api.delete(`/interviews/${b.dataset.id}`);
              showToast('Interview cancelled & deleted.');
              loadData();
            } catch (err) {
              showToast(err.message || 'Failed to delete interview.', 'error');
            }
          }
        });
      });
    } catch (err) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load interviews.</div>`;
    }
  }

  function openRescheduleModal(item) {
    const formattedDate = item.scheduled_at ? item.scheduled_at.substring(0, 16) : '';
    const content = `
      <form id="resched-modal-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            Assigned Interviewer
          </label>
          <select id="resched-interviewer-id" class="glass-input">
            ${companyInterviewers
              .map(
                (i) => `
              <option value="${i.id}" ${i.id === item.interviewer_id ? 'selected' : ''}>
                ${i.name} (${i.email})
              </option>
            `
              )
              .join('')}
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
            <option value="scheduled" ${item.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
            <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${item.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
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
      maxWidth: '520px',
    });

    document.getElementById('resched-cancel')?.addEventListener('click', () => closeModal());

    document.getElementById('resched-modal-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const interviewerId = document.getElementById('resched-interviewer-id').value;
      const scheduledAt = document.getElementById('resched-datetime').value;
      const status = document.getElementById('resched-status').value;
      const submitBtn = document.getElementById('resched-submit');

      submitBtn.disabled = true;

      try {
        await api.put(`/interviews/${item.id}`, {
          interviewer_id: interviewerId ? parseInt(interviewerId) : undefined,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
          status: status || undefined,
        });
        showToast('Interview updated successfully!');
        closeModal();
        loadData();
      } catch (err) {
        showToast(err.message || 'Failed to update interview', 'error');
        submitBtn.disabled = false;
      }
    });
  }

  loadData();
}

// 5. Recruiter Documents Vector Store
export function renderRecruiterDocumentsPage() {
  return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Approved Company Documents</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Upload and index verified policy, FAQ, and process files for privacy-scoped RAG retrieval</p>
      </div>

      <!-- Upload Document Box -->
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.25rem; border-color: rgba(99, 102, 241, 0.35);">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.Upload('w-5 h-5 text-indigo-400')} Upload Company Knowledge Document
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
              ${Icons.Upload('w-4 h-4')} Upload & Index in PGVector
            </button>
          </div>
        </form>
      </div>

      <!-- Documents List -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.FolderLock('w-5 h-5 text-purple-400')}
          Indexed Knowledge Files
        </h3>

        <div id="rec-docs-list-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">Loading company documents...</div>
        </div>
      </div>
    </div>
  `;
}

export async function initRecruiterDocumentsPage() {
  const form = document.getElementById('doc-upload-form');
  const fileInput = document.getElementById('doc-file-input');
  const typeInput = document.getElementById('doc-type-input');
  const uploadBtn = document.getElementById('doc-upload-btn');
  const container = document.getElementById('rec-docs-list-container');
  let companyDocs = [];

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput?.files[0];
    if (!file) return;

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = `Chunking & generating vector embeddings...`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', typeInput?.value || 'company_policy');

    try {
      await api.post('/documents/', formData);
      showToast('Document indexed into pgvector knowledge base!');
      form.reset();
      loadDocs();
    } catch (err) {
      showToast(err.message || 'Failed to upload document.', 'error');
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = `${Icons.Upload('w-4 h-4')} Upload & Index in PGVector`;
    }
  });

  async function loadDocs() {
    try {
      companyDocs = await api.get('/documents/');
      if (companyDocs.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 3rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            ${Icons.FolderLock('w-10 h-10 text-muted')}
            <p>No company documents uploaded yet. Upload a policy or FAQ above.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = companyDocs
        .map(
          (doc) => `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.85rem; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(139, 92, 246, 0.15); flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              ${Icons.FileText('w-4 h-4 text-indigo-400')}
              <span style="font-weight: 700; color: #ffffff;">${doc.filename}</span>
              <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(168, 85, 247, 0.15); color: #c084fc; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">
                ${doc.document_type}
              </span>
              ${StatusBadge(doc.indexing_status)}
            </div>
            ${
              doc.extracted_text_preview
                ? `<p style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; max-width: 500px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    "${doc.extracted_text_preview}"
                   </p>`
                : ''
            }
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-doc-preview" data-id="${doc.id}">
              Preview
            </button>
            <button class="glass-btn glass-btn-secondary glass-btn-sm btn-doc-reindex" data-id="${doc.id}">
              ${Icons.RefreshCw('w-3.5 h-3.5')} Re-index
            </button>
            <button class="glass-btn glass-btn-danger glass-btn-sm btn-doc-del" data-id="${doc.id}">
              ${Icons.Trash2('w-3.5 h-3.5')}
            </button>
          </div>
        </div>
      `
        )
        .join('');

      container.querySelectorAll('.btn-doc-preview').forEach((b) => {
        b.addEventListener('click', () => {
          const doc = companyDocs.find((d) => d.id === parseInt(b.dataset.id));
          if (doc) {
            openModal({
              title: `Preview: ${doc.filename}`,
              contentHtml: `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                  <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Category: <strong style="color: #c084fc;">${doc.document_type}</strong> • Status: <strong style="color: #34d399;">${doc.indexing_status}</strong>
                  </div>
                  <div style="padding: 1rem; border-radius: 12px; background: rgba(10, 11, 20, 0.7); border: 1px solid rgba(255,255,255,0.08); font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary); max-height: 350px; overflow-y: auto; white-space: pre-wrap; line-height: 1.6;">${doc.extracted_text_preview || 'No preview available.'}</div>
                </div>
              `,
              maxWidth: '650px',
            });
          }
        });
      });

      container.querySelectorAll('.btn-doc-reindex').forEach((b) => {
        b.addEventListener('click', async () => {
          try {
            const res = await api.post(`/documents/${b.dataset.id}/index`);
            showToast(res.message || 'Document re-indexed into pgvector chunks!');
            loadDocs();
          } catch (err) {
            showToast(err.message || 'Re-indexing failed.', 'error');
          }
        });
      });

      container.querySelectorAll('.btn-doc-del').forEach((b) => {
        b.addEventListener('click', async () => {
          if (confirm('Delete this document and all its pgvector chunks?')) {
            try {
              await api.delete(`/documents/${b.dataset.id}`);
              showToast('Document removed.');
              loadDocs();
            } catch (err) {
              showToast(err.message || 'Failed to delete document.', 'error');
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

// 6. Recruiter AI Candidate Matcher
export function renderRecruiterAIMatchingPage() {
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
            ${Icons.Sparkles('w-4 h-4')} Calculate Matches
          </button>
        </div>
      </div>

      <!-- Ranked Candidates List -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.Sparkles('w-5 h-5 text-cyan-400')}
          Ranked Candidates
        </h3>

        <div id="matcher-results-container" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="text-align: center; padding: 3rem; color: var(--text-muted);">Select a company position above to compute AI rankings.</div>
        </div>
      </div>
    </div>
  `;
}

export async function initRecruiterAIMatchingPage() {
  const selectEl = document.getElementById('matcher-job-select');
  const btnRecompute = document.getElementById('btn-recompute-matches');
  const container = document.getElementById('matcher-results-container');
  let candidateMatches = [];

  try {
    const jobs = await api.get('/jobs/company/me');
    if (jobs.length > 0) {
      selectEl.innerHTML = jobs
        .map((j) => `<option value="${j.id}">${j.title} (${j.location})</option>`)
        .join('');
      runMatching(jobs[0].id);
    } else {
      selectEl.innerHTML = `<option value="">No company jobs available</option>`;
      container.innerHTML = `<div class="glass-card" style="text-align: center; padding: 3rem; color: var(--text-muted);">Please create a job posting first.</div>`;
    }
  } catch (err) {
    selectEl.innerHTML = `<option value="">Error loading jobs</option>`;
  }

  btnRecompute?.addEventListener('click', () => {
    const jobId = selectEl?.value;
    if (jobId) runMatching(jobId);
  });

  selectEl?.addEventListener('change', () => {
    const jobId = selectEl?.value;
    if (jobId) runMatching(jobId);
  });

  async function runMatching(jobId) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
        <span class="animate-spin" style="font-size: 1.5rem;">⚡</span>
        <p>Computing 384-dimensional cosine similarity across all registered candidate resumes...</p>
      </div>
    `;

    try {
      candidateMatches = await api.get(`/match/job/${jobId}/candidates`);
      if (candidateMatches.length === 0) {
        container.innerHTML = `
          <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${Icons.User('w-12 h-12 text-muted')}
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Candidate Matches</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Ensure candidates have registered and uploaded resumes to compute matches.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = candidateMatches
        .map((cand, idx) => {
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
                    ${cand.has_applied ? `<span class="status-badge status-hired" style="font-size: 0.65rem;">Applied</span>` : ''}
                  </h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;">
                    ${Icons.Mail('w-3.5 h-3.5')} ${cand.candidate_email}
                  </p>
                </div>
              </div>

              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; padding-left: 2.75rem;">
                ${cand.explanation}
              </p>

              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; padding-left: 2.75rem;">
                ${cand.breakdown?.strong_matches
                  ?.slice(0, 3)
                  .map(
                    (s) => `
                  <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; font-size: 0.7rem; font-weight: 600;">
                    ✓ ${s}
                  </span>
                `
                  )
                  .join('')}
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 1rem;">
              ${MatchScoreBadge(cand.match_percentage, 'md')}
              <button class="glass-btn glass-btn-outline glass-btn-sm btn-view-cand-breakdown" data-candid="${cand.candidate_id}">
                View Breakdown
              </button>
            </div>
          </div>
        `;
        })
        .join('');

      container.querySelectorAll('.btn-view-cand-breakdown').forEach((b) => {
        b.addEventListener('click', () => {
          const candId = parseInt(b.dataset.candid);
          const cand = candidateMatches.find((c) => c.candidate_id === candId);
          if (cand) {
            openModal({
              title: `Match Analysis • ${cand.candidate_name}`,
              contentHtml: `
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                    <div>
                      <h4 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">${cand.candidate_name}</h4>
                      <p style="font-size: 0.8rem; color: var(--text-muted);">${cand.candidate_email}</p>
                    </div>
                    ${MatchScoreBadge(cand.match_percentage, 'lg')}
                  </div>

                  <div style="padding: 1rem; border-radius: 12px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 0.5rem;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">Grounded AI Explanation</span>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${cand.explanation}</p>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem;">
                    <div style="padding: 0.75rem; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);">
                      <span style="font-size: 0.7rem; font-weight: 700; color: #6ee7b7; text-transform: uppercase;">Strong Matches</span>
                      <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                        ${cand.breakdown?.strong_matches?.length > 0 ? cand.breakdown.strong_matches.join(', ') : 'None'}
                      </div>
                    </div>
                    <div style="padding: 0.75rem; border-radius: 10px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3);">
                      <span style="font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Partial Matches</span>
                      <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                        ${cand.breakdown?.partial_matches?.length > 0 ? cand.breakdown.partial_matches.join(', ') : 'None'}
                      </div>
                    </div>
                    <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
                      <span style="font-size: 0.7rem; font-weight: 700; color: #fcd34d; text-transform: uppercase;">Potential Gaps</span>
                      <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                        ${cand.breakdown?.potential_gaps?.length > 0 ? cand.breakdown.potential_gaps.join(', ') : 'None detected'}
                      </div>
                    </div>
                  </div>

                  <div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">
                    * ${cand.advisory_disclaimer || 'AI match scores are advisory suggestions.'}
                  </div>
                </div>
              `,
              maxWidth: '650px',
            });
          }
        });
      });
    } catch (err) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to calculate matches: ${err.message}</div>`;
    }
  }
}
