import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Briefcase,
  FileText,
  Send,
  Calendar,
  Bot,
  Sparkles,
  ArrowRight,
  Upload,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const [appsCount, setAppsCount] = useState(0);
  const [interviewsCount, setInterviewsCount] = useState(0);
  const [hasResume, setHasResume] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [appsRes, interviewsRes, resumesRes, matchRes] = await Promise.allSettled([
          api.get('/applications/me'),
          api.get('/interviews/me'),
          api.get('/resumes/'),
          api.get('/match/candidate/jobs'),
        ]);

        if (appsRes.status === 'fulfilled') setAppsCount(appsRes.value.data.length);
        if (interviewsRes.status === 'fulfilled') setInterviewsCount(interviewsRes.value.data.length);
        if (resumesRes.status === 'fulfilled') setHasResume(resumesRes.value.data.length > 0);
        if (matchRes.status === 'fulfilled') setRecommendedJobs(matchRes.value.data.slice(0, 3));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 border-purple-500/25">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Candidate Intelligence Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name}</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Your personalized recruitment dashboard provides semantic job matching, resume insights, and real-time interview tracking.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard hover className="flex items-center justify-between border-indigo-500/20">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applications</p>
            <h3 className="text-3xl font-extrabold text-white">{appsCount}</h3>
            <Link to="/applications" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1">
              View pipeline <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-600/20 text-indigo-400">
            <Send className="w-7 h-7" />
          </div>
        </GlassCard>

        <GlassCard hover className="flex items-center justify-between border-purple-500/20">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Interviews</p>
            <h3 className="text-3xl font-extrabold text-white">{interviewsCount}</h3>
            <Link to="/interviews" className="text-xs text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1">
              View schedule <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 rounded-2xl bg-purple-600/20 text-purple-400">
            <Calendar className="w-7 h-7" />
          </div>
        </GlassCard>

        <GlassCard hover className="flex items-center justify-between border-cyan-500/20">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resume Status</p>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {hasResume ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Uploaded</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>Pending</span>
                </>
              )}
            </h3>
            <Link to="/resume" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1">
              {hasResume ? 'Manage Resume' : 'Upload PDF'} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 rounded-2xl bg-cyan-600/20 text-cyan-400">
            <FileText className="w-7 h-7" />
          </div>
        </GlassCard>
      </div>

      {/* Main Grid: Recommended Jobs & AI Assistant Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              AI Recommended Jobs
            </h2>
            <Link to="/jobs" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
              Browse all jobs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading recommendations...</div>
          ) : recommendedJobs.length > 0 ? (
            <div className="space-y-4">
              {recommendedJobs.map((job) => (
                <GlassCard key={job.job_id} hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{job.job_title}</h4>
                      <span className="text-xs text-slate-400">• {job.company_name}</span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{job.location}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.breakdown?.strong_matches?.slice(0, 3).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MatchScoreBadge score={job.match_percentage} size="sm" />
                    <Link to={`/jobs`}>
                      <GlassButton size="sm" variant="outline">
                        View
                      </GlassButton>
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-8 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-300">Upload your resume to receive AI semantic job recommendations.</p>
              <Link to="/resume">
                <GlassButton size="sm" variant="primary">
                  <Upload className="w-4 h-4 mr-1" /> Upload Resume
                </GlassButton>
              </Link>
            </GlassCard>
          )}
        </div>

        {/* AI Assistant Card */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            AI Career Advisor
          </h2>
          <GlassCard glow className="space-y-4 border-purple-500/30">
            <p className="text-sm text-slate-300 leading-relaxed">
              Ask questions about resume improvements, skill gaps, company interview rounds, or mock questions.
            </p>
            <div className="space-y-2">
              <Link to="/chat" state={{ prompt: "How can I improve my resume for Senior Backend roles?" }} className="block">
                <div className="p-3 rounded-xl bg-white/5 hover:bg-purple-900/30 border border-purple-500/20 text-xs text-slate-200 transition-colors">
                  💡 "How can I improve my resume?"
                </div>
              </Link>
              <Link to="/chat" state={{ prompt: "What skills are missing for full stack engineer jobs?" }} className="block">
                <div className="p-3 rounded-xl bg-white/5 hover:bg-purple-900/30 border border-purple-500/20 text-xs text-slate-200 transition-colors">
                  🎯 "What skills are missing from my resume?"
                </div>
              </Link>
              <Link to="/chat" state={{ prompt: "Help me prepare for a Python & FastAPI technical interview." }} className="block">
                <div className="p-3 rounded-xl bg-white/5 hover:bg-purple-900/30 border border-purple-500/20 text-xs text-slate-200 transition-colors">
                  ⚡ "Help me prepare for FastAPI interview"
                </div>
              </Link>
            </div>
            <Link to="/chat" className="block pt-2">
              <GlassButton variant="primary" className="w-full">
                Open AI Career Chat <ArrowRight className="w-4 h-4 ml-1" />
              </GlassButton>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
