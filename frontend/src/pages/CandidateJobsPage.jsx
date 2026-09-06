import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Modal } from '../components/Modal';
import { Search, MapPin, Building2, Briefcase, CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';

export const CandidateJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState({});
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes, matchesRes] = await Promise.allSettled([
        api.get('/jobs/'),
        api.get('/applications/me'),
        api.get('/match/candidate/jobs'),
      ]);

      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data);
      if (appsRes.status === 'fulfilled') {
        const applied = new Set(appsRes.value.data.map((a) => a.job_id));
        setAppliedJobIds(applied);
      }
      if (matchesRes.status === 'fulfilled') {
        const matchMap = {};
        matchesRes.value.data.forEach((m) => {
          matchMap[m.job_id] = m;
        });
        setMatches(matchMap);
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetails = async (job) => {
    setSelectedJob(job);
    const existingMatch = matches[job.id];
    if (existingMatch) {
      setSelectedMatch(existingMatch);
    } else {
      setSelectedMatch(null);
    }
  };

  const handleApply = async (jobId) => {
    setApplying(true);
    try {
      await api.post('/applications/', { job_id: jobId });
      setAppliedJobIds((prev) => new Set([...prev, jobId]));
      setToastMessage('Application submitted successfully!');
      setTimeout(() => setToastMessage(''), 4000);
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(null);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Explore Job Opportunities</h1>
          <p className="text-sm text-slate-400">Discover active positions with AI-powered candidate-job compatibility</p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by job title, skill keywords, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Filter by location (e.g. Remote)..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
        </div>
      </GlassCard>

      {/* Job Cards List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading active opportunities...</div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const matchInfo = matches[job.id];
            const isApplied = appliedJobIds.has(job.id);

            return (
              <GlassCard key={job.id} hover className="flex flex-col justify-between space-y-4 border-purple-500/20">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-white hover:text-purple-300 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-purple-300 font-medium flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {job.company_name}
                      </p>
                    </div>
                    {matchInfo && <MatchScoreBadge score={matchInfo.match_percentage} size="sm" />}
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {job.location}
                  </p>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  {matchInfo?.breakdown?.strong_matches && matchInfo.breakdown.strong_matches.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {matchInfo.breakdown.strong_matches.slice(0, 4).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                          ✓ {skill}
                        </span>
                      ))}
                      {matchInfo.breakdown.potential_gaps?.slice(0, 2).map((gap) => (
                        <span key={gap} className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]">
                          △ {gap}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-purple-500/15">
                  <GlassButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDetails(job)}
                  >
                    View Details
                  </GlassButton>

                  {isApplied ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                    </span>
                  ) : (
                    <GlassButton
                      size="sm"
                      variant="primary"
                      onClick={() => handleApply(job.id)}
                      loading={applying}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Apply Now
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard className="text-center py-16 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Jobs Found</h3>
          <p className="text-sm text-slate-400">Try adjusting your search keywords or location filters.</p>
        </GlassCard>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-500/20">
              <div>
                <p className="text-base font-semibold text-purple-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> {selectedJob.company_name}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {selectedJob.location}
                </p>
              </div>

              {selectedMatch && <MatchScoreBadge score={selectedMatch.match_percentage} size="lg" />}
            </div>

            {/* Match Breakdown Section */}
            {selectedMatch && (
              <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  AI Compatibility Analysis
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedMatch.explanation}
                </p>

                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Strong Matches</span>
                    <div className="text-xs text-slate-200">
                      {selectedMatch.breakdown?.strong_matches?.length > 0
                        ? selectedMatch.breakdown.strong_matches.join(', ')
                        : 'None explicitly listed'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">Partial Matches</span>
                    <div className="text-xs text-slate-200">
                      {selectedMatch.breakdown?.partial_matches?.length > 0
                        ? selectedMatch.breakdown.partial_matches.join(', ')
                        : 'None'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Potential Gaps</span>
                    <div className="text-xs text-slate-200">
                      {selectedMatch.breakdown?.potential_gaps?.length > 0
                        ? selectedMatch.breakdown.potential_gaps.join(', ')
                        : 'Comprehensive coverage'}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 italic pt-1">
                  * Note: AI match scores are advisory suggestions and do not guarantee hiring decisions.
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Job Description & Responsibilities</h4>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedJob.description}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-500/20">
              <GlassButton variant="outline" onClick={() => setSelectedJob(null)}>
                Close
              </GlassButton>

              {appliedJobIds.has(selectedJob.id) ? (
                <span className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> You have already applied
                </span>
              ) : (
                <GlassButton
                  variant="primary"
                  onClick={() => handleApply(selectedJob.id)}
                  loading={applying}
                >
                  <Send className="w-4 h-4 mr-1" /> Submit Application
                </GlassButton>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
