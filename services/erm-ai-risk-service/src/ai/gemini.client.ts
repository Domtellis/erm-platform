import { Injectable, Logger } from "@nestjs/common";
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
  PROMPT_VERSION,
} from "./prompt.builder";

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

  async assessRisk(ctx: BreachContext): Promise<AiAssessmentResult> {
    const prompt = buildRiskAssessmentPrompt(ctx);
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      if (attempt > 1) {
        // Exponential backoff: 500ms, 1000ms, 2000ms
        const delayMs = 500 * Math.pow(2, attempt - 2);
        this.logger.warn(
          `Retry attempt ${attempt}/${this.maxRetries} after ${delayMs}ms`,
        );
        geminiRetryCount.add(1, {
          model: this.model,
          attempt: String(attempt),
        });
        await this.sleep(delayMs);
      }

      try {
        const { text, usage, safety } = await this.callGeminiApi(prompt);
        const result = parseAiResponse(text);

        // Record Telemetry
        this.recordTelemetry(usage, safety, "success");

        const latencyMs = Date.now() - startTime;
        geminiCallDuration.record(latencyMs, {
          model: this.model,
          prompt_version: PROMPT_VERSION,
          status: "success",
        });

        this.logger.log(
          `Gemini assessment complete | model=${this.model} prompt_version=${PROMPT_VERSION} ` +
            `latency=${latencyMs}ms attempt=${attempt} impact=${result.impact} likelihood=${result.likelihood}`,
        );

        return result;
      } catch (err) {
        lastError = err;
        const errorType = this.classifyError(err);
        this.logger.error(
          `Gemini call failed (attempt ${attempt}): ${err.message}`,
        );
        geminiErrorCount.add(1, { model: this.model, error_type: errorType });

        // Don't retry on parse errors — the response came back but was malformed
        if (errorType === "parse_error") {
          break;
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    geminiCallDuration.record(latencyMs, {
      model: this.model,
      prompt_version: PROMPT_VERSION,
      status: "failure",
    });

    throw lastError;
  }

  private async callGeminiApi(
    prompt: string,
  ): Promise<{ text: string; usage?: UsageMetadata; safety?: SafetyRating[] }> {
    const url = `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

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
        throw new Error(`Gemini API HTTP ${response.status}: ${body}`);
      }

      const data: GeminiApiResponse = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        // Check if it was blocked by safety
        const safety = data?.candidates?.[0]?.safetyRatings;
        if (safety?.some((s) => s.blocked)) {
          this.recordTelemetry(data.usageMetadata, safety, "safety_blocked");
          throw new Error("Gemini API call blocked by safety filters");
        }
        throw new Error("Gemini API returned empty content");
      }

      return {
        text,
        usage: data.usageMetadata,
        safety: data?.candidates?.[0]?.safetyRatings,
      };
    } catch (err) {
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

      // Pricing estimated for Gemini 2.0 Flash (as of 2026 approx)
      // Input: $0.10 / 1M tokens, Output: $0.40 / 1M tokens
      const cost =
        usage.promptTokenCount * 0.0000001 +
        usage.candidatesTokenCount * 0.0000004;
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
    if (err.message.includes("timeout")) return "timeout";
    if (
      err.message.includes("JSON") ||
      err.message.includes("parse") ||
      err.message.includes("Invalid") ||
      err.message.includes("Missing")
    )
      return "parse_error";
    if (err.message.includes("HTTP 4") || err.message.includes("HTTP 5"))
      return "api_error";
    return "unknown";
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
