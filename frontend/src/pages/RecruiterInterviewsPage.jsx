import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Calendar,
  Clock,
  UserCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

export const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [editData, setEditData] = useState({
    interviewer_id: '',
    scheduled_at: '',
    status: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [interviewsRes, interviewersRes] = await Promise.all([
        api.get('/interviews/'),
        api.get('/interviews/interviewers'),
      ]);
      setInterviews(interviewsRes.data);
      setInterviewers(interviewersRes.data);
    } catch (err) {
      console.error('Error loading interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (interview) => {
    setSelectedInterview(interview);
    setEditData({
      interviewer_id: interview.interviewer_id || '',
      scheduled_at: interview.scheduled_at ? interview.scheduled_at.substring(0, 16) : '',
      status: interview.status || 'scheduled',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/interviews/${selectedInterview.id}`, {
        interviewer_id: editData.interviewer_id ? parseInt(editData.interviewer_id) : undefined,
        scheduled_at: editData.scheduled_at ? new Date(editData.scheduled_at).toISOString() : undefined,
        status: editData.status || undefined,
      });
      setToastMessage('Interview appointment updated successfully!');
      setSelectedInterview(null);
      loadData();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update interview.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this scheduled interview?')) return;
    try {
      await api.delete(`/interviews/${id}`);
      setToastMessage('Interview removed.');
      loadData();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete interview.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Interview Scheduling & Management</h1>
        <p className="text-sm text-slate-400">Manage upcoming technical evaluations across your organization</p>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <GlassCard className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          Scheduled Interviews ({interviews.length})
        </h3>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading schedules...</div>
        ) : interviews.length > 0 ? (
          <div className="space-y-3">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/15 hover:border-purple-500/35 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-purple-400 font-bold">#{item.id}</span>
                    <h4 className="font-bold text-white text-base">
                      {item.job_title || `App #${item.application_id}`}
                    </h4>
                    {item.candidate_name && (
                      <span className="text-xs text-slate-300 font-medium">
                        • Candidate: <strong className="text-white">{item.candidate_name}</strong>
                      </span>
                    )}
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.scheduled_at).toLocaleString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.interviewer_name && (
                      <span className="flex items-center gap-1 text-purple-300">
                        <UserCheck className="w-3.5 h-3.5" />
                        Interviewer: {item.interviewer_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton size="sm" variant="outline" onClick={() => handleOpenEdit(item)}>
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Reschedule
                  </GlassButton>
                  <GlassButton size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">No interviews scheduled yet.</div>
        )}
      </GlassCard>

      {/* Reschedule Modal */}
      {selectedInterview && (
        <Modal
          isOpen={!!selectedInterview}
          onClose={() => setSelectedInterview(null)}
          title={`Update Interview #${selectedInterview.id}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Assigned Interviewer
              </label>
              <select
                value={editData.interviewer_id}
                onChange={(e) => setEditData({ ...editData, interviewer_id: e.target.value })}
                className="w-full glass-input rounded-xl py-2.5 px-3 text-sm"
              >
                {interviewers.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                New Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={editData.scheduled_at}
                onChange={(e) => setEditData({ ...editData, scheduled_at: e.target.value })}
                className="w-full glass-input rounded-xl py-2.5 px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="w-full glass-input rounded-xl py-2.5 px-3 text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-purple-500/20">
              <GlassButton variant="outline" type="button" onClick={() => setSelectedInterview(null)}>
                Cancel
              </GlassButton>
              <GlassButton variant="primary" type="submit" loading={submitting}>
                Save Changes
              </GlassButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
