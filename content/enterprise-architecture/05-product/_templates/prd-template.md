---
id: [product-id]
name: [Product Name]
version: 0.1.0
status: draft
owner: Product
parent: [parent-product-id]  # Optional: if this extends another product
bu: [BU-ID or ALL]
category: [category]
compliance_review_required: false  # Set to true if requires regulatory review
---

# [PRODUCT-ID] PRD — [Product Name]

## 1. Overview

### 1.1 Purpose
[Brief statement of what this product delivers and why it matters]

### 1.2 Problem Statement
[What problem are we solving? Who has this problem? What are the consequences of not solving it?]

### 1.3 Scope (MVP Pilot)
| Dimension | Scope |
| :--- | :--- |
| Business Unit | [BU-ID or ALL] |
| Category | [category] |
| User Segments | [which users] |
| Key Capabilities | [core features] |

### 1.4 Personas
| Persona | Role |
| :--- | :--- |
| [Persona Name] | [What they do with this product] |

---

## 2. User Journey

See: [Link to service blueprint or workflow diagram]

### 2.1 Key User Flows
1. **[Flow Name]:** [Description]
2. **[Flow Name]:** [Description]

---

## 3. Functional Requirements

### 3.1 [Capability Category]
| ID | Requirement | Priority |
|---|---|---|
| FR-001 | [User can...] | P0 |
| FR-002 | [System must...] | P1 |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- [e.g., Response time <2s for 95th percentile]

### 4.2 Security
- [e.g., All data encrypted at rest and in transit]

### 4.3 Compliance
- [e.g., Must comply with ISO 45001, GDPR]

---

## 5. Success Criteria

### 5.1 MVP Success Metrics
1. **[Metric Name]:** [Target]
2. **[Metric Name]:** [Target]

### 5.2 Long-term KPIs
- [Strategic metric aligned to OKRs]

---

## 6. Dependencies

### 6.1 Internal Dependencies
- [Product/Service Name]: [What we need from them]

### 6.2 External Dependencies
- [Vendor/API Name]: [What we need]

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk description] | [L/M/H] | [L/M/H] | [How we'll address it] |

---

## 8. Out of Scope

What we're explicitly NOT doing (to avoid scope creep):
- [Feature/capability]
- [Feature/capability]

---

## 9. Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| POC Complete | [Date] | Not Started |
| MVP Launch | [Date] | Not Started |

---

## 10. Appendix

### 10.1 Related Documents
- [Link to ADRs]
- [Link to technical design]
- [Link to backlog]

### 10.2 Revision History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1.0 | [Date] | Initial draft | [Name] |
