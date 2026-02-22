# Incident Classification Matrix (Project-Wide)

**Purpose**: Standardize response times and escalation paths for different incident categories.

| Severity | Category | Example | Response SLA | Escalation |
| :--- | :--- | :--- | :--- | :--- |
| **P0 - Critical** | Platform Down | API Gateway timeout; DB connection failure. | < 15 min | CTO + CRO |
| **P1 - High** | AI Integrity Breach | Systemic bias detected; Critical severity mis-assessment. | < 1 hour | AI Oversight Lead |
| **P1 - High** | Communication Failure | Notification Service down (No Email/Jira). | < 1 hour | Ops Team Lead |
| **P2 - Medium** | Performance Degraded | AI latency > 5s; Dashboard slow load. | < 4 hours | Backend Team |
| **P3 - Low** | Minor Functional Bug | UI glitch; Typo in PRD export. | < 24 hours | Frontend Team |

## Escalation Channels
- **P0/P1**: Notification Service (Email + Jira) + On-call Phone.
- **P2/P3**: Jira Ticket (Standard priority).
