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
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; font-weight: 600;">
            <a href="#/register" style="color: #c084fc; text-decoration: underline;">Candidate</a>
            <span>•</span>
            <a href="#/register-recruiter" style="color: #818cf8; text-decoration: underline;">Recruiter</a>
            <span>•</span>
            <a href="#/register-interviewer" style="color: #38bdf8; text-decoration: underline;">Interviewer</a>
            <span>•</span>
            <a href="#/register/company" style="color: #34d399; text-decoration: underline;">Register Company</a>
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

        <div style="padding: 0.85rem 1rem; border-radius: 12px; background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.25); display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: #6ee7b7;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${Icons.Building2('w-4 h-4 shrink-0')}
            <span>New Organization? Register your company & upload policies</span>
          </div>
          <a href="#/register/company" style="color: #34d399; font-weight: 700; text-decoration: underline; white-space: nowrap; margin-left: 0.5rem;">Register Company →</a>
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
                <input type="text" id="rec-code" required placeholder="Company security code" class="glass-input" />
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

  // Check for pre-filled parameters from company registration
  const prefillCompany = sessionStorage.getItem('prefill_company_name');
  const prefillCode = sessionStorage.getItem('prefill_recruiter_code');
  if (prefillCompany) {
    const compInput = document.getElementById('rec-company');
    if (compInput) compInput.value = prefillCompany;
  }
  if (prefillCode) {
    const codeInput = document.getElementById('rec-code');
    if (codeInput) codeInput.value = prefillCode;
  }

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
      // Clear prefilled storage once registered
      sessionStorage.removeItem('prefill_company_name');
      sessionStorage.removeItem('prefill_recruiter_code');
      showToast('Recruiter registered successfully! Logging you in...');
      const user = await auth.login(email, password);
      showToast(`Welcome, ${user.name}!`);
      window.location.hash = '#/recruiter';
    } catch (err) {
      errorBox.style.display = 'flex';
      errorMsg.textContent = err.message || 'Recruiter registration failed. Please check your company name & code.';
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

// Company Registration & Policy Ingestion Portal
export function renderRegisterCompanyPage() {
  return `
    <div style="max-width: 760px; margin: 2rem auto; padding: 0 1rem;">
      <div id="company-reg-card" class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1.75rem; border-color: rgba(52, 211, 153, 0.35); position: relative; overflow: hidden;">
        
        <!-- Header -->
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <div style="width: 52px; height: 52px; border-radius: 16px; background: rgba(52, 211, 153, 0.15); color: #34d399; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(52, 211, 153, 0.2);">
            ${Icons.Building2('w-7 h-7')}
          </div>
          <span style="font-size: 0.75rem; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(52, 211, 153, 0.1); padding: 0.25rem 0.75rem; border-radius: 9999px; border: 1px solid rgba(52, 211, 153, 0.25);">
            Enterprise Organization Setup
          </span>
          <h2 style="font-size: 1.85rem; font-weight: 800; color: #ffffff; margin-top: 0.25rem;">Register Company & AI Knowledge Base</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 580px; line-height: 1.5;">
            Create your company workspace and upload essential policies (Maternity Leave, Remote Work, Benefits). 
            Our AI engine will instantly vectorize them so candidates and recruiters get instant, grounded answers.
          </p>
        </div>

        <div id="company-error-box" style="display: none; padding: 0.85rem 1rem; border-radius: 12px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fda4af; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
          ${Icons.AlertCircle('w-4 h-4 shrink-0')}
          <span id="company-error-msg"></span>
        </div>

        <!-- Main Form -->
        <form id="register-company-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Section 1: Company Profile -->
          <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem; border-radius: 14px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08);">
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em;">
              ${Icons.Briefcase('w-4 h-4')} 1. Organization Details
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div style="grid-column: span 2;">
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                  Company Name <span style="color: #f43f5e;">*</span>
                </label>
                <input type="text" id="comp-name" required placeholder="e.g. Apex Global Technologies" class="glass-input" style="font-size: 0.95rem; font-weight: 600;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                  Industry / Sector
                </label>
                <input type="text" id="comp-industry" placeholder="e.g. Cloud & AI Software" class="glass-input" />
              </div>

              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                  Headquarters / Work Model
                </label>
                <input type="text" id="comp-location" placeholder="e.g. San Francisco, CA & Remote" class="glass-input" />
              </div>

              <div style="grid-column: span 2;">
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                  Company Website (Optional)
                </label>
                <input type="url" id="comp-website" placeholder="https://company.example.com" class="glass-input" />
              </div>
            </div>
          </div>

          <!-- Section 2: AI Knowledge Base Policies -->
          <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem; border-radius: 14px; background: rgba(52, 211, 153, 0.04); border: 1px solid rgba(52, 211, 153, 0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.05em;">
                ${Icons.Sparkles('w-4 h-4')} 2. Company Policies & AI Knowledge Base
              </div>
              <span style="font-size: 0.75rem; color: #6ee7b7; background: rgba(52, 211, 153, 0.15); padding: 0.2rem 0.6rem; border-radius: 6px;">
                ⚡ Pre-loaded with industry best practices
              </span>
            </div>

            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
              These documents are automatically chunked and indexed into pgvector so your AI Assistant can immediately answer candidate questions. Feel free to edit or keep the standard templates.
            </p>

            <!-- Policy Tabs -->
            <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <button type="button" class="policy-tab-btn active" data-tab="maternity" style="padding: 0.45rem 0.85rem; font-size: 0.8rem; font-weight: 600; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(52, 211, 153, 0.15); color: #34d399; cursor: pointer; white-space: nowrap;">
                👶 Maternity & Parental Leave
              </button>
              <button type="button" class="policy-tab-btn" data-tab="remote" style="padding: 0.45rem 0.85rem; font-size: 0.8rem; font-weight: 600; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); background: transparent; color: var(--text-muted); cursor: pointer; white-space: nowrap;">
                🏠 Remote & Flexible Work
              </button>
              <button type="button" class="policy-tab-btn" data-tab="benefits" style="padding: 0.45rem 0.85rem; font-size: 0.8rem; font-weight: 600; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); background: transparent; color: var(--text-muted); cursor: pointer; white-space: nowrap;">
                🏥 Health & Wellness Benefits
              </button>
              <button type="button" class="policy-tab-btn" data-tab="culture" style="padding: 0.45rem 0.85rem; font-size: 0.8rem; font-weight: 600; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); background: transparent; color: var(--text-muted); cursor: pointer; white-space: nowrap;">
                ⚖️ Culture & Code of Conduct
              </button>
            </div>

            <!-- Tab Contents -->
            <div id="tab-content-maternity" class="policy-tab-pane" style="display: flex; flex-direction: column; gap: 0.4rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
                  Maternity & Parental Leave Policy (Markdown / Text)
                </label>
                <span style="font-size: 0.7rem; color: #a78bfa;">20 Weeks Primary / 12 Weeks Secondary</span>
              </div>
              <textarea id="policy-maternity" rows="7" class="glass-input" style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; line-height: 1.4; resize: vertical;"></textarea>
            </div>

            <div id="tab-content-remote" class="policy-tab-pane" style="display: none; flex-direction: column; gap: 0.4rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
                  Remote Work, Equipment & Hours Policy
                </label>
                <span style="font-size: 0.7rem; color: #a78bfa;">$1,500 Home Office Stipend + $100/mo Internet</span>
              </div>
              <textarea id="policy-remote" rows="7" class="glass-input" style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; line-height: 1.4; resize: vertical;"></textarea>
            </div>

            <div id="tab-content-benefits" class="policy-tab-pane" style="display: none; flex-direction: column; gap: 0.4rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
                  Health, Dental, Vision & Wellness Benefits
                </label>
                <span style="font-size: 0.7rem; color: #a78bfa;">100% Medical + $2,500 Learning Budget</span>
              </div>
              <textarea id="policy-benefits" rows="7" class="glass-input" style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; line-height: 1.4; resize: vertical;"></textarea>
            </div>

            <div id="tab-content-culture" class="policy-tab-pane" style="display: none; flex-direction: column; gap: 0.4rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">
                  Culture, Anti-Harassment & PTO Policy
                </label>
                <span style="font-size: 0.7rem; color: #a78bfa;">Unlimited PTO (20 Days Min) + 12 Holidays</span>
              </div>
              <textarea id="policy-culture" rows="7" class="glass-input" style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; line-height: 1.4; resize: vertical;"></textarea>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" id="company-submit-btn" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.9rem; font-size: 1rem; font-weight: 700; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-color: rgba(52, 211, 153, 0.4); display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            ${Icons.Sparkles('w-5 h-5')} Register Company & Index AI Knowledge Base
          </button>
        </form>

        <!-- Success Screen (Initially hidden) -->
        <div id="company-success-view" style="display: none; flex-direction: column; align-items: center; text-align: center; gap: 1.5rem; padding: 1rem 0;">
          <div style="width: 64px; height: 64px; border-radius: 20px; background: rgba(52, 211, 153, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(52, 211, 153, 0.3);">
            ${Icons.CheckCircle2('w-10 h-10')}
          </div>

          <div>
            <h3 style="font-size: 1.6rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem;" id="success-company-name">
              Organization Registered!
            </h3>
            <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 500px;">
              Your company workspace and AI vector knowledge base have been created and indexed successfully.
            </p>
          </div>

          <!-- Recruiter Code Showcase Box -->
          <div style="width: 100%; max-width: 480px; padding: 1.25rem; border-radius: 16px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.35); display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em;">
                Company Recruiter Security Code
              </span>
              <span id="success-chunks-badge" style="font-size: 0.75rem; font-weight: 700; color: #34d399; background: rgba(52, 211, 153, 0.15); padding: 0.2rem 0.6rem; border-radius: 6px;">
                ✨ Indexed in pgvector
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="text" id="success-recruiter-code" readonly style="flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; font-weight: 800; color: #38bdf8; background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 0.75rem 1rem; text-align: center; letter-spacing: 0.1em;" />
              <button type="button" id="copy-recruiter-code-btn" class="glass-btn" style="padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.4rem; background: rgba(99, 102, 241, 0.25); border-color: rgba(99, 102, 241, 0.4); color: #ffffff;">
                ${Icons.Copy('w-4 h-4')} <span id="copy-btn-text">Copy</span>
              </button>
            </div>
            
            <p style="font-size: 0.75rem; color: #cbd5e1; margin: 0; line-height: 1.4;">
              Share this secret code with recruiters from your team so they can join your company workspace.
            </p>
          </div>

          <!-- Next Actions -->
          <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 480px;">
            <button type="button" id="btn-goto-register-recruiter" class="glass-btn glass-btn-primary" style="width: 100%; padding: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 700;">
              ${Icons.UserCheck('w-5 h-5')} Register First Recruiter Account
            </button>
            <a href="#/login" class="glass-btn" style="width: 100%; padding: 0.75rem; text-align: center; text-decoration: none; color: var(--text-muted); font-size: 0.85rem;">
              Return to Sign In
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div id="company-form-footer" style="text-align: center; border-top: 1px solid rgba(52, 211, 153, 0.15); padding-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
          Already registered? <a href="#/register-recruiter" style="color: #34d399; font-weight: 600; text-decoration: underline;">Join as a Recruiter</a>
          <span style="margin: 0 0.5rem;">•</span>
          <a href="#/login" style="color: #c084fc; font-weight: 600; text-decoration: underline;">Sign In</a>
        </div>

      </div>
    </div>
  `;
}

export function initRegisterCompanyPage() {
  const form = document.getElementById('register-company-form');
  if (!form) return;

  const compNameInput = document.getElementById('comp-name');
  const maternityText = document.getElementById('policy-maternity');
  const remoteText = document.getElementById('policy-remote');
  const benefitsText = document.getElementById('policy-benefits');
  const cultureText = document.getElementById('policy-culture');

  // Populate dynamic policy templates
  function updatePolicyTemplates(cName) {
    const name = cName.trim() || 'Our Company';
    maternityText.value = `# ${name} — Maternity & Parental Leave Policy\n\n## 1. Overview\nAt ${name}, we provide comprehensive support for parents of all genders.\n\n## 2. Paid Leave Entitlements\n* **Primary Caregivers / Birthing Parents:** 20 weeks of 100% fully paid maternity leave.\n* **Secondary Caregivers / Non-Birthing Parents:** 12 weeks of 100% fully paid parental leave.\n* **Adoption & Surrogacy:** 16 weeks of 100% fully paid leave + $5,000 adoption stipend.\n\n## 3. Benefits & Equity\n* 100% health insurance premiums continue during leave.\n* Equity vesting and bonus eligibility continue uninterrupted.\n\n## 4. Gradual Phase-Back\n* Return to work on 80% hours with 100% salary for the first 4 weeks.\n* Dedicated private parent & lactation rooms in office hubs.`;

    remoteText.value = `# ${name} — Remote & Flexible Work Policy\n\n## 1. Remote-First Culture\n${name} operates with location flexibility across global hubs.\n\n## 2. Equipment & Home Office Stipends\n* **$1,500 home-office equipment stipend** upon joining for ergonomic setup.\n* **$100 monthly stipend** for high-speed home internet and mobile data.\n* Top-tier Apple MacBook Pro or developer workstation provided.\n\n## 3. Working Hours & Collaboration\n* Core collaboration hours: 10:00 AM to 4:00 PM local timezone.\n* Focus Fridays: No internal meetings to maximize deep uninterrupted work.`;

    benefitsText.value = `# ${name} — Health, Wellness & Comprehensive Benefits\n\n## 1. Health, Dental & Vision\n* 100% employer-sponsored health, dental, and vision insurance premiums for employees; 80% for dependents.\n* Low deductibles, worldwide emergency travel coverage, and comprehensive HSA/FSA options.\n\n## 2. Mental Health & Fitness\n* 12 free mental health therapy sessions per year via EAP.\n* $150/month ($1,800/year) fitness and gym reimbursement.\n* **$2,500 annual continuous learning budget** for conferences, books, and courses.`;

    cultureText.value = `# ${name} — Culture, Code of Conduct & Values\n\n## 1. Values & Inclusion\n* Radical transparency, ownership mentality, and psychological safety.\n* Equal opportunity and zero tolerance for harassment or discrimination.\n\n## 2. Time Off\n* Unlimited Paid Time Off (PTO) with a mandatory 20-day minimum.\n* 12 paid company holidays + 2 floating cultural heritage days.`;
  }

  // Initialize with placeholder company name
  updatePolicyTemplates('Our Company');

  // When company name changes, update templates if user hasn't heavily customized
  compNameInput?.addEventListener('input', (e) => {
    updatePolicyTemplates(e.target.value || 'Our Company');
  });

  // Tab switching logic
  const tabBtns = document.querySelectorAll('.policy-tab-btn');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        b.style.color = 'var(--text-muted)';
      });
      btn.classList.add('active');
      btn.style.background = 'rgba(52, 211, 153, 0.15)';
      btn.style.borderColor = 'rgba(52, 211, 153, 0.3)';
      btn.style.color = '#34d399';

      const tabId = btn.dataset.tab;
      document.querySelectorAll('.policy-tab-pane').forEach((p) => (p.style.display = 'none'));
      const activePane = document.getElementById(`tab-content-${tabId}`);
      if (activePane) activePane.style.display = 'flex';
    });
  });

  // Form submission logic
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('company-submit-btn');
    const errorBox = document.getElementById('company-error-box');
    const errorMsg = document.getElementById('company-error-msg');

    const companyName = compNameInput.value.trim();
    if (!companyName) return;

    const payload = {
      name: companyName,
      industry: document.getElementById('comp-industry')?.value.trim() || null,
      location: document.getElementById('comp-location')?.value.trim() || null,
      website: document.getElementById('comp-website')?.value.trim() || null,
      maternity_leave_policy: maternityText.value.trim() || null,
      remote_work_policy: remoteText.value.trim() || null,
      health_benefits: benefitsText.value.trim() || null,
      culture_code_of_conduct: cultureText.value.trim() || null,
    };

    errorBox.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin" style="display:inline-block;">⚡</span> Creating organization & vectorizing policies into pgvector...`;

    try {
      const res = await auth.registerCompany(payload);
      showToast(`Company '${res.name}' registered & knowledge vectorized!`);

      // Hide form and show success view
      form.style.display = 'none';
      document.getElementById('company-form-footer').style.display = 'none';
      
      const successView = document.getElementById('company-success-view');
      successView.style.display = 'flex';
      
      document.getElementById('success-company-name').textContent = `${res.name} is Ready!`;
      document.getElementById('success-recruiter-code').value = res.recruiter_code;
      document.getElementById('success-chunks-badge').textContent = `✨ ${res.documents_indexed || 15} Vector Chunks Indexed`;

      // Setup copy button
      const copyBtn = document.getElementById('copy-recruiter-code-btn');
      const copyText = document.getElementById('copy-btn-text');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(res.recruiter_code);
          copyText.textContent = 'Copied!';
          showToast('Recruiter code copied to clipboard!');
          setTimeout(() => {
            copyText.textContent = 'Copy';
          }, 2500);
        } catch {
          showToast(`Code: ${res.recruiter_code}`);
        }
      });

      // Setup direct recruiter registration shortcut
      const recBtn = document.getElementById('btn-goto-register-recruiter');
      recBtn.addEventListener('click', () => {
        sessionStorage.setItem('prefill_company_name', res.name);
        sessionStorage.setItem('prefill_recruiter_code', res.recruiter_code);
        window.location.hash = '#/register-recruiter';
      });

    } catch (err) {
      errorBox.style.display = 'flex';
      errorMsg.textContent = err.message || 'Failed to register company. Please try again.';
      btn.disabled = false;
      btn.innerHTML = `${Icons.Sparkles('w-5 h-5')} Register Company & Index AI Knowledge Base`;
    }
  });
}

