let ws = null;
let currentSessionId = null;

const messagesContainer = document.getElementById("messages-container");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const statusText = document.getElementById("status-text");
const statusBadge = document.getElementById("connection-status");
const jwtInput = document.getElementById("jwt-token");
const authBtn = document.getElementById("auth-btn");

function initWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    statusText.innerText = "Connected";
    statusBadge.style.background = "rgba(16, 185, 129, 0.15)";
    statusBadge.style.color = "#34d399";
    const token = localStorage.getItem("access_token") || jwtInput.value.trim();
    if (token) {
      jwtInput.value = token;
      ws.send(JSON.stringify({ type: "auth", token: token }));
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "auth_success") {
        statusText.innerText = data.message;
      } else if (data.type === "status" && data.status === "thinking") {
        showThinkingIndicator();
      } else if (data.type === "answer") {
        removeThinkingIndicator();
        currentSessionId = data.session_id;
        appendAssistantMessage(data.answer, data.sources, data.advisory_disclaimer);
      } else if (data.type === "system") {
        if (data.authenticated) {
          statusText.innerText = `Connected (${data.user_name})`;
        }
      }
    } catch (e) {
      console.error("Error parsing WS message:", e);
    }
  };

  ws.onclose = () => {
    statusText.innerText = "Disconnected. Reconnecting...";
    statusBadge.style.background = "rgba(239, 68, 68, 0.15)";
    statusBadge.style.color = "#f87171";
    setTimeout(initWebSocket, 3000);
  };
}

function showThinkingIndicator() {
  removeThinkingIndicator();
  const indicator = document.createElement("div");
  indicator.id = "thinking-bubble";
  indicator.className = "message assistant";
  indicator.innerHTML = `<div class="message-bubble" style="color: #a855f7;">AI is searching authorized documents and analyzing...</div>`;
  messagesContainer.appendChild(indicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeThinkingIndicator() {
  const el = document.getElementById("thinking-bubble");
  if (el) el.remove();
}

function appendUserMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message user";
  msg.innerHTML = `<div class="message-bubble">${escapeHtml(text)}</div>`;
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendAssistantMessage(answer, sources, disclaimer) {
  const msg = document.createElement("div");
  msg.className = "message assistant";

  let sourcesHtml = "";
  if (sources && sources.length > 0) {
    sourcesHtml = `<div class="sources-box"><strong>Sources Referenced:</strong><ul style="margin-top:4px; padding-left:16px;">`;
    sources.forEach((s) => {
      sourcesHtml += `<li>${escapeHtml(s.title || "Document")} (${escapeHtml(s.source_type || "text")})</li>`;
    });
    sourcesHtml += `</ul></div>`;
  }

  let disclaimerHtml = "";
  if (disclaimer) {
    disclaimerHtml = `<div class="disclaimer-box">${escapeHtml(disclaimer)}</div>`;
  }

  msg.innerHTML = `
    <div class="message-bubble">${escapeHtml(answer)}</div>
    ${sourcesHtml}
    ${disclaimerHtml}
  `;

  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;

  appendUserMessage(text);
  userInput.value = "";

  ws.send(JSON.stringify({
    message: text,
    session_id: currentSessionId,
  }));
});

authBtn.addEventListener("click", () => {
  const token = jwtInput.value.trim();
  if (token && ws && ws.readyState === WebSocket.OPEN) {
    localStorage.setItem("access_token", token);
    ws.send(JSON.stringify({ type: "auth", token: token }));
  }
});

function sendSuggested(prompt) {
  userInput.value = prompt;
  chatForm.dispatchEvent(new Event("submit"));
}

window.addEventListener("DOMContentLoaded", () => {
  initWebSocket();
});
