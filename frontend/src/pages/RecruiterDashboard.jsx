import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import {
  Briefcase,
  Users,
  Send,
  Calendar,
  Sparkles,
  Plus,
  FolderLock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecruiterData = async () => {
      setLoading(true);
      try {
        const [jobsRes, appsRes, interviewsRes, docsRes] = await Promise.allSettled([
          api.get('/jobs/company/me'),
          api.get('/applications/'),
          api.get('/interviews/'),
          api.get('/documents/'),
        ]);

        if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data);
        if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data);
        if (interviewsRes.status === 'fulfilled') setInterviews(interviewsRes.value.data);
        if (docsRes.status === 'fulfilled') setDocuments(docsRes.value.data);
      } catch (err) {
        console.error('Error loading recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecruiterData();
  }, []);

  const activeJobs = jobs.filter((j) => j.is_active);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-8 rounded-3xl border-indigo-500/25">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Recruiter Operations Hub
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Talent Dashboard • <span className="text-gradient">{user?.name}</span>
          </h1>
          <p className="text-sm text-slate-300">
            Company Scope: <strong className="text-purple-300">Active Company ID #{user?.company_id || 'N/A'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/recruiter/jobs">
            <GlassButton variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1" /> Post New Job
            </GlassButton>
          </Link>
          <Link to="/recruiter/matching">
            <GlassButton variant="secondary" size="md">
              <Sparkles className="w-4 h-4 mr-1" /> AI Matcher
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard hover className="flex items-center justify-between border-indigo-500/20">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Jobs</p>
            <h3 className="text-3xl font-extrabold text-white">{activeJobs.length}</h3>
            <Link to="/recruiter/jobs" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              Manage jobs →
            </Link>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-600/20 text-indigo-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard hover className="flex items-center justify-between border-purple-500/20">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applications</p>
            <h3 className="text-3xl font-extrabold text-white">{applications.length}</h3>
            <Link to="/recruiter/applications" className="text-xs text-purple-400 hover:text-purple-300 font-medium">
              Review candidates →
            </Link>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-600/20 text-purple-400">
            <Users className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard hover className="flex items-center justify-between border-cyan-500/20">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interviews</p>
            <h3 className="text-3xl font-extrabold text-white">{interviews.length}</h3>
            <Link to="/recruiter/interviews" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
              View schedules →
            </Link>
          </div>
          <div className="p-3.5 rounded-2xl bg-cyan-600/20 text-cyan-400">
            <Calendar className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard hover className="flex items-center justify-between border-emerald-500/20">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Documents</p>
            <h3 className="text-3xl font-extrabold text-white">{documents.length}</h3>
            <Link to="/recruiter/documents" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
              Vector knowledge →
            </Link>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-600/20 text-emerald-400">
            <FolderLock className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* Recent Applications Table */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Recent Applications
          </h3>
          <Link to="/recruiter/applications" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
            View All Applications →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading pipeline...</div>
        ) : applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-purple-950/40 text-purple-300 border-b border-purple-500/20">
                <tr>
                  <th className="p-3">Application ID</th>
                  <th className="p-3">Job ID</th>
                  <th className="p-3">Candidate ID</th>
                  <th className="p-3">Applied Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-xs">#{app.id}</td>
                    <td className="p-3 font-semibold text-white">Job #{app.job_id}</td>
                    <td className="p-3">Candidate #{app.candidate_id}</td>
                    <td className="p-3 text-xs text-slate-400">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td className="p-3"><StatusBadge status={app.status} /></td>
                    <td className="p-3 text-right">
                      <Link to="/recruiter/applications">
                        <GlassButton size="sm" variant="outline">
                          Review
                        </GlassButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">No applications received yet.</div>
        )}
      </GlassCard>
    </div>
  );
};
