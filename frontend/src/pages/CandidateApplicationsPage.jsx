import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { Send, Building2, Calendar, Briefcase, ArrowRight, Clock } from 'lucide-react';

export const CandidateApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const [appsRes, jobsRes] = await Promise.all([
          api.get('/applications/me'),
          api.get('/jobs/'),
        ]);

        const jobMap = {};
        jobsRes.data.forEach((j) => {
          jobMap[j.id] = j;
        });

        setApplications(appsRes.data);
        setJobs(jobMap);
      } catch (err) {
        console.error('Error loading applications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const stages = ['applied', 'screening', 'shortlisted', 'hired'];

  const getStageIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'rejected' || s === 'cancelled') return -1;
    const idx = stages.indexOf(s);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Applications</h1>
        <p className="text-sm text-slate-400">Track your submission stages and review pipeline progress</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading your applications...</div>
      ) : applications.length > 0 ? (
        <div className="space-y-6">
          {applications.map((app) => {
            const job = jobs[app.job_id] || { title: `Job #${app.job_id}`, company_name: 'Company' };
            const currentStage = getStageIndex(app.status);
            const isRejected = (app.status || '').toLowerCase() === 'rejected';

            return (
              <GlassCard key={app.id} hover className="space-y-5 border-purple-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/15">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                    <p className="text-xs text-purple-300 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.company_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                </div>

                {/* Progress Pipeline */}
                {!isRejected ? (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {stages.map((stage, idx) => {
                        const isDone = idx <= currentStage;
                        const isCurrent = idx === currentStage;
                        return (
                          <div key={stage} className="space-y-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isDone
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                                  : 'bg-slate-800'
                              }`}
                            />
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wider block ${
                                isCurrent
                                  ? 'text-purple-300'
                                  : isDone
                                  ? 'text-slate-300'
                                  : 'text-slate-600'
                              }`}
                            >
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    This application was not selected to proceed further. You can continue exploring other active positions.
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard className="text-center py-16 space-y-4">
          <Send className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Applications Yet</h3>
          <p className="text-sm text-slate-400">You haven't submitted any job applications yet.</p>
          <Link to="/jobs">
            <GlassButton variant="primary">
              <Briefcase className="w-4 h-4 mr-1" /> Explore Jobs
            </GlassButton>
          </Link>
        </GlassCard>
      )}
    </div>
  );
};
