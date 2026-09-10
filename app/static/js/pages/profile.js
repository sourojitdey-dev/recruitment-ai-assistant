/* ==========================================================================
   Recruitment AI Assistant - Account Profile View
   ========================================================================== */

import { api } from '../api.js';
import { auth } from '../auth.js';
import { Icons } from '../icons.js';
import { showToast } from '../components.js';

export function renderProfilePage() {
  const user = auth.getUser();
  const isCandidate = user?.role === 'candidate';

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
            ${(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #ffffff;">${user?.name || 'User'}</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem;">
              ${Icons.Mail('w-3.5 h-3.5')} ${user?.email || 'N/A'}
            </p>
            <div style="margin-top: 0.25rem;">
              <span class="status-badge status-${user?.role || 'applied'}">
                ${Icons.Shield('w-3 h-3')} Role: ${user?.role || 'candidate'}
              </span>
            </div>
          </div>
        </div>

        ${
          user?.company_id
            ? `
          <div style="padding: 1rem; border-radius: 12px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); display: flex; align-items: center; gap: 0.75rem;">
            ${Icons.Building2('w-5 h-5 text-indigo-400')}
            <div>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Associated Organization</p>
              <p style="font-size: 0.95rem; font-weight: 700; color: #ffffff;">Company ID #${user.company_id}</p>
            </div>
          </div>
        `
            : ''
        }
      </div>

      <!-- Candidate Specific Details Form -->
      ${
        isCandidate
          ? `
        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.25rem; border-color: rgba(168, 85, 247, 0.35);">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            ${Icons.User('w-5 h-5 text-purple-400')}
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
                    ${Icons.Phone('w-4 h-4')}
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
                    ${Icons.MapPin('w-4 h-4')}
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
      `
          : ''
      }
    </div>
  `;
}

export async function initProfilePage() {
  const user = auth.getUser();
  if (user?.role !== 'candidate') return;

  const phoneInput = document.getElementById('prof-phone');
  const locInput = document.getElementById('prof-location');
  const bioInput = document.getElementById('prof-bio');
  const form = document.getElementById('candidate-profile-form');
  const saveBtn = document.getElementById('prof-save-btn');

  let hasExistingProfile = false;

  try {
    const candidateData = await api.get('/candidates/me');
    if (candidateData) {
      hasExistingProfile = true;
      if (phoneInput) phoneInput.value = candidateData.phone || '';
      if (locInput) locInput.value = candidateData.location || '';
      if (bioInput) bioInput.value = candidateData.bio || '';
    }
  } catch {
    hasExistingProfile = false;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!saveBtn) return;

    saveBtn.disabled = true;
    saveBtn.innerHTML = `Saving changes...`;

    const payload = {
      phone: phoneInput?.value.trim() || '',
      location: locInput?.value.trim() || '',
      bio: bioInput?.value.trim() || '',
    };

    try {
      if (hasExistingProfile) {
        await api.put('/candidates/me', payload);
      } else {
        await api.post('/candidates/', payload);
        hasExistingProfile = true;
      }
      showToast('Profile saved successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Profile';
    }
  });
}
