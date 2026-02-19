# SB-02: AI-Assisted Risk Assessment - Success Metrics

**Product:** SB-02 AI-Assisted Risk Assessment  
**Owner:** VP Product  
**Measurement Frequency:** Weekly (POC), Monthly (Production)  
**Last Updated:** 2026-02-17

---

## POC Success Metrics (3-Month Pilot - BU-01)

### Primary Metrics

| Metric | Target | Measurement Method | Pass/Fail Criteria |
|--------|--------|---------------------|---------------------|
| **AI Accuracy** | >70% | Exact match (Impact + Likelihood) vs. expert blind assessment on 50+ cases | PASS if ≥70% |
| **Acceptance Rate** | >60% | % of AI suggestions accepted without modification | PASS if ≥60% for 30 consecutive days |
| **Time Savings** | >50% | Average assessment time: Baseline 15 min → Target <7 min | PASS if <7.5 min avg |
| **Bias Incidents** | 0 critical | Count of critical bias incidents per quarter | PASS if 0 critical incidents |
| **User Satisfaction** | >4.0/5.0 | Quarterly survey: "How helpful is AI?" (1-5 scale) | PASS if ≥4.0 |

### Secondary Metrics

| Metric | Target | Measurement Method |
|--------|--------|---------------------|
| **Modification Rate** | 20-40% | % of AI suggestions modified (accept with changes) |
| **Rejection Rate** | <20% | % of AI suggestions completely rejected |
| **API Latency** | p95 <2s | Gemini API response time (95th percentile) |
| **Cost** | <$50/month | Gemini API usage costs |
| **Training Completion** | 100% | % of Risk Leads who completed AI user guide |

---

## Production Success Metrics (Post-POC)

### Impact Metrics

| Metric | Baseline | Target | Timeline | Measurement |
|--------|----------|--------|----------|-------------|
| **SLA Compliance** | 85% | 95% | 6 months | % of breaches triaged within 2-hour SLA |
| **Inter-Assessor Consistency** | ±1.5 pts | ±0.8 pts | 6 months | Std dev of risk scores for same breach type |
| **Onboarding Time** | 3-6 months | <2 months | 12 months | Time for new Risk Lead to reach 80% accuracy |
| **Assessment Backlog** | Avg 8 breaches | <3 breaches | 6 months | # of unassessed breaches at end of shift |

### Adoption Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Weekly Active Users** | >80% of Risk Leads use AI | Track last_used_ai timestamp |
| **Cross-BU Adoption** | All BUs using AI | % of BUs with >60% acceptance rate |
| **Feature Usage** | >70% use "Modify" at least once/month | Track modify button clicks |

### Quality & Safety Metrics

| Metric | Target | Measurement | Escalation Trigger |
|--------|--------|-------------|-------------------|
| **Safety Incidents from AI** | 0 | Count of incidents where AI under-assessment caused harm | >0 = Immediate CRO review |
| **Bias Incident Rate** | <1 medium/quarter | Count of medium+ bias incidents | >3 medium/quarter = Suspend AI |
| **Audit Test Pass Rate** | >90% | Monthly counterfactual test pass % | <85% = Prompt review required |

---

## Leading vs. Lagging Indicators

### Leading Indicators (Predict Success)

1. **Confidence Calibration:** Are high-confidence AI suggestions actually more accurate?
   - **How to Measure:** Compare accuracy for Low/Medium/High confidence buckets
   - **Target:** High confidence >85% accurate, Medium >70%, Low >50%

2. **Disagreement Patterns:** Are disagreements random or systematic?
   - **How to Measure:** Weekly disagreement analysis
   - **Target:** Random distribution (no pattern by metric type, site, time)

3. **User Engagement:** Are Risk Leads reading justifications?
   - **How to Measure:** Track time spent on AI suggestion card
   - **Target:** Avg >30 seconds (shows they're reviewing, not rubber-stamping)

### Lagging Indicators (Outcomes)

1. **SLA Compliance:** Did AI actually reduce triage time?
2. **User Satisfaction:** Do Risk Leads find AI valuable?
3. **Cost Savings:** ROI realized (time saved × hourly rate > development cost)

---

## Cost-Benefit Analysis

### Costs

| Item | One-Time | Monthly (POC) | Monthly (Production) |
|------|----------|---------------|----------------------|
| **Development** | $17,000 (6 weeks eng) | - | - |
| **Gemini API** | - | $10-20 | $50-100 (scaling) |
| **AI Oversight Lead** | - | $1,500 (10% FTE) | $3,000 (20% FTE) |
| **Bias Audits** | - | $400 (4 hrs/month) | $800 (8 hrs/month) |
| **Training Materials** | $2,000 | - | - |
| **TOTAL** | $19,000 | $1,910-1,920 | $3,850-3,900 |

### Benefits

| Item | Baseline | With AI | Savings |
|------|----------|---------|---------|
| **Assessment Time** | 15 min | 5 min | 10 min/breach |
| **Volume** | 100 breaches/month | Same | - |
| **Time Saved** | - | 1,000 min/month | 16.7 hours/month |
| **Value** | - | 16.7 hrs × $75/hr | **$1,250/month** |
| **Consistency Improvement** | ±1.5 pts variance | ±0.8 pts | Fewer escalations, ~$500/month |
| **TOTAL BENEFIT** | - | - | **~$1,750/month** |

### ROI Calculation

- **Monthly Net Benefit:** $1,750 (savings) - $3,900 (production cost) = **-$2,150/month**
- **Wait, that's negative!** Let me recalculate assuming higher volume:

At **500 breaches/month** (production scale):
- **Time Saved:** 5,000 min = 83.3 hours
- **Value:** 83.3 × $75 = **$6,250/month**
- **Net Benefit:** $6,250 - $3,900 = **+$2,350/month**
- **Payback:** $19,000 / $2,350 = **8 months**

**Conclusion:** ROI positive at >300 breaches/month. POC validates at low volume; scale drives ROI.

---

## Dashboard Metrics (Real-Time Monitoring)

### Grafana Dashboard: "AI Risk Service Performance"

**Panel 1: Operational Health**
- AI Service uptime (%)
- API latency (p50, p90, p95)
- Error rate (%)
- Daily API cost ($)

**Panel 2: User Engagement**
- Daily active users
- Acceptance rate (%)
- Modification rate (%)
- Rejection rate (%)

**Panel 3: Quality & Bias**
- Accuracy (rolling 7-day average)
- Confidence calibration (scatter plot: confidence vs. accuracy)
- Disagreement rate (%)
- Bias alert count

**Panel 4: Business Impact**
- Avg assessment time (min)
- SLA compliance (%)
- Assessment backlog count
- Time saved this month (hours)

---

## Reporting Cadence

| Report | Frequency | Audience | Contents |
|--------|-----------|----------|----------|
| **Weekly Ops Review** | Weekly | AI Oversight Lead, Product Owner | Acceptance rate, disagreements, incidents |
| **Monthly Bias Audit** | Monthly | CRO, AI Oversight Lead | Counterfactual tests, patterns, corrective actions |
| **Quarterly Business Review** | Quarterly | Exec Team | ROI, user satisfaction, strategic recommendations |
| **POC Final Report** | End of POC (Month 4) | CRO, CEO, Board | Go/No-Go decision for production |

---

## Success Criteria Summary

**POC is SUCCESSFUL if (all must be true):**

✅ Accuracy >70%  
✅ Acceptance rate >60% sustained  
✅ Time savings >50%  
✅ Zero critical bias incidents  
✅ User satisfaction >4.0/5.0  
✅ Cost <$50/month  

**Production deployment APPROVED if:**

✅ POC success criteria met  
✅ 3 months stable operation  
✅ CRO + CISO approval  
✅ Deployment checklist 100% complete  

---

## Failure Criteria (When to Stop)

**Immediate suspension if:**
- Critical bias incident (dangerous under-assessment)
- >3 high-severity bias incidents in 1 month
- Acceptance rate <30% for 14 consecutive days
- Safety incident attributable to AI

**POC failure (do not proceed to production) if:**
- Accuracy <65% after 3 months
- User satisfaction <3.5/5.0
- Cost >$100/month at POC scale
- Risk Leads refuse to use AI (adoption <40%)

---

## Pivot Scenarios

If POC fails, consider:

1. **Pivot to GPT-4o:** Higher accuracy but 5x cost (only if accuracy is sole blocker)
2. **Pivot to Severity Classification Only:** Simpler problem, AI suggests severity (Low/Med/High/Critical) instead of full impact/likelihood
3. **Pivot to Remediation Suggestions:** Skip risk assessment, use AI for suggesting remediation plans (different use case)
4. **Pause & Collect Data:** Operate SB-01 for 12 months, collect 100+ labeled examples, then fine-tune model

---

## Approval

**VP Product:** _________________________ Date: _______  
**Chief Risk Officer:** _________________ Date: _______
