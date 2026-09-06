import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Modal } from '../components/Modal';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  Power,
} from 'lucide-react';

export const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', location: '', is_active: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/company/me');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to load company jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleOpenCreate = () => {
    setFormData({ title: '', description: '', location: '', is_active: true });
    setError('');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (job) => {
    setCurrentJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      is_active: job.is_active,
    });
    setError('');
    setIsEditOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/jobs/', formData);
      setSuccess('Job posting created and auto-indexed in vector store!');
      setIsCreateOpen(false);
      loadJobs();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/jobs/${currentJob.id}`, formData);
      setSuccess('Job posting updated successfully!');
      setIsEditOpen(false);
      loadJobs();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setSuccess('Job removed successfully.');
      loadJobs();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete job.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Company Job Postings</h1>
          <p className="text-sm text-slate-400">Create, update, and manage vacancies for your organization</p>
        </div>
        <GlassButton variant="primary" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1" /> Post New Vacancy
        </GlassButton>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading company jobs...</div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <GlassCard key={job.id} hover className="flex flex-col justify-between space-y-4 border-indigo-500/20">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                      job.is_active
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-500/15 border-slate-500/30 text-slate-400'
                    }`}
                  >
                    {job.is_active ? 'Active' : 'Archived'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {job.location}
                </p>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-500/15">
                <GlassButton size="sm" variant="outline" onClick={() => handleOpenEdit(job)}>
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </GlassButton>
                <GlassButton size="sm" variant="danger" onClick={() => handleDelete(job.id)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-16 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Jobs Posted Yet</h3>
          <p className="text-sm text-slate-400">Post your first company opening to receive applications and AI matches.</p>
          <GlassButton variant="primary" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1" /> Post Job
          </GlassButton>
        </GlassCard>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Job Vacancy">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Job Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Location</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Remote / New York, NY"
              className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Job Description & Skill Requirements
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe roles, technical stack, required qualifications, and experience..."
              className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <GlassButton variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" type="submit" loading={submitting}>
              Publish Job
            </GlassButton>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Job Vacancy">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Job Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Location</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Description</label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_active" className="text-xs font-semibold text-slate-300">
              Active Vacancy (Visible for candidate applications)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <GlassButton variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" type="submit" loading={submitting}>
              Save Changes
            </GlassButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
