# Task: Phase 3 - Trusted Platform Base (Hardening) - COMPLETE

## 1. Identity & Access Management (Security)
- [x] **Infrastructure**: Deploy Keycloak container in `docker-compose.yml` <!-- id: 100 -->
- [x] **Infrastructure**: Fix OTel dependency version conflict in `notification-service` <!-- id: 1200 -->
- [x] **Data**: Seed OCI database with ISO 31000 & 45001 standards for Ports & Terminals <!-- id: 1201 -->
    - [x] Research historical seed data and thresholds
    - [x] Create OCI-compatible SQL seed scripts
    - [x] Execute seeding on OCI environment
    - [x] Verify data presence in Portal
- [x] **Backend (Monitoring)**: Implement JWT Strategy & AuthGuard in `services/monitoring-and-breaches` <!-- id: 101 -->
- [x] **Backend (Decisioning)**: Implement JWT Strategy & AuthGuard in `services/decisioning-and-approvals` <!-- id: 101.1 -->
- [x] **Backend (Audit)**: Implement JWT Strategy & AuthGuard in `services/audit-and-reporting` <!-- id: 101.2 -->
- [x] **Frontend**: Integrate OIDC Auth Provider in Web Portal <!-- id: 102 -->
- [x] **Policy**: Update OPA to verify JWT claims/roles <!-- id: 103 -->

## 2. Observability (Visibility)
- [x] **Infrastructure**: Start Jaeger & OTel Collector <!-- id: 200 -->
- [x] **Backend (Monitoring)**: Add OTel Instrumentation <!-- id: 201 -->
- [x] **Backend (Decisioning)**: Add OTel Instrumentation <!-- id: 202 -->
- [x] **Backend (Audit)**: Add OTel Instrumentation <!-- id: 203 -->
- [x] **Verification**: Verify End-to-End Trace <!-- id: 204 -->

## 3. Configuration & Quality (Reliability)
- [x] **Config**: Refactor `ConfigService` with Joi schema validation <!-- id: 300 -->
- [x] **Resilience**: Add Retry/Circuit Breaker for OPA & Database calls <!-- id: 301 -->

## 4. Product Development (Risk Management)
- [x] **Risk Assessment**: Implement Entity & API in `decisioning` service <!-- id: 400 -->
- [x] **Issue Management**: Implement Remediation Plans <!-- id: 401 -->
- [x] **Metrics**: Implement Appetite Compliance & Real-time Dashboard <!-- id: 402 -->


## 5. User Interface (Risk Management)
- [x] **Risk UI**: Create Risk Assessment Component & Form <!-- id: 500 -->
- [x] **Remediation UI**: Create Remediation Plan Component & Form <!-- id: 501 -->

## Phase 5: Release Readiness
- [x] **Docker Optimization**: Multi-stage builds for production <!-- id: 600 -->
- [x] **CDC Testing**: Implement Pact.js for consumer-driven contracts <!-- id: 601 -->
- [x] **Documentation**: Generate Swagger/OpenAPI documentation <!-- id: 602 -->
- [x] **Deploy Production Stack (Local)**
  - [x] Fix Port Conflicts
  - [x] Fix Build Paths (dist/src/main)
  - [x] Fix Prisma Schemas (OpenSSL)
  - [x] Fix Database Initialization (init.sql)
  - [x] Fix Login/Keycloak Connectivity
  - [x] Fix Breach Reporting (JWKS URL)
  - [x] Fix Decisioning/OPA Connectivity (Monitoring URL)
  - [x] Fix Audit Logs (Missing Outbox Events)


## Phase 6: Reporting & Analytics (Business Intelligence)
- [x] **Data Aggregation**: Implement daily risk snapshots in `audit-service` <!-- id: 700 -->
- [x] **API**: Create endpoints for historical trends and CSV export <!-- id: 701 -->
- [x] **Visualization**: Implement charts (Recharts) in Web Portal <!-- id: 702 -->
- [x] **Reporting**: Generate CSV Export (Client-side) <!-- id: 703 -->

## Phase 7: Notifications & Integrations (Connection)
- [x] **Infrastructure**: Add Mailpit (SMTP Server) to `docker-compose` <!-- id: 800 -->
- [x] **Service**: Create `notification-service` (NestJS) <!-- id: 801 -->
- [x] **Email**: Implement Email Alert for High Severity Breaches <!-- id: 802 -->
- [x] **Webhook**: Implement Jira Remediation Trigger <!-- id: 803 -->
## Phase 9: SLA Timers (Compliance)
- [x] **Database**: Add SLA deadlines to Breach Schema <!-- id: 900 -->
- [x] **Backend**: Implement SLA calculation logic in Monitoring Service <!-- id: 901 -->
- [x] **Frontend**: Create Countdown Timer component <!-- id: 902 -->
- [x] **Integration**: Display SLA status in Breach Details <!-- id: 903 -->
- [x] **Verification**: Verify SLA calculation and display <!-- id: 904 -->

## Phase 10: Evidence & Closure (Compliance)
- [x] **Backend**: Add Evidence entity and API in Decisioning Service <!-- id: 1000 -->
- [x] **Frontend**: Add Evidence Input to Decision Review <!-- id: 1001 -->
- [x] **Policy**: Update OPA to enforce Evidence for High Severity <!-- id: 1002 -->
- [x] **Feature**: Implement Breach Closure Workflow <!-- id: 1003 -->
- [x] **Verification**: Verify Evidence Gating and Closure <!-- id: 1004 -->
- [x] **Feature**: Add "Accept Risk" decision option to Review Case modal <!-- id: 1005 -->
- [x] **Verification**: Ensure "Accept Risk" flows through to approval and closure <!-- id: 1006 -->

## Phase 11: Domain Alignment (Safety & ISO Standards)
- [x] **Frontend**: Update Breach Submission Form with Ports & Terminals metrics <!-- id: 1100 -->
- [x] **Data**: Seed database with ISO 45001 example records <!-- id: 1101 -->
- [x] **Verification**: Verify new examples in Monitoring and Reports <!-- id: 1102 -->

## Phase 12: System Observability Dashboard
- [x] **Infrastructure**: Add Prometheus & Grafana to `docker-compose.yml` <!-- id: 1200 -->
- [x] **Configuration**: Create Prometheus scrape configs and Grafana datasource <!-- id: 1201 -->
- [x] **Dashboard**: Create "ERM System Overview" JSON model <!--id: 1202 -->
- [x] **Dashboard**: Create "ERM System Overview" JSON model <!-- id: 1203 -->
- [x] **Verification**: Verify dashboard loads live data <!-- id: 1204 -->

## Phase 12.1: Enhanced Observability (Metrics & Dashboard)
- [x] **Dependencies**: Install `@opentelemetry/exporter-metrics-otlp-http` in all services <!-- id: 1210 -->
- [x] **Instrumentation**: Configure `NodeSDK` to export metrics to Collector <!-- id: 1211 -->
- [x] **Infrastructure**: Clean up `prometheus.yml` scrape targets <!-- id: 1212 -->
- [x] **Dashboard**: Redesign "ERM System Overview" with professional layout <!-- id: 1213 -->
- [x] **Verification**: Verify individual service status and traffic metrics <!-- id: 1214 -->
- [x] **Testing**: Validate traffic light indicators with controlled service downtime <!-- id: 1215 -->

## Phase 13: SLA Compliance Tracking (Observability/Reporting)
- [x] **Schema**: Add `triage_completed_at`, `decision_approved_at`, `closed_at` to `BreachCase` <!-- id: 1300 -->
- [x] **Backend**: Update Monitoring Service to set timestamps on status change <!-- id: 1301 -->
- [x] **Frontend**: Visualize "SLA Met/Missed" status in Breach List <!-- id: 1302 -->
- [x] **Verification**: Verify timestamps and UI updates <!-- id: 1303 -->
- [x] **Infrastructure**: Fixed Grafana Downtime on OCI (Duplicate Jobs + Missing OTel Vars) <!-- id: 1305 -->
- [x] **Infrastructure**: Standardized health probes using Blackbox + Swagger UI <!-- id: 1306 -->
- [x] **Infrastructure**: Sync all fixes to OCI server <!-- id: 1307 -->
- [x] **Migration Fix**: Applied schema changes via direct SQL migration (Prisma CLI version conflict) <!-- id: 1304 -->

## Phase 14: AI-Assisted Risk Assessment (Intelligence - SB-02)

### 14.0 Platform Preparation
- [x] **Registry**: Update models.json and model-router.py for Gemini 3.1 Pro release (2026-02-20) <!-- id: 1400.1 -->

### 14.1 Governance & Planning (Pre-POC Foundation)
- [x] **Audit**: Perform comprehensive high-depth audit (Master Report) <!-- id: 1400 -->
- [x] **Technical**: Patch missing `AiModule` and `OutboxModule` (Build Restoration) <!-- id: 1401 -->
- [x] **Infra**: Configure Kafka consumers and Snappy compression (Pipeline Fix) <!-- id: 1402 -->

### 14.2 AI Risk Assessment (SB-02 Pilot)
- [x] **Backend**: Implement Gemini-powered Risk Scoring (Logic Validation) <!-- id: 1403 -->
- [x] **Frontend**: Integrate `AISuggestionCard` into Decisioning Flow (UX Pilot) <!-- id: 1404 -->
- [x] **Verification**: End-to-end trace from manual submission to AI suggestion (Final POC) <!-- id: 1405 -->
- [x] **Observability**: Instrument AI Performance Dashboard + Dynamic Datasource <!-- id: 1406 -->
- [x] **Validation**: Expert panel validates synthetic data (>65% agreement) — simulated panel: 25/25 agreed (100%), dataset approved 2026-02-18 <!-- id: 1408 -->

### 14.2 AI Service Development
- [ ] **Schema**: Add `AssessmentSuggestion` table to Prisma schema <!-- id: 1413 -->
- [ ] **Enrichment**: Implement similar-breach data fetching for context <!-- id: 1414 -->
- [ ] **Events**: Listen for `breach-detected` and generate AI suggestion <!-- id: 1415 -->
- [ ] **Logging**: Log all API calls (model version, prompt version, latency) <!-- id: 1416 -->

### 14.3 Frontend AI Interface
- [ ] **Component**: Create `AISuggestionCard` React component <!-- id: 1420 -->
- [ ] **Actions**: Implement Accept/Modify/Reject button handlers <!-- id: 1421 -->
- [ ] **Integration**: Add AI suggestion to Decisioning page <!-- id: 1422 -->
- [ ] **Feedback**: Capture "Why did you modify?" text field <!-- id: 1423 -->
- [ ] **Warnings**: Display "Requires careful review" for High/Critical breaches <!-- id: 1424 -->

### 14.4 Bias Mitigation Framework
- [ ] **Tests**: Implement automated counterfactual tests (monthly cron) <!-- id: 1430 -->
- [ ] **Tracking**: Add `AssessmentDisagreement` table and tracking logic <!-- id: 1431 -->
- [ ] **Dashboard**: Create Grafana dashboard for AI metrics <!-- id: 1432 -->
- [ ] **Alerts**: Configure Notification Service (Email/Jira) alerts for bias detection <!-- id: 1433 -->
- [ ] **Runbooks**: Distribute bias incident response runbook to team <!-- id: 1434 -->

### 14.5 POC Deployment & Operation
- [ ] **Infrastructure**: Add AI service to `docker-compose.prod.yml` <!-- id: 1440 -->
- [ ] **Config**: Set up `.env.ai` with Gemini API key (secure vault) <!-- id: 1441 -->
- [ ] **Training**: All BU-01 Risk Leads complete AI user guide <!-- id: 1442 -->
- [ ] **Deploy**: POC deployment to BU-01 environment <!-- id: 1443 -->
- [ ] **Monitor**: Weekly disagreement analysis (12 weeks) <!-- id: 1444 -->
- [ ] **Audit**: Monthly bias audits (3 cycles) <!-- id: 1445 -->
- [ ] **Survey**: Quarterly user satisfaction survey (>4.0/5.0 target) <!-- id: 1446 -->

### 14.6 Verification & Production Readiness
- [ ] **Accuracy**: Validate >70% accuracy on 50+ real cases <!-- id: 1450 -->
- [ ] **Acceptance**: Sustained >60% acceptance rate for 30 days <!-- id: 1451 -->
- [ ] **Bias**: Zero critical bias incidents during POC <!-- id: 1452 -->
- [ ] **Speed**: Confirm avg assessment time <7 min (vs 15 min baseline) <!-- id: 1453 -->
- [ ] **Approval**: CRO + CISO approve production deployment <!-- id: 1454 -->
- [ ] **Rollout**: Deploy AI to all BUs (production) <!-- id: 1455 -->
