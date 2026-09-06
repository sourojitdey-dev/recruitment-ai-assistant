import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Briefcase,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

export const InterviewerDashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/interviews/');
      setInterviews(res.data);
    } catch (err) {
      console.error('Failed to load assigned interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const handleUpdateStatus = async (interviewId, newStatus) => {
    try {
      await api.put(`/interviews/${interviewId}/status`, { status: newStatus });
      setInterviews((prev) =>
        prev.map((i) => (i.id === interviewId ? { ...i, status: newStatus } : i))
      );
      setToastMessage(`Interview marked as ${newStatus}`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update interview status.');
    }
  };

  const scheduledCount = interviews.filter((i) => i.status === 'scheduled').length;
  const completedCount = interviews.filter((i) => i.status === 'completed').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border-cyan-500/25 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <UserCheck className="w-3.5 h-3.5" />
          Technical Interviewer Portal
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Assigned Interviews • <span className="text-gradient">{user?.name}</span>
        </h1>
        <p className="text-sm text-slate-300">
          Company: <strong className="text-purple-300">Company ID #{user?.company_id || 'N/A'}</strong> (Assigned interviews only)
        </p>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard className="flex items-center justify-between border-cyan-500/20">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Scheduled</p>
            <h3 className="text-3xl font-extrabold text-white">{scheduledCount}</h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-cyan-600/20 text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between border-emerald-500/20">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Evaluations</p>
            <h3 className="text-3xl font-extrabold text-white">{completedCount}</h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-600/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between border-purple-500/20">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Assigned</p>
            <h3 className="text-3xl font-extrabold text-white">{interviews.length}</h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-600/20 text-purple-400">
            <Calendar className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* Interviews List */}
      <GlassCard className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          My Scheduled Appointments
        </h3>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading assigned interviews...</div>
        ) : interviews.length > 0 ? (
          <div className="space-y-4">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-purple-500/20 hover:border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-purple-400 font-bold">Interview #{item.id}</span>
                    <h4 className="font-bold text-white text-base">
                      {item.job_title || `Application #${item.application_id}`}
                    </h4>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-cyan-300 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.scheduled_at).toLocaleString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {item.candidate_name && (
                      <span className="text-slate-300">Candidate: {item.candidate_name}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'scheduled' && (
                    <>
                      <GlassButton
                        size="sm"
                        variant="success"
                        onClick={() => handleUpdateStatus(item.id, 'completed')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Complete
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        variant="danger"
                        onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                      </GlassButton>
                    </>
                  )}
                  {item.status !== 'scheduled' && (
                    <GlassButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(item.id, 'scheduled')}
                    >
                      Re-open
                    </GlassButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm">You have no technical interviews assigned currently.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
