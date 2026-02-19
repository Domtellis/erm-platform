# ADR-0008: AI Model Selection for Risk Assessment

## Status: Proposed
## Date: 2026-02-17
## Decision Makers: [Product Lead, CTO, Chief Risk Officer]

## Context

The ERM Platform requires an AI model to provide automated risk assessment suggestions for breach response. Key constraints:

- **Limited Historical Data:** <10 breach records available for training
- **Zero-Shot Requirement:** Model must work without fine-tuning
- **Explainability:** Must provide transparent reasoning for audit compliance
- **Cost:** Budget-conscious, targeting <$0.05 per assessment
- **Regulatory:** Must align with ISO 45001 safety standards
- **Structured Output:** Need consistent JSON schema for integration

We evaluated multiple AI model options across three categories:
1. Large Language Models (LLMs)
2. Fine-tuned classification models
3. Self-hosted open-source models

## Decision

Use **Gemini 2.0 Flash Thinking Experimental** via Google AI API for zero-shot risk assessment.

**Technical Specification:**
- **Provider:** Google (Vertex AI or AI Studio API)
- **Model:** `gemini-2.0-flash` (experimental thinking mode)
- **Input:** Breach metadata + ISO 45001 knowledge via prompt
- **Output:** Structured JSON (Impact 1-5, Likelihood 1-5, Justification, Recommendations)
- **Integration:** REST API with 10-second timeout, 3 retry attempts

## Rationale

### Why Gemini 2.0 Flash Thinking?

1. **Zero-Shot Excellence:** Pre-trained on vast safety/risk management corpus, understands ISO 45001 without fine-tuning
2. **Reasoning Transparency:** "Thinking" mode shows step-by-step logic before final answer (critical for bias detection)
3. **Structured Output:** Native JSON schema enforcement reduces hallucination risk
4. **Cost-Effective:** ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens = ~$0.01 per assessment
5. **Domain Knowledge:** Understands ports/terminals, maritime safety, regulatory terminology
6. **Speed:** <2 second latency (p95), meets user experience requirements

### Comparison to Alternatives

| Model | Accuracy (Est.) | Cost/Call | Reasoning | Zero-Shot | Verdict |
|-------|-----------------|-----------|-----------|-----------|---------|
| **Gemini 2.0 Flash** | 70-75% | $0.01 | ✅ Excellent | ✅ Yes | **SELECTED** |
| GPT-4o | 75-80% | $0.05 | ✅ Excellent | ✅ Yes | ❌ 5x cost |
| Claude 3.5 Sonnet | 72-77% | $0.04 | ✅ Good | ✅ Yes | ❌ Less structured output |
| Llama 3.1 70B | 65-70% | $0.00* | ⚠️ Fair | ⚠️ Limited | ❌ Self-hosting complexity |
| Fine-tuned BERT | 60-65% | $0.001 | ❌ None | ❌ No | ❌ No explanation |

*Llama is "free" but requires infrastructure ($200-500/month GPU instance)

## Consequences

### Positive

1. **Fast Time-to-Value:** No training period, deploy immediately
2. **Explainable Assessments:** Audit-compliant reasoning with ISO standard citations
3. **Low Operational Cost:** At 1,000 assessments/month = $10/month
4. **Pre-trained Safety Knowledge:** Understands OSHA, ISO 45001, IMO guidelines
5. **Continuous Improvement:** Google updates model, we benefit without re-training
6. **Scalability:** Handles spikes in breach volume without infrastructure changes

### Negative

1. **External API Dependency:** Service availability dependent on Google uptime (99.9% SLA)
2. **Data Privacy:** Breach data sent to Google servers (mitigated: no PII, legal review required)
3. **Vendor Lock-In:** Switching models requires prompt re-engineering
4. **Limited Customization:** Cannot fine-tune on our specific breach patterns (yet)
5. **Cost Scaling:** If volume >100k assessments/month, costs could exceed $1,000/month
6. **Regional Latency:** API calls from non-US regions may have higher latency

### Neutral

- Model versioning: Google may update/deprecate models (mitigation: pin to specific version)
- Experimental status: "Thinking" mode may graduate to stable or be discontinued

## Risks & Mitigation

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| **Gemini API outage** | Medium | Low | Fallback to manual assessment, cache similar cases |
| **Data privacy violation** | High | Low | Legal review of API terms, no PII in prompts, consider Vertex AI for data residency |
| **Model hallucination** | High | Medium | JSON schema validation, confidence thresholds, human-in-the-loop |
| **Cost overrun** | Low | Low | Rate limiting (max 5 calls/sec), daily budget caps, monitoring |
| **Vendor lock-in** | Medium | High | Abstraction layer (easy to swap models), maintain prompt templates |
| **Regulatory non-compliance** | Critical | Low | ISO 45001 auditor informed, document AI as decision support (not control) |

## Compliance Impact

### ISO 45001 Considerations
- **AI Role:** Decision support tool, NOT a safety control under §8.1.2
- **Competent Person:** Risk Leads remain the "competent person," AI does not replace
- **Audit Trail:** All AI reasoning logged for auditor review

### GDPR / Data Privacy
- **Lawful Basis:** Legitimate interest (risk management)
- **Data Minimization:** Only breach metadata sent, no employee PII
- **Right to Explanation:** AI must justify assessments in natural language
- **Data Location:** Vertex AI (EU region) preferred over AI Studio for EU data residency

### Action Items
- [ ] Legal review of Google Cloud Terms of Service
- [ ] CISO approval for external API integration
- [ ] Inform ISO 45001 auditor of AI usage (decision support, not control)

## Alternatives Considered

### Alternative 1: GPT-4o (OpenAI)
**Pros:**
- Slightly higher accuracy (75-80% vs. 70-75%)
- Excellent reasoning and explanation
- Proven in production environments

**Cons:**
- 5x cost ($0.05 vs. $0.01 per assessment)
- OpenAI's API terms less enterprise-friendly than Google
- No structured output enforcement (relies on prompt engineering)

**Why Rejected:** Cost not justified by marginal accuracy improvement

### Alternative 2: Claude 3.5 Sonnet (Anthropic)
**Pros:**
- Strong reasoning capabilities
- Good safety alignment (reduced hallucination)
- Similar cost to Gemini

**Cons:**
- Less robust structured output support
- Smaller pre-trained knowledge of industrial safety standards
- API availability less global than Google/OpenAI

**Why Rejected:** Gemini's structured output and domain knowledge edge it out

### Alternative 3: Llama 3.1 70B (Self-Hosted)
**Pros:**
- No per-call API costs
- Full data control (no external API)
- Can fine-tune for specific use case

**Cons:**
- Infrastructure cost ($300-500/month GPU instance)
- Operational overhead (model deployment, monitoring, updates)
- Lower zero-shot performance than frontier models
- Requires ML expertise to maintain

**Why Rejected:** Not cost-effective at current volume (<1,000 assessments/month). Revisit if volume exceeds 10,000/month.

### Alternative 4: Fine-tuned BERT (Classification Model)
**Pros:**
- Fast inference (<100ms)
- Very low cost ($0.001 per assessment)
- Can run on CPU

**Cons:**
- Requires 1,000+ labeled examples for training
- No natural language explanation generation
- Limited to predefined impact/likelihood buckets
- Cannot reason about novel scenarios

**Why Rejected:** Limited historical data (<10 examples) makes fine-tuning impossible. No explainability fails audit requirements.

## Implementation Notes

### API Configuration
```typescript
const geminiConfig = {
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.3,  // Lower = more consistent
  maxOutputTokens: 2048,
  responseSchema: RiskAssessmentSchema,  // Enforce JSON structure
  timeout: 10000,  // 10 second timeout
  retryAttempts: 3
};
```

### Prompt Strategy
- Embed ISO 45001 risk matrix in system prompt
- Include 5-10 synthetic examples (zero-shot → few-shot)
- Force step-by-step reasoning before final answer
- Require citation of standards in justification

### Monitoring
- Track API latency (target: p95 <2s)
- Monitor error rates (target: <1%)
- Cost tracking (daily budget alert at >$1/day)
- Model version logging (detect when Google updates model)

## Future Considerations

**If volume scales (>10,000 assessments/month):**
- Evaluate self-hosted Llama 3.1 or Mixtral
- Consider fine-tuning on accumulated feedback data

**If accuracy insufficient (<65%):**
- Evaluate GPT-4o (accept higher cost)
- Hybrid approach: Gemini + rule-based validation layer

**If data privacy becomes critical:**
- Migrate to Vertex AI (regional data residency)
- Evaluate fully self-hosted model

## Related Decisions

- [ADR-0009: Bias Mitigation Strategy](./0009-ai-bias-mitigation-strategy.md)
- [ADR-0010: AI Data Privacy](./0010-ai-data-privacy.md)
- [AI Governance Policy](../../content/governance/policies/ai-governance-policy.md)

## Approval Signatures

This decision will be reviewed after 3 months of POC operation (target: 2026-05-17).

- [ ] Product Lead: _________________________ Date: _______
- [ ] CTO: __________________________________ Date: _______
- [ ] Chief Risk Officer: ___________________ Date: _______
