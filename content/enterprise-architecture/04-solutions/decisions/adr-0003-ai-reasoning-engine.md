# ADR 0003: AI Reasoning Engine Selection (Gemini 2.0 Flash + S-AIR RAG)

## Status
Accepted

## Last Updated
2026-03-05

## Context
The ERM platform requires an intelligent reasoning engine to perform automated risk triage, rationale generation, and narrative synthesis. We need a model with low latency (<2s), high reasoning capabilities for regulatory citations (ISO 45001, ISO 31000), and cost-effectiveness for pilot volume.

In addition to the original zero-shot requirement, the platform now applies a **RAG (Retrieval-Augmented Generation)** approach to ground the model's output in specific, verifiable standards clauses — eliminating the risk of generic or hallucinated regulatory references.

## Decision
We use **Google Gemini 2.0 Flash** as the primary reasoning engine for the Intelligence Layer, in a **dual-source S-AIR architecture**:

1. **Option A — Gemini-as-Oracle (ISO):** Gemini's pre-trained knowledge of ISO 45001:2018 and ISO 31000:2018 is invoked via structured prompting. The model is instructed to cite the exact sub-clause it applied.
2. **Option B — ILO Port Code RAG:** Clauses from the ILO Code of Practice on Safety & Health in Ports (2018) are stored in the `ai_risk.PortContextClause` table and dynamically injected into the prompt based on the breached metric's `metric_tags`.

## Rationale
- **Performance**: Gemini 2.0 Flash provides near-instant response times (<2s p95) for RAG-grounded risk assessment.
- **Reasoning**: Superior performance in mapping breach metadata to complex ISO/ILO risk criteria with specific sub-clause citations.
- **Standards Grounding**: ILO Port Code injection removes generic ISO references — every suggestion traces to a specific, verifiable clause. Dual citations (`ilo_clause_applied` + `iso_clause_applied`) appear in every `AssessmentSuggestion`.
- **Audit Immutability**: A `StandardSnapshot` is written alongside each `AssessmentSuggestion`, recording which exact clause versions were applied — enabling temporal audit trail ("what did the AI know and when?").
- **Cost**: Remains within the <$0.05 per assessment budget target.
- **Multimodal Context**: Future-proofs the platform for analyzing image-based evidence (e.g., photo proof of control execution).

## Consequences
- The `erm-ai-risk-service` must be configured with Gemini 2.0 API keys.
- The `ai_risk.PortContextClause` table must be seeded with active ILO/IMO clauses before assessments can be grounded. Empty registry triggers graceful degradation with a `standards_warning` flag.
- The `SyncEngineService` runs weekly to detect ILO publication changes and emit `erm.standards.out-of-sync.v1` if stale.
- Prompt engineering is optimized for the RAG grounding pattern: **inject → instruct → cite → validate**.
- Bias monitoring must account for Standards Drift as a new bias vector (see ADR-0009, Layer 6).
- See [ADR-0011: Standards RAG Strategy](./adr-0011-standards-rag-strategy.md) for detailed rationale on the dual-source approach.
