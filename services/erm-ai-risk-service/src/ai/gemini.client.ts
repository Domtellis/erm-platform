import { Injectable, Logger } from "@nestjs/common";
import { lastValueFrom, of, throwError, defer } from "rxjs";
import { delay, retry, map, catchError } from "rxjs/operators";
import { from } from "rxjs";
import { ConfigService } from "@nestjs/config";
import {
  geminiCallDuration,
  geminiErrorCount,
  geminiRetryCount,
  aiTokenUsage,
  aiCostTotal,
  aiSafetyBlockCount,
} from "../instrumentation";
import {
  BreachContext,
  AiAssessmentResult,
  buildRiskAssessmentPrompt,
  parseAiResponse,
  AiParseError,
  PROMPT_VERSION,
} from "./prompt.builder";
import { PortClauseContext } from "../standards/port-context.service";

interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

interface SafetyRating {
  category: string;
  probability: string;
  blocked?: boolean;
}

interface GeminiApiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
    safetyRatings?: SafetyRating[];
    finishReason?: string;
  }[];
  usageMetadata?: UsageMetadata;
}

const PRICING = {
  "gemini-2.0-flash": { input: 0.0000001, output: 0.0000004 },
  "gemini-2.5-flash-lite": { input: 0.000000075, output: 0.0000003 },
  // Fallback pricing
  default: { input: 0.0000001, output: 0.0000004 },
};

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly model: string;
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(private readonly configService: ConfigService) {
    this.model = this.configService.get<string>(
      "GEMINI_MODEL",
      "gemini-2.0-flash",
    );
    this.apiKey = this.configService.get<string>("GEMINI_API_KEY");
    this.apiUrl = this.configService.get<string>(
      "GEMINI_API_URL",
      "https://generativelanguage.googleapis.com/v1beta/models",
    );
    this.timeoutMs = this.configService.get<number>(
      "GEMINI_API_TIMEOUT_MS",
      10000,
    );
    this.maxRetries = this.configService.get<number>("GEMINI_MAX_RETRIES", 3);
  }

  get modelVersion(): string {
    return this.model;
  }

  get promptVersion(): string {
    return PROMPT_VERSION;
  }

  async assessRisk(
    ctx: BreachContext,
    portClauses: PortClauseContext[] = [],
  ): Promise<AiAssessmentResult> {
    const prompt = buildRiskAssessmentPrompt(ctx, portClauses);
    const startTime = Date.now();

    // Use RxJS for robust, industry-standard retry logic with exponential backoff
    // CRITICAL: Use defer() to ensure a fresh Promise/fetch is created on every retry!
    const assessment$ = defer(() => from(this.callGeminiApi(prompt))).pipe(
      map(({ text, usage, safety }) => {
        const result = parseAiResponse(text);
        this.recordTelemetry(usage, safety, "success");
        return { result, usage, safety };
      }),
      retry({
        count: this.maxRetries,
        delay: (error, retryCount) => {
          const errorType = this.classifyError(error);

          // FATAL ERROR: Do not retry on parsing failures or schema violations
          if (errorType === "parse_error") {
            return throwError(() => error);
          }

          // TRANSIENT ERROR: Implement Exponential Backoff (500ms, 1000ms, 2000ms)
          const backoff = 500 * Math.pow(2, retryCount - 1);
          this.logger.warn(
            `Transient error detected (${errorType}). Retry attempt ${retryCount}/${this.maxRetries} after ${backoff}ms: ${error.message}`,
          );

          geminiRetryCount.add(1, {
            model: this.model,
            attempt: String(retryCount),
          });

          return of(null).pipe(delay(backoff));
        },
      }),
      catchError((err) => {
        const errorType = this.classifyError(err);
        geminiErrorCount.add(1, { model: this.model, error_type: errorType });
        this.logger.error(`AI Assessment failed definitively: ${err.message}`);
        return throwError(() => err);
      }),
    );

    const { result } = await lastValueFrom(assessment$);

    const totalTransactionTime = Date.now() - startTime;
    this.logger.log(
      `Gemini assessment complete | model=${this.model} prompt_version=${PROMPT_VERSION} ` +
        `total_tx_time=${totalTransactionTime}ms impact=${result.impact} likelihood=${result.likelihood}`,
    );

    return result;
  }

  private async callGeminiApi(
    prompt: string,
  ): Promise<{ text: string; usage?: UsageMetadata; safety?: SafetyRating[] }> {
    const url = `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const requestStartTime = Date.now();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        if (response.status === 429) {
          throw new Error(
            "Gemini API Quota Exceeded. Please check your billing/tier or try again later.",
          );
        }
        throw new Error(`Gemini API HTTP ${response.status}: ${body}`);
      }

      const data: GeminiApiResponse = await response.json();
      const candidate = data?.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;
      const finishReason = candidate?.finishReason;

      // S-AIR Phase 3 Hardening: Finish Reason Validation
      if (finishReason && finishReason !== "STOP") {
        this.logger.error(
          `Gemini API finishReason is abnormal: ${finishReason}`,
        );
        // If it's blocked by safety, we already checked safetyRatings, but this is a double-check
        throw new Error(
          `Gemini API failed to complete: finish_reason=${finishReason}`,
        );
      }

      if (!text) {
        // Check if it was blocked by safety
        const safety = candidate?.safetyRatings;
        if (safety?.some((s) => s.blocked)) {
          this.recordTelemetry(data.usageMetadata, safety, "safety_blocked");
          throw new Error("Gemini API call blocked by safety filters");
        }
        throw new Error("Gemini API returned empty content");
      }

      // Record SUCCESS latency here
      const requestDuration = Date.now() - requestStartTime;
      geminiCallDuration.record(requestDuration, {
        model: this.model,
        prompt_version: PROMPT_VERSION,
        status: "success",
      });

      return {
        text,
        usage: data.usageMetadata,
        safety: data?.candidates?.[0]?.safetyRatings,
      };
    } catch (err) {
      const errorType = this.classifyError(err);
      const requestDuration = Date.now() - requestStartTime;

      geminiCallDuration.record(requestDuration, {
        model: this.model,
        prompt_version: PROMPT_VERSION,
        status: "failure",
        error_type: errorType,
      });

      if (err.name === "AbortError") {
        throw new Error(`Gemini API timeout after ${this.timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private recordTelemetry(
    usage?: UsageMetadata,
    safety?: SafetyRating[],
    status: string = "success",
  ) {
    const labels = {
      model: this.model,
      prompt_version: PROMPT_VERSION,
      status,
    };

    if (usage) {
      aiTokenUsage.add(usage.promptTokenCount, { ...labels, type: "prompt" });
      aiTokenUsage.add(usage.candidatesTokenCount, {
        ...labels,
        type: "completion",
      });

      const rates = (PRICING as any)[this.model] || PRICING.default;
      const cost =
        usage.promptTokenCount * rates.input +
        usage.candidatesTokenCount * rates.output;
      aiCostTotal.add(cost, labels);
    }

    if (safety) {
      safety.forEach((rating) => {
        if (rating.blocked || rating.probability !== "NEGLIGIBLE") {
          aiSafetyBlockCount.add(1, {
            ...labels,
            category: rating.category,
            probability: rating.probability,
          });
        }
      });
    }
  }

  private classifyError(err: Error): string {
    if (err instanceof AiParseError) return "parse_error";
    if (err.message.includes("timeout")) return "timeout";
    if (err.message.includes("HTTP 4") || err.message.includes("HTTP 5"))
      return "api_error";
    return "unknown";
  }
}
