import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Send,
  Calendar,
  Bot,
  Users,
  FolderLock,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = (user.role || 'candidate').toLowerCase();

  const candidateLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'Explore Jobs', icon: Briefcase },
    { to: '/resume', label: 'My Resume', icon: FileText },
    { to: '/applications', label: 'My Applications', icon: Send },
    { to: '/interviews', label: 'My Interviews', icon: Calendar },
    { to: '/chat', label: 'AI Career Assistant', icon: Bot, highlight: true },
  ];

  const recruiterLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/jobs', label: 'Job Postings', icon: Briefcase },
    { to: '/recruiter/applications', label: 'Applications & Review', icon: Users },
    { to: '/recruiter/interviews', label: 'Interviews & Schedules', icon: Calendar },
    { to: '/recruiter/matching', label: 'AI Candidate Matcher', icon: Sparkles, highlight: true },
    { to: '/recruiter/documents', label: 'Company Documents', icon: FolderLock },
    { to: '/chat', label: 'AI Recruiter Assistant', icon: Bot },
  ];

  const interviewerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/interviewer/interviews', label: 'My Assigned Interviews', icon: Calendar },
    { to: '/profile', label: 'My Profile', icon: UserCheck },
  ];

  let links = candidateLinks;
  if (role === 'recruiter' || role === 'admin') {
    links = recruiterLinks;
  } else if (role === 'interviewer') {
    links = interviewerLinks;
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 glass-panel rounded-2xl p-4 flex flex-col gap-1.5">
        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-purple-400/70">
          Navigation • {role}
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                } ${link.highlight && !link.isActive ? 'border border-purple-500/30 text-purple-300' : ''}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
