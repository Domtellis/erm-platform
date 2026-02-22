# ERM Platform: Implementation Reference
> **Status**: Living Document
> **Maintained By**: Platform Engineering Team
> **Last Updated**: 2026-02-21

This document serves as a consolidated reference of all implementation phases, architectural decisions, and feature sets delivered for the Clean Energy Risk Management (ERM) Platform, transitioning from the **SB-01 "Walking Skeleton"** to the **SB-02 "Intelligent ERM"**.

## 🎯 Scope Definitions

### SB-01: The Walking Skeleton
The initial Strategic Bet to deliver a fully functional, end-to-end slice of the platform. Covers Phases 1 through 8, establishing the Foundation, Security, Observability, Logic, and Reporting layers.

### SB-02: Intelligent ERM (Current Phase)
The evolution of the platform into a "Predictive & Assisted" risk management system. It introduces **Gemini 2.0 Flash** for automated triage, **Redis** for stateful AI performance, and the **Notification Service** for unified alerting.

---

## 🏗️ Phase 1 & 2: Foundation & Infrastructure
**Goal**: Establish a scalable monorepo structure and deploy core backing services.

### Technical Stack
- **Languages**: TypeScript 5.0+, Node.js 20 (LTS).
- **Frontend**: React 18, Vite 5, TailwindCSS 3.4.
- **Backend**: NestJS 10 (Microservices mode).
- **AI Core**: Gemini 2.0 Flash via Google Vertex AI.
- **Caching**: Redis (Applied for Prompt Cache and SLA state).

### Infrastructure (Docker Compose)
- **PostgreSQL 15**: Auto-initialization via `init.sql`.
- **Redpanda (Kafka)**: Event-driven backbone using transactional Outbox pattern.
- **Redis**: Low-latency cache for AI reasoning and temporary session data.

---

## 🔐 Phase 3: Trusted Platform Base (IAM & Security)
**Goal**: Secure the platform with industry-standard Identity and Access Management (IAM).
- **Identity Provider**: Keycloak 24.
- **Policy-as-Code**: Open Policy Agent (OPA) for decoupled authorization.
- **Backend Security**: Global `AuthGuard` using `passport-jwt` verifying claims against Keycloak JWKS.

---

## ⚖️ Phase 4: Risk Management Domain
**Goal**: Enable core business logic for assessing and mitigating risks.
- **Domain Model**: 5x5 Matrix (Impact x Likelihood).
- **Remediation**: 1-to-Maybe relationship between risks and action plans.
- **Transactional Integrity**: Outbox Pattern ensuring atomicity between DB writes and Kafka events.

---

## 📊 Phase 6 & 7: Reporting & Notifications
- **Audit Trace**: Subscribes to wildcard topic `^erm\..*` to capture ALL domain events.
- **Email System**: `notification-service` using Nodemailer (SMTP).
- **Jira Integration**: Automated ticket creation triggered by `remediation.plan-created` events.

---

## ⚓ Phase 11: Domain Alignment (Safety)
**Goal**: Align platform context with **ISO 31000** & **ISO 45001** for Ports & Terminals.
- **Safety Metrics**: Wind Speed (Knots), Container Stack Height, PM 2.5, Proximity Alerts, Fatigue Index.

---

## 🛰️ Phase 12: Enhanced Observability (Prometheus & Grafana)
**Goal**: Implement real-time monitoring with metrics collection and visualization.
- **Stack**: OTel Collector → Prometheus → Grafana.
- **Dashboard**: "ERM System Overview" with RED/GREEN status based on telemetry heartbeat.

---

## ⏱️ Phase 13: SLA Compliance Tracking
**Goal**: Implement historical SLA compliance tracking.
- **Logic**: Captures actual completion timestamps (`triage_completed_at`, etc.).
- **UI**: Introduced `SLABadge.tsx` for retrospective **Met** vs **Missed** status.

---

## 📊 Phase 14: Intelligent Risk Management (SB-02)
**Goal**: Transition from manual triage to "AI-Assisted" risk assessment.

### AI Architecture (Gemini 2.0 Integration)
- **Model**: `gemini-2.0-flash`.
- **Reasoning Standard**: **"Thinking-First" Progressive Disclosure**. AI provides a raw score and a collapsed reasoning drawer citing ISO 45001 clauses.

### HITL Flow
- **Suggestion**: AI publishes suggested score and reasoning.
- **Review**: Human reviews; can Accept or Override with feedback.
- **Calibration**: Disagreements trigger calibration events for model tuning.

---

## 🚀 Phase 15: Operations-as-Code & Multi-Channel Alerting
**Goal**: Bridge the gap between technical monitoring and human operational response.
- **Unified Alerting**: Decouples domain events from channels (Email, Jira) via the `erm-notification-service`.
- **AI Oversight**: Centralized hub for monitoring bias, agreement rates, and model performance.

---

## 🔮 Future Architecture (Intelligent Roadmap)
- **Phase 16: EU AI Act Compliance**: Automated self-documentation of AI training data and bias test results.
- **Phase 17: Multi-BU Federated Identity**: Scaling the platform with isolated security realms.
- **Phase 18: Predictive Maintenance**: Transitioning from breach response to breach **prevention**.

---
