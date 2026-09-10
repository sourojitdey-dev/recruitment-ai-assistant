/* ==========================================================================
   Recruitment AI Assistant - Candidate Experience Views & Workflows
   ========================================================================== */

import { api } from '../api.js';
import { auth } from '../auth.js';
import { Icons } from '../icons.js';
import { showToast, openModal, closeModal, StatusBadge, MatchScoreBadge } from '../components.js';

// 1. Candidate Dashboard
export function renderCandidateDashboard() {
  const user = auth.getUser();
  return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <!-- Welcome Banner -->
      <div class="glass-panel" style="padding: 2rem; position: relative; overflow: hidden; border-color: rgba(168, 85, 247, 0.25);">
        <div style="position: relative; z-index: 2; display: flex; flex-direction: column; gap: 0.75rem; max-width: 650px;">
          <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.8rem; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #a5b4fc; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
            ${Icons.Sparkles('w-3.5 h-3.5 text-cyan-400')}
            Candidate Intelligence Portal
          </div>
          <h1 style="font-size: 2rem; font-weight: 800; color: #ffffff;">
            Welcome back, <span class="text-gradient">${user?.name || 'Candidate'}</span>
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
              View pipeline ${Icons.ArrowRight('w-3 h-3')}
            </a>
          </div>
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Send('w-6 h-6')}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; border-color: rgba(168, 85, 247, 0.25);">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Scheduled Interviews</p>
            <h3 id="dash-interviews-count" style="font-size: 2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">...</h3>
            <a href="#/interviews" style="font-size: 0.75rem; color: #c084fc; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              View schedule ${Icons.ArrowRight('w-3 h-3')}
            </a>
          </div>
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${Icons.Calendar('w-6 h-6')}
          </div>
        </div>

        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; border-color: rgba(6, 182, 212, 0.25);">
          <div>
            <p style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Resume Status</p>
            <h3 id="dash-resume-status" style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0.4rem 0; display: flex; align-items: center; gap: 0.4rem;">
              ...
            </h3>
            <a href="#/resume" id="dash-resume-link" style="font-size: 0.75rem; color: #38bdf8; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              Manage Resume ${Icons.ArrowRight('w-3 h-3')}
            </a>
          </div>
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.FileText('w-6 h-6')}
          </div>
        </div>
      </div>

      <!-- Main Grid: Top AI Recommendations & Assistant Shortcut -->
      <div class="grid-split-2-1">
        <!-- Top Recommended Jobs -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
              ${Icons.Sparkles('w-5 h-5 text-indigo-400')}
              AI Recommended Jobs
            </h2>
            <a href="#/jobs" style="font-size: 0.8rem; font-weight: 700; color: #c084fc; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
              Browse all jobs ${Icons.ArrowRight('w-3 h-3')}
            </a>
          </div>

          <div id="dash-recommended-list" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="padding: 2rem; text-align: center; color: var(--text-muted);">Loading recommendations...</div>
          </div>
        </div>

        <!-- AI Assistant Shortcut -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            ${Icons.Bot('w-5 h-5 text-purple-400')}
            AI Career Advisor
          </h2>
          <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem; border-color: rgba(168, 85, 247, 0.3);">
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
              Ask questions about resume improvements, skill gaps, company interview rounds, or mock technical questions.
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              <a href="#/chat?prompt=How+can+I+improve+my+resume+for+Senior+Backend+roles%3F" style="padding: 0.75rem; border-radius: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(168, 85, 247, 0.2); font-size: 0.8rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;">
                💡 "How can I improve my resume?"
              </a>
              <a href="#/chat?prompt=What+skills+are+missing+for+full+stack+engineer+jobs%3F" style="padding: 0.75rem; border-radius: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(168, 85, 247, 0.2); font-size: 0.8rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;">
                🎯 "What skills are missing from my resume?"
              </a>
              <a href="#/chat?prompt=Help+me+prepare+for+a+Python+and+FastAPI+technical+interview." style="padding: 0.75rem; border-radius: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(168, 85, 247, 0.2); font-size: 0.8rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;">
                ⚡ "Help me prepare for FastAPI interview"
              </a>
            </div>
            <a href="#/chat" class="glass-btn glass-btn-primary" style="width: 100%; margin-top: 0.5rem;">
              Open AI Career Chat ${Icons.ArrowRight('w-4 h-4')}
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function initCandidateDashboard() {
  try {
    const [appsRes, interviewsRes, resumesRes, matchRes] = await Promise.allSettled([
      api.get('/applications/me'),
      api.get('/interviews/me'),
      api.get('/resumes/'),
      api.get('/match/candidate/jobs'),
    ]);

    // Apps Count
    const appsCount = appsRes.status === 'fulfilled' ? appsRes.value.length : 0;
    const appsEl = document.getElementById('dash-apps-count');
    if (appsEl) appsEl.textContent = appsCount;

    // Interviews Count
    const intCount = interviewsRes.status === 'fulfilled' ? interviewsRes.value.length : 0;
    const intEl = document.getElementById('dash-interviews-count');
    if (intEl) intEl.textContent = intCount;

    // Resume Status
    const hasResume = resumesRes.status === 'fulfilled' && resumesRes.value.length > 0;
    const resEl = document.getElementById('dash-resume-status');
    const resLink = document.getElementById('dash-resume-link');
    if (resEl) {
      resEl.innerHTML = hasResume
        ? `${Icons.CheckCircle2('w-5 h-5 text-emerald-400')} Uploaded`
        : `${Icons.Clock('w-5 h-5 text-amber-400')} Pending`;
    }
    if (resLink) {
      resLink.innerHTML = hasResume ? `Manage Resume ${Icons.ArrowRight('w-3 h-3')}` : `Upload PDF ${Icons.ArrowRight('w-3 h-3')}`;
    }

    // Recommended Jobs List
    const recListEl = document.getElementById('dash-recommended-list');
    if (recListEl) {
      if (matchRes.status === 'fulfilled' && matchRes.value.length > 0) {
        const topJobs = matchRes.value.slice(0, 3);
        recListEl.innerHTML = topJobs
          .map(
            (job) => `
          <div class="glass-card" style="display: flex; flex-direction: column; gap: 0.75rem; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 700; color: #ffffff;">${job.job_title}</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
                  ${job.company_name} • <span style="color: var(--text-muted);">${job.location}</span>
                </p>
              </div>
              ${MatchScoreBadge(job.match_percentage, 'sm')}
            </div>

            ${
              job.breakdown?.strong_matches && job.breakdown.strong_matches.length > 0
                ? `
              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
                ${job.breakdown.strong_matches
                  .slice(0, 3)
                  .map(
                    (s) => `
                  <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.15); color: #6ee7b7; font-size: 0.7rem; font-weight: 600;">
                    ✓ ${s}
                  </span>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }

            <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid rgba(139, 92, 246, 0.15);">
              <a href="#/jobs" class="glass-btn glass-btn-outline glass-btn-sm">View Position</a>
            </div>
          </div>
        `
          )
          .join('');
      } else {
        recListEl.innerHTML = `
          <div class="glass-card" style="text-align: center; padding: 2.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            ${Icons.Briefcase('w-10 h-10 text-muted')}
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Upload your PDF resume to unlock personalized AI semantic job recommendations.</p>
            <a href="#/resume" class="glass-btn glass-btn-primary glass-btn-sm">
              ${Icons.Upload('w-4 h-4')} Upload Resume
            </a>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error('Failed to load candidate dashboard:', err);
  }
}

// 2. Candidate Jobs Explorer
let allJobs = [];
let candidateMatchesMap = {};
let appliedJobIdsSet = new Set();

export function renderCandidateJobsPage() {
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
              ${Icons.Search('w-4 h-4')}
            </span>
            <input type="text" id="job-search-input" placeholder="Search by title, skill keywords, or company..." class="glass-input" style="padding-left: 2.75rem;" />
          </div>
          <div style="position: relative;">
            <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
              ${Icons.MapPin('w-4 h-4')}
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

export async function initCandidateJobsPage() {
  const container = document.getElementById('jobs-grid-container');
  const searchInput = document.getElementById('job-search-input');
  const locInput = document.getElementById('job-location-input');

  async function loadData() {
    try {
      const [jobsRes, appsRes, matchesRes] = await Promise.allSettled([
        api.get('/jobs/'),
        api.get('/applications/me'),
        api.get('/match/candidate/jobs'),
      ]);

      allJobs = jobsRes.status === 'fulfilled' ? jobsRes.value : [];
      appliedJobIdsSet = new Set(
        appsRes.status === 'fulfilled' ? appsRes.value.map((a) => a.job_id) : []
      );
      candidateMatchesMap = {};
      if (matchesRes.status === 'fulfilled') {
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
    const searchVal = (searchInput?.value || '').toLowerCase().trim();
    const locVal = (locInput?.value || '').toLowerCase().trim();

    const filtered = allJobs.filter((job) => {
      const matchSearch =
        !searchVal ||
        (job.title || '').toLowerCase().includes(searchVal) ||
        (job.company_name || '').toLowerCase().includes(searchVal) ||
        (job.description || '').toLowerCase().includes(searchVal);

      const matchLoc = !locVal || (job.location || '').toLowerCase().includes(locVal);
      return matchSearch && matchLoc;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${Icons.Briefcase('w-12 h-12 text-muted')}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Jobs Found</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">Try adjusting your search keywords or location filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
      .map((job) => {
        const matchInfo = candidateMatchesMap[job.id];
        const isApplied = appliedJobIdsSet.has(job.id);

        return `
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.25rem;">
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">${job.title}</h3>
                <p style="font-size: 0.85rem; color: #c084fc; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; margin-top: 0.2rem;">
                  ${Icons.Building2('w-3.5 h-3.5')} ${job.company_name}
                </p>
              </div>
              ${matchInfo ? MatchScoreBadge(matchInfo.match_percentage, 'sm') : ''}
            </div>

            <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
              ${Icons.MapPin('w-3.5 h-3.5')} ${job.location}
            </p>

            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${job.description}
            </p>

            ${
              matchInfo?.breakdown?.strong_matches && matchInfo.breakdown.strong_matches.length > 0
                ? `
              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; padding-top: 0.25rem;">
                ${matchInfo.breakdown.strong_matches
                  .slice(0, 3)
                  .map(
                    (s) => `
                  <span style="padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; font-size: 0.7rem; font-weight: 600;">
                    ✓ ${s}
                  </span>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid rgba(139, 92, 246, 0.15);">
            <button class="glass-btn glass-btn-outline glass-btn-sm btn-job-details" data-id="${job.id}">
              View Details
            </button>

            ${
              isApplied
                ? `
              <span class="status-badge status-applied">
                ${Icons.CheckCircle2('w-3.5 h-3.5')} Applied
              </span>
            `
                : `
              <button class="glass-btn glass-btn-primary glass-btn-sm btn-job-apply" data-id="${job.id}">
                ${Icons.Send('w-3.5 h-3.5')} Apply Now
              </button>
            `
            }
          </div>
        </div>
      `;
      })
      .join('');

    // Wire Details buttons
    container.querySelectorAll('.btn-job-details').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const job = allJobs.find((j) => j.id === id);
        if (job) openJobModal(job);
      });
    });

    // Wire Apply buttons
    container.querySelectorAll('.btn-job-apply').forEach((btn) => {
      btn.addEventListener('click', async () => {
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
              ${Icons.Building2('w-4 h-4')} ${job.company_name}
            </p>
            <p style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem;">
              ${Icons.MapPin('w-3.5 h-3.5')} ${job.location}
            </p>
          </div>
          ${matchInfo ? MatchScoreBadge(matchInfo.match_percentage, 'lg') : ''}
        </div>

        ${
          matchInfo
            ? `
          <div style="padding: 1.25rem; border-radius: 16px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="font-size: 0.85rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.4rem;">
              ${Icons.Sparkles('w-4 h-4 text-cyan-400')} AI Grounded Compatibility Analysis
            </div>
            <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5;">${matchInfo.explanation}</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; margin-top: 0.5rem;">
              <div style="padding: 0.75rem; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);">
                <span style="font-size: 0.7rem; font-weight: 700; color: #6ee7b7; text-transform: uppercase;">Strong Matches</span>
                <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                  ${matchInfo.breakdown?.strong_matches?.length > 0 ? matchInfo.breakdown.strong_matches.join(', ') : 'None listed'}
                </div>
              </div>
              <div style="padding: 0.75rem; border-radius: 10px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3);">
                <span style="font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Partial Matches</span>
                <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                  ${matchInfo.breakdown?.partial_matches?.length > 0 ? matchInfo.breakdown.partial_matches.join(', ') : 'None'}
                </div>
              </div>
              <div style="padding: 0.75rem; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
                <span style="font-size: 0.7rem; font-weight: 700; color: #fcd34d; text-transform: uppercase;">Potential Gaps</span>
                <div style="font-size: 0.78rem; color: var(--text-primary); margin-top: 0.25rem;">
                  ${matchInfo.breakdown?.potential_gaps?.length > 0 ? matchInfo.breakdown.potential_gaps.join(', ') : 'Comprehensive coverage'}
                </div>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <div>
          <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Job Description</h4>
          <div style="padding: 1rem; border-radius: 12px; background: rgba(10, 11, 20, 0.6); border: 1px solid rgba(255,255,255,0.08); font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; max-height: 250px; overflow-y: auto; white-space: pre-wrap;">${job.description}</div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(139, 92, 246, 0.2);">
          <button class="glass-btn glass-btn-outline" id="modal-close-secondary">Close</button>
          ${
            isApplied
              ? `<span class="status-badge status-applied" style="padding: 0.6rem 1rem;">${Icons.CheckCircle2('w-4 h-4')} Already Applied</span>`
              : `<button class="glass-btn glass-btn-primary" id="modal-apply-btn">${Icons.Send('w-4 h-4')} Submit Application</button>`
          }
        </div>
      </div>
    `;

    openModal({
      title: job.title,
      contentHtml: content,
      maxWidth: '680px',
    });

    document.getElementById('modal-close-secondary')?.addEventListener('click', () => closeModal());
    document.getElementById('modal-apply-btn')?.addEventListener('click', async () => {
      closeModal();
      await applyToJob(job.id);
    });
  }

  async function applyToJob(jobId) {
    try {
      await api.post('/applications/', { job_id: jobId });
      appliedJobIdsSet.add(jobId);
      showToast('Application submitted successfully!');
      renderJobsList();
    } catch (err) {
      showToast(err.message || 'Failed to apply.', 'error');
    }
  }

  searchInput?.addEventListener('input', renderJobsList);
  locInput?.addEventListener('input', renderJobsList);

  loadData();
}

// 3. Candidate Resume Management
export function renderCandidateResumePage() {
  return `
    <div style="display: flex; flex-direction: column; gap: 2rem; padding-bottom: 3rem;">
      <div>
        <h1 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Resume Management</h1>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Upload your PDF resume for PyMuPDF text extraction and pgvector indexing</p>
      </div>

      <!-- Upload Box -->
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.25rem; border-color: rgba(99, 102, 241, 0.35);">
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.Upload('w-5 h-5 text-indigo-400')}
          Upload New PDF Resume
        </h3>

        <form id="resume-upload-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="border: 2px dashed rgba(168, 85, 247, 0.3); border-radius: 18px; padding: 2.5rem 1.5rem; text-align: center; background: rgba(168, 85, 247, 0.05); cursor: pointer; transition: all 0.2s;" id="dropzone-box">
            <input type="file" id="resume-file-input" accept="application/pdf" style="display: none;" />
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
              <div style="width: 56px; height: 56px; border-radius: 16px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
                ${Icons.FileText('w-8 h-8')}
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
              ${Icons.Upload('w-4 h-4')} Upload & Extract Text
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

export async function initCandidateResumePage() {
  const form = document.getElementById('resume-upload-form');
  const fileInput = document.getElementById('resume-file-input');
  const dropzone = document.getElementById('dropzone-box');
  const chosenLabel = document.getElementById('file-chosen-label');
  const uploadBtn = document.getElementById('resume-upload-btn');
  const resumeContainer = document.getElementById('active-resume-container');

  let selectedFile = null;

  dropzone?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Please select a valid .pdf resume file.', 'error');
        return;
      }
      selectedFile = file;
      chosenLabel.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      uploadBtn.disabled = false;
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = `Extracting text & vector embeddings...`;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/resumes/', formData);
      showToast('Resume uploaded and indexed successfully!');
      selectedFile = null;
      chosenLabel.textContent = 'Click to select or drag & drop your PDF resume here';
      uploadBtn.disabled = true;
      uploadBtn.innerHTML = `${Icons.Upload('w-4 h-4')} Upload & Extract Text`;
      loadResumes();
    } catch (err) {
      showToast(err.message || 'Failed to upload resume.', 'error');
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = `${Icons.Upload('w-4 h-4')} Upload & Extract Text`;
    }
  });

  async function loadResumes() {
    try {
      const resumes = await api.get('/resumes/');
      if (resumes.length > 0) {
        const latest = resumes[0];
        resumeContainer.innerHTML = `
          <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); color: #34d399; display: flex; align-items: center; justify-content: center;">
                  ${Icons.FileCheck('w-6 h-6')}
                </div>
                <div>
                  <h3 style="font-size: 1.15rem; font-weight: 700; color: #ffffff;">${latest.filename}</h3>
                  <p style="font-size: 0.75rem; color: var(--text-muted);">Indexed in vector store with 384-d embeddings</p>
                </div>
              </div>
              <button id="copy-resume-btn" class="glass-btn glass-btn-outline glass-btn-sm">
                ${Icons.Copy('w-3.5 h-3.5')} Copy Extracted Text
              </button>
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
                Extracted Text (PyMuPDF)
              </label>
              <div id="resume-text-viewer" style="padding: 1rem; border-radius: 12px; background: rgba(10, 11, 20, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary); max-height: 380px; overflow-y: auto; white-space: pre-wrap; line-height: 1.6;">${latest.extracted_text || 'No text extracted.'}</div>
            </div>
          </div>
        `;

        document.getElementById('copy-resume-btn')?.addEventListener('click', () => {
          navigator.clipboard.writeText(latest.extracted_text || '');
          showToast('Resume text copied to clipboard!');
        });
      } else {
        resumeContainer.innerHTML = `
          <div class="glass-card" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            ${Icons.FileText('w-10 h-10 mx-auto')}
            <p style="margin-top: 0.5rem;">No resume uploaded yet. Upload a PDF above to get started.</p>
          </div>
        `;
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  }

  loadResumes();
}

// 4. Candidate Applications Tracker
export function renderCandidateApplicationsPage() {
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

export async function initCandidateApplicationsPage() {
  const container = document.getElementById('applications-list-container');
  const stages = ['applied', 'screening', 'shortlisted', 'hired'];

  try {
    const [appsRes, jobsRes] = await Promise.all([
      api.get('/applications/me'),
      api.get('/jobs/'),
    ]);

    const jobsMap = {};
    jobsRes.forEach((j) => (jobsMap[j.id] = j));

    if (appsRes.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${Icons.Send('w-12 h-12 text-muted')}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Applications Yet</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">You haven't submitted any job applications yet.</p>
          <a href="#/jobs" class="glass-btn glass-btn-primary">
            ${Icons.Briefcase('w-4 h-4')} Explore Jobs
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = appsRes
      .map((app) => {
        const job = jobsMap[app.job_id] || { title: `Job #${app.job_id}`, company_name: 'Company' };
        const status = (app.status || 'applied').toLowerCase();
        const isRejected = status === 'rejected' || status === 'cancelled';
        const currentIdx = isRejected ? -1 : Math.max(0, stages.indexOf(status));

        return `
        <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(139, 92, 246, 0.15);">
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">${job.title}</h3>
              <p style="font-size: 0.85rem; color: #c084fc; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; margin-top: 0.2rem;">
                ${Icons.Building2('w-3.5 h-3.5')} ${job.company_name}
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;">
                ${Icons.Clock('w-3.5 h-3.5')} Applied: ${new Date(app.applied_at).toLocaleDateString()}
              </span>
              ${StatusBadge(app.status)}
            </div>
          </div>

          <!-- Pipeline Timeline -->
          ${
            !isRejected
              ? `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; padding: 0.5rem 0;">
              ${stages
                .map((st, idx) => {
                  const isDone = idx <= currentIdx;
                  const isCur = idx === currentIdx;
                  return `
                  <div style="display: flex; flex-direction: column; gap: 0.4rem; text-align: center;">
                    <div style="height: 6px; border-radius: 9999px; background: ${
                      isDone ? 'linear-gradient(90deg, #6366f1, #a855f7)' : 'rgba(255, 255, 255, 0.08)'
                    }; box-shadow: ${isDone ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none'};"></div>
                    <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${
                      isCur ? '#c084fc' : isDone ? 'var(--text-primary)' : 'var(--text-muted)'
                    };">${st}</span>
                  </div>
                `;
                })
                .join('')}
            </div>
          `
              : `
            <div style="padding: 0.75rem 1rem; border-radius: 12px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.25); color: #fda4af; font-size: 0.8rem;">
              This application was not selected to proceed further. You can continue exploring other active positions.
            </div>
          `
          }
        </div>
      `;
      })
      .join('');
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load applications.</div>`;
  }
}

// 5. Candidate Interviews
export function renderCandidateInterviewsPage() {
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

export async function initCandidateInterviewsPage() {
  const container = document.getElementById('interviews-list-container');
  try {
    const interviews = await api.get('/interviews/me');
    if (interviews.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          ${Icons.Calendar('w-12 h-12 text-muted')}
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Interviews Scheduled</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted);">When recruiters schedule technical evaluations for your applications, they will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = interviews
      .map(
        (item) => `
      <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">
              ${item.job_title || `Interview #${item.id}`}
            </h3>
            ${
              item.company_name
                ? `<span style="font-size: 0.85rem; color: #c084fc; font-weight: 600;">• ${item.company_name}</span>`
                : ''
            }
          </div>

          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem; font-size: 0.825rem; color: var(--text-secondary);">
            <span style="display: flex; align-items: center; gap: 0.35rem; color: #38bdf8; font-weight: 600;">
              ${Icons.Calendar('w-4 h-4')}
              ${new Date(item.scheduled_at).toLocaleString([], {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            ${
              item.interviewer_name
                ? `
              <span style="display: flex; align-items: center; gap: 0.35rem;">
                ${Icons.UserCheck('w-4 h-4 text-purple-400')} Interviewer: <strong>${item.interviewer_name}</strong>
              </span>
            `
                : ''
            }
          </div>
        </div>

        <div>
          ${StatusBadge(item.status)}
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #fda4af;">Failed to load interviews.</div>`;
  }
}
