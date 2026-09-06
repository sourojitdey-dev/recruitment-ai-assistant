import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Briefcase, FileCheck, Bot, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

export const LandingPage = () => {
  return (
    <div className="space-y-20 py-10">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Next-Gen AI Recruitment & Career Intelligence
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Smarter Recruitment. <br />
          <span className="text-gradient">Grounded Career Guidance.</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An enterprise-grade platform connecting candidates, recruiters, and interviewers with semantic job matching, automated resume extraction, and privacy-first RAG career assistance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/register">
            <GlassButton size="lg" variant="primary" className="shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </GlassButton>
          </Link>
          <Link to="/jobs">
            <GlassButton size="lg" variant="secondary">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <span>Explore Active Jobs</span>
            </GlassButton>
          </Link>
          <Link to="/chat">
            <GlassButton size="lg" variant="outline">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span>Try AI Assistant</span>
            </GlassButton>
          </Link>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="grid md:grid-cols-3 gap-6">
        <GlassCard hover glow className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Semantic AI Matching</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            384-dimensional vector embeddings with pgvector compute deep semantic compatibility, extracting strong skills, partial matches, and potential gaps without hallucination.
          </p>
        </GlassCard>

        <GlassCard hover glow className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">RAG Career Advisory</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Candidates receive actionable advice grounded only in verified company policies and their own uploaded resume, backed by Groq LLM and real-time WebSockets.
          </p>
        </GlassCard>

        <GlassCard hover glow className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Strict Company Isolation</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Multi-tenant architecture guarantees recruiters cannot access other companies' candidates, documents, or interview pipelines. Zero cross-tenant leakage.
          </p>
        </GlassCard>
      </section>

      {/* Roles Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Tailored for Every Recruitment Role</h2>
          <p className="text-slate-400 text-sm">Unified workflows with strict permission scoping</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard className="space-y-4 border-indigo-500/25">
            <div className="text-indigo-400 font-bold uppercase tracking-wider text-xs">For Candidates</div>
            <h4 className="text-lg font-bold text-white">Manage Career & Resumes</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> PDF Resume Extraction</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Match Percentage Breakdown</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Application Pipeline Tracking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Interview Preparation</li>
            </ul>
            <Link to="/register" className="block pt-2">
              <GlassButton variant="secondary" size="sm" className="w-full">Candidate Sign Up</GlassButton>
            </Link>
          </GlassCard>

          <GlassCard className="space-y-4 border-purple-500/25">
            <div className="text-purple-400 font-bold uppercase tracking-wider text-xs">For Recruiters</div>
            <h4 className="text-lg font-bold text-white">Source & Schedule</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Company Job Management</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Candidate Scoring</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Interviewer Dropdown Scheduling</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Policy Document Vector Store</li>
            </ul>
            <Link to="/register/recruiter" className="block pt-2">
              <GlassButton variant="primary" size="sm" className="w-full">Recruiter Sign Up</GlassButton>
            </Link>
          </GlassCard>

          <GlassCard className="space-y-4 border-cyan-500/25">
            <div className="text-cyan-400 font-bold uppercase tracking-wider text-xs">For Interviewers</div>
            <h4 className="text-lg font-bold text-white">Execute Evaluations</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> View Assigned Interviews Only</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Candidate Resume Context</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Update Status (Complete/Cancel)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Clean Focused Interface</li>
            </ul>
            <Link to="/register/interviewer" className="block pt-2">
              <GlassButton variant="outline" size="sm" className="w-full">Interviewer Sign Up</GlassButton>
            </Link>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};
