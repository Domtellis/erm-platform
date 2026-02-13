# Context Map

This document defines the relationships and dependencies between the bounded contexts of the ERM platform.

## Relationship Diagram

```mermaid
flowchart LR
  AC[Appetite & Criteria] -- "Published Language: Appetite/Threshold versions" --> MB[Monitoring & Breaches]
  MB -- "Command/API: request approval" --> DA[Decisioning & Approvals]
  DA -- "Event: decision-approved" --> MB
  MB -- "Reference evidence" --> EP[Evidence & Provenance]
  EP -- "Event: evidence-policy-result" --> DA
  MB -- "Domain events" --> AR[Audit & Reporting]
  DA -- "Domain events" --> AR
  EP -- "Domain events" --> AR

  EXT[External Monitoring] -- "ACL + Contract: breach-detected" --> MB
  TEAMS[Microsoft Teams] <-- Notification adapter --> MB
  IDP[Identity Provider] --> IA[Identity & Access]
  IA --> MB
  IA --> DA
  IA --> EP
```

## Relationship Types

| Relationship | Type | Rationale |
| :--- | :--- | :--- |
| **Appetite -> Monitoring** | Published Language | Shared definitions for thresholds used across multiple contexts. |
| **Monitoring -> Decisioning** | Customer/Supplier | Monitoring depends on Decisioning to fulfill the "Action Response" part of the lifecycle. |
| **External -> Monitoring** | Anti-Corruption Layer (ACL) | Protects the core domain from external monitoring tool schema changes. |
| **Audit -> All** | Customer/Supplier | All domains act as suppliers of events to the Audit context. |
| **Identity -> All** | Conformist | Most domains conform to the standard identity/tenancy model provided by the platform. |
