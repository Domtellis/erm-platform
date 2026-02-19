# ADR-0010: AI Data Privacy & External API Usage

## Status: Proposed
## Date: 2026-02-17
## Decision Makers: [CISO, Chief Risk Officer, Legal Counsel]

## Context

The AI risk assessment feature requires sending breach data to Google's Gemini API for processing. This raises data privacy, security, and compliance questions:

**Key Concerns:**
1. What data leaves our infrastructure?
2. Where is it processed and stored?
3. Does this comply with GDPR, industry regulations?
4. What are contractual obligations with Google?
5. Can we meet ISO 45001 audit requirements?

**Regulatory Landscape:**
- **GDPR:** Applies if any EU data subjects involved
- **ISO 45001:** Requires confidentiality of certain safety information
- **Industry Regs:** Ports/terminals may have additional data residency requirements
- **Insurance:** Some policies require data remain on-premise

## Decision

**Allow** sending breach metadata to Gemini API with the following controls:

### 1. Data Minimization
**PERMITTED Data:**
- Metric names (e.g., "wind_speed_knots", "chemical_spill_liters")
- Observed values (numeric only)
- Severity classification
- Site/BU identifiers (codes only, not names)
- Timestamps

**PROHIBITED Data:**
- Employee names, IDs, or contact information
- Specific location addresses (use site codes: "SAFE-001")
- Confidential business strategies
- Third-party names (contractors, partners)
- Financial data
- Any fields marked "Confidential" in database

### 2. API Provider: Google Cloud (Vertex AI preferred)
**Option A: Vertex AI (RECOMMENDED for production)**
- Data residency controls (choose EU/US region)
- Enterprise SLAs and support
- GDPR-compliant data processing agreement
- Audit logs and compliance certifications

**Option B: Google AI Studio API (acceptable for POC)**
- Less control over data residency
- Simpler integration, faster POC
- Must migrate to Vertex AI before production

### 3. Data Flow Transparency
**User Notification:**
- Privacy policy updated to disclose AI usage
- Risk Leads informed that breach data processed by Google
- Option to opt-out (manual assessment only)

## Rationale

### Why External API vs. Self-Hosted?

**Self-Hosted (e.g., Llama 3.1) Pros:**
- Complete data control
- No data leaves infrastructure
- Unlimited usage (no per-call cost)

**Self-Hosted Cons:**
- Requires GPU infrastructure ($300-500/month)
- Operational overhead (model deployment, updates)
- Lower accuracy (65-70% vs. 70-75%)
- ML expertise needed

**External API (Gemini) Pros:**
- No infrastructure cost
- Google's security/compliance certifications
- Higher accuracy
- Automatic model improvements

**External API Cons:**
- Data sent outside our control
- Dependency on Google uptime
- Per-call costs

**Decision:** External API justified because:
1. Breach metadata is **not highly sensitive** (no PII, no trade secrets)
2. Google's **compliance certifications** (ISO 27001, SOC 2) meet our requirements
3. **Cost savings** ($10/month vs. $500/month infrastructure)
4. **Faster time-to-value** (deploy in weeks, not months)

### GDPR Compliance

**Lawful Basis:** Legitimate Interest (§6(1)(f))
- **Interest:** Improve risk assessment speed and consistency
- **Necessity:** AI demonstrably improves outcomes
- **Balancing Test:** No PII involved, low privacy risk

**Data Processing Agreement:**
- Google Cloud Standard Contractual Clauses (SCCs)
- Data Processing Addendum covers Gemini API
- Vertex AI preferred for GDPR (explicit EU region)

**Data Subject Rights:**
- Right to object: Users can opt-out (manual assessment)
- Right to erasure: Breach data can be deleted (Google retains <30 days per API terms)
- Right to explanation: AI must justify assessments

### ISO 45001 Compliance

**Confidentiality (§7.5):**
- AI processing does NOT violate confidentiality requirements
- Breach metadata is operational data, not confidential IP
- Employee safety data anonymized (no names in prompts)

**Third-Party Management (§8.1.4.2):**
- Google classified as "external provider"
- Vendor risk assessment completed
- SLA and compliance terms reviewed

## Consequences

### Positive

1. **Regulatory Compliant:** Vertex AI meets GDPR, ISO 27001, SOC 2 standards
2. **Cost-Effective:** No infrastructure build-out required
3. **Scalable:** Google handles compute scaling automatically
4. **Audit Trail:** Vertex AI provides logs for compliance reviews
5. **Professional Support:** Enterprise SLA and support from Google

### Negative

1. **Data Sovereignty:** Breach data processed outside our infrastructure
2. **Vendor Trust:** Reliant on Google's security practices
3. **Regulatory Risk:** Future regulations may restrict external AI APIs
4. **Contract Dependency:** Subject to Google's terms changes
5. **Latency:** API calls add network round-trip time

### Neutral

- Google may use data for model improvement (can opt-out per terms)
- Subject to Google API rate limits (60 requests/minute)

## Risks & Mitigation

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| **Data breach at Google** | High | Very Low | Google has ISO 27001, SOC 2 certifications; insurance covers impacts |
| **Regulatory non-compliance** | Critical | Low | Legal review of terms; GDPR DPA in place; annual compliance audit |
| **Confidential data leaked** | Critical | Low | Data scrubbing layer removes PII; automated validation before API call |
| **Google changes terms** | Medium | Medium | Annual terms review; fallback to self-hosted if terms become unacceptable |
| **API key compromise** | High | Low | Keys in secure vault; 90-day rotation; usage monitoring for anomalies |

## Compliance Checklist

### Pre-Deployment

- [ ] **Legal:** Review Google Cloud Vertex AI Terms of Service
- [ ] **Legal:** Execute Data Processing Addendum (DPA)
- [ ] **CISO:** Vendor security assessment of Google Cloud
- [ ] **Privacy:** Update privacy policy to disclose AI usage
- [ ] **ISO 45001:** Inform auditor of external API usage
- [ ] **GDPR:** Document lawful basis (Legitimate Interest Assessment)
- [ ] **Technical:** Implement PII scrubbing layer
- [ ] **Technical:** Verify data sent to API meets whitelist

### Post-Deployment

- [ ] **Quarterly:** Review Google's compliance certifications (renewals)
- [ ] **Annually:** Re-review API terms for changes
- [ ] **Annually:** Vendor risk assessment

## Implementation Details

### Data Scrubbing Layer

```typescript
function scrubBeachDataForAI(breach: BreachCase): AIPromptData {
  return {
    metric_name: breach.metric_name,                // OK
    observed_value: breach.observed_value,          // OK
    severity: breach.severity,                      // OK
    site_id: breach.site_id,                        // OK (code only)
    bu_id: breach.bu_id,                            // OK (code only)
    // PROHIBITED - Never send:
    // description: breach.description,              // May contain names
    // created_by: breach.created_by,                // Employee ID
    // site_address: breach.site_address             // PII
  };
}
```

### API Configuration (Vertex AI)

```typescript
const vertexAIConfig = {
  project: 'erm-production',
  location: 'europe-west4',  // EU region for GDPR
  model: 'gemini-2.0-flash-exp',
  credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  
  // Data residency enforcement
  dataResidency: 'EU',
  
  // Disable data logging for model improvement
  optOutDataCollection: true
};
```

### Audit Logging

Log every API call:
```typescript
model AIAPILog {
  id                String   @id @default(uuid())
  breach_case_id    String
  data_sent         Json     // Scrubbed data sent to API
  response_received Json
  timestamp         DateTime
  api_latency_ms    Int
  model_version     String
}
```

## Alternatives Considered

### Alternative 1: Self-Hosted Llama 3.1
**Approach:** Deploy open-source model on our infrastructure

**Pros:**
- Complete data control
- No external API dependency
- One-time infrastructure cost

**Cons:**
- $500/month GPU instance cost
- Lower accuracy (65-70%)
- Operational overhead
- Requires ML expertise

**Why Rejected:** Not cost-effective at current volume. Revisit if:
- Volume exceeds 10,000 assessments/month
- New regulations prohibit external APIs
- Google terms become unacceptable

### Alternative 2: On-Premise AI (Air-Gapped)
**Approach:** Self-hosted model with no internet access

**Why Rejected:**
- Massive infrastructure cost (>$5,000/month)
- No model updates (frozen in time)
- Overkill for non-classified data

### Alternative 3: Anonymization Layer (Hash Site IDs)
**Approach:** Hash all identifiers before sending to API

**Why Rejected:**
- AI needs actual values for assessment (hashing breaks context)
- Site codes already anonymized (SAFE-001 doesn't reveal location)
- Over-engineering for low-sensitivity data

## Data Retention Policy

**At Google (per API terms):**
- **AI Studio API:** 48 hours (for abuse detection)
- **Vertex AI:** Configurable, recommend 0 days (no retention)

**In ERM Platform:**
- AI prompts logged for 12 months (audit trail)
- After 12 months, archived or deleted per retention policy

## Geographic Considerations

| Region | Preferred API | Reason |
|--------|---------------|--------|
| **EU** | Vertex AI (europe-west4) | GDPR compliance, data residency |
| **US** | Vertex AI (us-central1) or AI Studio | Faster latency, less regulatory concern |
| **APAC** | Vertex AI (asia-southeast1) | Local data residency laws |

**Recommendation:** Start with Vertex AI EU region (covers strictest regulations)

## Related Decisions

- [ADR-0008: AI Model Selection](./0008-ai-model-selection.md)
- [ADR-0009: Bias Mitigation Strategy](./0009-ai-bias-mitigation-strategy.md)
- [AI Governance Policy](../../content/governance/policies/ai-governance-policy.md)

## Review & Approval

**Legal Review Required:** YES  
**Privacy Impact Assessment:** Required before production  
**Vendor Risk Assessment:** Required (Google Cloud)

**Approval Signatures:**

- [ ] CISO: ________________________________________ Date: _______
- [ ] Chief Risk Officer: _________________________ Date: _______
- [ ] Legal Counsel: ______________________________ Date: _______
- [ ] Data Protection Officer (if applicable): ____ Date: _______
