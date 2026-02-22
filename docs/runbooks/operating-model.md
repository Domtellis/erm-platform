# ERM Operating Model: Service-Ops SOP

## 1. Overview
This SOP defines the "Service-Ops" model for the ERM Platform. It shifts away from manual communication (Slack/Teams) toward a centralized **Notification Service**.

## 2. Notification Priority Matrix

| Severity | Channel | Response SLA |
| :--- | :--- | :--- |
| **P0 - Critical** | Email + Jira + Phone | < 15 Min |
| **P1 - High** | Email + Jira | < 1 Hour |
| **P2 - Medium** | Jira Ticket | < 4 Hours |

## 3. Incident Management
All platform incidents must be logged in the **Incident Management Module** to ensure cross-service traceability.

## 4. AI Oversight
The **AI Oversight Lead** conducts weekly calibration reviews. All disagreements must be documented as "Feedback" in the AI Risk Service.
