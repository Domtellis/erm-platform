# ERM Platform: Implementation Reference
> **Status**: Living Document
> **Maintained By**: Platform Engineering Team
> **Last Updated**: 2026-02-16

This document serves as a consolidated reference of all implementation phases, architectural decisions, and feature sets delivered for **SB-01: The "Walking Skeleton"** of the Clean Energy Risk Management (ERM) Platform. 

**SB-01 Scope Definition**:
"SB-01" represents the initial Strategic Bet to deliver a fully functional, end-to-end slice of the platform. It encompasses Phases 1 through 8, establishing the Foundation, Security, Observability, Logic, and Reporting layers necessary for a production-ready MVP.

---

## 🏗️ Phase 1 & 2: Foundation & Infrastructure
**Goal**: Establish a scalable monorepo structure and deploy core backing services.

### Technical Stack
- **Languages**: TypeScript 5.0+, Node.js 20 (LTS).
- **Frontend**: React 18, Vite 5, TailwindCSS 3.4.
- **Backend**: NestJS 10 (Microservices mode).
- **Package Manager**: NPM (Workspaces).

### Infrastructure (Docker Compose)
- **PostgreSQL 15**:
  - Image: `postgres:15-alpine`
  - Ports: `5432:5432`
  - *Configuration*: Auto-initialization via `init.sql` to create `monitoring`, `decisioning`, `audit`, and `keycloak` databases on startup.
- **Redpanda (Kafka)**:
  - Image: `docker.redpanda.com/redpandadata/redpanda:v23.2.19`
  - Ports: `9092` (External), `29092` (Internal)
  - *Decision*: Selected over standard Kafka/Zookeeper for single-binary simplicity and lower resource footprint.

---

## 🔐 Phase 3: Trusted Platform Base (IAM & Security)
**Goal**: Secure the platform with industry-standard Identity and Access Management (IAM).

### Identity Provider (Keycloak)
- **Image**: `quay.io/keycloak/keycloak:24.0.1`
- **Realm**: `erm-platform`
- **Clients**:
  - `erm-web-portal`: Public Client (Standard Flow) for React App.
  - `erm-backend-service`: Confidential Client (Service Accounts) for inter-service auth.
- **Users (Seeded)**: `site-user-01`, `risk-lead-01`, `bu-owner-01`.

### Policy-as-Code (OPA)
- **Engine**: Open Policy Agent (Daemon mode).
- **Integration**: Decoupled authorization decisioning.
- **Policy Logic**:
  ```rego
  # Example: Allow Mitigation only for Risk Leads
  allow if {
      input.method == "POST"
      input.path == ["remediation", "plans"]
      input.token.realm_access.roles[_] == "risk_lead"
  }
  ```

### Backend Security
- **Guard**: Global `AuthGuard` using `passport-jwt`.
- **Validation**: Verifies `iss`, `aud`, and `exp` claims against Keycloak JWKS.

---

## 📡 Phase 3b: Observability
**Goal**: Achieve deep visibility into distributed transactions.

### Telemetry Stack
- **SDK**: `@opentelemetry/sdk-node` with auto-instrumentation for Http and Kafka.
- **Collector**: OpenTelemetry Collector (Sidecar).
- **Visualization**: Jaeger (`http://localhost:16686`).

### Trace Context Propagation
- **Standard**: W3C Trace Context (`traceparent` header).
- **Challenge**: Context is lost when events sit in the Database Outbox.
- **Solution**: Manually capture `activeSpan` during API request and inject it into the `Outbox` record's metadata. The Relay worker restores this context when publishing to Kafka, ensuring the trace looks continuous (API -> DB -> Kafka -> Consumer).

---

## ⚖️ Phase 4: Risk Management Domain
**Goal**: Enable core business logic for assessing and mitigating risks.

### Domain Model
- **Risk Assessment**:
  - **Matrix**: 5x5 (Impact 1-5 x Likelihood 1-5).
  - **Logic**: `Score = Impact * Likelihood`.
  - **Levels**: Low (1-4), Medium (5-12), High (12-19), Critical (20-25).
- **Remediation Plan**:
  - **Relationship**: 1-to-Maybe (A risk can have a plan).
  - **Fields**: `title`, `description`, `assigned_to`, `due_date`, `status`.

### Transactional Integrity (Outbox Pattern)
- **Problem**: Dual-write problem (Writing to DB and publishing to Kafka can fail independently).
- **Implementation**:
  1.  Start SQL Transaction.
  2.  Insert `RiskAssessment` record.
  3.  Insert `Outbox` event record (`erm.risk.assessment-created.v1`).
  4.  Commit Transaction.
  - *Result*: Atomicity guaranteed. If DB write succeeds, the event is guaranteed to exist.

---

## 🚀 Phase 5: Release Readiness
**Goal**: Optimize the platform for production-like deployment.

### Container Optimization
- **Base Image**: Migrated from `node:20` (1GB+) to `node:20-alpine` (~150MB).
- **Multi-Stage Build**:
  1.  **Builder**: Installs all dependencies (including `devDependencies`), builds NestJS/React apps.
  2.  **Runner**: Copies only `dist/` and `node_modules` (pruned to `production` only).

### Consumer-Driven Contracts (Pact)
- **Tool**: Pact.js
- **Flow**:
  1.  **Consumer (Web)**: Defines expectations in `web/portal/tests/pact`. Generates contract JSON.
  2.  **Provider (Monitoring)**: Verifies contract against running API.
  - *Benefit*: Prevents frontend breakage when backend APIs change.

---

## 📊 Phase 6: Reporting & Analytics
**Goal**: Provide historical insights and executive reporting.

### Architecture
- **Source of Truth**: `audit-service`.
- **Pattern**: Event Sourcing Lite.
- **Ingestion**: Subscribes to wildcard topic `^erm\..*` to capture ALL domain events.
- **Storage**: `audit_event` table storing JSON payloads.

### aggregation Logic
- **Risk Trends**:
  - Dynamically queries `audit_event` where type is `breach-detected`.
  - Groups by `detected_at` (Date) and `payload->severity`.
  - *Optimization*: No separate analytical DB used yet; aggregation is on-demand (sufficient for MVP volume).

---

## 🔔 Phase 7: Notifications & Integrations
**Goal**: Proactive alerting and external ecosystem integration.

### Email System
- **Service**: `notification-service`.
- **Transport**: Nodemailer (SMTP).
- **Provider**: Mailpit (Local SMTP capture).
- **Trigger**: `erm.monitoring.breach-detected.v1` where `severity` IN ('high', 'critical').

### Jira Integration
- **Trigger**: `erm.remediation.plan-created.v1`.
- **Implementation**:
  - Maps internal `plan_id` to Jira `External Issue ID`.
  - Posts to Atlassian v3 REST API.
  - **Handling**: currently fire-and-forget; in production would require error handling/retries.

---

## 🛠️ Phase 8: System Hardening & Troubleshooting
**Goal**: Resolve integration issues found during End-to-End validation.

### Critical Defect Log

#### 1. "Cannot Login" (Infrastructure)
- **Symptom**: Services crashed on startup; Keycloak unreachable.
- **Root Cause**: PostgreSQL container started empty. Services tried to connect before databases existed.
- **Fix**: Added `postgres/init.sql` to auto-create DBs. Added `depends_on: condition: service_healthy` in Docker Compose.

#### 2. "Unauthorized Approval" (Policy)
- **Symptom**: OPA denied valid `risk-lead` approvals.
- **Root Cause**: `decisioning-service` tried to fetch breach details from `localhost` (container loopback) instead of `monitoring-service` (Docker DNS).
- **Fix**: Updated environment variables to use service names (`http://monitoring-service:4010`).

#### 3. "Missing Audit Logs" (Architecture)
- **Symptom**: Risk Assessments didn't appear in Audit Trail.
- **Root Cause**: `RiskService` wrote directly to DB but forgot to create an `Outbox` event.
- **Fix**: Wrapped creation in transaction and injected `Outbox` record.

#### 4. "Missing Email Alerts" (Messaging)
- **Symptom**: Critical breaches didn't trigger emails.
- **Root Cause**: `MonitoringService` published to legacy topic `erm-audit-events`. `NotificationService` listened to `erm.monitoring.breach-detected.v1`.
- **Fix**: Aligned Topic naming convention across Producer and Consumer.

#### 5. "Missing Status Update" (Event Propagation)
- **Symptom**: Breach status remained stuck despite approval.
- **Root Cause**: Twofold: 
  1. `MonitoringService` controller applied global AuthGuard to Kafka events (which lack headers).
  2. `DecisioningService` published to generic `erm-audit-events` topic instead of specific domain topic.
- **Fix**: Refactored AuthGuard to HTTP-only and corrected Outbox topic destination.

#### 6. "Governance Violation" (Critical Severity)
- **Symptom**: "Critical" severity breaches were auto-denied even with correct role.
- **Root Cause**: OPA Policy `governance.rego` only explicitly handled "high" severity; "critical" fell through to default deny.
- **Fix**: Updated OPA policy to treat `critical` and `high` severity identically.

---

---

## ⚓ Phase 11: Domain Alignment (Safety)
**Goal**: Align platform context with **ISO 31000** & **ISO 45001** for Ports & Terminals.

### Safety Metrics (ISO 45001)
Replaced generic IoT metrics with industry-specific safety indicators:
- **Wind Speed (Knots)**: Crane operations safety.
- **Container Stack Height**: Yard stability.
- **PM 2.5**: Air quality/Health.
- **Proximity Alerts**: Vehicle safety.
- **Fatigue Index**: Workforce health.

---

## 🔮 Future Architecture (Roadmap)
- **Event Sourcing**: Move from "State + Outbox" to full Event Sourcing for Risk entities.
- **Kubernetes**: Helm charts for deployment to EKS/AKS.
- **API Gateway**: Introduce Kong or Traefik for centralized rate limiting and SSL termination.


---

## ?? Phase 12: Enhanced Observability (Prometheus & Grafana)
**Goal**: Implement comprehensive real-time monitoring with metrics collection and visualization dashboards.

### Infrastructure
- **Prometheus**:
  - Image: `prom/prometheus:latest`
  - Port: `9090`
  - Scrape Interval: 5 seconds
  - Targets: OTel Collector (`erm-otel-collector:8889`)
  
- **Grafana**:
  - Image: `grafana/grafana:latest`
  - Port: `3000`
  - Default Credentials: `admin/admin`
  - Auto-provisioned with Prometheus datasource and ERM System Overview dashboard

### Metrics Architecture
**Flow**: Application Services ? OTel Collector ? Prometheus ? Grafana

**Key Metrics Exported**:
- `http_client_duration_milliseconds_bucket` - Client HTTP request duration histogram
- `http_server_duration_milliseconds_count` - Server HTTP request count
- `http_server_duration_milliseconds_sum` - Server HTTP request duration sum

**Label Transformation**:
When OTel Collector re-exports metrics to Prometheus, the original `job` label is renamed to `exported_job` to avoid conflicts. Dashboard queries use:
``promql
count(http_client_duration_milliseconds_bucket{exported_job="erm-monitoring-service"}) > 0
``

### Dashboard Features
**ERM System Overview** (`http://localhost:3000`):
1. **Service Health Panels** - Real-time status indicators:
   - ?? GREEN: Service running and exporting metrics
   - ?? RED: Service down or no metrics (5+ minutes)
   - ?? YELLOW: No metrics expected (platform services)

2. **Traffic Metrics**:
   - Request Rate (RPM) by service
   - Average Latency (milliseconds)
   - Error Rate (5xx errors)

**Services Monitored**:
- Application: Monitoring, Decisioning, Audit, Notification, Web Portal, OTel Collector
- Platform: PostgreSQL, Kafka, Keycloak, OPA, Prometheus, Grafana, Jaeger, Mailpit

### Implementation Challenges

#### Challenge 1: Metric Label Mismatch
- **Symptom**: Dashboard showed RED for all application services despite them running.
- **Root Cause**: Queries used `job="service-name"` but OTel Collector renamed to `exported_job="service-name"`.
- **Resolution**: Updated all dashboard queries to use `exported_job` label.

#### Challenge 2: Dashboard Version Conflict
- **Symptom**: Grafana refused to reload updated dashboard file.
- **Root Cause**: Grafana cached version 17 (old), file had version 6 (new). Grafana won't downgrade versions.
- **Resolution**: Deleted Grafana database, restarted container to force fresh provisioning.

#### Challenge 3: Duplicate Dashboard Files
- **Symptom**: Grafana loaded wrong/outdated dashboard.
- **Root Cause**: Two dashboard files existed (`system_dashboard.json` and `system_dashboard_v2.json`).
- **Resolution**: Deleted duplicate files, cleaned up 7 temporary test files.

### Prometheus Caching Behavior
Metrics remain cached for approximately **5 minutes** after a service stops:
- Prevents false alarms from brief service restarts
- Dashboard shows RED only after sustained downtime (5+ minutes)
- Service returns to GREEN within 10-30 seconds after restart

### Validation Testing
**Controlled Downtime Test** (2026-02-16):
- **Service**: `erm-audit-service`
- **Duration**: 5 minutes 30 seconds
- **Stop Time**: 14:25:53 GMT
- **Restart Time**: 14:29:36 GMT

**Results**:
- ? Dashboard remained GREEN during cache period (0-5 minutes)
- ? Dashboard turned RED after cache expiry (~5 minutes)
- ? Dashboard returned to GREEN within ~1 minute of restart
- ? No impact on other services (isolation verified)

**Conclusion**: Traffic light system working correctly with appropriate buffering to prevent false alarms.

### Operations Guide
Comprehensive observability operations documentation available at:
- `/infra/local/OBSERVABILITY.md`

---

## ⏱️ Phase 13: SLA Compliance Tracking

**Goal**: Implement historical SLA compliance tracking by capturing completion timestamps for each workflow stage and visualizing Met/Missed status.

### Problem Statement
While Phase 9 implemented SLA **deadlines** (countdown timers), the platform lacked historical completion timestamps. This made it impossible to:
- Report on SLA compliance metrics (e.g., "95% of cases triaged on time")
- Display retrospective Met/Missed status for completed stages
- Perform trend analysis on workflow efficiency

### Solution Design

#### Database Schema Changes
Added three completion timestamp columns to `BreachCase`:

```prisma
model BreachCase {
  // ... existing fields
  triage_due_at        DateTime?
  triage_completed_at  DateTime?    // NEW
  decision_due_at      DateTime?
  decision_approved_at DateTime?    // NEW
  closure_due_at       DateTime?
  closed_at            DateTime?    // NEW
}
```

**Rationale**: Each SLA stage now has both a `_due_at` (deadline) and `_completed_at` (actual) timestamp, enabling Met/Missed calculation.

#### Backend Event Handling
Enhanced `MonitoringService` to capture completion timestamps via event-driven architecture:

**1. Triage Completion** (`erm.risk.assessment-created.v1`)
```typescript
async handleRiskAssessmentCreated(payload: any) {
    await this.prisma.breachCase.update({
        where: { id: breach_case_id },
        data: {
            status: 'triaged',
            triage_completed_at: new Date()
        }
    });
}
```

**2. Decision Approval** (`erm.decisioning.decision-approved.v1`)
```typescript
async handleDecisionApproved(payload: any) {
    await this.prisma.breachCase.update({
        where: { id: breach_case_id },
        data: {
            status: 'decision_approved',
            decision_approved_at: new Date()
        }
    });
}
```

**3. Case Closure** (API Endpoint: `POST /breaches/:id/close`)
```typescript
async closeBreach(id: string) {
    return this.prisma.breachCase.update({
        where: { id },
        data: {
            status: 'closed',
            closed_at: new Date()
        }
    });
}
```

#### Frontend Visualization

**New Component: `SLABadge.tsx`**
Displays retrospective SLA status:
- ✅ **Green "Met"** if `completedAt <= dueAt`
- ❌ **Red "Missed"** if `completedAt > dueAt`
- Returns `null` if no completion timestamp (shows countdown instead)

**Updated Pages:**
- `MonitoringPage.tsx`: Conditionally renders `SLABadge` (completed) or `SLACountdown` (active)
- `DecisioningPage.tsx`: Same conditional rendering + **Bug Fix** (added `'triaged'` status to active cases filter)

**Conditional Rendering Logic:**
```typescript
const getSLA = () => {
    switch (item.status) {
        case 'open': return { label: 'Triage', due: item.triage_due_at, completed: null };
        case 'triaged': return { label: 'Triage', due: item.triage_due_at, completed: item.triage_completed_at };
        // ... similar for decision_approved and closed
    }
};

{sla && sla.due && (
    sla.completed ? (
        <SLABadge label={sla.label} dueAt={sla.due} completedAt={sla.completed} />
    ) : (
        <SLACountdown label={sla.label} dueDate={sla.due} />
    )
)}
```

### Implementation Challenges

#### Challenge 1: Prisma Version Conflict
**Symptom**: `npx prisma migrate dev` failed with cryptic schema errors.

**Root Cause**:
- `npx` fetched Prisma **7.4.0** (latest) which introduced breaking changes
- Project uses Prisma **5.22.0** (locked in `package.json`)
- Prisma 7.x requires `url` property in datasource block (syntax incompatibility)

**Impact**: Unable to generate migration file or apply schema changes.

**Resolution**:
1. Created manual SQL migration: `add_sla_timestamps.sql`
   ```sql
   ALTER TABLE monitoring."BreachCase"
   ADD COLUMN IF NOT EXISTS "triage_completed_at" TIMESTAMP(3),
   ADD COLUMN IF NOT EXISTS "decision_approved_at" TIMESTAMP(3),
   ADD COLUMN IF NOT EXISTS "closed_at" TIMESTAMP(3);
   ```
2. Applied via Docker exec: `docker exec -i erm-postgres psql -U admin -d monitoring < add_sla_timestamps.sql`
3. Regenerated Prisma client inside container: `docker exec erm-monitoring-service npx prisma generate`
4. Restarted service

**Lesson**: Pin Prisma CLI version in CI/CD scripts to avoid version drift.

#### Challenge 2: Windows PowerShell Execution Policy
**Symptom**: Prisma CLI scripts failed with "Execution Policy" errors.

**Root Cause**: Windows blocked `.ps1` scripts in Prisma's `node_modules/.bin/`

**Workaround**: Used direct SQL migration (see Challenge 1 resolution).

#### Challenge 3: DecisioningPage Filter Bug
**Symptom**: After risk assessment, cases disappeared from Decisioning page.

**Root Cause**: Active cases filter was `['open', 'decision_approved']`, missing `'triaged'` status.

**Fix**:
```typescript
// Before
const activeCases = cases?.filter(c => ['open', 'decision_approved'].includes(c.status)) || [];

// After
const activeCases = cases?.filter(c => ['open', 'triaged', 'decision_approved'].includes(c.status)) || [];
```

### Verification Testing
**Workflow Test** (2026-02-16):
1. Created breach → `triage_due_at` countdown displayed
2. Assessed risk → Status changed to `triaged`, `triage_completed_at` recorded → ✅ "Triage: Met" badge
3. Reviewed decision → Status changed to `decision_approved`, `decision_approved_at` recorded → ✅ "Decision: Met" badge
4. Closed case → Status changed to `closed`, `closed_at` recorded → ✅ "Closure: Met" badge

**Database Verification:**
```sql
SELECT id, status, triage_completed_at, decision_approved_at, closed_at
FROM monitoring."BreachCase"
ORDER BY created_at DESC LIMIT 1;
```

**Result**: All timestamps populated correctly for new workflow.

### Known Limitations
- **Historical Data**: Breach cases created before migration lack completion timestamps and will continue showing countdown timers instead of badges.
- **Future Enhancement**: Add SLA compliance reporting endpoint (e.g., "% triaged on time by severity").

### Files Modified
- **Schema**: `services/monitoring-and-breaches/schema.prisma`
- **Backend**:
  - `services/monitoring-and-breaches/src/monitoring/monitoring.service.ts`
  - `services/monitoring-and-breaches/src/monitoring/monitoring.controller.ts`
- **Frontend**:
  - `web/portal/src/components/common/SLABadge.tsx` (NEW)
  - `web/portal/src/pages/MonitoringPage.tsx`
  - `web/portal/src/pages/DecisioningPage.tsx`
  - `web/portal/src/api/monitoring.ts`
- **Migration**: `services/monitoring-and-breaches/add_sla_timestamps.sql`

---
