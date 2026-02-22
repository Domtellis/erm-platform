# AI Governance Policy

**Version:** 1.0.0  
**Status:** DRAFT - Requires CRO Approval  
**Owner:** Chief Risk Officer  
**Last Updated:** 2026-02-17  
**Review Cycle:** Quarterly

---

## 1. Purpose & Scope

### 1.1 Purpose
This policy establishes governance requirements for all Artificial Intelligence (AI) and Machine Learning (ML) systems used in risk assessment and decision support within the ERM Platform.

### 1.2 Scope
This policy applies to:
- All AI/ML models used in breach response workflows
- External AI APIs (e.g., Gemini, GPT, Claude)
- Automated decision support systems
- Risk assessment suggestion engines

**Out of Scope:**
- Simple rule-based automation (e.g., threshold alerts)
- Statistical analysis without predictive modeling

---

## 2. Core Principles

### 2.1 Human Accountability
- **AI is a decision support tool, NOT a decision maker**
- Final accountability for risk assessments remains with certified Risk Leads
- AI cannot override human safety judgment
- All AI suggestions must be reviewed by qualified personnel

### 2.2 Transparency & Explainability
- All AI reasoning must be explainable in natural language
- Model versions must be tracked and auditable
- AI assessments must cite standards, regulations, or data sources
- Users must be informed when AI is influencing a decision

### 2.3 Bias Mitigation
- Monthly bias audits are mandatory
- Counterfactual testing required before production deployment
- Diverse validation panels (3+ risk leads from different business units)
- Zero tolerance for systematic bias in High/Critical severity assessments

### 2.4 Right to Override
- Risk Leads can ALWAYS reject AI suggestions without justification
- No penalties or metrics based on AI acceptance rate
- Culture of "healthy skepticism" over "rubber-stamping"

---

## 3. Approval Authority

### 3.1 Deployment Approvals

| Decision | Authority | Cannot Delegate |
|----------|-----------|-----------------|
| **POC Deployment** | VP Product + VP Risk | No |
| **Production Deployment** | CISO + Chief Risk Officer | No |
| **Model Version Changes** | AI Oversight Lead | Yes (to Product Owner) |
| **Prompt Modifications (Minor)** | AI Oversight Lead | Yes |
| **Prompt Modifications (Major)** | Chief Risk Officer | No |
| **Override AI Assessment** | Any Risk Lead | Always Allowed |

**Definitions:**
- **Minor Prompt Change:** Wording adjustments, formatting, adding examples
- **Major Prompt Change:** Changing risk matrix, removing safety guardrails, altering decision logic

### 3.2 Deployment Gate Checklist

Before deploying AI to production, verify:
- [ ] CRO approval obtained
- [ ] CISO security review complete
- [ ] Synthetic data validation passed (>65% expert agreement)
- [ ] Bias mitigation framework implemented
- [ ] ISO 45001 auditor informed (if applicable)
- [ ] Gemini API terms reviewed by Legal
- [ ] Data privacy assessment completed
- [ ] Incident response plan documented
- [ ] Rollback procedure tested
- [ ] Human override UI implemented

---

## 4. Data Privacy & Security

### 4.1 Data Handling

**Permitted:**
- Breach metadata (metric name, observed value, severity)
- Site/BU identifiers
- Timestamp information
- Historical risk assessment outcomes (anonymized)

**PROHIBITED:**
- Personal Identifiable Information (PII) of employees
- Confidential business strategies
- Trade secrets or proprietary information
- Individual assessor names (only anonymized IDs)

### 4.2 External API Requirements

For any external AI API (e.g., Gemini, GPT):
1. **Legal Review:** Terms of service approved by Legal
2. **Data Residency:** Verify where data is processed/stored
3. **Retention Policies:** Confirm AI provider's data retention
4. **Right to Delete:** Ensure ability to request data deletion
5. **Audit Rights:** Contract must include audit trail access

### 4.3 API Key Management

- API keys stored in secure vaults (NOT in code)
- Rotation every 90 days
- Access restricted to AI service only (not shared)
- Monitoring for unauthorized usage

---

## 5. Bias Monitoring & Auditing

### 5.1 Monthly Bias Audits

**Mandatory Tests:**
1. **Severity Anchoring Test:** Same breach, different initial severities → Should yield identical assessments
2. **Geographic Bias Test:** Same breach, different sites → Should yield identical assessments
3. **Temporal Bias Test:** Same breach, different timestamps → Should yield identical assessments

**Pass Criteria:** ≥90% consistency across test variations

### 5.2 Acceptance Rate Monitoring

**Alert Thresholds:**
- **Yellow Alert:** <50% acceptance rate for 7 consecutive days → Trigger prompt review
- **Red Alert:** <30% acceptance rate for 3 consecutive days → Suspend AI suggestions, mandatory investigation

**Note:** Low acceptance rate is NOT a performance failure. It may indicate:
- AI is correctly being skeptical (good)
- Users are appropriately exercising judgment (good)
- AI model drift or quality degradation (requires investigation)

### 5.3 Disagreement Analysis

Track every AI vs. human disagreement:
- **Data Fields:** AI assessment, final assessment, assessor ID, modification notes
- **Analysis Frequency:** Weekly
- **Pattern Detection:** Identify systematic over/under-estimation
- **Prompt Updates:** Monthly refinement based on patterns

---

## 6. Model Versioning & Change Control

### 6.1 Version Tracking

Every AI assessment must record:
- Model provider (e.g., "Google Gemini")
- Model version (e.g., "gemini-2.0-pro-exp" or "gemini-2.0-flash")
- Prompt template version (e.g., "v1.3.2")
- Tracking: `ai_context_hash` and `ai_prompt_ref`
- Audit Event: Emits `AI_SUGGESTION_CREATED`

### 6.2 Model Updates

**Before deploying new model version:**
1. **Validation:** Test on 20+ historical cases
2. **Comparison:** Compare new vs. old model accuracy
3. **Approval:** AI Oversight Lead approval required
4. **Rollback Plan:** Document how to revert
5. **Communication:** Notify Risk Leads of change

### 6.3 Re-assessment Rights

If a model version is found to have systematic bias:
- Option to re-run assessments with corrected model
- Notify affected business units
- Document incident in AI Governance Log

---

## 7. Incident Response

### 7.1 Bias Incident Classification

| Severity | Definition | Example | Response Time |
|----------|------------|---------|---------------|
| **Critical** | AI suggests dangerous under-assessment of High/Critical breach | AI rates fatality risk as "Low" | Immediate |
| **High** | Systematic bias detected (>10 cases) | All chemical spills under-assessed | <4 hours |
| **Medium** | Isolated incorrect assessment | Single misassessment, no pattern | <24 hours |
| **Low** | Low confidence, correctly flagged | AI says "low confidence," user corrects | Monitor |

### 7.2 Incident Response Procedure

**For Critical/High Severity:**
1. **Immediate:** Suspend AI suggestions for affected breach types
2. **Within 2 hours:** Assemble incident team (AI Oversight Lead, CRO, Product Owner)
3. **Within 4 hours:** Root cause analysis
4. **Within 24 hours:** Corrective action (prompt update, model change, or rollback)
5. **Within 48 hours:** Incident report to governance committee
6. **Within 1 week:** Review all similar historical cases

### 7.3 Incident Reporting

All bias incidents must be logged in `content/governance/audit/ai-governance-log.md` with:
- Incident ID
- Severity
- Description
- Root cause
- Corrective action
- Affected assessments
- Responsible person

---

## 8. Regulatory Compliance

### 8.1 ISO 45001 Considerations

**Question for Auditors:** Does AI risk assessment qualify as a "control" under ISO 45001 §8.1.2?

**Current Stance:**
- AI is decision support, not a control
- Human Risk Leads remain the "competent person" under ISO 45001
- AI does not replace human expertise requirements

**Documentation Required:**
- Maintain evidence that all assessments are human-approved
- Demonstrate AI improves consistency, does not replace judgment
- Bias audit trail for auditor review

### 8.2 GDPR / Data Privacy

**Compliance Measures:**
- No PII sent to external APIs
- Data minimization (only breach metadata)
- Right to explanation (AI must justify reasoning)
- Lawful basis: Legitimate interest (risk management)

### 8.3 Industry-Specific Regulations

**Ports & Terminals:**
- Ensure AI aligns with IMO guidelines
- AI cannot override local maritime safety regulations
- Emergency response plans must work WITHOUT AI

---

## 9. Roles & Responsibilities

### 9.1 Chief Risk Officer (CRO)
- **Approval Authority:** Production AI deployment
- **Oversight:** Monthly bias audit review
- **Incident Response:** Final escalation point for critical incidents
- **Policy Updates:** Approve AI governance policy changes

### 9.2 AI Oversight Lead
- **Day-to-Day Management:** Prompt updates, model monitoring
- **Bias Audits:** Conduct monthly audits
- **Performance Metrics:** Track acceptance rate, accuracy
- **Incident Response:** Lead investigation of bias incidents

### 9.3 Risk Leads
- **Assessment Responsibility:** Final decision on all risk assessments
- **AI Feedback:** Accept/modify/reject AI suggestions
- **Bias Reporting:** Flag suspicious AI behavior
- **Right to Override:** Can always reject AI without justification

### 9.4 Product Owner
- **Roadmap:** Plan AI feature enhancements
- **User Training:** Ensure Risk Leads trained on AI usage
- **Metrics:** Track user satisfaction with AI suggestions

### 9.5 CISO (Chief Information Security Officer)
- **Security Review:** Approve external API integrations
- **Data Privacy:** Ensure compliance with data policies
- **API Key Management:** Oversee secure credential storage

---

## 10. Training & Competency

###10.1 Required Training

**Before using AI suggestions, Risk Leads must complete:**
- [ ] AI Risk Assessment User Guide
- [ ] Bias awareness training
- [ ] When to trust / when to be skeptical
- [ ] How to provide feedback for model improvement

**Refresher:** Annual re-training required

### 10.2 Competency Standards

Risk Leads who use AI must still meet competency requirements:
- Certified in risk assessment methodology
- ISO 45001 awareness
- Domain expertise (ports/terminals operations)

**AI does NOT reduce competency requirements**

---

## 11. Success Metrics

### 11.1 Performance Metrics

| Metric | Target | Measurement Frequency |
|--------|--------|----------------------|
| **AI Accuracy** | >70% exact match vs. expert | Monthly |
| **Acceptance Rate** | >60% (without modification) | Weekly |
| **Bias Incident Rate** | 0 critical incidents per quarter | Quarterly |
| **Assessment Speed** | <7 minutes avg (vs. 15 min baseline) | Monthly |
| **User Satisfaction** | >4.0/5.0 rating | Quarterly survey |

### 11.2 Governance Metrics

| Metric | Target | Measurement Frequency |
|--------|--------|----------------------|
| **Bias Audit Completion** | 100% on-time | Monthly |
| **Incident Response Time** | <24 hours for high severity | Per incident |
| **Policy Compliance** | 100% deployment checklist completion | Per deployment |

---

## 12. Policy Review & Updates

### 12.1 Review Cycle

- **Quarterly:** AI Oversight Lead reviews metrics and proposes updates
- **Annually:** CRO formal policy review
- **Ad-hoc:** After any critical incident

### 12.2 Amendment Process

1. AI Oversight Lead proposes change
2. Stakeholder review (Risk Leads, Product, CISO)
3. CRO approval
4. Communicate to all users
5. Update training materials

---

## 13. Appendices

### Appendix A: Glossary

- **Bias:** Systematic error that causes AI to favor certain outcomes
- **Counterfactual Testing:** Testing AI with modified inputs to detect bias
- **Zero-Shot Learning:** AI making predictions without training on specific data
- **Confidence Score:** AI's self-assessed certainty (Low/Medium/High)

### Appendix B: Related Documents

- [ADR-0003: AI Reasoning Engine](../../enterprise-architecture/04-solutions/decisions/adr-0003-ai-reasoning-engine.md)
- [ADR-0005: Model Calibration](../../enterprise-architecture/04-solutions/decisions/adr-0005-model-calibration.md)
- [SB-02 PRD](../../enterprise-architecture/05-product/01-prds/sb-02/prd.md)

---

**APPROVAL REQUIRED:**

- [ ] Chief Risk Officer: _________________________ Date: _______
- [ ] CISO: ________________________________________ Date: _______
- [ ] VP Product: __________________________________ Date: _______

**Version History:**

| Version | Date | Changes | Approved By |
|---------|------|---------|-------------|
| 1.0.0 | 2026-02-17 | Initial policy | DRAFT |
