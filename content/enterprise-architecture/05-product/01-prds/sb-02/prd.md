---
id: sb-02
name: AI-Assisted Risk Assessment (Intelligence Platform)
version: 0.1.0
status: draft
owner: Product
parent: sb-01  # Enhances SB-01 Appetite Breach Response
bu: ALL        # Cross-BU capability
category: ai-automation
compliance_review_required: true  # Triggers governance review
---

# SB-02 PRD — AI-Assisted Risk Assessment

## 1. Overview

### 1.1 Purpose
Provide AI-powered risk assessment suggestions to Risk Leads, reducing assessment time from 15 minutes to <5 minutes while maintaining or improving consistency and accuracy. This Strategic Bet enhances SB-01 (Appetite Breach Response) by introducing intelligent automation to the risk triage workflow.

### 1.2 Problem Statement

**Current State:**
- Risk assessment is **100% manual**, requiring Risk Leads to analyze breach metadata, recall ISO 45001 standards, and apply risk matrices
- Average assessment time: **15 minutes per breach**
- **Inconsistency:** Same breach assessed by different leads can vary by 1-2 risk points (on 1-5 scale)
- **Cognitive load:** Risk Leads juggle multiple breaches, leading to fatigue and errors
- **Limited historical learning:** Knowledge stays in individuals' heads, not systematically captured

**Impact:**
- SLA pressure: Triage SLA is 2 hours; multiple breaches can cause backlogs
- Quality variance: Inconsistent assessments lead to either under-response (safety risk) or over-response (resource waste)
- Training gap: New Risk Leads take 3-6 months to achieve expert-level consistency

### 1.3 Scope (MVP Pilot)

| Dimension | Scope |
| :--- | :--- |
| Business Unit | BU-01 (Ports & Terminals) initially, expand to ALL after POC |
| Category | Zero-shot risk assessment using Gemini 2.0 Flash |
| User Segments | Risk Leads (certified), AI Oversight Lead (new role) |
| Key Capabilities | AI risk suggestion, human override, bias monitoring, disagreement tracking |
| **OUT OF SCOPE** | Auto-approval (always human-in-loop), fine-tuned models (zero-shot only), remediation suggestions (Phase 2) |

### 1.4 Personas

| Persona | Role |
| :--- | :--- |
| **Risk Lead** | Uses AI suggestions to speed up risk assessments; can accept, modify, or reject |
| **AI Oversight Lead** | Manages prompts, monitors bias, conducts monthly audits (NEW ROLE) |
| **Chief Risk Officer** | Approves governance policy, reviews bias reports, ultimate accountability |
| **Operations Manager** | Monitors team efficiency gains from AI |

---

## 2. User Journey

See: [AI Risk Assessment Workflow](../../../03-experience/workflows/wf-risk-assessment.yaml)

### 2.1 Key User Flows

1. **Risk Lead Receives AI Suggestion:**
   - Breach is triaged → AI service automatically generates suggestion
   - Risk Lead opens Decisioning page → sees AI suggestion card
   - Reviews AI's impact, likelihood, justification, and confidence
   - Decides: Accept | Modify | Reject

2. **AI Oversight Lead Manages Bias:**
   - Monthly automated bias tests run
   - Reviews disagreement patterns weekly
   - Updates prompts based on learnings
   - Escalates bias incidents per runbook

3. **Risk Lead Provides Feedback:**
   - Modifies AI suggestion → logs reason
   - System tracks disagreement for analysis
   - Feedback loop improves future suggestions

---

## 3. Functional Requirements

### 3.1 AI Suggestion Generation

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | System SHALL generate AI risk assessment within 5 seconds of breach triage | P0 |
| FR-002 | AI SHALL output: Impact (1-5), Likelihood (1-5), Justification (text), Recommendations (text), Confidence (Low/Medium/High) | P0 |
| FR-003 | AI SHALL cite ISO 45001 standards or relevant regulations in justification | P0 |
| FR-004 | AI SHALL NOT receive initial severity in prompt (prevent anchoring bias) | P0 |
| FR-005 | System SHALL log: model version, prompt version, timestamp, API latency for every assessment | P1 |

### 3.2 Human Override UI

| ID | Requirement | Priority |
|---|---|---|
| FR-006 | Risk Lead SHALL see AI suggestion card with Accept/Modify/Reject buttons | P0 |
| FR-007 | Risk Lead SHALL be able to accept AI suggestion with 1 click (creates Risk Assessment record) | P0 |
| FR-008 | Risk Lead SHALL be able to modify AI suggestion (e.g., change impact from 3 to 4) | P0 |
| FR-009 | Risk Lead SHALL be able to reject AI and assess manually (no AI influence) | P0 |
| FR-010 | System SHALL REQUIRE human confirmation before creating assessment (no auto-approval) | P0 |
| FR-011 | High/Critical breaches SHALL display warning: "Requires careful review" (no 1-click accept) | P1 |

### 3.3 Bias Monitoring

| ID | Requirement | Priority |
|---|---|---|
| FR-012 | System SHALL run monthly automated counterfactual bias tests | P0 |
| FR-013 | System SHALL track every AI vs. human disagreement with: delta fields, modification reason | P0 |
| FR-014 | System SHALL alert if acceptance rate <50% for 7 consecutive days | P1 |
| FR-015 | AI Oversight Lead SHALL have dashboard showing: acceptance rate, accuracy, disagreement patterns | P1 |

### 3.4 Governance & Transparency

| ID | Requirement | Priority |
|---|---|---|
| FR-016 | System SHALL display AI reasoning (show assumptions, uncertainties, alternative interpretations) | P0 |
| FR-017 | System SHALL log AI API calls for audit trail (12-month retention) | P0 |
| FR-018 | AI Oversight Lead SHALL be able to suspend AI for specific breach types | P1 |
| FR-019 | Risk Lead SHALL be notified when AI is in POC mode (vs. production-approved) | P2 |

---

## 4. Non-Functional Requirements

### 4.1 Performance

- **AI Latency:** p95 latency <2 seconds for AI API call
- **End-to-End:** Total time from breach triage to AI suggestion visible <5 seconds
- **Availability:** 99.5% uptime (allows ~3.6 hours downtime/month)
- **Scalability:** Support up to 1,000 assessments/month (POC), 10,000/month (production)

### 4.2 Security

- **Data Privacy:** NO PII sent to external API (see ADR-0010)
- **API Key Management:** Keys stored in secure vault, rotated every 90 days
- **Access Control:** Only Risk Leads can accept assessments (RBAC via OPA)
- **Audit Logging:** All AI interactions logged with user ID, timestamp, data sent

### 4.3 Compliance

- **ISO 45001:** AI classified as "decision support," not "control" (human remains competent person)
- **GDPR:** Data Processing Agreement with Google, lawful basis (legitimate interest)
- **Bias Mitigation:** Monthly bias audits, counterfactual testing, incident response plan (per ADR-0009)

### 4.4 Usability

- **Training:** Risk Leads complete 30-minute AI user guide training
- **Feedback:** Users can provide feedback via "Why did you modify this?" text field
- **Clarity:** AI confidence level displayed visually (red/yellow/green indicator)

---

## 5. Success Criteria

###5.1 MVP Success Metrics (3-Month POC)

1. **Accuracy:** >70% exact match vs. expert assessments (measured on 50+ validation cases)
2. **Acceptance Rate:** >60% of AI suggestions accepted without modification
3. **Speed Improvement:** Average assessment time reduced from 15 min → <7 min (>50% improvement)
4. **Bias-Free:** Zero critical bias incidents, <3 medium incidents (with corrective actions)
5. **User Satisfaction:** >4.0/5.0 rating from Risk Leads (quarterly survey)
6. **Cost:** <$50/month API costs at POC volume

### 5.2 Long-term KPIs (Post-Production)

- **SLA Compliance:** Triage SLA compliance improves from 85% → 95%
- **Consistency:** Inter-assessor variance reduced from ±1.5 points → ±0.8 points
- **ROI:** Payback period <3 months (time savings vs. development cost)
- **Adoption:** >80% of Risk Leads use AI at least weekly
- **Quality:** No safety incidents attributable to AI-suggested under-assessment

---

## 6. Dependencies

### 6.1 Internal Dependencies

- **SB-01 (Appetite Breach Response):** Must be operational (provides breach data)
- **Decisioning Service:** Must support AI suggestion FK in RiskAssessment table
- **Identity & Access:** Keycloak roles updated (add `ai_oversight_lead`)
- **Observability:** Grafana dashboards for AI metrics

### 6.2 External Dependencies

- **Gemini API:** Google AI Studio or Vertex AI account + API key
- **Legal Approval:** Data Processing Agreement with Google
- **ISO 45001 Auditor:** Informed of AI usage (decision support classification)

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **AI suggests dangerous under-assessment** | Medium | Critical | Counterfactual testing, High/Critical breach review requirement, bias incident runbook |
| **Low adoption (<60%)** | Medium | High | User training, show time savings, "fear of AI" communication plan |
| **Google API outage** | Low | Medium | Fallback to manual assessment, cache similar cases for offline mode (future) |
| **Regulatory non-compliance (GDPR, ISO)** | Low | Critical | Legal review of API terms, GDPR DPA, inform ISO auditor pre-deployment |
| **Bias amplification via feedback loop** | Medium | High | Quarterly external audit of prompts, diverse validation panels |
| **Cost overrun (>$100/month)** | Low | Low | Rate limiting (5 calls/sec), daily budget alerts |

---

## 8. Out of Scope

What we're explicitly NOT doing (to avoid scope creep):

- **Auto-approval:** AI will NEVER create assessments without human confirmation
- **Remediation suggestions:** AI only does risk assessment; remediation planning stays human (Phase 2 candidate)
- **Fine-tuned models:** Zero-shot only for POC; revisit fine-tuning if >100 labeled examples collected
- **Multi-language support:** English only for MVP
- **Mobile app integration:** Web portal only for POC

---

## 9. Timeline & Milestones

| Milestone | Target Date | Status | Owner |
|-----------|-------------|--------|-------|
| **Phase 0: Pre-POC** | | | |
| - Governance policy approved | Week 1-2 | In Progress | CRO |
| - Synthetic data generated (25 examples) | Week 1-2 | Not Started | AI Oversight Lead |
| - ADRs approved | Week 1-2 | Not Started | CTO + CRO |
| **Phase 1: POC Development** | | | |
| - AI service built | Week 3-5 | Not Started | Engineering |
| - Frontend AI suggestion card | Week 5-6 | Not Started | Engineering |
| - POC deployed to BU-01 | Week 6 | Not Started | Product |
| **Phase 2: POC Operation** | | | |
| - 3 months POC with BU-01 | Month 2-4 | Not Started | AI Oversight Lead |
| - Monthly bias audits | Ongoing | Not Started | AI Oversight Lead |
| **Phase 3: Production Readiness** | | | |
| - Success metrics validated | Month 5 | Not Started | Product |
| - CRO approval for production | Month 5 | Not Started | CRO |
| - Production deployment (all BUs) | Month 6 | Not Started | Engineering |

---

## 10. Appendix

### 10.1 Related Documents

- **Governance:** [AI Governance Policy](../../../../governance/policies/ai-governance-policy.md)
- **Technical Decisions:**
  - [ADR-0008: AI Model Selection](../../../../../docs/adrs/0008-ai-model-selection.md)
  - [ADR-0009: Bias Mitigation](../../../../../docs/adrs/0009-ai-bias-mitigation-strategy.md)
  - [ADR-0010: Data Privacy](../../../../../docs/adrs/0010-ai-data-privacy.md)
- **Deployment:** [AI Deployment Checklist](../../../../governance/approvals/ai-deployment-checklist.md)
- **Operations:** [Bias Incident Response Runbook](../../../../../docs/runbooks/ai-bias-incident-response.md)
- **Backlog:** [SB-02 Epics](../../02-backlog/sb-02/epics.yaml)

### 10.2 Stakeholder Sign-Off

- [ ] VP Product: _________________________ Date: _______
- [ ] Chief Risk Officer: _________________ Date: _______
- [ ] CISO: _______________________________ Date: _______
- [ ] VP Engineering: _____________________ Date: _______

### 10.3 Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1.0 | 2026-02-17 | Initial draft (pre-POC) | AI/Product Team |
