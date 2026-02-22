# ADR 0003: AI Reasoning Engine Selection (Gemini 2.0 Flash)

## Status
Accepted

## Context
The ERM platform requires an intelligent reasoning engine to perform automated risk triage, rationale generation, and narrative synthesis. We need a model with low latency (<2s), high reasoning capabilities for regulatory citations (ISO 45001), and cost-effectiveness for pilot volume.

## Decision
We will use **Google Gemini 2.0 Flash** as the primary reasoning engine for the Intelligence Layer.

## Rationale
- **Performance**: Gemini 2.0 Flash provides near-instant response times for zero-shot risk assessment.
- **Reasoning**: It demonstrates superior performance in mapping breach metadata to complex risk criteria compared to smaller models.
- **Multimodal Context**: Future-proofs the platform for analyzing image-based evidence (e.g., photo proof of control execution).
- **Cost**: Offers a balanced price-to-performance ratio for High-Volume/Low-Complexity triage tasks.

## Consequences
- The `erm-ai-risk-service` must be configured with Gemini 2.0 API keys.
- Prompt engineering must be optimized for Gemini 2.0 zero-shot capabilities.
- Bias monitoring must be calibrated to this specific model edition.
