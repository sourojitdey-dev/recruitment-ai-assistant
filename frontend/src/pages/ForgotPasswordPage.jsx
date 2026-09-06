import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Mail, Lock, BookOpen, Heart, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    favorite_book: '',
    favorite_person: '',
    new_password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Password reset failed. Please check your answers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <GlassCard glow className="space-y-6 border-purple-500/30">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-purple-600/20 text-purple-400 mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-sm text-slate-400">Verify your security answers to set a new password</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center py-4">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Password Reset Successful!</h3>
            <p className="text-sm text-slate-300">Your password has been updated. You can now log in with your new credentials.</p>
            <Link to="/login" className="block pt-2">
              <GlassButton variant="primary" className="w-full">
                Proceed to Sign In
              </GlassButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Favorite Book</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="favorite_book"
                  required
                  value={formData.favorite_book}
                  onChange={handleChange}
                  placeholder="Your security answer"
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Favorite Person / Role Model</label>
              <div className="relative">
                <Heart className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="favorite_person"
                  required
                  value={formData.favorite_person}
                  onChange={handleChange}
                  placeholder="Your security answer"
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="new_password"
                  required
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            <GlassButton type="submit" variant="primary" loading={loading} className="w-full">
              Reset Password
            </GlassButton>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-purple-500/15">
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold underline">
            Back to Sign In
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};
