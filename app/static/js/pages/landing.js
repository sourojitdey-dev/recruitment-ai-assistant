/* ==========================================================================
   Recruitment AI Assistant - Landing Page View
   ========================================================================== */

import { Icons } from '../icons.js';

export function renderLandingPage() {
  return `
    <div style="display: flex; flex-direction: column; gap: 5rem; padding: 2.5rem 0 5rem 0;">
      <!-- Hero Section -->
      <section style="text-align: center; max-width: 850px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 1rem; border-radius: 9999px; background: rgba(79, 70, 229, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); color: #c084fc; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
          ${Icons.Sparkles('w-4 h-4 text-cyan-400')}
          Next-Gen AI Recruitment & Career Intelligence
        </div>

        <h1 style="font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.02em; color: #ffffff;">
          Smarter Recruitment. <br />
          <span class="text-gradient">Grounded Career Guidance.</span>
        </h1>

        <p style="font-size: 1.15rem; color: var(--text-secondary); max-width: 650px; line-height: 1.6;">
          An enterprise-grade platform connecting candidates, recruiters, and interviewers with 384-dimensional semantic matching, automated PDF resume parsing, and privacy-first RAG career assistance.
        </p>

        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; padding-top: 1rem;">
          <a href="#/register" class="glass-btn glass-btn-primary glass-btn-lg">
            <span>Get Started Free</span>
            ${Icons.ArrowRight('w-5 h-5')}
          </a>
          <a href="#/jobs" class="glass-btn glass-btn-secondary glass-btn-lg">
            ${Icons.Briefcase('w-5 h-5 text-indigo-400')}
            <span>Explore Active Jobs</span>
          </a>
          <a href="#/chat" class="glass-btn glass-btn-outline glass-btn-lg">
            ${Icons.Bot('w-5 h-5 text-cyan-400')}
            <span>Try AI Career Assistant</span>
          </a>
        </div>
      </section>

      <!-- Feature Pillars -->
      <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(99, 102, 241, 0.18); border: 1px solid rgba(99, 102, 241, 0.3); display: flex; align-items: center; justify-content: center; color: #818cf8;">
            ${Icons.FileCheck('w-6 h-6')}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">Semantic AI Matching</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            384-dimensional vector embeddings with pgvector compute deep semantic compatibility, extracting strong skills, partial matches, and potential gaps without hallucination.
          </p>
        </div>

        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(168, 85, 247, 0.18); border: 1px solid rgba(168, 85, 247, 0.3); display: flex; align-items: center; justify-content: center; color: #c084fc;">
            ${Icons.Bot('w-6 h-6')}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">RAG Career Advisory</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            Candidates receive actionable advice grounded only in verified company policies and their own uploaded resume, backed by Groq LLM and real-time WebSockets.
          </p>
        </div>

        <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(6, 182, 212, 0.18); border: 1px solid rgba(6, 182, 212, 0.3); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
            ${Icons.ShieldCheck('w-6 h-6')}
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">Strict Company Isolation</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            Multi-tenant architecture guarantees recruiters cannot access other companies' candidates, documents, or interview pipelines. Zero cross-tenant leakage.
          </p>
        </div>
      </section>

      <!-- Roles Section -->
      <section style="display: flex; flex-direction: column; gap: 2rem;">
        <div style="text-align: center;">
          <h2 style="font-size: 1.85rem; font-weight: 800; color: #ffffff;">Tailored for Every Recruitment Role</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.4rem;">Unified workflows with strict permission scoping</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          <!-- Candidate Role Card -->
          <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; border-color: rgba(99, 102, 241, 0.25);">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em;">For Candidates</span>
              <h4 style="font-size: 1.2rem; font-weight: 700; color: #ffffff;">Manage Career & Resumes</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} PDF Resume Parsing</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} AI Match Percentage Breakdown</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} Application Pipeline Tracker</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} AI Interview Preparations</li>
              </ul>
            </div>
            <a href="#/register" class="glass-btn glass-btn-secondary" style="width: 100%;">Candidate Sign Up</a>
          </div>

          <!-- Recruiter Role Card -->
          <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; border-color: rgba(168, 85, 247, 0.25);">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #c084fc; text-transform: uppercase; letter-spacing: 0.05em;">For Recruiters</span>
              <h4 style="font-size: 1.2rem; font-weight: 700; color: #ffffff;">Source, Match & Schedule</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} Company Job Posting Management</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} Semantic AI Candidate Ranking</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} Interviewer Dropdown Scheduling</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} Company Knowledge Vector Store</li>
              </ul>
            </div>
            <a href="#/register-recruiter" class="glass-btn glass-btn-primary" style="width: 100%;">Recruiter Sign Up</a>
          </div>

          <!-- Interviewer Role Card -->
          <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; border-color: rgba(6, 182, 212, 0.25);">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">For Interviewers</span>
              <h4 style="font-size: 1.2rem; font-weight: 700; color: #ffffff;">Execute Evaluations</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} Assigned Interviews Exclusively</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} Candidate & Job Context</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} Mark Complete or Cancel</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;">${Icons.CheckCircle2('w-4 h-4 text-emerald-400')} Clean Focused Interface</li>
              </ul>
            </div>
            <a href="#/register-interviewer" class="glass-btn glass-btn-outline" style="width: 100%;">Interviewer Sign Up</a>
          </div>
        </div>
      </section>
    </div>
  `;
}
