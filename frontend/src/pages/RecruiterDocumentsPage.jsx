import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  FolderLock,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const RecruiterDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('company_policy');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents/');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a document to upload.');
      return;
    }

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', docType);

    try {
      await api.post('/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Document uploaded and automatically indexed into pgvector knowledge base!');
      setFile(null);
      loadDocs();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleReindex = async (docId) => {
    try {
      const res = await api.post(`/documents/${docId}/index`);
      setSuccess(res.data.message || 'Document re-indexed into vector chunks!');
      loadDocs();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Reindexing failed.');
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document and its corresponding vector chunks?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setSuccess('Document removed successfully.');
      loadDocs();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete document.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Approved Company Documents</h1>
        <p className="text-sm text-slate-400">
          Upload and index verified policy, FAQ, and process files for privacy-scoped RAG retrieval
        </p>
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

      {/* Upload Document Box */}
      <GlassCard glow className="border-indigo-500/30 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-400" /> Upload Company Knowledge Document
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Select File (PDF, DOCX, TXT, Markdown)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={handleFileChange}
                className="w-full glass-input rounded-xl py-2 px-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full glass-input rounded-xl py-2.5 px-3 text-sm"
              >
                <option value="company_policy">Company Policy</option>
                <option value="faq">Recruitment FAQ</option>
                <option value="process">Interview Process</option>
                <option value="general">General Knowledge</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <GlassButton type="submit" variant="primary" loading={uploading} disabled={!file}>
              <Upload className="w-4 h-4 mr-1" /> Upload & Index in PGVector
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      {/* Documents List */}
      <GlassCard className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FolderLock className="w-5 h-5 text-purple-400" />
          Indexed Knowledge Files ({documents.length})
        </h3>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading company documents...</div>
        ) : documents.length > 0 ? (
          <div className="divide-y divide-purple-500/10">
            {documents.map((doc) => (
              <div key={doc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                    <h4 className="font-bold text-white text-base">{doc.filename}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] uppercase font-semibold">
                      {doc.document_type}
                    </span>
                    <StatusBadge status={doc.indexing_status} />
                  </div>

                  {doc.extracted_text_preview && (
                    <p className="text-xs text-slate-400 line-clamp-1 italic pl-8">
                      "{doc.extracted_text_preview}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton size="sm" variant="outline" onClick={() => setSelectedDoc(doc)}>
                    View Preview
                  </GlassButton>
                  <GlassButton size="sm" variant="secondary" onClick={() => handleReindex(doc.id)}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-index
                  </GlassButton>
                  <GlassButton size="sm" variant="danger" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <FolderLock className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300">No company documents uploaded yet.</p>
          </div>
        )}
      </GlassCard>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title={`Document: ${selectedDoc.filename}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-purple-500/20">
              <span>Category: <strong className="text-purple-300">{selectedDoc.document_type}</strong></span>
              <span>Status: <strong className="text-emerald-400">{selectedDoc.indexing_status}</strong></span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {selectedDoc.extracted_text_preview || 'No extracted text available.'}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-purple-500/20">
              <GlassButton variant="outline" onClick={() => setSelectedDoc(null)}>
                Close
              </GlassButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
