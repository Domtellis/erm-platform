---
id: sb-01
name: Appetite breach response
bu: BU-01
breach_category: Safety
owner: Product
status: active
version: 0.1.0
---

# SB-01 Lighthouse Charter — Appetite Breach Response (Safety)

## Purpose
Deliver a thin, end-to-end workflow that drives real operational adoption when a **Safety breach** crosses defined **Risk Appetite / Thresholds**, ensuring:
- consistent triage and escalation
- decisioning with delegated authority
- evidence and approvals captured in-tool
- audit-ready traceability from day 1

## Problem statement
Safety breaches are often handled across email, chats, and spreadsheets, leading to:
- inconsistent escalation and decisioning
- missing evidence and unclear rationale
- weak audit trails and poor repeatability
- delays in corrective actions

## Scope boundaries (pilot)
- Business Unit: **BU-01**
- Category: **Safety**
- Breach intake: **manual case creation + monitoring event stub**
- Notifications: **Microsoft Teams**
- High severity approval: **BU Risk Owner**

## In-scope personas
- Incident Lead (operator)
- Risk Lead (governance oversight)
- BU Risk Owner (accountable approver for High severity)

## Definition of “success”
See: `success-metrics.yaml`

## Definition of “done” for MVP
- A Safety breach can be run **end-to-end in-tool:**

  **Detect/Create → Triage → Validate vs Appetite → Escalate → Decision + Approval → Action Plan → Evidence bundle → Close + Audit pack export**

- SoD, approvals, evidence requirements and audit log are enforced (not optional)
- Workflow is production-usable by BU-01 pilot users
