---
doc_type: information_architecture
lighthouse: sb-01
version: 0.1.0
last_updated: 2026-02-07
---

# Information Architecture — ERM Platform

## Navigation Model

The ERM platform uses a **task-based navigation** combined with **object hubs** to balance user intent with data discoverability.

### Primary Navigation (Left Sidebar)

| Nav Item | Purpose | Primary Persona(s) |
|:---------|:--------|:-------------------|
| **Home** | My Work: assigned cases, pending approvals, overdue actions | All |
| **Breaches** | Breach case list, filters, detail views | Incident Lead, Risk Lead |
| **Risk** | Risk register, assessments, appetite statements | Risk Lead, BU Risk Owner |
| **Controls** | Control library, testing, evidence | Control Owner |
| **Monitoring** | Indicators, thresholds, dashboards | Incident Lead |
| **Decisions** | Decision log, pending approvals | BU Risk Owner, Risk Lead |
| **Actions** | Task backlog, completion tracking | All |
| **Reports** | Audit packs, board pack diff | Risk Lead, Compliance |
| **Admin** | RBAC, SoD config, integrations | Platform Admin |

### Secondary Navigation (Context Header)

- **Breadcrumbs**: Home → Breaches → BC-2026-000123 → Triage
- **Object actions**: Edit, Escalate, Export, Close
- **Status chips**: Severity, State, SLA timer

---

## Object Model (UX Hubs)

Core objects map to platform entities and drive navigation consistency:

### SB-01 Core Objects

| Object | Hub Location | Key Actions | Related Objects |
|:-------|:-------------|:------------|:----------------|
| `BreachCase` | Breaches | Create, Triage, Close | Evaluation, Decision, Evidence, Actions |
| `Evaluation` | Case Detail | Select Appetite, Evaluate | AppetiteStatementVersion, Threshold |
| `Decision` | Case Detail / Decisions | Submit, Approve/Reject | Approval, Evidence |
| `Approval` | Decisions | Approve, Reject, Comment | Decision |
| `EvidenceItem` | Case Detail / Evidence tab | Upload, View, Delete | BreachCase |
| `ActionItem` | Case Detail / Actions | Create, Complete, Track | BreachCase |

### Reference Objects

| Object | Hub Location | Purpose |
|:-------|:-------------|:--------|
| `AppetiteStatementVersion` | Risk / Appetite | Versioned appetite for evaluation |
| `Threshold` | Risk / Appetite | Tolerance rules |
| `AuditEvent` | Audit timeline | Immutable event log |

---

## Persona-Based Navigation ("Where do I go to...?")

### Incident Lead (per-005)

| Task | Navigate To |
|:-----|:------------|
| Create a new breach case | Home → "New Case" button OR Breaches → "Create" |
| Triage an existing case | Breaches → Select case → Triage tab |
| Attach evidence | Case Detail → Evidence tab → Upload |
| Track my assigned actions | Home → My Actions section |

### Risk Lead (per-002)

| Task | Navigate To |
|:-----|:------------|
| Evaluate breach against appetite | Case Detail → Evaluation tab |
| Submit a decision | Case Detail → Decision tab → Submit |
| Review pending approvals | Decisions → Pending tab |
| Export audit pack | Case Detail → Export → Audit Pack |

### BU Risk Owner (per-003)

| Task | Navigate To |
|:-----|:------------|
| Review decision asks | Home → Decision Asks section OR Decisions → Pending |
| Approve a High severity decision | Decision Ask screen (direct link from Teams) |
| View breach status | Breaches → Filter by BU |

---

## Search Strategy

### Global Search (Header)
- Searches across: Cases, Decisions, Actions
- Prefix syntax: `case:BC-2026-*`, `decision:pending`, `action:overdue`
- Returns: Object type, ID, title, status, owner

### Scoped Search (Within Lists)
- Free-text filter within current view
- Column filters: Severity, Status, Owner, SLA

---

## Cross-Linking Patterns

Object pages deep-link to related objects:

```
BreachCase
├── → Evaluation (linked evaluation record)
│   └── → AppetiteStatementVersion (version used)
│       └── → Threshold (threshold applied)
├── → Decision (decision submitted)
│   └── → Approval(s) (approval chain)
├── → EvidenceItem[] (attached evidence)
├── → ActionItem[] (action plan)
└── → AuditEvent[] (timeline)
```

---

## Naming Conventions

| Internal Term | User-Facing Label | Notes |
|:--------------|:------------------|:------|
| `BreachCase` | Breach Case | Avoid "incident" to prevent confusion with IT incidents |
| `AppetiteStatementVersion` | Appetite Statement | Show version badge when relevant |
| `Threshold` | Threshold / Tolerance | Use in evaluation context |
| `computed_severity` | Calculated Severity | Distinguish from triaged severity |
| `sod_check_passed` | SoD Check | Show as badge: ✓ Pass / ✗ Fail |

---

## IA Quality Checklist

- [x] Navigation labels match user language (validated via persona journeys)
- [x] Search strategy covers global + scoped needs
- [x] Cross-links enable object discovery without menu hopping
- [ ] Card sorting validation (pending usability testing)
- [ ] Tree testing validation (pending usability testing)
