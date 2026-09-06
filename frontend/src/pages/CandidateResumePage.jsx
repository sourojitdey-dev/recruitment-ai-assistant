import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

export const CandidateResumePage = () => {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resumes/');
      setResumes(res.data);
    } catch (err) {
      console.error('Error loading resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        setError('Only PDF resumes are supported. Please choose a .pdf file.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/resumes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Resume uploaded and extracted successfully!');
      setFile(null);
      loadResumes();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload resume. Ensure candidate profile is created.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const latestResume = resumes.length > 0 ? resumes[0] : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Resume Management</h1>
        <p className="text-sm text-slate-400">Upload your PDF resume for PyMuPDF text extraction and vector embedding</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Box */}
      <GlassCard glow className="border-indigo-500/30">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-400" />
          Upload New PDF Resume
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center bg-purple-950/20 hover:bg-purple-950/30 transition-colors">
            <input
              type="file"
              accept="application/pdf"
              id="resume-upload"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="resume-upload" className="cursor-pointer block space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white hover:text-indigo-300">
                  {file ? file.name : 'Click to browse or drop your PDF resume here'}
                </span>
                <p className="text-xs text-slate-400 mt-1">Accepts standard .pdf files up to 10MB</p>
              </div>
            </label>
          </div>

          <div className="flex justify-end">
            <GlassButton type="submit" variant="primary" loading={uploading} disabled={!file}>
              <Upload className="w-4 h-4 mr-1" />
              Upload & Extract Text
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      {/* Active Resume Preview */}
      {latestResume ? (
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{latestResume.filename}</h3>
                  <p className="text-xs text-slate-400">Extracted and indexed in vector store</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(latestResume.extracted_text || '')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            {/* Extracted Text Viewer */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Extracted Text Content
              </label>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {latestResume.extracted_text || 'No text extracted from PDF.'}
              </div>
            </div>
          </GlassCard>
        </div>
      ) : loading ? (
        <div className="text-center py-8 text-slate-400">Loading resume status...</div>
      ) : (
        <GlassCard className="text-center py-10 space-y-2 text-slate-400">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-300">No resume uploaded yet. Upload a PDF above to get started.</p>
        </GlassCard>
      )}
    </div>
  );
};
