# AI Scalability & Token Management Plan

**Vision**: Scale the "Intelligent ERM" from a single BU pilot to enterprise-wide deployment without hitting Gemini 2.0 quota limits or budget caps.

## 1. Token Usage Strategy

| Phase | Volume | Strategy |
| :--- | :--- | :--- |
| **Pilot (BU-01)** | ~100 breaches/mo | Direct Gemini 2.0 Flash usage; minimal caching. |
| **Global v1** | ~5000 breaches/mo | **Context Caching**: Cache common risk matrix prompts; Redis for similar breach patterns. |
| **Enterprise v2** | 50k+ breaches/mo | **Model Tiering**: Gemini 2.0 Flash for Triage (fast/cheap); Gemini 2.0 Pro for Critical reviews. |

## 2. Quota Management
- **Rate Limiting**: Implement upstream rate limiting in `erm-ai-risk-service` to prevent 429 errors during metric spikes.
- **Failover**: Fallback to "Standard Rules Engine" (Heuristics) if AI quota is exhausted.

## 3. Cost Optimization
- **Prompt Pruning**: Regularly audit prompt templates for token bloat.
- **Batch Processing**: Use Gemini Batch API for non-urgent weekly bias audits (50% cost reduction).
