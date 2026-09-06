import React from 'react';

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase();

  const styles = {
    applied: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    screening: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    shortlisted: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    scheduled: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    hired: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.2)]',
    rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    cancelled: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    indexed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };

  const style = styles[norm] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {status}
    </span>
  );
};
