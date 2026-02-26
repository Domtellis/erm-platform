import { resourceFromAttributes } from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { metrics } from "@opentelemetry/api";

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "erm-ai-risk-service",
  }),
  traceExporter: new OTLPTraceExporter({}),
  instrumentations: [getNodeAutoInstrumentations()],
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({}),
    exportIntervalMillis: 10000, // Export every 10s
  }),
});

// IMPORTANT: Metrics API must be initialized BEFORE calling start() if using the metrics API inside the same module
// However, sdk.start() registers the global meter provider.
sdk.start();

console.log("OTel SDK started for erm-ai-risk-service");

// ─── Custom AI Business Metrics ───────────────────────────────────────────────
// Get meter AFTER sdk.start() to ensure it uses the registered global provider.
const meter = metrics.getMeter("erm-ai-risk-service", "1.0.0");

// Gemini API call latency — histogram with standard buckets (ms)
export const geminiCallDuration = meter.createHistogram(
  "ai.gemini.call.duration",
  {
    description: "Gemini API call latency in milliseconds",
    unit: "ms",
    advice: {
      explicitBucketBoundaries: [100, 250, 500, 1000, 2000, 3000, 5000, 10000],
    },
  },
);

// Gemini API errors by type
export const geminiErrorCount = meter.createCounter("ai.gemini.error.count", {
  description:
    "Number of Gemini API errors by type (timeout, parse_error, api_error)",
});

// Gemini retry attempts
export const geminiRetryCount = meter.createCounter("ai.gemini.retry.count", {
  description: "Number of Gemini API retry attempts",
});

// Total assessments generated
export const assessmentTotal = meter.createCounter("ai.assessment.total", {
  description: "Total AI risk assessments generated",
});

// Failed assessments
export const assessmentFailed = meter.createCounter("ai.assessment.failed", {
  description: "Number of AI risk assessments that failed",
});

// Human feedback counters
export const assessmentAccepted = meter.createCounter(
  "ai.assessment.accepted",
  {
    description: "AI assessments accepted by human reviewer",
  },
);

export const assessmentModified = meter.createCounter(
  "ai.assessment.modified",
  {
    description: "AI assessments modified by human reviewer",
  },
);

export const assessmentRejected = meter.createCounter(
  "ai.assessment.rejected",
  {
    description: "AI assessments rejected by human reviewer",
  },
);

// Pending backlog (up-down counter)
export const assessmentPending = meter.createUpDownCounter(
  "ai.assessment.pending",
  {
    description: "Current number of AI assessments awaiting human review",
  },
);

// Kafka events published
export const kafkaPublishedCount = meter.createCounter(
  "ai.kafka.published.count",
  {
    description: "Number of events published to Kafka by the AI service",
  },
);

// ─── AI TRiSM & FinOps Metrics (2026 Standards) ─────────────────────────────

// Token usage (Prompt vs Completion)
export const aiTokenUsage = meter.createCounter("ai.usage.tokens", {
  description: "Number of tokens consumed by the LLM",
});

// Estimated cost in USD (Based on model pricing)
export const aiCostTotal = meter.createCounter("ai.usage.cost", {
  description: "Estimated cost of LLM usage in USD",
});

// Safety blocks by category
export const aiSafetyBlockCount = meter.createCounter("ai.safety.block.count", {
  description: "Number of safety filter blocks by category",
});

// Groundedness score (0.0 - 1.0)
export const aiGroundednessScore = meter.createHistogram(
  "ai.quality.groundedness",
  {
    description: "Semantic groundedness score of the AI response",
    advice: {
      explicitBucketBoundaries: [0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 1.0],
    },
  },
);
