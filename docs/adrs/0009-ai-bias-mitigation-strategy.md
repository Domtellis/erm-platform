# ADR-0009: AI Bias Mitigation Strategy

## Status: Accepted
## Date: 2026-02-17
## Last Updated: 2026-03-05
## Decision Makers: [Chief Risk Officer, AI Oversight Lead, VP Product]

## Context

AI models can exhibit systematic bias that unfairly advantages or disadvantages certain outcomes. In risk assessment, bias could:
- Under-assess genuine hazards (safety risk)
- Over-assess minor issues (resource waste)
- Systematically favor/disfavor specific sites, metrics, or severities

With limited historical data (<10 examples), we cannot rely on dataset diversity to prevent bias. Traditional bias mitigation (balanced datasets, fairness metrics) requires large labeled datasets we don't have.

**Key Challenges:**
- Zero-shot learning lacks historical calibration
- External API (Gemini) pre-training biases unknown
- Prompt design can introduce unintentional bias
- ISO 45001 compliance requires demonstrable fairness

## Decision

Implement a **multi-layered bias prevention and detection framework** centered on:

1. **Zero-Anchoring Prompt Design** - Remove bias-inducing cues
2. **Counterfactual Testing** - Automated monthly bias detection
3. **Diverse Validation Panels** - Multi-perspective human review
4. **Continuous Feedback Loop** - Track disagreements, update prompts
5. **Transparency Requirements** - Force AI to show reasoning
6. **Standards Drift Monitoring** — Detect ILO/ISO clause staleness before it biases AI outputs


##Rationale

### Layer 1: Prompt Design (Prevention)

**Do NOT include** in prompts:
- Initial severity (prevents anchoring)
- Historical acceptance rates (prevents confirmation bias)
- Site incident history (prevents geographic bias)

**DO include**:
- Objective risk matrix (ISO 45001 standard)
- Requirement to cite standards
- Explicit uncertainty acknowledgment

**Example Bias:
**
```markdown
<!-- BAD (introduces anchoring) -->
Initial Severity: CRITICAL
Assess this breach...

<!-- GOOD (blind assessment) -->
Metric: wind_speed_knots
Observed Value: 45
Threshold: 35
Assess the risk...
```

### Layer 2: Counterfactual Testing (Detection)

**Monthly Automated Tests:**

1. **Severity Anchoring Test**
   - Same breach, vary initial severity (Low/Medium/High/Critical)
   - **Pass:** AI gives identical assessment regardless
   - **Fail:** Assessment changes based on initial severity

2. **Geographic Bias Test**
   - Same breach, vary site_id (different locations)
   - **Pass:** AI gives identical assessment
   - **Fail:** Certain sites systematically get higher/lower scores

3. **Temporal Bias Test**
   - Same breach, vary timestamp
   - **Pass:** Assessment independent of time
   - **Fail:** Recency bias detected

**Pass Threshold:** ≥90% consistency across variations

### Layer 3: Diverse Validation (Human Oversight)

- **Rotating panel of 3+ risk leads** from different BUs
- **Every 10th** AI assessment reviewed by full panel
- **Quarterly calibration sessions** where panel assesses same cases independently
- **Disagreement → Investigation:** If panel diverges >2 points on impact/likelihood

### Layer 4: Feedback Loop (Continuous Improvement)

```
AI Suggestion → Human Decision → Track Disagreement → Weekly Analysis → Prompt Update
```

**Tracked Data:**
- AI impact/likelihood
- Final human impact/ likelihood
- Modification notes ("Why did you change this?")
- Assessor ID (anonymized for analysis)

**Monthly Review:**
- Identify patterns (e.g., "AI underestimates chemical spills by avg 1.5 points")
- Update prompt with bias corrections
- Re-test with historical cases

### Layer 5: Transparency (Auditability)

**Require AI to output:**
- `reasoning.assumptions_made`: What did I assume?
- `reasoning.uncertainty_factors`: What am I unsure about?
- `reasoning.alternative_interpretations`: Could this be different?

**Why:** Makes implicit bias explicit, allows human to catch flawed logic

### Layer 6: Standards Drift Prevention (S-AIR)

With the S-AIR RAG architecture, a new bias vector exists: **stale ILO/ISO clauses** injected into prompts can lead to systematically incorrect assessments if the underlying publications have changed.

**Detection:**
- `SyncLog.status` is checked before every AI call
- If `status = 'stale'`, the `erm.risk.standards-unavailable.v1` event is emitted and the assessment is flagged
- Weekly `SyncEngineService` cron independently checks ILO publication metadata for changes

**Mitigation:**
- Stale registry → AI assessment proceeds with a `standards_warning` flag; HITL review is mandatory
- AI Oversight Lead is notified via `erm.standards.out-of-sync.v1` event
- `unable_to_cite_reason` field in `AssessmentSuggestion` captures when Gemini could not apply a clause, enabling systematic gap analysis

**Pass Threshold:** `SyncLog.status = 'active'` must be present for any assessment that will be auto-accepted.


## Consequences

### Positive

1. **Detectable Bias:** Counterfactual tests catch systematic errors before they compound
2. **Auditable:** Transparency requirements provide clear paper trail
3. **Adaptive:** Feedback loop allows model improvement without re-training
4. **Culturally Safe:** Diverse panels prevent single-expert bias from propagating
5. **Preventative:** Zero-anchoring prompt reduces bias at source

### Negative

1. **Operational Overhead:** Monthly bias audits require 4-8 hours of effort
2. **Delayed Detection:** Weekly feedback analysis means 7-day window where bias could exist
3. **Human Variability:** Panel disagreements may reflect human inconsistency, not AI bias
4. **Cost:** Counterfactual tests consume additional API calls (~50/month = $0.50)

### Neutral

- False positives: Tests may flag variance that's not actual bias
- Human feedback may itself be biased (garbage in, garbage out)

## Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Bias goes undetected** | Critical | Multiple detection layers (counterfactual + human + disagreement analysis) |
| **Panel bias** | Medium | Rotate panel members, include diverse BUs/backgrounds |
| **Feedback loop amplifies bias** | High | External quarterly audit (independent reviewer validates prompts) |
| **Test gaming** | Low | AI doesn't know about tests (use random breach variations) |

## Compliance Impact

### ISO 45001
- Bias mitigation demonstrates "competent person" oversight (§7.2)
- Audit trail supports "monitoring and measurement" requirements (§9.1)

### Fairness Standards
- Aligns with EU AI Act principles (transparency, human oversight)
- Supports "right to explanation" under GDPR

## Implementation

### Counterfactual Test Automation

```typescript
// Monthly cron job
async function runBiasTests() {
  const baseCases = await getRandomBreaches(10);
  
  for (const baseCase of baseCases) {
    // Test 1: Severity anchoring
    const variants = [
      { ...baseCase, severity: 'low' },
      { ...baseCase, severity: 'high' }
    ];
    const assessments = await Promise.all(
      variants.map(v => getAIAssessment(v))
    );
    
    if (Math.abs(assessments[0].impact - assessments[1].impact) > 0) {
      await logBiasAlert('severity_anchoring', baseCase.id, assessments);
    }
  }
  
  await generateBiasAuditReport();
}
```

### Disagreement Tracking Schema

```typescript
model AssessmentDisagreement {
  id                String   @id @default(uuid())
  breach_case_id    String
  ai_impact         Int
  ai_likelihood     Int
  human_impact      Int
  human_likelihood  Int
  delta_impact      Int      // human - AI
  delta_likelihood  Int
  modification_reason String?
  assessor_id       String   // Anonymized
  created_at        DateTime @default(now())
}
```

## Alternatives Considered

### Alternative 1: Pre-Deployment Fairness Audits Only
**Approach:** Test for bias once before launch, then deploy

**Rejected Because:**
- Static approach can't catch model drift
- Gemini API updates could introduce new biases
- No mechanism to learn from production data

### Alternative 2: Algorithmic Fairness Metrics (e.g., Demographic Parity)
**Approach:** Measure statistical fairness across groups

**Rejected Because:**
- Requires protected class attributes (we don't track gender/race/age)
- Not applicable to industrial risk (no demographic groups)
- Doesn't detect domain-specific bias (metric-type bias)

### Alternative 3: Human-Only Review (No Automated Tests)
**Approach:** Rely solely on risk leads to catch bias

**Rejected Because:**
- Subtle systematic bias may go unnoticed
- Human reviewers subject to confirmation bias themselves
- Doesn't scale if AI volume increases

## Related Decisions

- [ADR-0008: AI Model Selection](./0008-ai-model-selection.md)
- [ADR-0010: AI Data Privacy](./0010-ai-data-privacy.md)
- [ADR-0011: Standards RAG Strategy](./0011-standards-rag-strategy.md)
- [AI Governance Policy](../../content/governance/policies/ai-governance-policy.md)


## Success Criteria

After 3 months of operation:
- [ ] Zero critical bias incidents
- [ ] <3 medium bias incidents (with corrective actions)
- [ ] 100% completion of monthly bias audits
- [ ] >90% pass rate on counterfactual tests

## Approval Signatures

- [ ] Chief Risk Officer: _________________________ Date: _______
- [ ] AI Oversight Lead: _________________________ Date: _______
- [ ] VP Product: ________________________________ Date: _______
