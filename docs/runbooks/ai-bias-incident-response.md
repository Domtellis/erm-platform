# AI Bias Incident Response Runbook

**Service:** AI Risk Service  
**Owner:** AI Oversight Lead  
**Escalation:** Chief Risk Officer  
**Last Updated:** 2026-02-17

---

## Purpose

This runbook defines procedures for responding to AI bias incidents - situations where the AI risk assessment system exhibits systematic errors that could compromise safety or fairness.

---

## Bias Incident Classification

### Severity Levels

| Severity | Definition | Example | Response Time |
|----------|------------|---------|---------------|
| **CRITICAL** | AI suggests dangerous under-assessment of High/Critical breach | AI rates fatality risk as "Low"; AI systematically underestimates chemical spills | **Immediate** (< 1 hour) |
| **HIGH** | Systematic bias detected across multiple cases (>10) | All wind-related breaches over-assessed; Geographic bias favoring certain sites | **< 4 hours** |
| **MEDIUM** | Isolated incorrect assessment or emerging pattern (<10 cases) | Single significant misassessment; Temporal bias detected in testing | **< 24 hours** |
| **LOW** | Low confidence correctly flagged; minor variance within acceptable range | AI shows "low confidence," user corrects appropriately | **Monitor only** |

---

##Incident Detection

### How Bias is Discovered

1. **Automated Counterfactual Tests** (monthly cron job)
   - Severity anchoring test fails
   - Geographic bias test fails
   - Temporal bias test fails

2. **Human Reviewer Flags**
   - Risk Lead reports suspicious AI behavior
   - Pattern noticed in disagreement analysis

3. **Disagreement Analysis** (weekly review)
   - AI systematically over/under-estimates specific metric types
   - One site consistently gets higher/lower assessments

4. **Validation Panel Review** (quarterly)
   - Panel identifies AI bias not caught by automated tests

---

## Response Procedures

### CRITICAL Severity Response

**Timeline: Immediate action required**

#### Within 1 Hour:

1. **IMMEDIATE: Suspend AI Suggestions** for affected breach types
   ```bash
   # Emergency AI service suspension
   kubectl scale deployment erm-ai-risk-service --replicas=0
   ```
   OR
   ```bash
   # Selective suspension (preferred)
   curl -X POST http://localhost:4015/ai/config/suspend \
     -H "Content-Type: application/json" \
     -d '{"breach_types": ["chemical_spill", "crane_operations"]}'
   ```

2. **Notify Stakeholders:**
   - CRO (immediate phone call)
   - CISO (email + Notification Service (Email/Jira))
   - All Risk Leads (email: "AI suggestions temporarily paused")
   - AI Oversight Lead (if not the discoverer)

3. **Preserve Evidence:**
   - Export AI logs for affected breaches
   - Screenshot counterfactual test results
   - Save disagreement data to incident folder

#### Within 2 Hours:

4. **Assemble Incident Team:**
   - AI Oversight Lead (incident commander)
   - CRO or delegate
   - Product Owner
   - On-call engineer

5. **Initial Assessment:**
   - How many cases affected?
   - What is the pattern? (metric type, site, severity, time range)
   - Has any dangerous decision been made based on biased assessment?

#### Within 4 Hours:

6. **Root Cause Analysis:**
   - Review prompt template changes (last 30 days)
   - Check Gemini model version (did Google update?)
   - Analyze training/synthetic data for bias seeds
   - Review recent disagreement patterns for early warnings

7. **Safety Review:**
   - For each affected case:
     - Re-assess manually by senior risk lead
     - If breach was under-assessed, escalate to BU immediately
     - Document revised assessment

#### Within 24 Hours:

8. **Corrective Action:**
   - **Option A:** Prompt fix (if bias is prompt-induced)
     - Update prompt template
     - Test on validation set (20+ historical cases)
     - Verify bias eliminated
   - **Option B:** Model rollback (if model version issue)
     - Revert to previous known-good model version
     - Document rollback in AI Governance Log
   - **Option C:** Feature suspension (if unfixable immediately)
     - Keep AI suspended until proper fix developed
     - Communicate timeline to users

9. **Re-deployment Testing:**
   - Run full counterfactual test suite
   - Validate on 50+ historical cases
   - Require CRO approval before resuming

#### Within 48 Hours:

10. **Incident Report:**
    - Complete incident template (see below)
    - Submit to CRO and governance committee
    - Update AI Governance Log

#### Within 1 Week:

11. **Historical Review:**
    - Re-run all historical assessments from past 90 days
    - Identify additional affected cases
    - Notify BUs if any revisions needed

12. **Process Improvement:**
    - Update counterfactual tests to catch this bias type
    - Add new synthetic examples to validation set
    - Review if bias could have been caught earlier

---

### HIGH Severity Response

**Timeline: < 4 hours initial response**

Follow similar procedure to CRITICAL, but:
- **No immediate suspension** (unless CRO directs)
- Flag affected breach types with "review carefully" warning
- 24-hour deadline for root cause and corrective action
- Less urgent stakeholder notification (email vs. phone call)

---

### MEDIUM Severity Response

**Timeline: < 24 hours**

1. **Investigate:**
   - Confirm bias exists (not just random variance)
   - Quantify magnitude (how many points off?)
   - Identify scope (how many cases affected?)

2. **Monitor:**
   - Increase disagreement tracking frequency (daily vs. weekly)
   - Flag pattern for AI Oversight Lead review

3. **Corrective Action:**
   - Schedule prompt update in next sprint
   - Add to validation set for future testing

4. **Documentation:**
   - Log in AI Governance Log (medium severity)
   - No formal incident report required

---

### LOW Severity (Monitor Only)

- Log in disagreement database
- Include in monthly bias audit report
- No immediate action required

---

## Incident Report Template

```markdown
# AI Bias Incident Report

**Incident ID:** AI-BIAS-YYYY-MM-DD-###  
**Severity:** [CRITICAL | HIGH | MEDIUM]  
**Discovered:** [Date/Time]  
**Discovered By:** [Name/Process]  
**Incident Commander:** [AI Oversight Lead Name]

## Summary
[1-2 sentence description of the bias]

## Impact
- **Cases Affected:** [Number]
- **Time Range:** [Start date - End date]
- **Breach Types:** [List]
- **Safety Impact:** [Were any dangerous decisions made?]

## Root Cause
[Detailed analysis of why bias occurred]

## Evidence
- Counterfactual test results: [Link]
- Disagreement data: [Link]
- AI logs: [Link]
- Example affected cases: [Breach IDs]

## Corrective Actions
1. [Action taken]
2. [Action taken]
3. [Action taken]

## Prevention
[What we're doing to prevent recurrence]

## Timeline
| Time | Event |
|------|-------|
| [Timestamp] | Bias detected |
| [Timestamp] | Stakeholders notified |
| [Timestamp] | AI suspended |
| [Timestamp] | Root cause identified |
| [Timestamp] | Fix deployed |
| [Timestamp] | Service resumed |

## Approvals
- CRO Review: _________________________ Date: _______
- CISO (if security-related): _________ Date: _______

**Incident Closed:** [Date]  
**Lessons Learned:** [Link to post-mortem document]
```

---

## Escalation Procedures

### Standard Escalation Path

1. **Discoverer** → AI Oversight Lead
2. **AI Oversight Lead** → CRO (if High/Critical)
3. **CRO** → CISO + CEO (if Critical with safety impact)

### Emergency Contacts

**AI Oversight Lead:**  
- Name: [TBD]
- Phone: [TBD]
- Email: [TBD]

**Chief Risk Officer:**  
- Name: [TBD]
- Phone: [TBD - 24/7]
- Email: [TBD]

**CISO:**  
- Name: [TBD]
- Phone: [TBD - 24/7]
- Email: [TBD]

**On-Call Engineer:**  
- PagerDuty: [Link]

---

## Communication Templates

### Internal Stakeholder Notification (Critical)

**Subject:** URGENT: AI Risk Assessment Service Suspended

**Body:**
```
Priority: HIGH

The AI risk assessment suggestion feature has been temporarily suspended due to detected bias in [breach type/scenario].

IMMEDIATE ACTIONS:
- All risk assessments must be completed manually until further notice
- Do NOT rely on any recent AI suggestions for [affected breach types]
- Review recent assessments for [list of breach IDs] and re-assess manually

IMPACT:
- [Number] cases potentially affected
- [Expected resolution time]

CONTACT:
- For questions: [AI Oversight Lead email]
- For urgent safety concerns: [CRO phone number]

We will provide updates every [frequency] until resolution.

[AI Oversight Lead Name]
```

### User Notification (High - Non-Urgent)

**Subject:** AI Risk Assessment: Improved Accuracy Update

**Body:**
```
Hi Risk Leads,

We've identified and corrected a pattern where AI was [over/under]-assessing [breach type] by an average of [magnitude].

ACTIONS:
- AI suggestions continue to be available
- Please review assessments for [affected breach types] more carefully
- Fix will be deployed on [date]

No immediate action required. Questions? Contact [AI Oversight Lead].

Thanks,
[Team]
```

---

## Prevention & Monitoring

### Proactive Measures

1. **Monthly Counterfactual Testing** (automated)
   - Runs first Monday of each month
   - Results reviewed by AI Oversight Lead
   - Pass/fail reported in monthly bias audit

2. **Weekly Disagreement Analysis**
   - AI Oversight Lead reviews all disagreements
   - Patterns flagged for investigation
   - Trends tracked in dashboard

3. **Quarterly Validation Panel Review**
   - 3+ risk leads assess same 10 cases
   - Compare human agreement vs. AI agreement
   - Calibration session if divergence >15%

### Early Warning Signals

- Acceptance rate drops below 50% for 7 days
- Disagreement rate increases >20% week-over-week
- Counterfactual test pass rate <90%
- User feedback mentions "AI seems off lately"

---

## Related Documents

- [AI Governance Policy](../policies/ai-governance-policy.md)
- [ADR-0009: Bias Mitigation Strategy](../../docs/adrs/0009-ai-bias-mitigation-strategy.md)
- [AI Service Operations Runbook](../../docs/runbooks/ai-service-operations.md)
- [AI Deployment Checklist](./ai-deployment-checklist.md)

---

## Runbook Maintenance

**Review Cycle:** Quarterly  
**Last Review:** 2026-02-17  
**Next Review:** 2026-05-17  
**Owner:** AI Oversight Lead
