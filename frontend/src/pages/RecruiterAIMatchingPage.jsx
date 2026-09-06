import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Modal } from '../components/Modal';
import {
  Sparkles,
  Briefcase,
  User,
  Calendar,
  CheckCircle2,
  Mail,
  Send,
  AlertCircle,
} from 'lucide-react';

export const RecruiterAIMatchingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [matching, setMatching] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await api.get('/jobs/company/me');
        setJobs(res.data);
        if (res.data.length > 0) {
          setSelectedJobId(String(res.data[0].id));
        }
      } catch (err) {
        console.error('Failed to load company jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobs();
  }, []);

  const handleRunMatch = async () => {
    if (!selectedJobId) return;
    setMatching(true);
    try {
      const res = await api.get(`/match/job/${selectedJobId}/candidates`);
      setCandidates(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to compute candidate matches.');
    } finally {
      setMatching(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      handleRunMatch();
    }
  }, [selectedJobId]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">AI Candidate Matcher</h1>
        <p className="text-sm text-slate-400">
          Rank candidates using 384-dimensional vector similarity against company job descriptions
        </p>
      </div>

      {/* Job Selector Box */}
      <GlassCard glow className="p-6 border-purple-500/30">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1 max-w-xl space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Company Opening
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full glass-input rounded-xl py-3 px-4 text-sm"
              disabled={loadingJobs}
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.location})
                </option>
              ))}
            </select>
          </div>

          <GlassButton variant="primary" onClick={handleRunMatch} loading={matching}>
            <Sparkles className="w-4 h-4 mr-1" /> Recompute Matches
          </GlassButton>
        </div>
      </GlassCard>

      {/* Candidate Matches Ranked List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Ranked Candidates ({candidates.length})
        </h3>

        {matching ? (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <Sparkles className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
            <p className="text-sm">Calculating cosine similarities and extracting skill gaps...</p>
          </div>
        ) : candidates.length > 0 ? (
          <div className="space-y-4">
            {candidates.map((cand, idx) => (
              <GlassCard key={cand.candidate_id} hover className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-indigo-500/20">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        {cand.candidate_name}
                        {cand.has_applied && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold">
                            Applied
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {cand.candidate_email}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed pl-11">
                    {cand.explanation}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pl-11">
                    {cand.breakdown?.strong_matches?.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                        ✓ {s}
                      </span>
                    ))}
                    {cand.breakdown?.potential_gaps?.slice(0, 2).map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]">
                        △ {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-11 md:pl-0">
                  <MatchScoreBadge score={cand.match_percentage} size="md" />
                  <GlassButton size="sm" variant="outline" onClick={() => setSelectedCandidate(cand)}>
                    View Breakdown
                  </GlassButton>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="text-center py-16 space-y-3">
            <User className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Candidate Matches</h3>
            <p className="text-sm text-slate-400">Select a job above or ensure candidates have uploaded resumes to compute matches.</p>
          </GlassCard>
        )}
      </div>

      {/* Candidate Breakdown Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title={`Match Analysis • ${selectedCandidate.candidate_name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <div>
                <h4 className="text-lg font-bold text-white">{selectedCandidate.candidate_name}</h4>
                <p className="text-xs text-slate-400">{selectedCandidate.candidate_email}</p>
              </div>
              <MatchScoreBadge score={selectedCandidate.match_percentage} size="lg" />
            </div>

            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Grounded Explanation
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{selectedCandidate.explanation}</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Strong Matches</span>
                <div className="text-xs text-slate-200">
                  {selectedCandidate.breakdown?.strong_matches?.length > 0
                    ? selectedCandidate.breakdown.strong_matches.join(', ')
                    : 'None'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">Partial Matches</span>
                <div className="text-xs text-slate-200">
                  {selectedCandidate.breakdown?.partial_matches?.length > 0
                    ? selectedCandidate.breakdown.partial_matches.join(', ')
                    : 'None'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Potential Gaps</span>
                <div className="text-xs text-slate-200">
                  {selectedCandidate.breakdown?.potential_gaps?.length > 0
                    ? selectedCandidate.breakdown.potential_gaps.join(', ')
                    : 'None'}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 italic">
              {selectedCandidate.advisory_disclaimer}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-purple-500/20">
              <GlassButton variant="outline" onClick={() => setSelectedCandidate(null)}>
                Close
              </GlassButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
