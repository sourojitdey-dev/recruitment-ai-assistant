import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { User, Mail, Lock, BookOpen, Heart, AlertCircle, Sparkles } from 'lucide-react';

export const RegisterCandidatePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    favorite_book: '',
    favorite_person: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      navigate('/login?registered=candidate');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <GlassCard glow className="space-y-6 border-purple-500/30">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 mb-1">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Candidate Registration</h2>
          <p className="text-sm text-slate-400">Create your profile to explore AI-matched jobs</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="e.g. Sagnik Saha"
                className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
              />
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
                placeholder="Create strong password"
                className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-3">
            <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Security Questions (For Password Recovery)
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Favorite Book</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="favorite_book"
                  required
                  value={formData.favorite_book}
                  onChange={handleChange}
                  placeholder="e.g. Clean Code"
                  className="w-full glass-input rounded-xl py-2 pl-10 pr-4 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Favorite Person / Role Model</label>
              <div className="relative">
                <Heart className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="favorite_person"
                  required
                  value={formData.favorite_person}
                  onChange={handleChange}
                  placeholder="e.g. Alan Turing"
                  className="w-full glass-input rounded-xl py-2 pl-10 pr-4 text-sm"
                />
              </div>
            </div>
          </div>

          <GlassButton type="submit" variant="primary" loading={loading} className="w-full">
            Register as Candidate
          </GlassButton>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold underline">
            Sign In
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};
