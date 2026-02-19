# ERM Platform (Enterprise Risk Management) - "Walking Skeleton"

This repository contains the source code for the SB-01 Enterprise Risk Management Platform, a distributed microservices system designed for managing operational risks, breaches, and remediations.

## 🟢 System Status (Verified: 2026-02-16)
The "Walking Skeleton" is **Fully Operational**. All core domains have been integrated and verified:
- **IAM**: Keycloak OIDC + OPA Policy Enforcement.
- **Monitoring**: Real-time Breach Ingestion & Outbox Reliability.
- **Decisioning**: Risk Assessment & Remediation Planning.
- **Audit**: Immutable Event Log & Historical Reporting.
- **Notifications**: Email Alerts (High/Critical) & Jira Integration.
- **Observability**: Real-time Metrics Dashboard with Service Health Monitoring.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js (v20+) & NPM

### 1. Start the Platform
The entire platform is containerized.
```bash
cd infra/local
docker-compose -f docker-compose.prod.yml up -d --build
```

### 2. Access Points
- **Web Portal**: [http://localhost:5180](http://localhost:5180)
- **Grafana Dashboard**: [http://localhost:3000](http://localhost:3000) *(login: admin/admin)*
- **Prometheus Metrics**: [http://localhost:9090](http://localhost:9090)
- **Keycloak (Auth)**: [http://localhost:8080](http://localhost:8080)
- **Mailpit (Email)**: [http://localhost:8025](http://localhost:8025)
- **Jaeger (Traces)**: [http://localhost:16686](http://localhost:16686)

### 3. Default Credentials
| Role | Username | Password |
|---|---|---|
| Site Manager | `site-user-01` | `password` |
| Risk Lead | `risk-lead-01` | `password` |

## 🏗️ Architecture

### Middleware & Infrastructure
- **PostgreSQL**: Primary relational database (Stores Breaches, Risks, Plans, Audit Events).
- **Redpanda**: Kafka-compatible event streaming platform (Event Bus).
- **Keycloak**: IAM provider for OIDC authentication and RBAC.
- **OPA (Open Policy Agent)**: Decoupled policy engine for authorization.
- **Mailpit**: SMTP server for email testing and capture.

### Observability
- **Prometheus**: Metrics collection and time-series database.
- **Grafana**: Real-time dashboard with service health monitoring (🟢/🔴 traffic lights).
- **Jaeger**: Distributed tracing visualization.
- **OTel Collector**: Telemetry aggregation sidecar.

### Backend Services (NestJS)
- **Monitoring Service**: Ingestion & System of Record for Metric Breaches.
- **Decisioning Service**: Governance orchestration, Risk Assessment, and Approvals.
- **Audit Service**: Immutable event sinking and Reporting API.
- **Notification Service**: Proactive alerting (Email) and Jira integration.

### Frontend
- **Web Portal**: React (Vite) + TailwindCSS single-page application.

## 🧪 Verification
The platform includes a suite of verification scripts in the `root` directory.
```bash
# Verify Permissions & Policy
node verify-permissions.js

# Verify Risk Assessment Flow
node verify-risk-assessment.js

# Verify Remediation Plan Creation
node verify-remediation.js
```

## 📚 Documentation
- **[Walkthrough](docs/walkthrough.md)**: Detailed step-by-step guide of the implementation and verification.
- **[Task List](docs/task.md)**: Breakdown of completed features.
- **[Implementation Reference](docs/implementation_reference.md)**: Consolidated history of architectural decisions and phases.
