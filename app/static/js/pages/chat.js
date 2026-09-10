/* ==========================================================================
   Recruitment AI Assistant - Real-Time AI Career Chat View
   ========================================================================== */

import { api } from '../api.js';
import { auth } from '../auth.js';
import { Icons } from '../icons.js';
import { showToast } from '../components.js';

export function renderChatPage() {
  return `
    <div class="chat-container">
      <!-- Sessions Sidebar -->
      <div class="glass-card chat-sessions-sidebar">
        <div style="display: flex; flex-direction: column; gap: 1rem; overflow: hidden; flex: 1;">
          <button id="chat-new-btn" class="glass-btn glass-btn-primary glass-btn-sm" style="width: 100%; justify-content: flex-start;">
            ${Icons.Plus('w-4 h-4')} New Conversation
          </button>

          <div style="font-size: 0.68rem; font-family: var(--font-mono); color: rgba(192, 132, 252, 0.7); text-transform: uppercase; letter-spacing: 0.08em; padding: 0 0.5rem;">
            Conversation History
          </div>

          <div id="chat-sessions-list" style="overflow-y: auto; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; padding-right: 0.25rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem;">Loading sessions...</div>
          </div>
        </div>

        <div style="padding-top: 0.75rem; border-top: 1px solid rgba(139, 92, 246, 0.15); display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--text-muted);">
          <span>Protocol:</span>
          <span id="chat-conn-status" style="display: flex; align-items: center; gap: 0.35rem; color: #34d399; font-weight: 700;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #34d399; display: inline-block;"></span>
            Connecting...
          </span>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="glass-card chat-main-area">
        <!-- Messages Feed -->
        <div id="chat-messages-container" class="chat-messages-scroll">
          <div id="chat-empty-state" style="margin: auto; max-width: 520px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem;">
            <div style="width: 56px; height: 56px; border-radius: 18px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);">
              ${Icons.Bot('w-8 h-8')}
            </div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #ffffff;">AI Career & Recruitment Assistant</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              Grounded career guidance, resume improvements, skill gap analysis, and mock interview preparations based strictly on authorized database documents.
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; width: 100%; margin-top: 0.5rem;">
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                💡 "How can I improve my resume for Senior Backend roles?"
              </button>
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                🎯 "What jobs in the database fit my skills?"
              </button>
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                ⚡ "Help me prepare for a Python & FastAPI interview."
              </button>
              <button class="chat-prompt-chip glass-card" style="padding: 0.75rem; font-size: 0.75rem; text-align: left; cursor: pointer; color: var(--text-primary); border-color: rgba(168, 85, 247, 0.2);">
                🔍 "What skills are missing from my resume for ML positions?"
              </button>
            </div>
          </div>
        </div>

        <!-- Input Bar -->
        <div style="padding: 1rem 1.5rem; background: rgba(10, 11, 20, 0.85); border-top: 1px solid rgba(139, 92, 246, 0.15); display: flex; flex-direction: column; gap: 0.5rem;">
          <form id="chat-input-form" style="display: flex; gap: 0.75rem;">
            <input
              type="text"
              id="chat-input-field"
              placeholder="Ask about resume improvements, skill gaps, or interview questions..."
              class="glass-input"
              style="padding: 0.85rem 1.25rem; font-size: 0.9rem;"
              autocomplete="off"
            />
            <button type="submit" id="chat-send-btn" class="glass-btn glass-btn-primary" style="padding: 0.85rem 1.5rem;">
              ${Icons.Send('w-5 h-5')}
            </button>
          </form>

          <div style="text-align: center; font-size: 0.7rem; color: var(--text-muted);">
            Advisory Notice: Responses are AI-assisted guidance based on verified company documents and do not represent automated hiring decisions.
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initChatPage() {
  const container = document.getElementById('chat-messages-container');
  const emptyState = document.getElementById('chat-empty-state');
  const form = document.getElementById('chat-input-form');
  const input = document.getElementById('chat-input-field');
  const sendBtn = document.getElementById('chat-send-btn');
  const sessionsList = document.getElementById('chat-sessions-list');
  const newBtn = document.getElementById('chat-new-btn');
  const statusEl = document.getElementById('chat-conn-status');

  let currentSessionId = null;
  let chatSessions = [];
  let currentMessages = [];
  let isThinking = false;
  let ws = null;

  // Handle incoming query params (e.g. #/chat?prompt=...)
  const hashParts = window.location.hash.split('?');
  if (hashParts.length > 1) {
    const params = new URLSearchParams(hashParts[1]);
    const initPrompt = params.get('prompt');
    if (initPrompt && input) {
      input.value = initPrompt;
    }
  }

  // Setup WebSocket connection
  const token = auth.getToken();
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/chat${token ? `?token=${token}` : ''}`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (statusEl) {
        statusEl.innerHTML = `
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #34d399; display: inline-block;"></span>
          Real-time WS
        `;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'answer') {
          hideThinking();
          addMessage({
            role: 'assistant',
            content: data.answer,
            sources: data.sources,
          });
          currentSessionId = data.session_id;
          loadSessions();
        } else if (data.type === 'status' && data.status === 'thinking') {
          showThinking();
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.onerror = () => {
      if (statusEl) {
        statusEl.innerHTML = `
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
          REST Mode
        `;
      }
    };

    ws.onclose = () => {
      if (statusEl) {
        statusEl.innerHTML = `
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; display: inline-block;"></span>
          REST Mode
        `;
      }
    };
  } catch {
    if (statusEl) statusEl.textContent = 'REST Mode';
  }

  async function loadSessions() {
    try {
      chatSessions = await api.get('/chat/sessions');
      if (sessionsList) {
        if (chatSessions.length === 0) {
          sessionsList.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); padding: 0.5rem;">No conversations yet</div>`;
          return;
        }

        sessionsList.innerHTML = chatSessions
          .map(
            (s) => `
          <div class="chat-session-item" data-id="${s.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.75rem; border-radius: 10px; font-size: 0.78rem; cursor: pointer; transition: all 0.2s; background: ${
              currentSessionId === s.id ? 'rgba(168, 85, 247, 0.25)' : 'transparent'
            }; color: ${currentSessionId === s.id ? '#ffffff' : 'var(--text-secondary)'}; border: 1px solid ${
              currentSessionId === s.id ? 'rgba(168, 85, 247, 0.4)' : 'transparent'
            };">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; max-width: 170px;">
              ${s.title}
            </span>
            <button class="btn-del-session" data-id="${s.id}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;" title="Delete">
              ${Icons.Trash2('w-3.5 h-3.5')}
            </button>
          </div>
        `
          )
          .join('');

        sessionsList.querySelectorAll('.chat-session-item').forEach((item) => {
          item.addEventListener('click', () => {
            const sid = item.dataset.id;
            if (sid) selectSession(sid);
          });
        });

        sessionsList.querySelectorAll('.btn-del-session').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const sid = btn.dataset.id;
            if (!sid) return;
            try {
              await api.delete(`/chat/sessions/${sid}`);
              if (currentSessionId === sid) {
                newChat();
              }
              showToast('Conversation deleted');
              loadSessions();
            } catch (err) {
              showToast('Failed to delete session', 'error');
            }
          });
        });
      }
    } catch (err) {
      console.error('Error loading chat sessions:', err);
    }
  }

  async function selectSession(sessionId) {
    if (!sessionId) return;
    currentSessionId = String(sessionId);
    loadSessions();
    try {
      const session = await api.get(`/chat/sessions/${sessionId}`);
      currentMessages = session.messages || [];
      renderMessagesFeed();
    } catch (err) {
      console.error('Failed to load session messages:', err);
      showToast('Failed to load conversation history', 'error');
    }
  }

  function newChat() {
    currentSessionId = null;
    currentMessages = [];
    renderMessagesFeed();
    loadSessions();
  }

  newBtn?.addEventListener('click', newChat);

  function renderMessagesFeed() {
    if (currentMessages.length === 0) {
      container.innerHTML = '';
      if (emptyState) container.appendChild(emptyState);
      wirePromptChips();
      return;
    }

    container.innerHTML = currentMessages
      .map((m) => {
        const isUser = m.role === 'user';
        return `
        <div style="display: flex; gap: 0.75rem; max-width: 900px; width: 100%; ${isUser ? 'margin-left: auto; flex-direction: row-reverse;' : 'margin-right: auto;'}">
          <div style="width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; ${
            isUser
              ? 'background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff;'
              : 'background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc;'
          }">
            ${isUser ? Icons.User('w-4 h-4') : Icons.Bot('w-4 h-4')}
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 85%;">
            <div class="${isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}">
              ${isUser ? `<div style="white-space: pre-wrap;">${escapeHtml(m.content)}</div>` : formatChatMarkdown(m.content)}
            </div>

            ${!isUser ? renderSourcesBadges(m.sources) : ''}
          </div>
        </div>
      `;
      })
      .join('');

    scrollToBottom();
  }

  function addMessage(msg) {
    currentMessages.push(msg);
    renderMessagesFeed();
  }

  function showThinking() {
    if (isThinking) return;
    isThinking = true;
    const thinkingEl = document.createElement('div');
    thinkingEl.id = 'chat-thinking-indicator';
    thinkingEl.style.cssText = 'display: flex; gap: 0.75rem; margin-right: auto; max-width: 500px;';
    thinkingEl.innerHTML = `
      <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc; display: flex; align-items: center; justify-content: center;">
        ${Icons.Bot('w-4 h-4')}
      </div>
      <div class="chat-bubble-bot animate-pulse" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #c084fc;">
        <span class="animate-spin" style="display:inline-block;">⚡</span>
        <span>Searching vector knowledge base & generating response...</span>
      </div>
    `;
    container.appendChild(thinkingEl);
    scrollToBottom();
  }

  function hideThinking() {
    isThinking = false;
    document.getElementById('chat-thinking-indicator')?.remove();
  }

  function scrollToBottom() {
    container.scrollTop = container.scrollHeight;
  }

  function wirePromptChips() {
    document.querySelectorAll('.chat-prompt-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const text = chip.textContent.replace(/^[\s💡🎯⚡🔍"']+|["'\s]+$/g, '').trim();
        if (input) {
          input.value = text;
          form.dispatchEvent(new Event('submit'));
        }
      });
    });
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = (input?.value || '').trim();
    if (!text) return;

    input.value = '';
    addMessage({ role: 'user', content: text });
    showThinking();

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          message: text,
          session_id: currentSessionId,
        })
      );
    } else {
      // REST Fallback
      try {
        const res = await api.post('/chat/', {
          message: text,
          session_id: currentSessionId,
        });
        hideThinking();
        addMessage({
          role: 'assistant',
          content: res.answer,
          sources: res.sources,
        });
        currentSessionId = res.session_id;
        loadSessions();
      } catch (err) {
        hideThinking();
        addMessage({
          role: 'assistant',
          content: 'Could not connect to AI service. Please verify server status.',
        });
      }
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function inlineFormat(str) {
    if (!str) return '';
    return escapeHtml(str)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>');
  }

  function renderSourcesBadges(sources) {
    if (!sources || sources.length === 0) return '';
    const seen = new Set();
    const unique = [];
    for (const s of sources) {
      const key = `${s.title}_${s.source_type}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(s);
      }
    }
    if (unique.length === 0) return '';

    return `
      <div class="chat-sources-box">
        <div style="font-weight: 700; color: #c084fc; display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.45rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
          ${Icons.BookOpen('w-3.5 h-3.5')} Verified Sources Grounded
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
          ${unique
            .map(
              (s) => `
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.6rem; border-radius: 8px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); font-size: 0.72rem; color: #e0e7ff;">
              <strong style="color: #ffffff;">${escapeHtml(s.title || 'Document')}</strong>
              <span style="opacity: 0.7; font-size: 0.68rem; text-transform: capitalize;">(${escapeHtml(s.source_type || 'doc')})</span>
            </span>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  function formatChatMarkdown(text) {
    if (!text) return '';

    // Extract and preserve code blocks
    const codeBlocks = [];
    let temp = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const idx = codeBlocks.length;
      codeBlocks.push(`<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`);
      return `__CODE_BLOCK_${idx}__`;
    });

    const lines = temp.split('\n');
    const processedLines = [];
    let inTable = false;
    let tableHeader = [];
    let tableRows = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        // Check if separator row
        if (cells.every((c) => /^:?-+:?$/.test(c))) {
          continue;
        }
        if (!inTable) {
          inTable = true;
          tableHeader = cells;
          tableRows = [];
        } else {
          tableRows.push(cells);
        }
      } else {
        if (inTable) {
          let tableHtml = `<div class="chat-table-wrapper"><table class="chat-markdown-table"><thead><tr>`;
          tableHeader.forEach((th) => {
            tableHtml += `<th>${inlineFormat(th)}</th>`;
          });
          tableHtml += `</tr></thead><tbody>`;
          tableRows.forEach((row) => {
            tableHtml += `<tr>`;
            row.forEach((td) => {
              tableHtml += `<td>${inlineFormat(td)}</td>`;
            });
            tableHtml += `</tr>`;
          });
          tableHtml += `</tbody></table></div>`;
          processedLines.push(tableHtml);
          inTable = false;
        }
        processedLines.push(line);
      }
    }

    if (inTable) {
      let tableHtml = `<div class="chat-table-wrapper"><table class="chat-markdown-table"><thead><tr>`;
      tableHeader.forEach((th) => {
        tableHtml += `<th>${inlineFormat(th)}</th>`;
      });
      tableHtml += `</tr></thead><tbody>`;
      tableRows.forEach((row) => {
        tableHtml += `<tr>`;
        row.forEach((td) => {
          tableHtml += `<td>${inlineFormat(td)}</td>`;
        });
        tableHtml += `</tr>`;
      });
      tableHtml += `</tbody></table></div>`;
      processedLines.push(tableHtml);
    }

    let result = [];
    let inList = false;
    let listType = 'ul';

    for (let line of processedLines) {
      if (line.startsWith('__CODE_BLOCK_')) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        const match = line.match(/__CODE_BLOCK_(\d+)__/);
        if (match) {
          result.push(codeBlocks[parseInt(match[1])]);
        }
        continue;
      }

      if (line.startsWith('<div class="chat-table-wrapper"')) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(line);
        continue;
      }

      if (line.startsWith('#### ')) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(`<h4>${inlineFormat(line.slice(5))}</h4>`);
      } else if (line.startsWith('### ')) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
      } else if (line.startsWith('## ')) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
      } else if (line.startsWith('# ')) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(`<h1>${inlineFormat(line.slice(2))}</h1>`);
      } else if (/^[-*•]\s+/.test(line)) {
        if (!inList || listType !== 'ul') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        result.push(`<li>${inlineFormat(line.replace(/^[-*•]\s+/, ''))}</li>`);
      } else if (/^\d+\.\s+/.test(line)) {
        if (!inList || listType !== 'ol') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        result.push(`<li>${inlineFormat(line.replace(/^\d+\.\s+/, ''))}</li>`);
      } else if (line.startsWith('> ')) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
      } else if (line.trim() === '') {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
      } else {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(`<p>${inlineFormat(line)}</p>`);
      }
    }

    if (inList) {
      result.push(`</${listType}>`);
    }

    return `<div class="chat-markdown">${result.join('')}</div>`;
  }

  loadSessions();
  wirePromptChips();
}
