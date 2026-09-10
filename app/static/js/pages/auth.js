/* ==========================================================================
   Recruitment AI Assistant - Authentication Views (Login, Registers, Reset)
   ========================================================================== */

import { auth } from '../auth.js';
import { Icons } from '../icons.js';
import { showToast } from '../components.js';

// Login Page
export function renderLoginPage() {
  return `
    <div style="max-width: 440px; margin: 3rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Sparkles('w-6 h-6')}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Welcome Back</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Sign in to your Recruitment AI account</p>
        </div>

        <div id="auth-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle('w-4 h-4 shrink-0')}
          <span id="auth-error-msg"></span>
        </div>

        <form id="login-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
              Email Address
            </label>
            <div style="position: relative;">
              <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                ${Icons.Mail('w-4 h-4')}
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
                ${Icons.Lock('w-4 h-4')}
              </span>
              <input type="password" id="login-password" required placeholder="••••••••" class="glass-input" style="padding-left: 2.75rem;" />
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
            <span>•</span>
            <a href="#/register-recruiter" style="color: #818cf8; text-decoration: underline;">Recruiter</a>
            <span>•</span>
            <a href="#/register-interviewer" style="color: #38bdf8; text-decoration: underline;">Interviewer</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initLoginPage() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-submit-btn');
    const errorBox = document.getElementById('auth-error-box');
    const errorMsg = document.getElementById('auth-error-msg');

    errorBox.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin" style="display:inline-block;">⚡</span> Signing in...`;

    try {
      const user = await auth.login(email, password);
      showToast(`Welcome back, ${user.name}!`);
      if (user.role === 'interviewer') {
        window.location.hash = '#/interviewer/interviews';
      } else {
        window.location.hash = '#/dashboard';
      }
    } catch (err) {
      errorBox.style.display = 'flex';
      errorMsg.textContent = err.message || 'Invalid email or password. Please try again.';
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

// Candidate Registration
export function renderRegisterCandidatePage() {
  return `
    <div style="max-width: 540px; margin: 2rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.User('w-6 h-6')}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Candidate Registration</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Create your profile to explore AI-matched jobs & upload resumes</p>
        </div>

        <div id="register-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle('w-4 h-4 shrink-0')}
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
              ${Icons.UserCheck('w-4 h-4 text-indigo-400')} Profile Details (For Job Matching & Resume)
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Phone Number *</label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                    ${Icons.Phone('w-3.5 h-3.5')}
                  </span>
                  <input type="tel" id="reg-phone" required placeholder="+91 9876543210" class="glass-input" style="padding-left: 2.25rem;" />
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Location / City *</label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex;">
                    ${Icons.MapPin('w-3.5 h-3.5')}
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

export function initRegisterCandidatePage() {
  const form = document.getElementById('register-candidate-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('reg-submit-btn');
    const errorBox = document.getElementById('register-error-box');
    const errorMsg = document.getElementById('register-error-msg');

    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    const data = {
      name: document.getElementById('reg-name').value.trim(),
      email: email,
      password: password,
      phone: document.getElementById('reg-phone')?.value.trim() || null,
      location: document.getElementById('reg-location')?.value.trim() || null,
      bio: document.getElementById('reg-bio')?.value.trim() || null,
      favorite_book: document.getElementById('reg-book').value.trim(),
      favorite_person: document.getElementById('reg-person').value.trim(),
    };

    errorBox.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin" style="display:inline-block;">⚡</span> Creating profile & logging in...`;

    try {
      await auth.registerCandidate(data);
      showToast('Registration successful! Logging you in...');
      const user = await auth.login(email, password);
      showToast(`Welcome to RecruitAI, ${user.name}!`);
      window.location.hash = '#/dashboard';
    } catch (err) {
      errorBox.style.display = 'flex';
      errorMsg.textContent = err.message || 'Registration failed. Please check your information.';
      btn.disabled = false;
      btn.textContent = 'Register & Open Dashboard';
    }
  });
}

// Recruiter Registration
export function renderRegisterRecruiterPage() {
  return `
    <div style="max-width: 540px; margin: 2rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(99, 102, 241, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.2); color: #818cf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.Briefcase('w-6 h-6')}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Recruiter Registration</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Join your organization to manage jobs and source candidates</p>
        </div>

        <div id="recruiter-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle('w-4 h-4 shrink-0')}
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

export function initRegisterRecruiterPage() {
  const form = document.getElementById('register-recruiter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('rec-submit-btn');
    const errorBox = document.getElementById('recruiter-error-box');
    const errorMsg = document.getElementById('recruiter-error-msg');

    const email = document.getElementById('rec-email').value.trim();
    const password = document.getElementById('rec-password').value;

    const data = {
      name: document.getElementById('rec-name').value.trim(),
      email: email,
      password: password,
      company_name: document.getElementById('rec-company').value.trim(),
      recruiter_code: document.getElementById('rec-code').value.trim(),
      favorite_book: document.getElementById('rec-book').value.trim(),
      favorite_person: document.getElementById('rec-person').value.trim(),
    };

    errorBox.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin" style="display:inline-block;">⚡</span> Registering & logging in...`;

    try {
      await auth.registerRecruiter(data);
      showToast('Recruiter registered successfully! Logging you in...');
      const user = await auth.login(email, password);
      showToast(`Welcome, ${user.name}!`);
      window.location.hash = '#/recruiter';
    } catch (err) {
      errorBox.style.display = 'flex';
      errorMsg.textContent = err.message || 'Recruiter registration failed. Check company code.';
      btn.disabled = false;
      btn.textContent = 'Register & Open Portal';
    }
  });
}

// Interviewer Registration
export function renderRegisterInterviewerPage() {
  return `
    <div style="max-width: 500px; margin: 2rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(6, 182, 212, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(6, 182, 212, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            ${Icons.UserCheck('w-6 h-6')}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Interviewer Registration</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Join your company team to conduct technical interviews</p>
        </div>

        <div id="interviewer-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle('w-4 h-4 shrink-0')}
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

export function initRegisterInterviewerPage() {
  const form = document.getElementById('register-interviewer-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('int-submit-btn');
    const errorBox = document.getElementById('interviewer-error-box');
    const errorMsg = document.getElementById('interviewer-error-msg');

    const email = document.getElementById('int-email').value.trim();
    const password = document.getElementById('int-password').value;

    const data = {
      name: document.getElementById('int-name').value.trim(),
      email: email,
      password: password,
      company_name: document.getElementById('int-company').value.trim(),
      recruiter_code: document.getElementById('int-code').value.trim(),
    };

    errorBox.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin" style="display:inline-block;">⚡</span> Registering & logging in...`;

    try {
      await auth.registerInterviewer(data);
      showToast('Interviewer registered successfully! Logging you in...');
      const user = await auth.login(email, password);
      showToast(`Welcome, ${user.name}!`);
      window.location.hash = '#/interviewer/interviews';
    } catch (err) {
      errorBox.style.display = 'flex';
      errorMsg.textContent = err.message || 'Interviewer registration failed.';
      btn.disabled = false;
      btn.textContent = 'Register & Open Portal';
    }
  });
}

// Forgot Password Recovery
export function renderForgotPasswordPage() {
  return `
    <div style="max-width: 440px; margin: 3rem auto;">
      <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.35);">
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center;">
            ${Icons.KeyRound('w-6 h-6')}
          </div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #ffffff;">Reset Password</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Verify your security answers to set a new password</p>
        </div>

        <div id="reset-error-box" style="display: none; padding: 0.85rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle('w-4 h-4 shrink-0')}
          <span id="reset-error-msg"></span>
        </div>

        <div id="reset-success-box" style="display: none; padding: 1.25rem; text-align: center; flex-direction: column; align-items: center; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center;">
            ${Icons.CheckCircle2('w-8 h-8')}
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

export function initForgotPasswordPage() {
  const form = document.getElementById('forgot-password-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('fp-submit-btn');
    const errorBox = document.getElementById('reset-error-box');
    const errorMsg = document.getElementById('reset-error-msg');
    const successBox = document.getElementById('reset-success-box');

    const data = {
      email: document.getElementById('fp-email').value.trim(),
      favorite_book: document.getElementById('fp-book').value.trim(),
      favorite_person: document.getElementById('fp-person').value.trim(),
      new_password: document.getElementById('fp-password').value,
    };

    errorBox.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = `Verifying and updating...`;

    try {
      await auth.forgotPassword(data);
      form.style.display = 'none';
      successBox.style.display = 'flex';
      showToast('Password reset successfully!');
    } catch (err) {
      errorBox.style.display = 'flex';
      errorMsg.textContent = err.message || 'Password reset failed. Please check your answers.';
      btn.disabled = false;
      btn.textContent = 'Reset Password';
    }
  });
}
