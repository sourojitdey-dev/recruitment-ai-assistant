import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import {
  Bot,
  Send,
  Sparkles,
  Plus,
  Trash2,
  BookOpen,
  User,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const AICareerAssistantPage = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const initialPrompt = location.state?.prompt;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat sessions
  const loadSessions = async () => {
    try {
      const res = await api.get('/chat/sessions');
      setSessions(res.data);
      if (res.data.length > 0 && !currentSessionId) {
        setCurrentSessionId(res.data[0].id);
        setMessages(res.data[0].messages || []);
      }
    } catch (err) {
      console.error('Error loading chat sessions:', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Handle incoming initial prompt from router state
  useEffect(() => {
    if (initialPrompt && !loading) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  // Establish WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat${token ? `?token=${token}` : ''}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setSocketConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'answer') {
          setLoading(false);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              role: 'assistant',
              content: data.answer,
              sources: data.sources,
            },
          ]);
          setCurrentSessionId(data.session_id);
          loadSessions();
        } else if (data.type === 'status' && data.status === 'thinking') {
          setLoading(true);
        }
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    };

    ws.onclose = () => {
      setSocketConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [token]);

  const selectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    try {
      const res = await api.get(`/chat/sessions/${sessionId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
      loadSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      sources: null,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Try sending over WebSocket first
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          message: text,
          session_id: currentSessionId,
        })
      );
    } else {
      // Fallback to REST API
      try {
        const res = await api.post('/chat/', {
          message: text,
          session_id: currentSessionId,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: res.data.answer,
            sources: res.data.sources,
          },
        ]);
        setCurrentSessionId(res.data.session_id);
        loadSessions();
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: 'Could not connect to AI service. Please try again.',
            sources: null,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const suggestedPrompts = [
    'How can I improve my resume for Senior Backend roles?',
    'What jobs in the database fit my skills?',
    'Help me prepare for a Python & FastAPI interview.',
    'What skills are missing from my resume for ML positions?',
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Sessions Sidebar */}
      <GlassCard className="w-full lg:w-72 p-4 flex flex-col justify-between shrink-0 h-48 lg:h-full">
        <div className="space-y-4 overflow-hidden flex flex-col flex-1">
          <GlassButton
            onClick={handleNewChat}
            variant="primary"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <Plus className="w-4 h-4" /> New Conversation
          </GlassButton>

          <div className="text-[11px] font-mono text-purple-400/80 uppercase tracking-wider px-2">
            History ({sessions.length})
          </div>

          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  currentSessionId === s.id
                    ? 'bg-purple-600/30 border border-purple-500/40 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className="truncate pr-2 font-medium">{s.title}</span>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-slate-400">
          <span>Status:</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            {socketConnected ? 'Real-time WS' : 'REST Mode'}
          </span>
        </div>
      </GlassCard>

      {/* Main Chat Panel */}
      <GlassCard className="flex-1 p-0 flex flex-col overflow-hidden border-purple-500/25">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Career & Recruitment Assistant</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Grounded career guidance, resume improvements, skill gap analysis, and mock interview preparations based strictly on authorized database documents.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-4">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setInput(p);
                    }}
                    className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-slate-300 hover:text-white hover:bg-purple-900/40 text-left transition-colors"
                  >
                    💡 {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${
                      isUser
                        ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                        : 'bg-purple-950 border border-purple-500/40 text-purple-300'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white rounded-tr-none shadow-md'
                          : 'bg-slate-900/80 border border-purple-500/20 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* Sources Box if Present */}
                    {!isUser && m.sources && m.sources.length > 0 && (
                      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-slate-400 space-y-1">
                        <div className="font-semibold text-purple-300 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> Verified Sources:
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                          {m.sources.map((s, idx) => (
                            <li key={idx}>
                              <span className="font-medium text-slate-200">{s.title || 'Document'}</span> ({s.source_type})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-md animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 text-xs text-purple-300 rounded-tl-none flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Searching vector store & analyzing with AI...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/60 border-t border-purple-500/20 space-y-2">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder="Ask about resume improvements, skill gaps, or interview questions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 glass-input rounded-xl py-3 px-4 text-sm"
              disabled={loading}
            />
            <GlassButton type="submit" variant="primary" disabled={!input.trim() || loading}>
              <Send className="w-4 h-4" />
            </GlassButton>
          </form>

          <div className="text-center text-[11px] text-slate-500">
            Advisory Notice: Responses are AI-assisted guidance based on platform documents and do not represent automated hiring decisions.
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
