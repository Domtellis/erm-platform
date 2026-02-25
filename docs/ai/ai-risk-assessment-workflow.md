# AI Risk Assessment Workflow — SB-02

This document defines the end-to-end operational workflow for AI-assisted risk assessments within the ERM Platform.

## 1. Process Overview
The workflow ensures that every appetite breach is analyzed by a vetted AI model against ISO 45001 standards, with mandatory human verification before any governance decision is finalized.

```mermaid
graph TD
    A[Breach Detected] --> B[AiService Triggered]
    B --> C[Gemini Analysis]
    C --> D[Suggestion Stored]
    D --> E[Human Notification]
    E --> F{Human Review}
    F -->|Accept| G[Final Score Saved]
    F -->|Modify| H[Human Calibration]
    F -->|Reject| I[Manual Scoring]
    G --> J[Governance Decision]
    H --> J
    I --> J
```

```mermaid
sequenceDiagram
    participant User as User / System
    participant Portal as ERM Portal
    participant API as AI Risk Service
    participant DB as Database
    participant Kafka as Kafka Bus

    User->>Portal: Submit Breach Report
    Portal->>DB: Save Draft
    Portal->>User: Show Draft

    User->>Portal: Request AI Assessment
    Portal->>API: POST /api/ai/assess
    API->>API: Load Context (ISO 45001, Site History)
    API->>API: Call Gemini 2.0 Flash
    API-->>Portal: JSON Suggestion (Score, Rationale)

    Portal->>Portal: Store Suggestion (Pending Review)
    Portal->>User: Show "AI Suggestion" Card

    alt User Accepts
        User->>Portal: Click "Accept"
        Portal->>DB: Save Final Score
        Portal->>Kafka: Emit "RiskAssessed" Event
        Portal->>User: Show Success Message
    else User Modifies
        User->>Portal: Edit Score/Rationale
        Portal->>DB: Update Suggestion
        Portal->>User: Show "Updated Suggestion"
    else User Rejects
        User->>Portal: Click "Reject"
        Portal->>DB: Mark as Rejected
        Portal->>User: Revert to Manual Entry
    end
```


## 2. Roles & Responsibilities

| Role | Responsibility |
| :--- | :--- |
| **System Agent** | Monitor Gemini API health, token usage, and Kafka outbox processing. |
| **Risk Analyst** | Perform primary review of AI suggestions; calibrate scores based on local context. |
| **BU Risk Owner** | Approve high-severity assessments; ensure AI recommendations are implemented. |

## 3. SLA & Quality Targets
- **AI Turnaround**: < 5 seconds from breach detection to suggestion availability.
- **Human Review**: Mandatory within 24 hours for High/Critical breaches.
- **Accuracy Target**: > 85% human acceptance rate (Initial target: 65%).

## 4. Model Context (Prompt Engineering)
The `AiService` embeds the following context in every request:
- ISO 45001 Clause mapping.
- Historical breach context for the specific site.
- Current Risk Appetite thresholds.

## 5. Escalation Path
If the AI service is unavailable (e.g., API quota exceeded or network failure):
1.  System alerts **Risk Lead** via internal dashboard.
3.  "AI Service Down" banner is displayed on the Decisioning Page.

## 6. Monitoring & TRiSM Visibility
The AI assessment pipeline is instrumented for **AI TRiSM (2026 Standards)**. 
- **Dashboard**: [AI Risk Assessment Performance](https://erm.prod:5180/grafana/d/ai-risk-performance/)
- **Golden Signals**: Real-time tracking of token cost, safety blocks, and human agreement rates.
- **Bootstrapping**: Metrics are initialized to `0` on service startup via `OnModuleInit` to ensure continuous visibility even during low-traffic periods.
