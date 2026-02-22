# Reference Architecture

This document provides the high-level architecture container view for the ERM platform, illustrating the interaction between domain services and platform capabilities.

## 1. Container Diagram (Runtime Topology)

```mermaid
flowchart TB
  UI[Web UI] --> APIGW[API Gateway / BFF]

  subgraph Domains
    MB[Monitoring & Breaches Service]
    AC[Appetite & Criteria Service]
    DA[Decisioning & Approvals Service]
    EP[Evidence & Provenance Service]
    AM[Action Management Service]
    AR[Audit & Reporting Service]
    AI[AI Risk Service - Gemini 2.0]
  end

  APIGW --> MB
  APIGW --> DA
  APIGW --> AC
  APIGW --> EP
  APIGW --> AM
  APIGW --> AR

  subgraph Platform
    BUS[Event Bus]
    ID[Identity Provider / IAM]
    POL[Policy Engine - RBAC/ABAC/SoD]
    OBS[Observability - logs/metrics/traces]
    NOTIF[Notification Adapter - Teams]
    STORE[Object Store - Evidence]
    AUDITSTORE[Append-only Audit Store]
  end

  MB --> BUS
  DA --> BUS
  EP --> BUS
  AC --> BUS
  AM --> BUS
  AI --- BUS
  AI -.-> GEM[Google Gemini API]

  AR --> AUDITSTORE
  MB --> AUDITSTORE
  DA --> AUDITSTORE
  EP --> AUDITSTORE
  AI --> AUDITSTORE

  EP --> STORE
  APIGW --> POL
  APIGW --> ID
  MB --> NOTIF
  MB --> OBS
  DA --> OBS
  EP --> OBS
  AI --> OBS
```

## 2. Logical Information Model

This diagram illustrates the core entity relationships, emphasizing the link between breach detection, AI suggestions, and human-in-the-loop calibration.

```mermaid
erDiagram
    BreachCase ||--o{ BreachSignal : triggered_by
    BreachCase ||--o| AssessmentSuggestion : enriched_by
    AssessmentSuggestion ||--o| HumanFeedbackLog : calibrated_by
    BreachCase ||--o{ ActionItem : requires
    ActionItem ||--o{ EvidenceItem : verified_by
    
    BreachCase {
        string breach_case_id PK
        enum status
        enum severity
        datetime created_at
    }

    AssessmentSuggestion {
        string suggestion_id PK
        string model_version
        string suggested_severity
        decimal confidence_score
        text rationale
    }

    HumanFeedbackLog {
        string feedback_id PK
        string reviewer_id
        enum action "Accepted | Modified | Rejected"
        text override_rationale
    }

    ActionItem {
        string action_item_id PK
        enum status
        date due_date
    }

    EvidenceItem {
        string evidence_id PK
        enum type
        string uri
        string integrity_hash
    }
```

## Architectural Components

### Domain Services
## Physical Deployment Strategy (Proof-of-Path)

For the initial "Walking Skeleton", we utilize a **Single PostgreSQL Instance** with isolated **Schemas per Bounded Context**. 

- **Monitoring Schema**: `BreachCase`, `Evaluation`
- **Decisioning Schema**: `Decision`, `Approval`
- **Audit Schema**: `AuditEvent`

This preserves logical separation and System of Record (SoR) integrity while minimizing infrastructure overhead during early build. Transition to a database-per-service model can be executed without application code changes as the platform scales.

- **Monitoring & Breaches**: Manages breach signals, triage, and breach case lifecycle.
- **Appetite & Criteria**: Owns appetite statements, versions, and threshold definitions.
- **Decisioning & Approvals**: Orchestrates the governance flow, authority checks, and decisions.
- **Evidence & Provenance**: Handles attachment indexing and integrity validation.
- **Action Management**: Tracks remediation actions and their completion status.
- **Audit & Reporting**: Aggregates append-only events for governance reporting.

### Platform Capabilities
- **Event Bus**: Decoupled asynchronous communication (e.g., Kafka, Azure Service Bus).
- **Audit Store**: Specialised immutable storage for control events.
- **Policy Engine**: Centralised enforcement for RBAC/ABAC and SoD rules.
- **Evidence Store**: Encrypted object storage for physical evidence files.
