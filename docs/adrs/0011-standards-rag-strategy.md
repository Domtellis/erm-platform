# ADR-0011: Standards Registry and RAG-Grounded AI Assessment (S-AIR)

## Status: Accepted
## Date: 2026-03-05
## Decision Makers: [Product Lead, Chief Risk Officer, AI Oversight Lead]

## Context

The ERM Platform's AI Risk Assessment (`erm-ai-risk-service`) was originally built using zero-shot prompting with hardcoded ISO 45001 context embedded in the system prompt. While functional, this approach had three critical weaknesses for a production compliance platform:

1. **Not auditable**: The AI's knowledge source was Gemini's training data — not a versioned, citeable document.
2. **Not port-specific**: ISO 45001 is a general OHS standard. Ports and Terminals operate under specific ILO/IMO codes of practice that the generic prompt did not account for.
3. **Not maintainable**: There was no mechanism to detect when relevant standards changed, or to update the AI's context without a code deployment.

## Decision

Implement the **S-AIR (Standards-Aware AI Risk)** architecture using a two-layer knowledge strategy:

- **Layer A (ISO Knowledge)**: Leverage Gemini's pre-trained knowledge of ISO 45001:2018 and ISO 31000:2018. Prompt the AI to identify and cite the relevant ISO clause it knows applies to the breach.
- **Layer B (Port Context)**: Ingest freely available ILO Port Code of Practice (2018) clause summaries into a local `PortContextClause` registry. Retrieve the relevant clause by `metric_tags` and inject the text verbatim into the prompt before the Gemini call.

Every AI assessment must produce both an `ilo_clause_applied` and an `iso_clause_applied` citation. If neither can be determined, the AI must set `unable_to_cite_reason` and the UI must surface this explicitly to the Risk Analyst.

## Rationale

| Factor | Decision Basis |
|---|---|
| **Cost** | ISO standard text is copyrighted (~$200-500/yr subscription). ILO Port Code is freely published by an intergovernmental body — no copyright barrier. |
| **Legal Risk** | Scraping ISO.org is a copyright violation. This approach uses only what Gemini was legally trained on (Layer A) and legally free publications (Layer B). |
| **Auditability** | Every `AssessmentSuggestion` now links to a `StandardSnapshot` recording the exact clause IDs and ILO version used at the time of assessment. |
| **Port Specificity** | ILO Port Code 2018 clauses are directly mapped to our 6 terminal safety metrics, making AI responses far more domain-relevant. |

## Approved Metric-to-Clause Seed Map

| metric_name | ILO Port Code Clause | ISO 45001 Clause |
|---|---|---|
| `ltifr` | §3.1 OHS Management | §9.1 Monitoring & Measurement |
| `dropped_object_rate` | §4.3 Crane & Lifting Equipment | §6.1.2 Hazard ID & Risk Assessment |
| `near_miss_reporting_rate` | §3.5 Incident Investigation | §10.2 Incident, Nonconformity & Action |
| `overload_alarm_frequency` | §4.3.2 Safe Working Load | §8.1 Operational Planning & Control |
| `wind_protocol_breach_count` | §4.7 Adverse Weather Conditions | §6.1.4 Planning Actions |
| `wah_incident_rate` | §5.2 Falls from Height | §8.1.2 Hierarchy of Controls |

## Consequences

### Positive
- AI assessments are now grounded, citeable, and auditable against named clause IDs
- StandardSnapshot creates an immutable audit trail for temporal traceability
- SyncEngine detects ILO publication changes weekly and notifies operators
- Graceful degradation: if registry is empty, a warning event is emitted but assessment continues

### Negative
- Requires one-time seed ingestion by the Compliance team
- ILO clause summaries are curated plain-English — not verbatim clause text (due to copyright)
- Sync detection is heuristic (HTTP last-modified header), not byte-level diffing

### Neutral
- ISO clause citations come from Gemini's training — verified by human review, not automated assertion

## Future Consideration

When the Platform scales to production volume (>1,000 assessments/month), evaluate an ISO subscription to automate full clause text ingestion and enable automated diff detection.

## Related Decisions

- [ADR-0008: AI Model Selection](./0008-ai-model-selection.md)
- [ADR-0009: AI Bias Mitigation Strategy](./0009-ai-bias-mitigation-strategy.md)
- [EA ADR-0003: AI Reasoning Engine](../../content/enterprise-architecture/04-solutions/decisions/adr-0003-ai-reasoning-engine.md)

## Approval Signatures

- [ ] Product Lead: _________________________ Date: _______
- [ ] Chief Risk Officer: ___________________ Date: _______
- [ ] AI Oversight Lead: ___________________ Date: _______
