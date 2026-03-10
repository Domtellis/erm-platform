import { Test, TestingModule } from "@nestjs/testing";
import { GeminiClient } from "./gemini.client";
import { ConfigService } from "@nestjs/config";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

describe("Phase 3: Gemini Client Resilience (RxJS Retries)", () => {
  let client: GeminiClient;
  let config: DeepMockProxy<ConfigService>;
  let fetchMock: jest.SpyInstance;

  beforeEach(async () => {
    config = mockDeep<ConfigService>();
    config.get.mockImplementation((key: string, defaultValue?: any) => {
      if (key === "GEMINI_MODEL") return "gemini-2.0-flash";
      if (key === "GEMINI_API_KEY") return "test-key";
      if (key === "GEMINI_API_TIMEOUT_MS") return 1000;
      if (key === "GEMINI_MAX_RETRIES") return 3;
      return defaultValue;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [GeminiClient, { provide: ConfigService, useValue: config }],
    }).compile();

    client = module.get<GeminiClient>(GeminiClient);

    // Mock global fetch
    fetchMock = jest.spyOn(global, "fetch");
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fetchMock.mockRestore();
    jest.useRealTimers();
  });

  const mockBreach = {
    breach_case_id: "b-01",
    metric_name: "test",
    observed_value: 10,
    severity: "high",
    site_id: "s-1",
    bu_id: "b-1",
    title: "test",
  };

  /**
   * NOTE ON DLQ ARCHITECTURE:
   * GeminiClient is a low-level provider responsible for API communication and retries.
   * It throws errors to the caller (AiService).
   * Data preservation (DLQ routing) is verified in 'test/ai/ai.chaos.spec.ts' at the Service level.
   */

  it("Scenario 3.3: Retries up to 3 times on transient timeout errors", async () => {
    // 1. Mock 3 failures followed by 1 success
    fetchMock
      .mockRejectedValueOnce(new Error("AbortError (timeout)")) // Attempt 1 (Failure)
      .mockRejectedValueOnce(new Error("AbortError (timeout)")) // Attempt 2 (Failure)
      .mockRejectedValueOnce(new Error("AbortError (timeout)")) // Attempt 3 (Failure)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: '{"impact": 4, "likelihood": 3, "justification": "The observed value exceeds the safety threshold for this site.", "recommendations": ["Conduct immediate safety review"]}',
                  },
                ],
              },
            },
          ],
        }),
      });

    // 2. Start call
    const callPromise = client.assessRisk(mockBreach);

    // 3. Use runAllTimersAsync to handle all backoff delays
    await jest.runAllTimersAsync();

    // 4. Resolve
    const result = await callPromise;

    // 5. ASSERT: fetch called 4 times total (init + 3 retries)
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(result.impact).toBe(4);
  });

  it("Scenario 3.3b: Exhausts all retries and throws error on persistent network failure", async () => {
    // 1. Mock persistent failure (4 consecutive rejections)
    // One initial + three retries = 4 failures
    fetchMock.mockRejectedValue(new Error("AbortError (timeout)"));

    // 2. Execute
    const callPromise = client.assessRisk(mockBreach);

    // 3. Fast-forward through all 3 retry backoff delays
    // We attach the expectation BEFORE running timers to avoid 'Unhandled Rejection' warnings
    const assertionPromise = expect(callPromise).rejects.toThrow(
      "AbortError (timeout)",
    );

    await jest.runAllTimersAsync();

    // 4. ASSERT: It must reject, and fetch must have been called exactly 4 times
    await assertionPromise;
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("Scenario 3.2: Does NOT retry on fatal parse errors", async () => {
    // 1. Mock a response that returns invalid JSON structure (missing fields)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          { content: { parts: [{ text: '{"impact": "not-an-int"}' }] } },
        ],
      }),
    });

    // 2. Execute
    await expect(client.assessRisk(mockBreach)).rejects.toThrow();

    // 3. ASSERT: fetch called exactly ONCE. No retries for fatal parsing issues.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("Scenario 3.4: Successfully parses JSON even with conversational filler", async () => {
    // 1. Mock response with prefix and suffix filler + markdown block
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Certainly! Here is the assessment:\n\n```json\n{"impact": 2, "likelihood": 2, "justification": "Safe with filler", "recommendations": ["None"]}\n```\n\nI hope this meets your requirements!',
                },
              ],
            },
          },
        ],
      }),
    });

    // 2. Execute
    const result = await client.assessRisk(mockBreach);

    // 3. ASSERT
    expect(result.impact).toBe(2);
    expect(result.justification).toBe("Safe with filler");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
