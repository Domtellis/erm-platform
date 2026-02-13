---
doc_type: hypotheses
lighthouse: sb-01
version: 0.1.0
last_updated: 2026-02-07
---

# UX Validation Hypotheses — SB-01

## Purpose

These hypotheses define what we're testing in the clickable prototype. Each hypothesis maps to specific features/stories and will be validated through usability testing.

---

## Hypotheses

### H1: Triage Speed
**Hypothesis**: Incident Leads can triage and move a case to `Triaged` status in under 2 minutes without help.

| Mapping | Reference |
|:--------|:----------|
| Feature | F-01-03 |
| Story | S-04 |
| Persona | Incident Lead (per-005) |

**Test Task**: "Find the new safety breach case and triage it to High severity."

---

### H2: Evaluation Comprehension
**Hypothesis**: Risk Leads can complete threshold evaluation and understand the computed severity and why it was calculated.

| Mapping | Reference |
|:--------|:----------|
| Feature | F-02-01, F-02-02 |
| Story | S-05, S-06 |
| Persona | Risk Lead (per-002) |

**Test Task**: "Select appetite version AS-2026-01 and threshold TH-SAFETY-HIGH, then evaluate measured value 85 with rationale."

---

### H3: Approval Confidence
**Hypothesis**: BU Risk Owners can approve High severity decisions confidently from one screen without needing separate emails or documents.

| Mapping | Reference |
|:--------|:----------|
| Feature | F-03-03 |
| Story | S-09 |
| Persona | BU Risk Owner (per-003) |

**Test Task**: "Approve the High severity decision. What would you need to feel confident?"

---

### H4: Evidence Gating Clarity
**Hypothesis**: Users understand when evidence is missing and know how to fix it (evidence checklist is clear).

| Mapping | Reference |
|:--------|:----------|
| Feature | F-04-02 |
| Story | S-11 |
| Persona | All |

**Test Task**: "Try to approve without the RCA. What happens? Is it clear what to do?"

---

### H5: Navigation Labels
**Hypothesis**: Navigation labels match user language — users can find breach cases, decisions, and actions without confusion.

| Mapping | Reference |
|:--------|:----------|
| Feature | - |
| Story | - |
| Persona | All |

**Test Task**: "Where would you go to find all pending approvals?"

---

### H6: Decision Submission Flow
**Hypothesis**: Risk Leads can submit a decision with rationale and evidence references in a single flow.

| Mapping | Reference |
|:--------|:----------|
| Feature | F-03-02 |
| Story | S-08 |
| Persona | Risk Lead (per-002) |

**Test Task**: "Submit a decision to mitigate with rationale and reference the evidence."

---

### H7: SoD Understanding
**Hypothesis**: Users understand the Segregation of Duties indicator and why they may be blocked from approving their own decisions.

| Mapping | Reference |
|:--------|:----------|
| Feature | F-03-03 |
| Story | S-09 |
| Persona | Risk Lead, BU Risk Owner |

**Test Task**: "What does the SoD badge mean? Why can't you approve this decision?"

---

### H8: Action Plan Tracking
**Hypothesis**: Users can create actions, assign owners, and understand completion requirements.

| Mapping | Reference |
|:--------|:----------|
| Feature | F-04-03 |
| Story | S-12 |
| Persona | Incident Lead, Risk Lead |

**Test Task**: "Create an action item and assign it to yourself."

---

### H9: Audit Pack Clarity
**Hypothesis**: Users understand what the audit pack contains and can export it with confidence.

| Mapping | Reference |
|:--------|:----------|
| Feature | F-05-02 |
| Story | S-15 |
| Persona | Risk Lead |

**Test Task**: "Export the audit pack. What do you expect to see included?"

---

### H10: Escalation Visibility
**Hypothesis**: Users understand when and why escalation was triggered (auto-escalation explanation is clear).

| Mapping | Reference |
|:--------|:----------|
| Feature | F-03-01 |
| Story | S-07 |
| Persona | Incident Lead, Risk Lead |

**Test Task**: "This case was escalated. Why and to whom?"

---

## Validation Approach

Each hypothesis will be tested with:
1. **Task script** (specific action to perform)
2. **Observation** (what user does)
3. **Post-task question** ("What did you expect?")
4. **Confidence rating** (1-7 scale)

Findings will be logged in `test-notes/session-*.md` and synthesised in `findings.md`.
