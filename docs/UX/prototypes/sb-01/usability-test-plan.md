---
doc_type: usability_test_plan
lighthouse: sb-01
version: 0.1.0
last_updated: 2026-02-07
---

# Usability Test Plan — SB-01 Appetite Breach Response

## Overview
This plan defines the protocol for validating the SB-01 clickable prototype with pilot users.

**Goal**: Validate that users can complete the breach response critical path and understand governance gates without training.

---

## 1. Participants
Recruit 5-8 participants matching these personas:

| # | Persona | Role | Key Hypotheses |
|:--|:--------|:-----|:---------------|
| 1 | Incident Lead (per-005) | Ops / SOC Analyst | H1, H8, H10 |
| 2 | Incident Lead (per-005) | Senior Ops Lead | H1, H8, H10 |
| 3 | Risk Lead (per-002) | Enterprise Risk Manager | H2, H6, H7, H9 |
| 4 | Risk Lead (per-002) | Risk Analyst | H2, H6, H7, H9 |
| 5 | BU Risk Owner (per-003) | Head of Safety | H3, H7 |
| 6 | BU Risk Owner (per-003) | Terminal Manager | H3, H7 |
| 7 | Governance (per-006) | Internal Audit (Optional) | H4, H9 |

---

## 2. Session Protocol (40 mins)

### Introduction (5 mins)
- "We are testing a new prototype for safety breach management."
- "There are no right or wrong answers; we are testing the system, not you."
- "Please think aloud—tell us what you are looking for and what you expect to happen."

### Context Questions (3 mins)
- "How do you currently handle safety breach escalations today?"
- "What is the biggest pain point in the current process?"

### Task Execution (25 mins)
- Moderator reads scenario + task.
- User attempts to complete task in prototype.
- Moderator observes errors, hesitation, and success.
- **Do not help** unless the user is completely stuck (>1 min).

### Debrief (5 mins)
- "On a scale of 1-7 (1=Impossible, 7=Easy), how would you rate the experience?"
- "What one thing would you change?"

---

## 3. Task Scripts

### Task 1: Triage (Incident Lead)
**Scenario**: "A new safety incident has been reported at Quay 3. You need to assess it."
**Instruction**: "Find the new 'Safety breach at Quay 3' case and triage it as High severity."
**Success Criteria**: Status changes to `Triaged`.
**Hypothesis**: H1

### Task 2: Evaluation (Risk Lead)
**Scenario**: "The case has been triaged. Now you need to check if it breaches our risk appetite."
**Instruction**: "Evaluate the case against the 2026 Safety Appetite using the 'Lost Time Injury Rate' threshold. The measured value is 85."
**Success Criteria**: Result is `Breach`, Computed Severity is `High`.
**Hypothesis**: H2

### Task 3: Decision Submission (Risk Lead)
**Scenario**: "It's a confirmed breach. We need to decide what to do."
**Instruction**: "Submit a decision to 'Mitigate' the breach. You'll need to reference the Incident Report and Photo as evidence."
**Success Criteria**: Decision submitted for approval.
**Hypothesis**: H6

### Task 4: Approval (BU Risk Owner)
**Scenario**: "You've received an urgent request to approve a High severity decision."
**Instruction**: "Review the decision request for 'Safety Breach at Quay 3' and approve it."
**Success Criteria**: Decision state becomes `Approved`.
**Hypothesis**: H3, H7

***Failure Mode Test***: "Before approving, notice the evidence checklist. What would happen if you tried to approve now?" (Test H4)

### Task 5: Action Planning (Incident Lead)
**Scenario**: "The decision is approved. We need to track the work."
**Instruction**: "Create a new action item for 'Safety training refresh' and assign it to Emily Wong."
**Success Criteria**: Action added to list.
**Hypothesis**: H8

### Task 6: Audit Export (Risk Lead)
**Scenario**: "Audit is asking for the file on this case."
**Instruction**: "Export the full audit pack for this case."
**Success Criteria**: User finds Export button and confirms download.
**Hypothesis**: H9

---

## 4. Metrics & Scoring

For each task, record:
- **Completion**: ✅ Success / ⚠️ Partial / ❌ Fail
- **Time**: <1 min / 1-3 min / >3 min
- **Errors**: Count of wrong clicks / navigation errors
- **Quotes**: "I expected the button to be here..."

---

## 5. Logistics
- **Platform**: Local HTML prototype (screen share or hosted link)
- **Recording**: Teams/Zoom recording (with permission)
- **Observer**: One silent observer to take notes
