---
doc_type: sprint_brief
lighthouse: sb-01
sprint: ux-validation
version: 0.1.0
last_updated: 2026-02-07
---

# Sprint Brief — SB-01 UX Validation

## Sprint Goal

Validate the SB-01 Appetite Breach Response workflow UX before heavy build by testing:
1. Critical path completion (happy path)
2. Governance gate clarity (SoD, approvals, evidence)
3. Navigation and IA comprehension
4. Form usability with realistic data

## Scope

### In Scope
- **Lighthouse**: SB-01 (Safety breach response)
- **BU**: BU-01 (pilot)
- **Personas**: Incident Lead, Risk Lead, BU Risk Owner
- **Fidelity**: Mid-fidelity clickable prototype

### Out of Scope
- Real backend or data persistence
- Multi-BU scenarios
- Admin/config workflows
- Mobile responsiveness (desktop-first)

---

## Critical Paths to Validate

### Spine (Happy Path)
```
Breaches List → Open Case → Triage → Evaluate vs Threshold 
→ Escalate → Decision Ask → Approval → Action Plan → Close → Audit Pack
```

### Failure Modes
1. **Evaluate without rationale** → Blocked with clear guidance
2. **Approve High severity without required evidence** → Blocked with checklist

---

## Success Measures

| Measure | Method | Target |
|:--------|:-------|:-------|
| Task completion | Success / Partial / Fail | ≥80% Success |
| Critical errors | Count per session | 0 blockers |
| Time on task | Rough timing | Triage <2 min, Approval <3 min |
| Confidence rating | 1-7 scale post-task | ≥5 average |

---

## Finding Severity

| Severity | Definition | Action |
|:---------|:-----------|:-------|
| **P0** | Blocks task completion or introduces governance risk | Must fix before build |
| **P1** | Major confusion or slowdown | Fix in MVP |
| **P2** | Minor polish | Backlog for v1+ |

---

## Timeline

| Phase | Duration | Deliverables |
|:------|:---------|:-------------|
| Prototype build | 2-3 days | Clickable HTML prototype |
| Usability sessions | 2-3 days | 5-8 sessions recorded |
| Synthesis | ½ day | Findings + iterations log |

---

## Team

| Role | Responsibility |
|:-----|:---------------|
| Product | Define scope, prioritise findings |
| UX | Build prototype, run sessions, synthesise |
| Engineering | Review technical feasibility of iterations |
