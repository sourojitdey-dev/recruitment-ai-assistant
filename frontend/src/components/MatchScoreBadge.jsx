import React from 'react';

export const MatchScoreBadge = ({ score, size = 'md' }) => {
  const numScore = parseFloat(score) || 0;

  let colorClass = 'text-indigo-400 border-indigo-500/30 bg-indigo-950/40';
  let glowClass = '';

  if (numScore >= 85) {
    colorClass = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40 shadow-[0_0_15px_rgba(52,211,153,0.25)]';
  } else if (numScore >= 70) {
    colorClass = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]';
  } else if (numScore >= 50) {
    colorClass = 'text-amber-400 border-amber-500/40 bg-amber-950/40';
  } else {
    colorClass = 'text-slate-400 border-slate-700 bg-slate-900/50';
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1 font-bold',
    lg: 'text-lg px-4 py-1.5 font-extrabold',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-xl border ${colorClass} ${sizes[size]}`}>
      <svg className="w-3.5 h-3.5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span>{numScore}% Match</span>
    </div>
  );
};
