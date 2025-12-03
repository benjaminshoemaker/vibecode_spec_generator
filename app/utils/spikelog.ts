/**
 * Spikelog - Metric tracking utility
 * https://spikelog.com
 *
 * Features:
 * - Fire-and-forget (non-blocking)
 * - Fails silently if API key missing or request fails
 * - Aggregates high-frequency data before sending
 */

const SPIKELOG_ENDPOINT = "https://api.spikelog.com/api/v1/ingest";

// Aggregation buffers for high-frequency metrics
interface AggregationBuffer {
  values: number[];
  lastFlush: number;
}

const aggregationBuffers: Map<string, AggregationBuffer> = new Map();
const AGGREGATION_INTERVAL_MS = 10_000; // 10 seconds

// Session tracking for active sessions heartbeat
let sessionHeartbeatInterval: ReturnType<typeof setInterval> | null = null;
let activeSessionCount = 0;

/**
 * Check if we're running on the server
 */
function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Get API key from environment (server-side only)
 */
function getApiKey(): string | null {
  if (isServer()) {
    return process.env.SPIKELOG_API_KEY || null;
  }
  return null;
}

/**
 * Send a metric to Spikelog (fire-and-forget)
 * - Server-side: sends directly to Spikelog API
 * - Client-side: sends to /api/spikelog which forwards to Spikelog
 */
function getEnvironmentTag(): "prod" | "dev" {
  return process.env.NODE_ENV === "production" ? "prod" : "dev";
}

async function sendMetric(
  chart: string,
  value: number,
  tags?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    const mergedTags = { env: getEnvironmentTag(), ...(tags ?? {}) };
    const body: Record<string, unknown> = { chart, value, tags: mergedTags };

    if (isServer()) {
      // Server-side: send directly to Spikelog
      const apiKey = getApiKey();
      if (!apiKey) return;

      fetch(SPIKELOG_ENDPOINT, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).catch(() => {
        // Silently ignore errors
      });
    } else {
      // Client-side: send to our API endpoint which forwards to Spikelog
      fetch("/api/spikelog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).catch(() => {
        // Silently ignore errors
      });
    }
  } catch {
    // Silently ignore errors
  }
}

/**
 * Track a metric immediately (for low-frequency events)
 */
function track(
  chart: string,
  value: number,
  tags?: Record<string, string | number | boolean>
): void {
  sendMetric(chart, value, tags);
}

/**
 * Track a metric with aggregation (for high-frequency events)
 * Collects values and sends average every AGGREGATION_INTERVAL_MS
 */
function trackAggregated(
  chart: string,
  value: number,
  tags?: Record<string, string | number | boolean>
): void {
  const key = chart;
  const now = Date.now();

  let buffer = aggregationBuffers.get(key);
  if (!buffer) {
    buffer = { values: [], lastFlush: now };
    aggregationBuffers.set(key, buffer);
  }

  buffer.values.push(value);

  // Check if it's time to flush
  if (now - buffer.lastFlush >= AGGREGATION_INTERVAL_MS) {
    flushBuffer(chart, buffer, tags);
  }
}

/**
 * Flush an aggregation buffer - sends average of collected values
 */
function flushBuffer(
  chart: string,
  buffer: AggregationBuffer,
  tags?: Record<string, string | number | boolean>
): void {
  if (buffer.values.length === 0) return;

  const avg = buffer.values.reduce((a, b) => a + b, 0) / buffer.values.length;
  sendMetric(chart, Math.round(avg), tags);

  // Reset buffer
  buffer.values = [];
  buffer.lastFlush = Date.now();
}

/**
 * Flush all aggregation buffers (call on app shutdown if needed)
 */
function flushAll(): void {
  aggregationBuffers.forEach((buffer, chart) => {
    flushBuffer(chart, buffer);
  });
}

// =============================================================================
// METRIC TRACKING FUNCTIONS
// =============================================================================

/**
 * #1 & #2: API Response Time tracking
 * Aggregated every 10 seconds to avoid flooding
 */
function trackApiResponseTime(
  endpoint: "chat" | "generate",
  durationMs: number
): void {
  const chart =
    endpoint === "chat"
      ? "API Response Time - Chat"
      : "API Response Time - Generate";
  trackAggregated(chart, durationMs, { endpoint });
}

/**
 * #3: Streaming Fallback Rate
 * Tracks when streaming fails and fallback is used
 */
function trackStreamingFallback(reason: string): void {
  track("Streaming Fallback Rate", 1, { reason });
}

/**
 * #4: Wizard Starts
 */
function trackWizardStart(source?: string): void {
  track("Wizard Starts", 1, source ? { source } : undefined);
}

/**
 * #5: Wizard Completions
 */
function trackWizardCompletion(): void {
  track("Wizard Completions", 1);
}

/**
 * #6: Step Drop-off tracking
 * Tracks which step users are currently on
 */
function trackStepView(step: number, stepName: string): void {
  track("Step Drop-off", step, { step_name: stepName });
}

/**
 * #7: Document Downloads
 */
function trackDocumentDownload(type: "individual" | "bulk", docCount?: number): void {
  track("Document Downloads", docCount ?? 1, { type, doc_count: docCount ?? 1 });
}

/**
 * #8: OpenAI Token Usage
 */
function trackTokenUsage(
  promptTokens: number,
  completionTokens: number,
  stepName?: string
): void {
  const totalTokens = promptTokens + completionTokens;
  track("OpenAI Token Usage", totalTokens, {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    ...(stepName ? { step_name: stepName } : {}),
  });
}

/**
 * #9: Active Sessions
 * Call startSessionHeartbeat() when a user enters the wizard
 * Call endSessionHeartbeat() when they leave
 */
function startSessionHeartbeat(): void {
  activeSessionCount++;

  // Only start interval if not already running
  if (!sessionHeartbeatInterval) {
    sessionHeartbeatInterval = setInterval(() => {
      if (activeSessionCount > 0) {
        track("Active Sessions", activeSessionCount);
      }
    }, 30_000); // Every 30 seconds
  }

  // Send immediate count
  track("Active Sessions", activeSessionCount);
}

function endSessionHeartbeat(): void {
  activeSessionCount = Math.max(0, activeSessionCount - 1);

  // Stop interval if no more sessions
  if (activeSessionCount === 0 && sessionHeartbeatInterval) {
    clearInterval(sessionHeartbeatInterval);
    sessionHeartbeatInterval = null;
  }
}

/**
 * #10 & #11: API Errors
 */
function trackApiError(
  endpoint: "chat" | "generate",
  errorType?: string
): void {
  const chart =
    endpoint === "chat" ? "API Errors - Chat" : "API Errors - Generate";
  track(chart, 1, errorType ? { error_type: errorType } : undefined);
}

/**
 * #12: Generation Success Rate
 * Tracks success (1) or failure (0) - aggregate to get percentage
 */
function trackGenerationResult(success: boolean, stepName?: string): void {
  track("Generation Success Rate", success ? 1 : 0, {
    success,
    ...(stepName ? { step_name: stepName } : {}),
  });
}

/**
 * #13: Chat Messages Per Session
 * Track message count - will be aggregated to show average
 */
function trackChatMessage(stepName: string): void {
  trackAggregated("Chat Messages Per Session", 1, { step_name: stepName });
}

/**
 * #14: Chat Response Time
 * Measures submit-to-first-answer latency per step
 */
function trackChatResponseTime(stepName: string, durationMs: number): void {
  track("Chat Response Time", durationMs, { step_name: stepName });
}

/**
 * #15: Regeneration Attempts
 */
function trackRegeneration(stepName: string): void {
  track("Regeneration Attempts", 1, { step_name: stepName });
}

/**
 * #16: Email Subscriptions
 */
function trackEmailSubscription(success: boolean): void {
  track("Email Subscriptions", success ? 1 : 0, { success });
}

// =============================================================================
// EXPORTS
// =============================================================================

export const spikelog = {
  // Core functions
  track,
  trackAggregated,
  flushAll,

  // Specific metrics
  trackApiResponseTime, // #1, #2
  trackStreamingFallback, // #3
  trackWizardStart, // #4
  trackWizardCompletion, // #5
  trackStepView, // #6
  trackDocumentDownload, // #7
  trackTokenUsage, // #8
  startSessionHeartbeat, // #9
  endSessionHeartbeat, // #9
  trackApiError, // #10, #11
  trackGenerationResult, // #12
  trackChatMessage, // #13
  trackChatResponseTime, // #14
  trackRegeneration, // #15
  trackEmailSubscription, // #16
};

export default spikelog;
