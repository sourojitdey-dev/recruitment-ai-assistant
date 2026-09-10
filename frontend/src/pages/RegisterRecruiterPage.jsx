import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { User, Mail, Lock, Building2, KeyRound, BookOpen, Heart, AlertCircle, Briefcase } from 'lucide-react';

export const RegisterRecruiterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company_name: '',
    recruiter_code: '',
    favorite_book: '',
    favorite_person: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register/recruiter', formData);
      await login(formData.email, formData.password);
      navigate('/recruiter');
    } catch (err) {
      setError(err.response?.data?.detail || 'Recruiter registration failed. Check company name or code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <GlassCard glow className="space-y-6 border-indigo-500/30">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 mb-1">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Recruiter Registration</h2>
          <p className="text-sm text-slate-400">Join your organization to manage jobs and candidates</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alice Recruiter"
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="recruiter@company.com"
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-3">
            <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Company Verification</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="company_name"
                    required
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="e.g. NexusTech"
                    className="w-full glass-input rounded-xl py-2 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Recruiter Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="recruiter_code"
                    required
                    value={formData.recruiter_code}
                    onChange={handleChange}
                    placeholder="Company security code"
                    className="w-full glass-input rounded-xl py-2 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-3">
            <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Security Questions</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Favorite Book</label>
                <input
                  type="text"
                  name="favorite_book"
                  required
                  value={formData.favorite_book}
                  onChange={handleChange}
                  placeholder="e.g. Mythical Man-Month"
                  className="w-full glass-input rounded-xl py-2 px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Favorite Person</label>
                <input
                  type="text"
                  name="favorite_person"
                  required
                  value={formData.favorite_person}
                  onChange={handleChange}
                  placeholder="e.g. Ada Lovelace"
                  className="w-full glass-input rounded-xl py-2 px-3 text-sm"
                />
              </div>
            </div>
          </div>

          <GlassButton type="submit" variant="primary" loading={loading} className="w-full">
            Register as Recruiter
          </GlassButton>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Sign In
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};
