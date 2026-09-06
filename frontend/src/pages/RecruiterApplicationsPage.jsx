import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Modal } from '../components/Modal';
import {
  Users,
  Search,
  Filter,
  Calendar,
  Sparkles,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const RecruiterApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState({});
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    interviewer_id: '',
    scheduled_at: '',
  });
  const [scheduling, setScheduling] = useState(false);
  const [candidateDetail, setCandidateDetail] = useState(null);
  const [matchDetail, setMatchDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsRes, jobsRes, interviewersRes] = await Promise.all([
        api.get('/applications/'),
        api.get('/jobs/company/me'),
        api.get('/interviews/interviewers'),
      ]);

      const jobMap = {};
      jobsRes.data.forEach((j) => {
        jobMap[j.id] = j;
      });

      setApplications(appsRes.data);
      setJobs(jobMap);
      setInterviewers(interviewersRes.data);
      if (interviewersRes.data.length > 0) {
        setScheduleData((prev) => ({ ...prev, interviewer_id: interviewersRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      setToastMessage(`Status updated to ${newStatus}`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.');
    }
  };

  const handleOpenSchedule = (app) => {
    setSelectedApp(app);
    setScheduleData({
      interviewer_id: interviewers.length > 0 ? interviewers[0].id : '',
      scheduled_at: '',
    });
    setIsScheduleOpen(true);
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!scheduleData.interviewer_id || !scheduleData.scheduled_at) {
      alert('Please select an interviewer and date/time.');
      return;
    }

    setScheduling(true);
    try {
      await api.post('/interviews/', {
        application_id: selectedApp.id,
        interviewer_id: parseInt(scheduleData.interviewer_id),
        scheduled_at: new Date(scheduleData.scheduled_at).toISOString(),
      });
      // Also update status to shortlisted/scheduled
      await handleStatusChange(selectedApp.id, 'shortlisted');
      setToastMessage('Interview scheduled successfully!');
      setIsScheduleOpen(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  const handleOpenReview = async (app) => {
    setSelectedApp(app);
    setLoadingDetail(true);
    try {
      const matchRes = await api.get(`/match/job/${app.job_id}/candidate/${app.candidate_id}`);
      setMatchDetail(matchRes.data);
    } catch (err) {
      setMatchDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = !statusFilter || app.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesJob = !jobFilter || String(app.job_id) === String(jobFilter);
    return matchesStatus && matchesJob;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Candidate Applications</h1>
        <p className="text-sm text-slate-400">Review applicants, evaluate AI match scores, and schedule interviews</p>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Filter by Job</label>
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="w-full glass-input rounded-xl py-2 px-3 text-sm"
            >
              <option value="">All Company Jobs</option>
              {Object.values(jobs).map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full glass-input rounded-xl py-2 px-3 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading applications...</div>
      ) : filteredApps.length > 0 ? (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const job = jobs[app.job_id] || { title: `Job #${app.job_id}` };
            return (
              <GlassCard key={app.id} hover className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-indigo-500/20">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-purple-400 font-bold">App #{app.id}</span>
                    <h3 className="text-lg font-bold text-white">Candidate #{app.candidate_id}</h3>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span className="font-semibold text-purple-300">Position: {job.title}</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="glass-input rounded-xl py-1.5 px-3 text-xs font-semibold"
                  >
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <GlassButton size="sm" variant="secondary" onClick={() => handleOpenReview(app)}>
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Match Review
                  </GlassButton>

                  <GlassButton size="sm" variant="primary" onClick={() => handleOpenSchedule(app)}>
                    <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule Interview
                  </GlassButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard className="text-center py-16 space-y-3">
          <Users className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Applications Found</h3>
          <p className="text-sm text-slate-400">Applications for your company's vacancies will appear here.</p>
        </GlassCard>
      )}

      {/* Schedule Interview Modal */}
      <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Schedule Technical Interview">
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <p className="text-xs text-slate-300">
            Scheduling interview for <strong>Candidate #{selectedApp?.candidate_id}</strong> applying for{' '}
            <strong>{jobs[selectedApp?.job_id]?.title}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Company Interviewer
            </label>
            {interviewers.length > 0 ? (
              <select
                required
                value={scheduleData.interviewer_id}
                onChange={(e) => setScheduleData({ ...scheduleData, interviewer_id: e.target.value })}
                className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
              >
                {interviewers.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                No active interviewers found in your company. Please ask your interviewers to register with your company code.
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Date and Time
            </label>
            <input
              type="datetime-local"
              required
              value={scheduleData.scheduled_at}
              onChange={(e) => setScheduleData({ ...scheduleData, scheduled_at: e.target.value })}
              className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-purple-500/20">
            <GlassButton variant="outline" type="button" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" type="submit" loading={scheduling} disabled={interviewers.length === 0}>
              Confirm Interview Schedule
            </GlassButton>
          </div>
        </form>
      </Modal>

      {/* AI Match Review Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!matchDetail}
          onClose={() => setMatchDetail(null)}
          title={`Candidate Compatibility • App #${selectedApp?.id}`}
          maxWidth="max-w-3xl"
        >
          {loadingDetail ? (
            <div className="py-8 text-center text-slate-400">Computing grounded semantic match...</div>
          ) : matchDetail ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
                <div>
                  <h4 className="text-lg font-bold text-white">{matchDetail.candidate_name}</h4>
                  <p className="text-xs text-purple-300">Applying for: {matchDetail.job_title}</p>
                </div>
                <MatchScoreBadge score={matchDetail.match_percentage} size="lg" />
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Grounded Explanation
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{matchDetail.explanation}</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Strong Matches</span>
                  <div className="text-xs text-slate-200">
                    {matchDetail.breakdown?.strong_matches?.length > 0
                      ? matchDetail.breakdown.strong_matches.join(', ')
                      : 'None'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Partial Matches</span>
                  <div className="text-xs text-slate-200">
                    {matchDetail.breakdown?.partial_matches?.length > 0
                      ? matchDetail.breakdown.partial_matches.join(', ')
                      : 'None'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Potential Gaps</span>
                  <div className="text-xs text-slate-200">
                    {matchDetail.breakdown?.potential_gaps?.length > 0
                      ? matchDetail.breakdown.potential_gaps.join(', ')
                      : 'None detected'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-500/20">
                <GlassButton variant="outline" onClick={() => setMatchDetail(null)}>
                  Close
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={() => {
                    setMatchDetail(null);
                    handleOpenSchedule(selectedApp);
                  }}
                >
                  <Calendar className="w-4 h-4 mr-1" /> Schedule Interview
                </GlassButton>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">Match details could not be loaded.</div>
          )}
        </Modal>
      )}
    </div>
  );
};
