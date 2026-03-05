/**
 * Prompt Builder — S-AIR Dynamic RAG Prompt
 *
 * Version history:
 *   v1.0 (2026-02-18): Initial release — ISO 45001 hardcoded zero-shot
 *   v2.0 (2026-03-05): S-AIR upgrade — Dynamic ILO clause injection (Option B)
 *                      + Gemini ISO 45001/31000 citation instruction (Option A)
 *
 * IMPORTANT: No PII is included in prompts. Only operational metrics are sent.
 */

import { PortClauseContext } from "../standards/port-context.service";

export const PROMPT_VERSION = "v2.0";

export interface BreachContext {
  breach_case_id: string;
  metric_name: string;
  observed_value: number;
  threshold?: number;
  severity: string;
  site_id: string;
  bu_id: string;
  title: string;
}

export interface AiAssessmentResult {
  impact: number;                 // 1-5
  likelihood: number;             // 1-5
  risk_score: number;             // impact × likelihood
  ilo_clause_applied: string | null;   // e.g. "ILO-PORT-2018 §4.3"
  ilo_clause_title: string | null;
  iso_clause_applied: string | null;   // e.g. "ISO 45001:2018 Clause 6.1.2"
  iso_clause_title: string | null;
  unable_to_cite_reason: string | null;
  justification: string;
  recommendations: string[];
}

/**
 * Builds a RAG-grounded risk assessment prompt.
 *
 * @param ctx           - Breach metadata
 * @param portClauses   - Top ILO/IMO clauses retrieved from the Port Context Registry
 *                        (empty array falls back to Gemini ISO knowledge only)
 */
export function buildRiskAssessmentPrompt(
  ctx: BreachContext,
  portClauses: PortClauseContext[],
): string {
  const thresholdLine =
    ctx.threshold != null
      ? `Threshold: ${ctx.threshold}`
      : "Threshold: Not specified";

  // Build the ILO Port Context block (Option B — injected free legal content)
  const portContextBlock =
    portClauses.length > 0
      ? `
## Applicable Port Safety Standards (ILO)
The following clauses from the ILO Code of Practice on Safety and Health in Ports (2018)
apply to this metric. Use them as grounding for your assessment:

${portClauses
        .map(
          (c) => `### ${c.clause_ref} — ${c.title}
${c.summary}`,
        )
        .join("\n\n")}
`
      : `
## Port Safety Standards
No specific ILO Port Code clause is available for this metric in the local registry.
Apply your knowledge of ISO 45001:2018 and ISO 31000:2018 to assess this breach.
`;

  return `You are an expert occupational health and safety risk assessor specialising in Ports and Terminals.
You are trained in ISO 45001:2018 (Occupational Health & Safety) and ISO 31000:2018 (Risk Management).

A safety metric breach has been detected at a ports and terminals facility.

## Breach Details
- Metric: ${ctx.metric_name}
- Observed Value: ${ctx.observed_value}
- ${thresholdLine}
- Severity Classification: ${ctx.severity}
- Site ID: ${ctx.site_id}
- Business Unit: ${ctx.bu_id}
- Title: ${ctx.title}
${portContextBlock}
## Your Task
Provide a structured risk assessment. You MUST:
1. Apply the ILO Port Code clause provided above if one is given.
2. Identify the most relevant ISO 45001:2018 or ISO 31000:2018 clause from your training knowledge.
3. Cite BOTH in your response using the exact clause IDs.
4. If you cannot confidently identify a specific clause, set "unable_to_cite_reason" explaining why.

**Impact Scale (ISO 45001 Annex B):**
1 = Negligible (no injury, minor property damage)
2 = Minor (first aid injury, minor impact)
3 = Moderate (medical treatment injury, moderate impact)
4 = Major (serious injury, significant environmental impact)
5 = Critical (fatality or permanent disability)

**Likelihood Scale (ISO 45001 Clause 6.1):**
1 = Rare (may occur only in exceptional circumstances)
2 = Unlikely (could occur at some time)
3 = Possible (might occur at some time)
4 = Likely (will probably occur in most circumstances)
5 = Almost Certain (expected to occur in most circumstances)

## Response Format
Respond ONLY with valid JSON — no markdown, no explanation outside the JSON:

{
  "impact": <integer 1-5>,
  "likelihood": <integer 1-5>,
  "ilo_clause_applied": "<ILO clause reference or null>",
  "ilo_clause_title": "<ILO clause title or null>",
  "iso_clause_applied": "<ISO clause reference e.g. 'ISO 45001:2018 Clause 6.1.2' or null>",
  "iso_clause_title": "<ISO clause title or null>",
  "unable_to_cite_reason": "<explanation if no clause found, or null>",
  "justification": "<2-3 sentences citing the specific metric value and the clauses applied>",
  "recommendations": [
    "<specific actionable recommendation 1>",
    "<specific actionable recommendation 2>",
    "<specific actionable recommendation 3>"
  ]
}`;
}

/**
 * Parses and validates the AI response from Gemini.
 * Handles both successful dual-citation and graceful unable-to-cite cases.
 */
export function parseAiResponse(rawText: string): AiAssessmentResult {
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  const impact = Number(parsed.impact);
  const likelihood = Number(parsed.likelihood);

  if (!Number.isInteger(impact) || impact < 1 || impact > 5) {
    throw new Error(`Invalid impact value: ${parsed.impact}`);
  }
  if (!Number.isInteger(likelihood) || likelihood < 1 || likelihood > 5) {
    throw new Error(`Invalid likelihood value: ${parsed.likelihood}`);
  }
  if (
    typeof parsed.justification !== "string" ||
    parsed.justification.trim().length === 0
  ) {
    throw new Error("Missing or empty justification");
  }
  if (
    !Array.isArray(parsed.recommendations) ||
    parsed.recommendations.length === 0
  ) {
    throw new Error("Missing or empty recommendations");
  }

  return {
    impact,
    likelihood,
    risk_score: impact * likelihood,
    ilo_clause_applied: parsed.ilo_clause_applied ?? null,
    ilo_clause_title: parsed.ilo_clause_title ?? null,
    iso_clause_applied: parsed.iso_clause_applied ?? null,
    iso_clause_title: parsed.iso_clause_title ?? null,
    unable_to_cite_reason: parsed.unable_to_cite_reason ?? null,
    justification: parsed.justification.trim(),
    recommendations: parsed.recommendations.map((r: unknown) =>
      String(r).trim(),
    ),
  };
}
