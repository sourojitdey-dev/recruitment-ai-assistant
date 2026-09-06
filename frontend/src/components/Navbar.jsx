import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User as UserIcon, Bot, Shield } from 'lucide-react';
import { GlassButton } from './GlassButton';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/15 bg-[#0a0b14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0d0f22] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              Recruit<span className="text-gradient">AI</span>
            </span>
            <span className="block text-[10px] text-purple-400/80 font-mono tracking-wider uppercase -mt-1">Career Intelligence</span>
          </div>
        </Link>

        {/* User Status / Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Role badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
                <Shield className="w-3 h-3 text-purple-400" />
                {user.role}
              </div>

              {/* User Greeting */}
              <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline font-medium">{user.name}</span>
              </Link>

              {/* AI Chat Shortcut */}
              <Link to="/chat">
                <GlassButton size="sm" variant="secondary" className="hidden sm:flex">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>AI Assistant</span>
                </GlassButton>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <GlassButton variant="outline" size="sm">
                  Sign In
                </GlassButton>
              </Link>
              <Link to="/register">
                <GlassButton variant="primary" size="sm">
                  Get Started
                </GlassButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
