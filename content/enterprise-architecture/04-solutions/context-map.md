# Context Map

This document defines the relationships and dependencies between the bounded contexts of the ERM platform.

## Relationship Diagram

```mermaid
flowchart TD
  MB[Monitoring & Breaches] -- "Event: breach-detected" --> AI[AI Risk Service]
  AI -- "API: get-context" --> MB
  AI -- "Event: ai_suggestion_created" --o DA[Decisioning & Approvals]
  
  AC[Appetite & Criteria] -- "Published Language" --> MB
  MB -- "Command: request-approval" --> DA
  DA -- "Event: decision-approved" --> MB
  MB -- "Domain events" --> AR[Audit & Reporting]
  AI -- "Metrics" --> OT[OTel Collector]
```

## Relationship Types

| Relationship | Type | Rationale |
| :--- | :--- | :--- |
| **Appetite -> Monitoring** | Published Language | Shared definitions for thresholds used across multiple contexts. |
| **Monitoring -> Decisioning** | Customer/Supplier | Monitoring depends on Decisioning to fulfill the "Action Response" part of the lifecycle. |
| **External -> Monitoring** | Anti-Corruption Layer (ACL) | Protects the core domain from external monitoring tool schema changes. |
| **Audit -> All** | Customer/Supplier | All domains act as suppliers of events to the Audit context. |
| **Identity -> All** | Conformist | Most domains conform to the standard identity/tenancy model provided by the platform. |
| **AI -> Monitoring** | Partnership | High-frequency collaboration; AI enriches signals with low-latency suggestions. |
| **AI -> Decisioning** | Downstream (ACL) | AI provides structured suggestions to the decision engine; ACL prevents drift in suggestion schemas. |
