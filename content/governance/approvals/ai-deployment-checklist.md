# AI Deployment Approval Checklist

**Purpose:** Gate checklist to ensure AI systems meet governance requirements before production deployment.  
**Applies To:** All AI/ML models used in decision support or automation  
**Owner:** AI Oversight Lead  
**Approval Required:** Chief Risk Officer + CISO

---

## 1. Governance & Policy

- [ ] **AI Governance Policy** approved by CRO
- [ ] **Model Selection ADR** (ADR-0008) approved
- [ ] **Bias Mitigation Strategy ADR** (ADR-0009) approved  
- [ ] **Data Privacy ADR** (ADR-0010) approved
- [ ] **Authority matrix** updated with AI decision rights
- [ ] **Roles defined:** AI Oversight Lead assigned

**Evidence:** Policy approval signatures, ADR approval records

---

## 2. Technical Validation

- [ ] **Synthetic data validation** passed (>65% expert agreement on 20+ examples)
- [ ] **Accuracy testing** completed (target: >70% on validation set)
- [ ] **Bias testing** passed (counterfactual tests >90% consistency)
- [ ] **Performance testing** met SLAs (API latency p95 <2s)
- [ ] **Error handling** tested (API timeout, malformed responses, rate limits)
- [ ] **Rollback procedure** documented and tested

**Evidence:** Test reports, metrics dashboards, rollback runbook

---

## 3. Security & Privacy

- [ ] **CISO approval** obtained for external API integration
- [ ] **API Terms of Service** reviewed by Legal (Google Cloud/Vertex AI)
- [ ] **Data Processing Agreement** executed with vendor
- [ ] **PII scrubbing layer** implemented and tested
- [ ] **API key management** using secure vault (not hardcoded)
- [ ] **Data encryption** in transit (HTTPS) and at rest
- [ ] **Access controls** implemented (RBAC for AI configuration)
- [ ] **Audit logging** enabled (all API calls logged)

**Evidence:** Legal approval, CISO sign-off, security test results, audit logs

---

## 4. Compliance & Regulatory

- [ ] **ISO 45001 auditor informed** (AI classified as decision support, not control)
- [ ] **GDPR compliance verified** (lawful basis documented, DPA in place)
- [ ] **Privacy policy updated** to disclose AI usage
- [ ] **Data retention policy** defined (API provider + internal logs)
- [ ] **Industry-specific regulations** reviewed (ports/terminals, maritime safety)
- [ ] **Insurance implications** reviewed (if applicable)

**Evidence:** Auditor communication, GDPR documentation, policy updates

---

## 5. Bias Mitigation Framework

- [ ] **Bias mitigation strategy** implemented per ADR-0009
- [ ] **Counterfactual testing** automated (monthly cron job configured)
- [ ] **Diverse validation panel** identified (3+ risk leads from different BUs)
- [ ] **Disagreement tracking** schema deployed to database
- [ ] **Transparency requirements** implemented (AI must show reasoning)
- [ ] **Zero-anchoring prompts** validated (no severity in input)
- [ ] **Bias audit template** created for monthly reviews

**Evidence:** Bias test automation code, panel member list, database schema, audit template

---

## 6. Human Oversight & Control

- [ ] **Human override UI** implemented (Accept/Modify/Reject buttons)
- [ ] **High/Critical breach guardrails** enforced (mandatory human review, no auto-accept)
- [ ] **Confidence thresholds** configured (low confidence flagged for review)
- [ ] **Right to override** communicated to all Risk Leads
- [ ] **No penalties policy** established (acceptance rate not a KPI for individuals)

**Evidence:** UI screenshots, OPA policies, user communication

---

## 7. Documentation & Training

- [ ] **User guide** created for Risk Leads
- [ ] **Operations runbook** created for on-call engineers
- [ ] **Incident response runbook** created (bias incident procedures)
- [ ] **Training materials** developed (when to trust/question AI)
- [ ] **Risk Lead training** completed (all users trained before launch)
- [ ] **Competency requirements** confirmed (AI does not reduce certification requirements)

**Evidence:** Documentation artifacts, training completion records

---

## 8. Monitoring & Observability

- [ ] **Grafana dashboards** configured (AI service health, latency, error rate)
- [ ] **Alerting rules** defined (service down, high latency, low acceptance rate)
- [ ] **Metrics instrumentation** implemented (acceptance rate, accuracy, disagreement rate)
- [ ] **Model version tracking** implemented (log model version per assessment)
- [ ] **Cost monitoring** configured (daily budget alerts)
- [ ] **Bias alert channels** established (Slack/Teams for bias detection)

**Evidence:** Grafana dashboard links, Prometheus alert configs, Slack integration

---

## 9. Incident Response Preparedness

- [ ] **Incident classification** defined (Critical/High/Medium/Low severity)
- [ ] **Escalation procedures** documented (on-call → Team Lead → CRO)
- [ ] **Bias incident runbook** created and communicated
- [ ] **Emergency contacts** list updated
- [ ] **Post-incident review template** created
- [ ] **Incident logging process** established (AI Governance Log)

**Evidence:** Runbook, escalation flowchart, incident log template

---

## 10. Business Continuity

- [ ] **Fallback to manual assessment** tested (if AI unavailable)
- [ ] **API outage procedures** documented
- [ ] **Rollback plan** documented and tested
- [ ] **Data backup** verified (AI suggestions backed up)
- [ ] **Disaster recovery** plan includes AI service
- [ ] **SLA alignment** confirmed (AI SLAs communicated to users)

**Evidence:** Failover test results, DR documentation

---

## 11. Acceptance Criteria (POC → Production)

**Before moving from POC to Production, verify:**

- [ ] **3 months POC operation** completed
- [ ] **Acceptance rate** >60% sustained for 30 days
- [ ] **Accuracy** >70% validated on real production data
- [ ] **Zero critical bias incidents** during POC
- [ ] **<3 medium bias incidents** (all with corrective actions)
- [ ] **User satisfaction** >4.0/5.0 (survey results)
- [ ] **Cost within budget** (<$50/month at current volume)
- [ ] **Availability** >99.5% (meets SLA)

**Evidence:** POC performance report, user feedback, cost analysis

---

## 12. Final Approvals

### Pre-POC Approval (Week 1-2)

- [ ] **Product Owner** approval (PRD, success metrics)
- [ ] **AI Oversight Lead** assignment
- [ ] **Chief Risk Officer** approval (governance policy)
- [ ] **CISO** approval (security controls)
- [ ] **Legal Counsel** approval (API terms, DPA)

**Signatures:**

- Product Owner: _________________________ Date: _______
- AI Oversight Lead: _____________________ Date: _______

### Production Deployment Approval (After POC)

- [ ] **Chief Risk Officer** approval (POC results reviewed)
- [ ] **CISO** approval (security posture validated)
- [ ] **VP Product** approval (user satisfaction confirmed)

**Signatures:**

- Chief Risk Officer: ____________________ Date: _______
- CISO: ___________________________________ Date: _______
- VP Product: ____________________________ Date: _______

---

## Checklist Completion Certificate

**Completed By:** [Name]  
**Date:** [Date]  
**POC Deployment Date:** [Planned]  
**Production Deployment Date:** [Planned]

**Attestation:**

I certify that all items in this checklist have been completed and evidence is available for audit review.

**Signature:** _____________________________ Date: _______

---

## Related Documents

- [AI Governance Policy](../policies/ai-governance-policy.md)
- [ADR-0008: AI Model Selection](../../docs/adrs/0008-ai-model-selection.md)
- [ADR-0009: Bias Mitigation](../../docs/adrs/0009-ai-bias-mitigation-strategy.md)
- [ADR-0010: Data Privacy](../../docs/adrs/0010-ai-data-privacy.md)
- [Authority Matrix](../authority-matrix.yaml)
- [SB-02 PRD](../enterprise-architecture/05-product/01-prds/sb-02/prd.md)
