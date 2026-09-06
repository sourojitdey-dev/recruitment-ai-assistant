import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { Calendar, UserCheck, Clock, Building2, Briefcase } from 'lucide-react';

export const CandidateInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInterviews = async () => {
      setLoading(true);
      try {
        const res = await api.get('/interviews/me');
        setInterviews(res.data);
      } catch (err) {
        console.error('Error loading interviews:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Interviews</h1>
        <p className="text-sm text-slate-400">View upcoming and past technical interview appointments</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading scheduled interviews...</div>
      ) : interviews.length > 0 ? (
        <div className="space-y-4">
          {interviews.map((item) => (
            <GlassCard key={item.id} hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-indigo-500/20">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {item.job_title || `Interview #${item.id}`}
                  </h3>
                  {item.company_name && (
                    <span className="text-xs text-purple-300 font-medium">
                      • {item.company_name}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.scheduled_at).toLocaleString([], {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {item.interviewer_name && (
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <UserCheck className="w-4 h-4 text-purple-400" />
                      Interviewer: {item.interviewer_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={item.status} />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-16 space-y-3">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Interviews Scheduled</h3>
          <p className="text-sm text-slate-400">When recruiters schedule technical interviews for your applications, they will appear here.</p>
        </GlassCard>
      )}
    </div>
  );
};
