const API = "/api/v1";

// ===== VIEW SWITCHING =====
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");

function showView(viewName) {
  views.forEach((v) => v.classList.remove("active"));
  navItems.forEach((n) => n.classList.remove("active"));
  document.getElementById(`view-${viewName}`).classList.add("active");
  document.querySelector(`[data-view="${viewName}"]`).classList.add("active");

  if (viewName === "dashboard") loadDashboard();
  if (viewName === "cases") loadCases();
  if (viewName === "chat") loadChatCases();
}

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    showView(item.dataset.view);
  });
});

// ===== API HELPER =====
async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Request failed");
  return data;
}

// ===== FORMATTING HELPERS =====
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatBytes(bytes) {
  if (!bytes) return "—";
  const num = Number(bytes);
  if (num < 1024) return num + " B";
  if (num < 1024 * 1024) return (num / 1024).toFixed(1) + " KB";
  return (num / (1024 * 1024)).toFixed(1) + " MB";
}

function modalityIcon(modality) {
  const map = { IMAGE: "image", VIDEO: "video", AUDIO: "audio", DOCUMENT: "document", CCTV: "video", BODYCAM: "video", DRONE: "video" };
  return map[modality] || "document";
}

function modalityLabel(modality) {
  const map = { IMAGE: "IMG", VIDEO: "VID", AUDIO: "AUD", DOCUMENT: "DOC", CCTV: "CCTV", BODYCAM: "CAM", DRONE: "DRN" };
  return map[modality] || "FILE";
}

// ===== DASHBOARD =====
async function loadDashboard() {
  try {
    const { data } = await api("/dashboard/summary");
    document.getElementById("metric-cases").textContent = data.metrics.activeCases;
    document.getElementById("metric-evidence").textContent = data.metrics.evidenceItems;
    document.getElementById("metric-pending").textContent = data.metrics.pendingAnalysis;
    document.getElementById("metric-integrity").textContent = data.metrics.integrityCoverage + "%";

    const grid = document.getElementById("recent-cases");
    if (data.recentCases.length === 0) {
      grid.innerHTML = `<div class="empty-state">No cases yet. Create your first case to get started.</div>`;
      return;
    }
    grid.innerHTML = data.recentCases.map((c) => `
      <div class="case-card" onclick="openCaseFromDashboard('${c.id}')">
        <div class="case-card-header">
          <div>
            <div class="case-card-title">${esc(c.title)}</div>
            <div class="case-card-ref">${esc(c.reference)}</div>
          </div>
          <span class="status-badge status-${c.status}">${c.status}</span>
        </div>
        <div class="case-card-meta">
          <span><span class="priority-dot priority-${c.priority}"></span>P${c.priority}</span>
          <span>${c.evidence_count} evidence</span>
          ${c.location ? `<span>📍 ${esc(c.location)}</span>` : ""}
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Dashboard load failed:", err);
  }
}

function openCaseFromDashboard(caseId) {
  showView("cases");
  openCaseDetail(caseId);
}

// ===== CASES =====
async function loadCases(search) {
  try {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const { data } = await api(`/cases${params}`);
    const list = document.getElementById("cases-list");

    if (data.length === 0) {
      list.innerHTML = `<div class="empty-state">No cases found. Click "New Case" to create one.</div>`;
      return;
    }

    list.innerHTML = data.map((c) => `
      <div class="case-row" onclick="openCaseDetail('${c.id}')">
        <span class="priority-dot priority-${c.priority}"></span>
        <div class="case-row-info">
          <div class="case-row-title">${esc(c.title)}</div>
          <div class="case-row-sub">${esc(c.reference)} · ${c.evidence_count} evidence · ${formatDate(c.updated_at)}</div>
        </div>
        <span class="status-badge status-${c.status}">${c.status}</span>
      </div>
    `).join("");
  } catch (err) {
    console.error("Cases load failed:", err);
  }
}

// Search debounce
let searchTimeout;
document.getElementById("search-cases").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadCases(e.target.value), 300);
});

// ===== CASE DETAIL =====
let currentCaseId = null;

async function openCaseDetail(caseId) {
  currentCaseId = caseId;
  const casesList = document.getElementById("cases-list");
  const panel = document.getElementById("case-detail-panel");
  const viewHeader = document.querySelector("#view-cases .view-header");
  const searchBar = document.querySelector("#view-cases .search-bar");

  casesList.classList.add("hidden");
  viewHeader.classList.add("hidden");
  searchBar.classList.add("hidden");
  panel.classList.remove("hidden");

  try {
    const { data } = await api(`/cases/${caseId}`);
    document.getElementById("case-detail-title").textContent = data.title;
    document.getElementById("case-detail-ref").textContent = data.reference;

    document.getElementById("case-detail-meta").innerHTML = `
      <div><div class="meta-item-label">Status</div><div class="meta-item-value"><span class="status-badge status-${data.status}">${data.status}</span></div></div>
      <div><div class="meta-item-label">Priority</div><div class="meta-item-value"><span class="priority-dot priority-${data.priority}"></span>P${data.priority}</div></div>
      <div><div class="meta-item-label">Location</div><div class="meta-item-value">${esc(data.location || "—")}</div></div>
      <div><div class="meta-item-label">Owner</div><div class="meta-item-value">${esc(data.owner_name || "—")}</div></div>
      <div><div class="meta-item-label">Created</div><div class="meta-item-value">${formatDate(data.created_at)}</div></div>
      ${data.description ? `<div style="grid-column: 1/-1"><div class="meta-item-label">Description</div><div class="meta-item-value" style="font-weight:400;color:var(--text-secondary)">${esc(data.description)}</div></div>` : ""}
    `;

    // Evidence list
    const evidenceList = document.getElementById("evidence-list");
    if (!data.evidence || data.evidence.length === 0) {
      evidenceList.innerHTML = `<div class="empty-state">No evidence uploaded yet.</div>`;
    } else {
      evidenceList.innerHTML = data.evidence.map((e) => `
        <div class="evidence-row">
          <div class="evidence-icon ${modalityIcon(e.modality)}">${modalityLabel(e.modality)}</div>
          <div class="evidence-info">
            <div class="evidence-name">${esc(e.original_name)}</div>
            <div class="evidence-meta">${formatBytes(e.byte_size)} · ${e.mime_type} · ${e.status}</div>
          </div>
          <div class="evidence-actions">
            ${e.status === "UPLOADED" || e.status === "FAILED" ? `<button class="btn btn-sm btn-primary" onclick="runAnalysis('${e.id}')">Analyze</button>` : ""}
            ${e.status === "READY" ? `<span class="status-badge status-OPEN">✓ Ready</span>` : ""}
          </div>
        </div>
      `).join("");
    }

    // Timeline
    loadTimeline(caseId);
  } catch (err) {
    console.error("Case detail load failed:", err);
  }
}

document.getElementById("btn-back-cases").addEventListener("click", () => {
  document.getElementById("case-detail-panel").classList.add("hidden");
  document.querySelector("#view-cases .view-header").classList.remove("hidden");
  document.querySelector("#view-cases .search-bar").classList.remove("hidden");
  document.getElementById("cases-list").classList.remove("hidden");
  currentCaseId = null;
  loadCases();
});

// ===== EVIDENCE UPLOAD =====
document.getElementById("evidence-upload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !currentCaseId) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("caseId", currentCaseId);

  try {
    await fetch(`${API}/evidence/upload`, { method: "POST", body: formData });
    openCaseDetail(currentCaseId); // Refresh
  } catch (err) {
    alert("Upload failed: " + err.message);
  }
  e.target.value = "";
});

// ===== RUN ANALYSIS =====
async function runAnalysis(evidenceId) {
  try {
    await api(`/analysis/evidence/${evidenceId}/run`, { method: "POST" });
    if (currentCaseId) openCaseDetail(currentCaseId);
  } catch (err) {
    alert("Analysis failed: " + err.message);
  }
}

// ===== TIMELINE =====
async function loadTimeline(caseId) {
  const container = document.getElementById("case-timeline");
  try {
    const { data } = await api(`/analysis/timeline/${caseId}`);
    if (data.length === 0) {
      container.innerHTML = `<div class="empty-state">No timeline events. Run analysis on evidence first.</div>`;
      return;
    }
    container.innerHTML = data.map((event) => `
      <div class="timeline-event">
        <div class="timeline-event-time">${formatDate(event.occurredAt)} · ${esc(event.evidenceName)}</div>
        <div class="timeline-event-title">${esc(event.title)}</div>
        <div class="timeline-event-desc">${esc(event.description).slice(0, 200)}</div>
        ${event.confidence ? `<div class="timeline-event-conf">${(event.confidence * 100).toFixed(1)}% confidence</div>` : ""}
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load timeline.</div>`;
  }
}

// ===== NEW CASE MODAL =====
const modal = document.getElementById("modal-new-case");
document.getElementById("btn-new-case").addEventListener("click", () => modal.classList.remove("hidden"));
document.getElementById("modal-close").addEventListener("click", () => modal.classList.add("hidden"));
document.getElementById("btn-cancel-case").addEventListener("click", () => modal.classList.add("hidden"));

document.getElementById("form-new-case").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    title: document.getElementById("case-title").value,
    description: document.getElementById("case-description").value || undefined,
    location: document.getElementById("case-location").value || undefined,
    priority: parseInt(document.getElementById("case-priority").value),
  };

  try {
    await api("/cases", { method: "POST", body: JSON.stringify(body) });
    modal.classList.add("hidden");
    e.target.reset();
    loadCases();
  } catch (err) {
    alert("Failed to create case: " + err.message);
  }
});

// ===== CHAT =====
async function loadChatCases() {
  try {
    const { data } = await api("/cases");
    const select = document.getElementById("chat-case-id");
    select.innerHTML = `<option value="">-- Select a case --</option>` +
      data.map((c) => `<option value="${c.id}">${esc(c.reference)} — ${esc(c.title)}</option>`).join("");
  } catch (err) {
    console.error("Failed to load cases for chat:", err);
  }
}

document.getElementById("chat-case-id").addEventListener("change", (e) => {
  const enabled = !!e.target.value;
  document.getElementById("chat-input").disabled = !enabled;
  document.getElementById("btn-send-chat").disabled = !enabled;
});

async function sendChatQuery() {
  const caseId = document.getElementById("chat-case-id").value;
  const input = document.getElementById("chat-input");
  const query = input.value.trim();
  if (!caseId || !query) return;

  const messages = document.getElementById("chat-messages");

  // User message
  messages.innerHTML += `<div class="chat-message user"><p>${esc(query)}</p></div>`;
  input.value = "";
  messages.scrollTop = messages.scrollHeight;

  try {
    const { data } = await api("/chat/query", {
      method: "POST",
      body: JSON.stringify({ caseId, query }),
    });

    let citationsHtml = "";
    if (data.citations && data.citations.length > 0) {
      citationsHtml = `<div class="chat-citations"><strong>Citations:</strong>` +
        data.citations.map((c) => `<div class="chat-citation">• ${esc(c.evidenceName)}${c.confidence ? ` (${(c.confidence * 100).toFixed(0)}%)` : ""}</div>`).join("") +
        `</div>`;
    }

    messages.innerHTML += `<div class="chat-message assistant"><p>${esc(data.answer)}</p>${citationsHtml}</div>`;
  } catch (err) {
    messages.innerHTML += `<div class="chat-message assistant"><p>Error: ${esc(err.message)}</p></div>`;
  }

  messages.scrollTop = messages.scrollHeight;
}

document.getElementById("btn-send-chat").addEventListener("click", sendChatQuery);
document.getElementById("chat-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChatQuery();
});

// ===== ESCAPE HTML =====
function esc(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

// ===== INIT =====
loadDashboard();
