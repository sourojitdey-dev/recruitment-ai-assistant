import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import {
  User,
  Mail,
  Building2,
  Shield,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [formData, setFormData] = useState({ phone: '', location: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.role === 'candidate') {
        try {
          const res = await api.get('/candidates/me');
          setCandidateProfile(res.data);
          setFormData({
            phone: res.data.phone || '',
            location: res.data.location || '',
            bio: res.data.bio || '',
          });
        } catch (err) {
          // Profile not yet created
          setCandidateProfile(null);
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleSaveCandidateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (candidateProfile) {
        const res = await api.put('/candidates/me', formData);
        setCandidateProfile(res.data);
      } else {
        const res = await api.post('/candidates/', formData);
        setCandidateProfile(res.data);
      }
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-400">View and update your personal and role configuration</p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Account Info */}
      <GlassCard className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-purple-500/20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3 h-3 text-purple-400" />
              Role: {user?.role}
            </div>
          </div>
        </div>

        {user?.company_id && (
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Associated Organization</p>
              <p className="text-sm font-bold text-white">Company ID #{user.company_id}</p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Candidate Profile Details */}
      {user?.role === 'candidate' && (
        <GlassCard glow className="border-purple-500/30 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Candidate Experience & Contact Details
          </h3>

          <form onSubmit={handleSaveCandidateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA / Remote"
                    className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Professional Bio & Core Competencies
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Summary of engineering experience, preferred technologies, and career goals..."
                className="w-full glass-input rounded-xl py-2.5 px-4 text-sm"
              />
            </div>

            <div className="flex justify-end">
              <GlassButton type="submit" variant="primary" loading={saving}>
                Save Profile
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}
    </div>
  );
};
