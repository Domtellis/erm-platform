/**
 * ERM Platform - SB-01 Prototype
 * Navigation and Screen Management
 */

// Sample data (loaded from external file in production)
const sampleData = {
    breachCase: {
        id: "BC-2026-000123",
        title: "Safety breach at Quay 3 - Lost Time Injury",
        status: "Escalated",
        severity: "high",
        location: "Quay 3, Terminal A",
        owner: "John Smith",
        riskLead: "Sarah Jones",
        buRiskOwner: "Michael Chen",
        createdAt: "2026-02-06 09:45",
        sla: { status: "on_track", remaining: "5h 15m" }
    },
    evaluation: {
        appetiteVersion: "AS-2026-01",
        threshold: "TH-SAFETY-HIGH",
        measuredValue: 85,
        limit: 70,
        result: "breach",
        computedSeverity: "high"
    },
    decision: {
        type: "mitigate",
        rationale: "Immediate mitigation required. Implementing enhanced safety protocols.",
        submittedBy: "Sarah Jones",
        status: "pending"
    },
    evidence: [
        { id: "EV-001", type: "Incident Report", status: "complete" },
        { id: "EV-002", type: "Photo", status: "complete" },
        { id: "EV-003", type: "RCA", status: "missing" }
    ],
    actions: [
        { id: "ACT-001", title: "Enhanced safety protocols", owner: "John Smith", status: "in_progress", due: "2026-02-14" },
        { id: "ACT-002", title: "Safety training", owner: "Emily Wong", status: "open", due: "2026-02-21" },
        { id: "ACT-003", title: "Root cause analysis", owner: "Sarah Jones", status: "open", due: "2026-02-10" }
    ]
};

// Screen definitions
const screens = {
    home: {
        title: "Home",
        breadcrumbs: ["Home"],
        render: renderHomeScreen
    },
    "breaches-list": {
        title: "Breaches",
        breadcrumbs: ["Home", "Breaches"],
        render: renderBreachesListScreen
    },
    "case-detail": {
        title: "Case Detail",
        breadcrumbs: ["Home", "Breaches", "BC-2026-000123"],
        render: renderCaseDetailScreen
    },
    triage: {
        title: "Triage",
        breadcrumbs: ["Home", "Breaches", "BC-2026-000123", "Triage"],
        render: renderTriageScreen
    },
    "eval-step1": {
        title: "Evaluation - Step 1",
        breadcrumbs: ["Home", "Breaches", "BC-2026-000123", "Evaluation"],
        render: renderEvalStep1Screen
    },
    "eval-step2": {
        title: "Evaluation - Step 2",
        breadcrumbs: ["Home", "Breaches", "BC-2026-000123", "Evaluation", "Measure"],
        render: renderEvalStep2Screen
    },
    escalation: {
        title: "Escalation",
        breadcrumbs: ["Home", "Breaches", "BC-2026-000123", "Escalation"],
        render: renderEscalationScreen
    },
    "decision-submit": {
        title: "Submit Decision",
        breadcrumbs: ["Home", "Breaches", "BC-2026-000123", "Decision"],
        render: renderDecisionSubmitScreen
    },
    "decision-ask": {
        title: "Decision Ask",
        breadcrumbs: ["Home", "Decisions", "DEC-2026-000789"],
        render: renderDecisionAskScreen
    },
    evidence: {
        title: "Evidence",
        breadcrumbs: ["Home", "Breaches", "BC-2026-000123", "Evidence"],
        render: renderEvidenceScreen
    },
    "action-plan": {
        title: "Action Plan",
        breadcrumbs: ["Home", "Breaches", "BC-2026-000123", "Actions"],
        render: renderActionPlanScreen
    },
    "close-case": {
        title: "Close Case",
        breadcrumbs: ["Home", "Breaches", "BC-2026-000123", "Close"],
        render: renderCloseCaseScreen
    },
    "audit-pack": {
        title: "Audit Pack",
        breadcrumbs: ["Home", "Breaches", "BC-2026-000123", "Audit Pack"],
        render: renderAuditPackScreen
    }
};

// Current screen state
let currentScreen = "home";

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    navigateTo("home");
});

// Initialize navigation
function initNavigation() {
    document.querySelectorAll(".nav-item[data-screen]").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const screen = item.dataset.screen;
            if (screens[screen]) {
                navigateTo(screen);
            }
        });
    });
}

// Navigate to screen
function navigateTo(screenId) {
    const screen = screens[screenId];
    if (!screen) return;

    currentScreen = screenId;
    updateBreadcrumbs(screen.breadcrumbs);
    updateActiveNav(screenId);
    renderScreen(screenId);
    window.scrollTo(0, 0);
}

// Update breadcrumbs
function updateBreadcrumbs(items) {
    const container = document.getElementById("breadcrumbs");
    container.innerHTML = items.map((item, index) =>
        `<span class="breadcrumb-item" onclick="handleBreadcrumbClick(${index})">${item}</span>`
    ).join("");
}

// Handle breadcrumb click
function handleBreadcrumbClick(index) {
    const screen = screens[currentScreen];
    if (index === 0) navigateTo("home");
    else if (index === 1 && screen.breadcrumbs[1] === "Breaches") navigateTo("breaches-list");
    else if (index === 2 && screen.breadcrumbs[2]?.startsWith("BC-")) navigateTo("case-detail");
}

// Update active nav item
function updateActiveNav(screenId) {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.dataset.screen === screenId ||
            (screenId.includes("breach") && item.dataset.screen === "breaches-list") ||
            (screenId === "case-detail" && item.dataset.screen === "breaches-list")) {
            item.classList.add("active");
        }
    });
    // Special case for home
    if (screenId === "home") {
        document.querySelector('[data-screen="home"]')?.classList.add("active");
    }
}

// Render screen
function renderScreen(screenId) {
    const container = document.getElementById("screen-container");
    const screen = screens[screenId];
    if (screen?.render) {
        container.innerHTML = screen.render();
    }
}

// Modal functions
function openModal(title, content) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-content").innerHTML = content;
    document.getElementById("modal-overlay").classList.add("active");
}

function closeModal() {
    document.getElementById("modal-overlay").classList.remove("active");
}

// Toast notifications
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${type === "success" ? "✓" : type === "error" ? "✗" : "!"}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Screen render functions
function renderHomeScreen() {
    return `
        <div class="page-header">
            <h1 class="page-title">Welcome back, Sarah</h1>
            <p class="page-subtitle">Here's what needs your attention today</p>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Active Cases</div>
                <div class="stat-value">3</div>
                <div class="stat-change positive">↑ 1 new today</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pending Approvals</div>
                <div class="stat-value">1</div>
                <div class="stat-change negative">⚠ 1 requires attention</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Overdue Actions</div>
                <div class="stat-value">0</div>
                <div class="stat-change positive">✓ All on track</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">SLA Compliance</div>
                <div class="stat-value">100%</div>
                <div class="stat-change positive">↑ Maintaining target</div>
            </div>
        </div>
        <div class="grid-2">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">My Cases</h3>
                    <button class="btn btn-secondary" onclick="navigateTo('breaches-list')">View All</button>
                </div>
                <div class="card-body">
                    <div class="card card-clickable mb-4" onclick="navigateTo('case-detail')">
                        <div class="card-body">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-muted text-sm">BC-2026-000123</span>
                                <span class="chip chip-high">HIGH</span>
                            </div>
                            <h4 class="font-semibold mb-4">Safety breach at Quay 3</h4>
                            <div class="flex justify-between items-center">
                                <span class="chip chip-status">Escalated</span>
                                <div class="sla-timer on-track">⏱ 5h 15m remaining</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Pending Approvals</h3>
                </div>
                <div class="card-body">
                    <div class="card card-clickable" onclick="navigateTo('decision-ask')">
                        <div class="card-body">
                            <div class="flex justify-between items-center mb-4">
                                <span class="text-muted text-sm">DEC-2026-000789</span>
                                <span class="chip chip-warning">Awaiting Approval</span>
                            </div>
                            <h4 class="font-semibold mb-4">High Severity Decision - Mitigate</h4>
                            <div class="flex items-center gap-2">
                                <div class="avatar sm">SJ</div>
                                <span class="text-sm">Submitted by Sarah Jones</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderBreachesListScreen() {
    return `
        <div class="page-header flex justify-between items-center">
            <div>
                <h1 class="page-title">Breach Cases</h1>
                <p class="page-subtitle">Manage and track safety breach cases</p>
            </div>
            <button class="btn btn-primary btn-lg">+ New Case</button>
        </div>
        <div class="card">
            <div class="card-header">
                <div class="flex gap-4">
                    <select class="form-select" style="width:150px">
                        <option>All Severities</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                    <select class="form-select" style="width:150px">
                        <option>All Statuses</option>
                        <option>Detected</option>
                        <option>Triaged</option>
                        <option>Escalated</option>
                        <option>Closed</option>
                    </select>
                </div>
            </div>
            <div class="table-container">
                <table class="table table-clickable">
                    <thead>
                        <tr>
                            <th>Case ID</th>
                            <th>Title</th>
                            <th>Severity</th>
                            <th>Status</th>
                            <th>Owner</th>
                            <th>SLA</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr onclick="navigateTo('case-detail')">
                            <td>BC-2026-000123</td>
                            <td>Safety breach at Quay 3 - Lost Time Injury</td>
                            <td><span class="chip chip-high">HIGH</span></td>
                            <td><span class="chip chip-status">Escalated</span></td>
                            <td><div class="flex items-center gap-2"><div class="avatar sm">JS</div>John Smith</div></td>
                            <td><div class="sla-timer on-track">5h 15m</div></td>
                            <td>2026-02-06</td>
                        </tr>
                        <tr>
                            <td>BC-2026-000122</td>
                            <td>Near-miss incident at Loading Bay 2</td>
                            <td><span class="chip chip-medium">MEDIUM</span></td>
                            <td><span class="chip chip-success">Closed</span></td>
                            <td><div class="flex items-center gap-2"><div class="avatar sm">EW</div>Emily Wong</div></td>
                            <td>—</td>
                            <td>2026-02-04</td>
                        </tr>
                        <tr>
                            <td>BC-2026-000121</td>
                            <td>Equipment safety check failure</td>
                            <td><span class="chip chip-low">LOW</span></td>
                            <td><span class="chip chip-success">Closed</span></td>
                            <td><div class="flex items-center gap-2"><div class="avatar sm">JS</div>John Smith</div></td>
                            <td>—</td>
                            <td>2026-02-01</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderCaseDetailScreen() {
    return `
        <div class="case-header">
            <div class="case-info">
                <div class="case-id">BC-2026-000123</div>
                <h1 class="case-title">${sampleData.breachCase.title}</h1>
                <div class="case-meta">
                    <span class="chip chip-high">HIGH</span>
                    <span class="chip chip-status">Escalated</span>
                    <div class="sla-timer on-track">⏱ Decision due in 5h 15m</div>
                </div>
            </div>
            <div class="case-actions">
                <button class="btn btn-secondary" onclick="navigateTo('evidence')">Evidence</button>
                <button class="btn btn-secondary" onclick="navigateTo('action-plan')">Actions</button>
                <button class="btn btn-primary" onclick="navigateTo('triage')">Continue Workflow →</button>
            </div>
        </div>
        <div class="progress-steps">
            <div class="progress-step complete"><div class="progress-step-dot">✓</div><div class="progress-step-label">Detected</div></div>
            <div class="progress-step complete"><div class="progress-step-dot">✓</div><div class="progress-step-label">Triaged</div></div>
            <div class="progress-step complete"><div class="progress-step-dot">✓</div><div class="progress-step-label">Evaluated</div></div>
            <div class="progress-step active"><div class="progress-step-dot">4</div><div class="progress-step-label">Escalated</div></div>
            <div class="progress-step"><div class="progress-step-dot">5</div><div class="progress-step-label">Decision</div></div>
            <div class="progress-step"><div class="progress-step-dot">6</div><div class="progress-step-label">Actions</div></div>
            <div class="progress-step"><div class="progress-step-dot">7</div><div class="progress-step-label">Closed</div></div>
        </div>
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><h3 class="card-title">Case Details</h3></div>
                <div class="card-body">
                    <div class="form-group"><label class="form-label">Location</label><p>${sampleData.breachCase.location}</p></div>
                    <div class="form-group"><label class="form-label">Owner</label><div class="flex items-center gap-2"><div class="avatar sm">JS</div>${sampleData.breachCase.owner}</div></div>
                    <div class="form-group"><label class="form-label">Risk Lead</label><div class="flex items-center gap-2"><div class="avatar sm">SJ</div>${sampleData.breachCase.riskLead}</div></div>
                    <div class="form-group"><label class="form-label">Created</label><p>${sampleData.breachCase.createdAt}</p></div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Audit Timeline</h3></div>
                <div class="card-body">
                    <div class="timeline">
                        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><div class="timeline-title">Escalation Triggered</div><div class="timeline-meta">High severity → BU Risk Owner notified</div><div class="timeline-meta">2026-02-06 12:00 by System</div></div></div>
                        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><div class="timeline-title">Threshold Evaluated</div><div class="timeline-meta">Result: Breach (85 > 70)</div><div class="timeline-meta">2026-02-06 11:30 by Sarah Jones</div></div></div>
                        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><div class="timeline-title">Case Triaged</div><div class="timeline-meta">Severity: High, Location: Quay 3</div><div class="timeline-meta">2026-02-06 10:30 by John Smith</div></div></div>
                        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><div class="timeline-title">Case Created</div><div class="timeline-meta">Manual creation</div><div class="timeline-meta">2026-02-06 09:45 by John Smith</div></div></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTriageScreen() {
    return `
        <div class="page-header"><h1 class="page-title">Triage Case</h1><p class="page-subtitle">BC-2026-000123</p></div>
        <div class="card" style="max-width:700px">
            <div class="card-body">
                <div class="form-group"><label class="form-label required">Severity</label>
                    <select class="form-select"><option value="">Select severity...</option><option value="high" selected>High</option><option value="medium">Medium</option><option value="low">Low</option></select>
                </div>
                <div class="form-group"><label class="form-label required">Location</label><input type="text" class="form-input" value="Quay 3, Terminal A"></div>
                <div class="form-group"><label class="form-label">Impact Summary</label><textarea class="form-textarea" placeholder="Describe the impact...">Worker sustained injury during cargo handling operations.</textarea></div>
            </div>
            <div class="card-footer"><button class="btn btn-secondary" onclick="navigateTo('case-detail')">Cancel</button><button class="btn btn-primary" onclick="navigateTo('eval-step1'); showToast('Triage completed')">Complete Triage →</button></div>
        </div>
    `;
}

function renderEvalStep1Screen() {
    return `
        <div class="page-header"><h1 class="page-title">Evaluation - Step 1</h1><p class="page-subtitle">Select Appetite Statement and Threshold</p></div>
        <div class="card" style="max-width:700px">
            <div class="card-body">
                <div class="form-group"><label class="form-label required">Appetite Statement Version</label>
                    <select class="form-select"><option value="">Select...</option><option value="AS-2026-01" selected>AS-2026-01 - Safety Appetite (2026)</option></select>
                    <div class="form-hint">Effective from: 2026-01-01</div>
                </div>
                <div class="form-group"><label class="form-label required">Threshold</label>
                    <select class="form-select"><option value="">Select...</option><option value="TH-SAFETY-HIGH" selected>TH-SAFETY-HIGH - Lost Time Injury Rate</option></select>
                    <div class="form-hint">Limit: 70 per 100,000 hours</div>
                </div>
            </div>
            <div class="card-footer"><button class="btn btn-secondary" onclick="navigateTo('case-detail')">Cancel</button><button class="btn btn-primary" onclick="navigateTo('eval-step2')">Next →</button></div>
        </div>
    `;
}

function renderEvalStep2Screen() {
    return `
        <div class="page-header"><h1 class="page-title">Evaluation - Step 2</h1><p class="page-subtitle">Enter Measurement and Rationale</p></div>
        <div class="card" style="max-width:700px">
            <div class="card-body">
                <div class="stat-card mb-6"><div class="stat-label">Threshold</div><div class="stat-value">TH-SAFETY-HIGH</div><div class="text-muted text-sm mt-4">Limit: 70 per 100,000 hours</div></div>
                <div class="form-group"><label class="form-label required">Measured Value</label><input type="number" class="form-input" value="85" placeholder="Enter value..."><div class="form-hint">Current LTI rate</div></div>
                <div class="form-group"><label class="form-label required">Rationale</label><textarea class="form-textarea" placeholder="Explain the evaluation...">Measured LTI rate of 85 exceeds the threshold of 70. This represents a significant breach requiring immediate attention.</textarea><div class="form-hint">Explain why this measurement was taken and any context</div></div>
                <div class="stat-card" style="border-left:3px solid var(--color-danger)"><div class="stat-label">Evaluation Result</div><div class="flex items-center gap-3 mt-4"><span class="chip chip-danger">BREACH</span><span class="chip chip-high">HIGH SEVERITY</span></div><div class="text-muted text-sm mt-4">85 exceeds limit of 70 (21% over)</div></div>
            </div>
            <div class="card-footer"><button class="btn btn-secondary" onclick="navigateTo('eval-step1')">← Back</button><button class="btn btn-primary" onclick="navigateTo('escalation'); showToast('Evaluation completed')">Complete Evaluation →</button></div>
        </div>
    `;
}

function renderEscalationScreen() {
    return `
        <div class="page-header"><h1 class="page-title">Escalation Triggered</h1><p class="page-subtitle">This case requires BU Risk Owner approval</p></div>
        <div class="card" style="max-width:700px">
            <div class="card-body">
                <div class="stat-card mb-6" style="border-left:3px solid var(--color-warning);background:var(--color-warning-muted)">
                    <div class="flex items-center gap-3"><span style="font-size:2rem">⚠️</span><div><div class="font-semibold">Auto-Escalation Applied</div><div class="text-muted text-sm">High severity breaches require BU Risk Owner approval</div></div></div>
                </div>
                <div class="form-group"><label class="form-label">Escalation Reason</label><p>Computed severity is <strong>High</strong> based on threshold evaluation (85 > 70).</p></div>
                <div class="form-group"><label class="form-label">Escalated To</label><div class="flex items-center gap-3"><div class="avatar">MC</div><div><div class="font-semibold">Michael Chen</div><div class="text-muted text-sm">BU Risk Owner</div></div></div></div>
                <div class="form-group"><label class="form-label">Notification</label><p class="text-muted">📱 Teams notification sent to BU-01-Safety-Risk channel</p></div>
            </div>
            <div class="card-footer"><button class="btn btn-secondary" onclick="navigateTo('case-detail')">View Case</button><button class="btn btn-primary" onclick="navigateTo('decision-submit')">Submit Decision →</button></div>
        </div>
    `;
}

function renderDecisionSubmitScreen() {
    return `
        <div class="page-header"><h1 class="page-title">Submit Decision</h1><p class="page-subtitle">BC-2026-000123</p></div>
        <div class="card" style="max-width:700px">
            <div class="card-body">
                <div class="form-group"><label class="form-label required">Decision Type</label>
                    <select class="form-select"><option value="">Select...</option><option value="accept">Accept</option><option value="mitigate" selected>Mitigate</option><option value="stop">Stop</option><option value="waive">Waive</option></select>
                </div>
                <div class="form-group"><label class="form-label required">Rationale</label><textarea class="form-textarea">Immediate mitigation required. Implementing enhanced safety protocols and additional training for quay operations staff.</textarea></div>
                <div class="form-group"><label class="form-label">Evidence References</label>
                    <div class="checklist"><div class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label">EV-001 - Incident Report</div></div><div class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label">EV-002 - Photo</div></div></div>
                    <button class="btn btn-secondary mt-4" onclick="navigateTo('evidence')">+ Add Evidence</button>
                </div>
            </div>
            <div class="card-footer"><button class="btn btn-secondary" onclick="navigateTo('case-detail')">Cancel</button><button class="btn btn-primary" onclick="navigateTo('decision-ask'); showToast('Decision submitted for approval')">Submit for Approval →</button></div>
        </div>
    `;
}

function renderDecisionAskScreen() {
    return `
        <div class="page-header"><h1 class="page-title">Decision Approval Required</h1><p class="page-subtitle">DEC-2026-000789 • High Severity</p></div>
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><h3 class="card-title">Case Summary</h3></div>
                <div class="card-body">
                    <div class="flex justify-between items-center mb-4"><span class="text-muted">BC-2026-000123</span><span class="chip chip-high">HIGH</span></div>
                    <h4 class="font-semibold mb-4">${sampleData.breachCase.title}</h4>
                    <div class="form-group"><label class="form-label">Location</label><p>${sampleData.breachCase.location}</p></div>
                    <div class="sla-timer on-track">⏱ Decision due in 5h 15m</div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Evaluation Summary</h3></div>
                <div class="card-body">
                    <div class="form-group"><label class="form-label">Appetite Version</label><p>AS-2026-01</p></div>
                    <div class="form-group"><label class="form-label">Threshold</label><p>TH-SAFETY-HIGH (Limit: 70)</p></div>
                    <div class="form-group"><label class="form-label">Measured Value</label><p class="font-semibold" style="color:var(--color-danger)">85 <span class="text-muted">(21% over limit)</span></p></div>
                    <div class="flex gap-2"><span class="chip chip-danger">BREACH</span><span class="chip chip-high">HIGH</span></div>
                </div>
            </div>
        </div>
        <div class="grid-2 mt-6">
            <div class="card">
                <div class="card-header"><h3 class="card-title">Decision Details</h3></div>
                <div class="card-body">
                    <div class="form-group"><label class="form-label">Decision Type</label><p class="font-semibold">Mitigate</p></div>
                    <div class="form-group"><label class="form-label">Rationale</label><p>${sampleData.decision.rationale}</p></div>
                    <div class="form-group"><label class="form-label">Submitted By</label><div class="flex items-center gap-2"><div class="avatar sm">SJ</div>Sarah Jones</div></div>
                    <div class="sod-badge pass mt-4">✓ SoD Check Passed<span class="text-muted text-sm ml-4">Approver ≠ Submitter</span></div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Evidence Checklist</h3><span class="chip chip-warning">2/3 Complete</span></div>
                <div class="card-body">
                    <ul class="checklist">
                        <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label">Incident Report</div><div class="checklist-status">EV-001</div></li>
                        <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label">Photo</div><div class="checklist-status">EV-002</div></li>
                        <li class="checklist-item"><div class="checklist-icon missing">!</div><div class="checklist-label">Root Cause Analysis</div><div class="checklist-status" style="color:var(--color-danger)">Required</div></li>
                    </ul>
                    <div class="stat-card mt-4" style="border-left:3px solid var(--color-warning);background:var(--color-warning-muted)"><div class="text-sm">⚠️ RCA is required for High severity approvals</div></div>
                </div>
            </div>
        </div>
        <div class="card mt-6">
            <div class="card-header"><h3 class="card-title">Proposed Actions</h3></div>
            <div class="card-body">
                <table class="table"><thead><tr><th>Action</th><th>Owner</th><th>Due Date</th></tr></thead>
                <tbody><tr><td>Enhanced safety protocols for quay operations</td><td><div class="flex items-center gap-2"><div class="avatar sm">JS</div>John Smith</div></td><td>2026-02-14</td></tr>
                <tr><td>Safety training for cargo handlers</td><td><div class="flex items-center gap-2"><div class="avatar sm">EW</div>Emily Wong</div></td><td>2026-02-21</td></tr></tbody></table>
            </div>
            <div class="card-footer">
                <div class="form-group" style="flex:1;margin:0"><textarea class="form-textarea" placeholder="Add approval comments (optional)..." style="min-height:60px"></textarea></div>
            </div>
            <div class="card-footer"><button class="btn btn-danger" onclick="showToast('Decision rejected','error')">Reject</button><button class="btn btn-success btn-lg" onclick="navigateTo('action-plan'); showToast('Decision approved!')">Approve Decision ✓</button></div>
        </div>
    `;
}

function renderEvidenceScreen() {
    return `
        <div class="page-header flex justify-between items-center"><div><h1 class="page-title">Evidence Library</h1><p class="page-subtitle">BC-2026-000123</p></div><button class="btn btn-primary">+ Upload Evidence</button></div>
        <div class="card">
            <div class="card-header"><h3 class="card-title">Required Evidence</h3><span class="chip chip-warning">2/3 Complete</span></div>
            <div class="card-body">
                <ul class="checklist">
                    <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label"><div class="font-semibold">Incident Report</div><div class="text-muted text-sm">Required for all severities</div></div><div class="checklist-status">EV-001</div></li>
                    <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label"><div class="font-semibold">Photo</div><div class="text-muted text-sm">Visual evidence</div></div><div class="checklist-status">EV-002</div></li>
                    <li class="checklist-item"><div class="checklist-icon missing">!</div><div class="checklist-label"><div class="font-semibold">Root Cause Analysis</div><div class="text-muted text-sm">Required for High severity</div></div><div class="checklist-status"><button class="btn btn-primary" style="padding:4px 12px;font-size:12px">Upload</button></div></li>
                </ul>
            </div>
        </div>
        <div class="card mt-6">
            <div class="card-header"><h3 class="card-title">All Evidence</h3></div>
            <div class="table-container">
                <table class="table"><thead><tr><th>ID</th><th>Type</th><th>Description</th><th>Uploaded By</th><th>Date</th></tr></thead>
                <tbody>
                    <tr><td>EV-001</td><td><span class="chip chip-status">Incident Report</span></td><td>Initial incident report from site supervisor</td><td>John Smith</td><td>2026-02-06</td></tr>
                    <tr><td>EV-002</td><td><span class="chip chip-status">Photo</span></td><td>Photo of incident location</td><td>John Smith</td><td>2026-02-06</td></tr>
                </tbody></table>
            </div>
        </div>
        <div class="card-footer mt-6"><button class="btn btn-secondary" onclick="navigateTo('case-detail')">← Back to Case</button></div>
    `;
}

function renderActionPlanScreen() {
    return `
        <div class="page-header flex justify-between items-center"><div><h1 class="page-title">Action Plan</h1><p class="page-subtitle">BC-2026-000123</p></div><button class="btn btn-primary">+ Add Action</button></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Actions</div><div class="stat-value">3</div></div>
            <div class="stat-card"><div class="stat-label">In Progress</div><div class="stat-value">1</div></div>
            <div class="stat-card"><div class="stat-label">Open</div><div class="stat-value">2</div></div>
            <div class="stat-card"><div class="stat-label">Completed</div><div class="stat-value">0</div></div>
        </div>
        <div class="card">
            <div class="table-container">
                <table class="table"><thead><tr><th>ID</th><th>Action</th><th>Owner</th><th>Status</th><th>Due Date</th><th></th></tr></thead>
                <tbody>
                    <tr><td>ACT-001</td><td>Enhanced safety protocols for quay operations</td><td><div class="flex items-center gap-2"><div class="avatar sm">JS</div>John Smith</div></td><td><span class="chip chip-warning">In Progress</span></td><td>2026-02-14</td><td><button class="btn btn-ghost">Edit</button></td></tr>
                    <tr><td>ACT-002</td><td>Safety training for cargo handlers</td><td><div class="flex items-center gap-2"><div class="avatar sm">EW</div>Emily Wong</div></td><td><span class="chip chip-status">Open</span></td><td>2026-02-21</td><td><button class="btn btn-ghost">Edit</button></td></tr>
                    <tr><td>ACT-003</td><td>Complete root cause analysis</td><td><div class="flex items-center gap-2"><div class="avatar sm">SJ</div>Sarah Jones</div></td><td><span class="chip chip-status">Open</span></td><td>2026-02-10</td><td><button class="btn btn-ghost">Edit</button></td></tr>
                </tbody></table>
            </div>
        </div>
        <div class="card-footer mt-6"><button class="btn btn-secondary" onclick="navigateTo('case-detail')">← Back to Case</button><button class="btn btn-primary" onclick="navigateTo('close-case')">Proceed to Close →</button></div>
    `;
}

function renderCloseCaseScreen() {
    return `
        <div class="page-header"><h1 class="page-title">Close Case</h1><p class="page-subtitle">BC-2026-000123</p></div>
        <div class="card" style="max-width:700px">
            <div class="card-body">
                <div class="stat-card mb-6"><div class="stat-label">Closure Checklist</div>
                    <ul class="checklist mt-4">
                        <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label">Decision approved</div></li>
                        <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label">All actions completed</div></li>
                        <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label">Evidence requirements met</div></li>
                    </ul>
                </div>
                <div class="form-group"><label class="form-label required">Post-Action Review Notes</label><textarea class="form-textarea" placeholder="Document learnings, what changed, and recommendations...">Enhanced safety protocols implemented. Training completed for all cargo handlers. RCA identified root cause as insufficient lighting - now resolved.</textarea></div>
            </div>
            <div class="card-footer"><button class="btn btn-secondary" onclick="navigateTo('case-detail')">Cancel</button><button class="btn btn-success btn-lg" onclick="navigateTo('audit-pack'); showToast('Case closed successfully')">Close Case ✓</button></div>
        </div>
    `;
}

function renderAuditPackScreen() {
    return `
        <div class="page-header"><h1 class="page-title">Audit Pack Export</h1><p class="page-subtitle">BC-2026-000123</p></div>
        <div class="card" style="max-width:800px">
            <div class="card-header"><h3 class="card-title">Audit Pack Contents</h3><span class="chip chip-success">Ready to Export</span></div>
            <div class="card-body">
                <ul class="checklist">
                    <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label"><strong>Case Summary</strong><div class="text-muted text-sm">ID, title, severity, status, dates</div></div></li>
                    <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label"><strong>Evaluation Record</strong><div class="text-muted text-sm">Appetite version, threshold, measurement, result</div></div></li>
                    <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label"><strong>Decision & Approvals</strong><div class="text-muted text-sm">Decision type, rationale, approvers, SoD outcome</div></div></li>
                    <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label"><strong>Evidence Index</strong><div class="text-muted text-sm">3 items: Incident Report, Photo, RCA</div></div></li>
                    <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label"><strong>Action Plan</strong><div class="text-muted text-sm">3 actions with completion evidence</div></div></li>
                    <li class="checklist-item"><div class="checklist-icon complete">✓</div><div class="checklist-label"><strong>Audit Timeline</strong><div class="text-muted text-sm">15 events from creation to closure</div></div></li>
                </ul>
            </div>
            <div class="card-footer"><button class="btn btn-secondary" onclick="navigateTo('case-detail')">← Back to Case</button><button class="btn btn-primary btn-lg" onclick="showToast('Audit pack exported')">📄 Export as PDF</button><button class="btn btn-secondary" onclick="showToast('Audit pack exported as ZIP')">📦 Export as ZIP</button></div>
        </div>
    `;
}
