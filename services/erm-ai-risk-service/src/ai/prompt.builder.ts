/**
 * Prompt Builder — ISO 45001 zero-shot prompt template
 *
 * Version history:
 *   v1.0 (2026-02-18): Initial release — ISO 45001 impact/likelihood scale
 *
 * IMPORTANT: No PII is included in prompts. Only operational metrics are sent.
 */

export const PROMPT_VERSION = "v1.0";

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
  impact: number; // 1-5
  likelihood: number; // 1-5
  risk_score: number; // impact × likelihood
  justification: string;
  recommendations: string[];
}

export function buildRiskAssessmentPrompt(ctx: BreachContext): string {
  const thresholdLine =
    ctx.threshold != null
      ? `Threshold: ${ctx.threshold}`
      : "Threshold: Not specified";

  return `You are an expert occupational health and safety risk assessor trained in ISO 45001:2018.

A safety metric breach has been detected at a ports and terminals facility. Assess the risk using the ISO 45001 risk matrix.

## Breach Details
- Metric: ${ctx.metric_name}
- Observed Value: ${ctx.observed_value}
- ${thresholdLine}
- Severity Classification: ${ctx.severity}
- Site ID: ${ctx.site_id}
- Business Unit: ${ctx.bu_id}
- Title: ${ctx.title}

## Your Task
Provide a structured risk assessment using the following scales:

**Impact Scale (ISO 45001 Annex B):**
1 = Negligible (no injury, minor property damage)
2 = Minor (first aid injury, minor environmental impact)
3 = Moderate (medical treatment injury, moderate impact)
4 = Major (serious injury, significant environmental impact)
5 = Critical (fatality or permanent disability, severe impact)

**Likelihood Scale (ISO 45001 Clause 6.1):**
1 = Rare (may occur only in exceptional circumstances)
2 = Unlikely (could occur at some time)
3 = Possible (might occur at some time)
4 = Likely (will probably occur in most circumstances)
5 = Almost Certain (expected to occur in most circumstances)

## Response Format
Respond ONLY with valid JSON in this exact structure — no markdown, no explanation outside the JSON:

{
  "impact": <integer 1-5>,
  "likelihood": <integer 1-5>,
  "justification": "<2-3 sentences referencing the specific metric value and ISO 45001 clause>",
  "recommendations": [
    "<specific actionable recommendation 1>",
    "<specific actionable recommendation 2>",
    "<specific actionable recommendation 3>"
  ]
}`;
}

export function parseAiResponse(rawText: string): AiAssessmentResult {
  // Strip markdown code fences if present (defensive parsing)
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
    justification: parsed.justification.trim(),
    recommendations: parsed.recommendations.map((r: any) => String(r).trim()),
  };
}
