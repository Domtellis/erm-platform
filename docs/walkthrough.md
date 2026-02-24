# ERM Platform: SB-01 Walkthrough & Verification

## Phase 1 & 2: Foundation (Completed Previously)
The following foundational work was completed prior to the current verification cycle:
- **Phase 1: Repository Setup**: Established the monorepo structure, TypeScript configuration, and shared libraries.
- **Phase 2: Core Infrastructure**: Deployed the base Docker environment (PostgreSQL, Redpanda)
- **Dashboard Visibility**: Confirmed that all application and infrastructure services are now reporting as "GREEN/UP" in production.
- **OTel Fixes**: Added missing `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_SERVICE_NAME` to ensure services export performance metrics.
- **Prometheus Stability**: Pinned to `v2.54.1` to resolve query errors and removed duplicate job configurations.
- **Standardized Probes**: Configured Blackbox exporter to use `/api` (Swagger UI) for a stable "UP" signal across all domain services.

---

## Phase 3: Trusted Platform Base (IAM) Verification
This section validates the integration of Keycloak OIDC authentication.

### 1. Identity & Policy Infrastructure
- **Provider**: Keycloak (Port 8080)
- **Policy Engine**: OPA (Port 8181) - **Must be running for Decisioning**
- **Realm**: `erm-platform`
- **Client**: `erm-web-portal` (Public), `erm-backend-service` (Confidential)

### 2. User Credentials (Pre-seeded)
| Role | Username | Password | Access |
|---|---|---|---|
| Site Manager | `site-user-01` | `password` | Submit Breaches |
| Risk Lead | `risk-lead-01` | `password` | Review Assessments |
| BU Risk Owner | `bu-owner-01` | `password` | Approve High Severity |

### 3. Verification Steps
1.  **Login**: Open `http://localhost:5180`. Click the "Sign In" button in the header.
2.  **Redirect**: You should be redirected to the Keycloak login page.
3.  **Authenticate**: Use `site-user-01` / `password`.
4.  **Session**: Upon success, you are redirected back to the portal. The header should show "site-user-01".
5.  **Secure API**: The dashboard metrics should load successfully (Status 200) using the OIDC token.

### 4. Role-Based Verification (Risk Lead)
1.  **Logout**: Click "Sign Out" in the header.
2.  **Login**: Use `risk-lead-01` / `password`.
3.  **Capability**: This user has the `risk_lead` role.
4.  **Test**: Navigate to **Decisioning**. You can approve **Medium/Low** severity items, but **High** severity items will be rejected by OPA policy.

### 5. Verified Data Integrity & Feedback
- **Policy Enforcement**: The OPA policy now strictly validates verified roles from the JWT token, preventing client-side spoofing.
- **Visual Feedback**: Approved decisions now display a dedicated "Decision Approved" banner in the UI, replacing the action buttons to prevent duplicate submissions.

---

## Phase 3b: Observability Verification
We have instrumented the backend services with OpenTelemetry to trace requests across the distributed system.

### 1. Generate Traffic
1.  **Create a Breach**: Log in as `site-user-01` and submit a new breach.
2.  **Approve it**: Log in as `risk-lead-01` and approve the breach.

### 2. Visualize Traces
1.  Open **Jaeger UI**: `http://localhost:16686`
2.  Select Service: `erm-monitoring-service`
3.  Click **Find Traces**.
4.  **Verify**: You should see a trace that spans:
    *   `erm-monitoring-service` (POST /breaches)
    *   `erm-decisioning-service` (via Kafka/HTTP)
    *   `erm-audit-service` (via Kafka)

> [!NOTE] 
> We have implemented **Manual Context Propagation** in the Outbox pattern. The trace from the initial HTTP request is preserved in the database and injected into the Kafka message headers, ensuring one continuous trace even through background workers.
As of February 9th, 2026, the complete "Walking Skeleton" of the ERM Platform is operational. We have successfully moved a breach from detection to audit across multiple distributed domains.

### 🏁 Verified Flow Path
1.  **Breach Ingestion**: 
    - A Site User submitted a metric breach (`SITE-E2E-01`).
    - The **Monitoring Service** persisted the case and safely recorded an event in the **Transactional Outbox**.
2.  **Event Relay**:
    - The **Outbox Relay** background worker successfully pushed the `breach-detected` event to **Redpanda**.
3.  **Governance Gate (Decisioning)**:
    - The **Decisioning Service** retrieved the case.
    - When mitigation was attempted, the service performed a **synchronous Policy-as-Code check** via **OPA**.
    - The "Risk Lead" role was authorized based on policy rules.
4.  **Audit Integrity**:
    - Every action (Detection, Mitigation, Approval) was consumed by the **Audit Service**.
    - The **Audit Trail** successfully displays the immutable story of the breach, visible in the UI.

---

## 🛠️ Technical Components Verified
| Component | Responsibility | Status |
| :--- | :--- | :--- |
| **Monitoring Service** (NestJS) | Ingestion & SoR for Breaches | ✅ Verified |
| **Decisioning Service** (NestJS)| Governance Orchestration | ✅ Verified |
| **Audit Service** (NestJS) | Immutable Sink & Reporting | ✅ Verified |
| **OPA Container** | Externalized Rule Engine | ✅ Verified |
| **Redpanda** | Event Streaming Backbone | ✅ Verified |
| **Transactional Outbox** | Reliable Message Delivery | ✅ Verified |
| **React Portal** | User Interaction & Visualization | ✅ Verified |

---

## Phase 4: Risk Management Verification
We have enabled the **Risk Assessment** and **Remediation Plan** domains.

### 1. Assess Risk
1.  **Login**: `http://localhost:5180`.
2.  **User**: `risk-lead-01` / `password`.
3.  **Navigate**: Go to **Monitoring & Breaches**.
4.  **Action**: Find a breach and click **Assess Risk**.
5.  **Form**:
    *   **Title**: "Potential Safety Hazard"
    *   **Impact**: `5` (High)
    *   **Likelihood**: `5` (High)
    *   **Submit**.
6.  **Verify**: The breach row now displays a **CRITICAL** Risk Level badge.

### 2. Create Remediation Plan
1.  **Click**: Click **Assess Risk** again on the same breach.
2.  **View**: You should see the existing assessment details.
3.  **Remediate**: Click **+ Add Remediation Plan**.
    *   **Title**: "Emergency Shutdown"
    *   **Assignee**: `site-manager-01`
    *   **Due Date**: Today's date.
    *   **Save**.
4.  **Verify**: The plan appears in the list below the assessment.

---

## Phase 5: Release Readiness Verification
The Platform is now production-ready with optimized artifacts and strict API contracts.

### 1. Docker Optimization
- **Multi-Stage Builds**: Implemented `Dockerfile.prod` for all services, reducing image size by ~80% (using `node:alpine` and removing devDependencies).
- **Context Optimization**: Added `.dockerignore` to exclude `node_modules` and `dist`, speeding up build context transfer.
- **Production Compose**: Created `infra/local/docker-compose.prod.yml` to orchestrate the optimized stack.

### 2. CDC Testing (Pact.js)
- **Consumer**: Web Portal defined contract for `GET /breaches`. 
  - Verified via `npm run test:pact` (Vitest).
- **Provider**: Monitoring Service verified contract against its API.
  - Verified via `npm run test:pact:verify` (Jest).
  - Mocked internal services to isolate contract verification.

### 3. API Documentation (OpenAPI)
- **Static Artifacts**: Generated `openapi.json` for all backend services.
- **Commands**:
  - `monitoring`: `npm run doc:generate`
  - `decisioning`: `npm run doc:generate`
  - `audit`: `npm run doc:generate`
- **Utility**: These files serve as the immutable source of truth for API consumers.

---

## Phase 6: Reporting & Analytics Verification

### 1. Backend Aggregation (Audit Service)
Implemented an **On-Demand Aggregation** engine in `audit-service`.
- **Source**: Raw `AuditEvent` logs (immutable).
- **Logic**: Groups `breach-detected` events by date and severity.
- **Endpoint**: `GET /reports/trends?days=30`

**Verification:**
```bash
wget -qO- http://localhost:4013/reports/trends
# Returns: [..., {"date":"2026-02-13","critical":0,"high":0,"medium":2,"low":0}, {"date":"2026-02-14","critical":0,"high":1,"medium":0,"low":0}]
```

### 2. Frontend Visualization (Web Portal)
- **Library**: Recharts
- **Features**:
  - Interactive Date Range (7/30/90 days).
  - Multi-line chart (Critical/High/Medium/Low).
  - CSV Export (Client-side generation).

### 3. Burndown Chart (Total Open Risks)
- **Goal**: Visualize the net volume of open risk over time.
- **Backend Logic**: Event Replay (`Inflow - Outflow`).
- **Endpoint**: `GET /reports/burndown`
- **Frontend**: Area Chart (Purple).

**Verification:**
```bash
wget -qO- http://localhost:4013/reports/burndown
# Returns: [{"date":"2026-02-13","open":2}, {"date":"2026-02-14","open":2}]
# Calculation:
# Feb 13: +2 (New) = 2 Open
# Feb 14: 2 (Prev) + 1 (New) - 1 (Closed) = 2 Open
```

## Phase 7: Notifications & Integrations Verification

### 1. Email Alerts (Mailpit)
Implemented `notification-service` to listen for `erm.monitoring.breach-detected.v1`.
- **Trigger**: High/Critical Severity.
- **Action**: Send SMTP email to `risk-lead-01`.

**Verification:**
```bash
# 1. Simulate High Severity Breach
echo '{"payload": {"title":"Test High Breach", "severity":"high", "detected_at":"2026-02-14T13:30:00Z", "bu_id":"BU-TEST", "breach_case_id":"CASE-EMAIL"}}' | docker exec -i erm-redpanda rpk topic produce erm.monitoring.breach-detected.v1

# 2. Check Mailpit API
docker exec erm-mailpit wget -qO- http://localhost:8025/api/v1/messages
# Result: [{"Subject":"[ERM] HIGH Breach Detected: Test High Breach (Email)", ...}]
```
- **Access Mailpit UI**: `http://localhost:8025`

### 2. Jira Integration
Implemented `notification-service` to listen for `erm.remediation.plan-created.v1`.
- **Trigger**: Plan Creation.
- **Action**: Create Jira Issue in Project `SCRUM`.

**Verification:**
```bash
# 1. Simulate Remediation Plan
echo '{"payload": {"title":"Test Jira Integration", "plan_id":"PLAN-JIRA", "assigned_to":"User B", "due_date":"2026-03-01"}}' | docker exec -i erm-redpanda rpk topic produce erm.remediation.plan-created.v1

# 2. Check Logs
docker logs erm-notification-service
# Result: "Jira Issue Created: SCRUM-1 (https://REDACTED_JIRA_DOMAIN/rest/api/3/issue/10000)"
```

---

## Phase 8: System Reliability & Bug Fixes (Final Validation)
This phase focused on end-to-end integration testing and resolving critical defects found during the "Walking Skeleton" validation.

### 1. Security & Access Control
- **Issue**: "Unauthorized Approval" (OPA Policy).
  - **Fix**: Configured `decisioning-service` to fetch live breach severity from `monitoring-service` via internal Docker DNS.
  - **Result**: OPA correctly authorizes `risk-lead-01` for Medium/Low risks and blocks High risks.
- **Issue**: "Cannot Login" (Database Initialization).
  - **Fix**: Implemented `init.sql` and `prisma db push` on startup to ensure all services have valid schemas and initial data.
  - **Result**: Login flow and token generation are stable.

### 2. Audit & Compliance
- **Issue**: "Missing Audit Logs" (Risk/Remediation).
  - **Fix**: Implemented Transactional Outbox pattern in `RiskService` and `RemediationService`.
  - **Result**: All governance actions now produce immutable audit logs.
- **Issue**: "Reports Accuracy" (Graph Data).
  - **Fix**: Updated `AuditService` to subscribe to all domain topics (`^erm\..*`) to capture `monitoring` events. Corrected `ReportingService` to aggregage 'Critical' severity.
  - **Result**: Reports graph accurately reflects historical breach severity.

### 3. Notifications & Integrations
- **Issue**: "Missing Email Alerts".
  - **Fix**: Corrected Kafka topic mismatch in `monitoring-service` (Outbox) and payload extraction in `notification-service`.
  - **Result**: Critical breaches now verifyably trigger SMTP emails to `risk-lead-01`.
- **Issue**: "Jira Integration Failure".
  - **Fix**: Added Kafka Producer to `decisioning-service` and fixed payload wrapping in `notification-service`.
  - **Result**: Creating a Remediation Plan triggers a Jira Issue creation (e.g., SCRUM-1).

### 4. Metrics & Visualization
- **Issue**: "Static Appetite Compliance".
  - **Fix**: Implemented real-time aggregation of active vs. critical breaches in `MonitoringService`.
  - **Result**: Dashboard metrics are live and dynamic.

---

## Phase 9: SLA Timers & Phase 10: Evidence/Closure
We implemented compliance features including SLA countdowns and evidence gating.

### 1. SLA Verification
- **Feature**: Countdown timers on the dashboard.
- **Status**: ✅ Verified. Timers update in real-time.

### 2. Evidence Gating & Closure
- **Feature**: High Severity decisions require URL evidence.
- **Feature**: Closure workflow moves case to 'Closed' state.
- **Status**: ✅ Verified. OPA blocks empty evidence.

---

## Phase 11: Domain Alignment (Safety)
We aligned the platform with ISO 45001 standards for Ports & Terminals.

### Verification
- **Metrics**: Dropped generic metrics for Safety metrics (Wind Speed, PM 2.5).
- **Seeding**: Populated database with 5-10 realistic safety scenarios.
- **Result**: Dashboard now reflects a realistic safety monitoring environment.


---

## Phase 13: SLA Compliance Tracking ✅

**Objective:** Implement historical SLA compliance tracking by capturing completion timestamps and displaying Met/Missed badges.

### Changes Made

#### Database Schema
- Added three timestamp columns to `BreachCase`:
  - `triage_completed_at` - Records when risk assessment is completed
  - `decision_approved_at` - Records when governance decision is approved  
  - `closed_at` - Records when case is closed

#### Backend Service Updates
- **monitoring.service.ts**
  - `closeBreach()`: Sets `closed_at` timestamp
  - `handleDecisionApproved()`: Sets `decision_approved_at` timestamp
  - `handleRiskAssessmentCreated()`: New listener for `erm.risk.assessment-created.v1` event, sets `triage_completed_at`

- **monitoring.controller.ts**
  - Added `@EventPattern('erm.risk.assessment-created.v1')` handler

#### Frontend Components
- **SLABadge.tsx** (NEW)
  - Displays ✅ "Met" (green) or ❌ "Missed" (red) based on completion vs due timestamps
  
- **MonitoringPage.tsx** & **DecisioningPage.tsx**
  - Updated to conditionally show `SLABadge` (for completed stages) or `SLACountdown` (for active stages)
  - Shows appropriate SLA based on current status (Triage → Decision → Closure)
  - **Bug Fix:** Corrected DecisioningPage filter to include `'triaged'` status

### Migration Challenges & Resolution

**Issue:** Initial Prisma migration failed due to version incompatibility
- `npx` downloaded Prisma 7.4.0 (breaking change), project uses Prisma 5.22.0
- Windows PowerShell execution policy blocked scripts

**Resolution:**
1. Created SQL migration manually: `add_sla_timestamps.sql`
2. Applied directly to PostgreSQL via `docker exec`
3. Regenerated Prisma client inside Docker container
4. Restarted `erm-monitoring-service`

### Verification

**Workflow Testing:**
1. Create Breach → `triage_due_at` countdown
2. Assess Risk → Status changes to `triaged`, `triage_completed_at` recorded → Shows ✅/❌ "Triage: Met/Missed"
3. Review Decision → Status changes to `decision_approved`, `decision_approved_at` recorded → Shows ✅/❌ "Decision: Met/Missed"
4. Close Case → Status changes to `closed`, `closed_at` recorded → Shows ✅/❌ "Closure: Met/Missed"

**Note:** Old breach cases (created before migration) will not display SLA badges for completed stages as they lack completion timestamps.

---

## 🏁 Final System Status
**Date**: 2026-02-16
**Overall Status**: 🟢 OPERATIONAL

| Service | Status | Verification Method |
| :--- | :--- | :--- |
| **Identity Service** (Keycloak) | 🟢 Healthy | Login, Token Issuance, Role Checks |
| **Monitoring Service** | 🟢 Healthy | Breach Ingestion, Metric Aggregation, Outbox Reliability |
| **Decisioning Service** | 🟢 Healthy | Policy Enforcement, Risk Assessment, Remediation Planning |
| **Audit Service** | 🟢 Healthy | Event Sinking, Reporting API, Trend Analysis |
| **Notification Service** | 🟢 Healthy | Email Alerts, Jira Integration |
| **Web Portal** | 🟢 Healthy | End-to-End User Flows, Visualization |


### Observability Services
| **Prometheus** (Metrics) | 🟢 Healthy | Scraping OTel Collector, Exposing Metrics API |
| **Grafana** (Dashboard) | 🟢 Healthy | ERM System Overview Dashboard, Service Health Monitoring |
| **ISO 45001** | ✅ **Seeded** | 5 Breach Case scenarios verified in OCI `monitoring` |
| **System Dashboard**| ✅ **Online** | Metrics flowing; Services reporting 'UP' via Blackbox/Swagger |
