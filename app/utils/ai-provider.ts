import { openai, createOpenAI } from "@ai-sdk/openai";

// ─── Private factory helpers ──────────────────────────────────────────────────
// Centralise provider construction so getModel and getOptionsModel stay thin
// and baseURL / apiKey / header logic lives in exactly one place per provider.

function buildLocalClient(modelName: string) {
  const baseURL =
    process.env.LOCAL_AI_BASE_URL || "http://localhost:11434/v1";
  const apiKey = process.env.LOCAL_AI_API_KEY || "local";
  return createOpenAI({ baseURL, apiKey })(modelName);
}

function buildOpenRouterClient(modelName: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your .env.local file."
    );
  }
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    headers: {
      "HTTP-Referer": "https://vibescaffold.dev",
      "X-Title": "Vibe Scaffold",
    },
  })(modelName);
}

// ─── getModel ─────────────────────────────────────────────────────────────────

/**
 * Returns an AI model instance for chat and document generation.
 *
 * Controlled by AI_PROVIDER (default: "openai"):
 *
 *   "openai"     — OpenAI API. Requires OPENAI_API_KEY.
 *                  Set OPENAI_MODEL to the model name (default: gpt-4o).
 *
 *   "local"      — Any OpenAI-compatible local server (Ollama, LM Studio, etc.).
 *                  Set LOCAL_AI_BASE_URL to your server's /v1 endpoint.
 *                  Set OPENAI_MODEL to the model name served locally.
 *                  Examples:
 *                    LOCAL_AI_BASE_URL=http://localhost:11434/v1  (Ollama)
 *                    LOCAL_AI_BASE_URL=http://localhost:1234/v1   (LM Studio)
 *                    OPENAI_MODEL=llama3.2:latest
 *                    OPENAI_MODEL=mistral:7b-instruct
 *
 *   "openrouter" — OpenRouter API (https://openrouter.ai). Requires OPENROUTER_API_KEY.
 *                  Set OPENAI_MODEL to an OpenRouter model identifier.
 *                  Examples:
 *                    OPENAI_MODEL=openai/gpt-4o
 *                    OPENAI_MODEL=anthropic/claude-3-5-sonnet
 *                    OPENAI_MODEL=google/gemini-2.0-flash-001
 */
export function getModel(modelName: string) {
  const provider = process.env.AI_PROVIDER || "openai";

  switch (provider) {
    case "local":
      return buildLocalClient(modelName);

    case "openrouter":
      return buildOpenRouterClient(modelName);

    default:
      if (provider !== "openai") {
        console.warn(
          `Unknown AI_PROVIDER "${provider}" — falling back to OpenAI. Check your .env.local file.`
        );
      }
      return openai(modelName);
  }
}

// ─── getOptionsModel ──────────────────────────────────────────────────────────

/**
 * Returns an AI model instance specifically for multiple-choice options generation.
 *
 * Options generation uses streamObject() which requires structured output support
 * (JSON schema enforcement). Not all models support this — choose accordingly.
 *
 * Controlled by OPTIONS_PROVIDER (defaults to AI_PROVIDER if not set):
 *
 *   "openai"     — Uses OPENAI_OPTIONS_MODEL, then falls back to OPENAI_MODEL (default: gpt-4o).
 *                  All gpt-4o and gpt-4-turbo variants support structured outputs.
 *
 *   "local"      — Uses LOCAL_OPTIONS_MODEL (default: "llama3.1:8b").
 *                  Pick a model with reliable JSON schema support — not all local
 *                  models handle structured outputs correctly; test before use.
 *                  Recommended (Ollama):
 *                    LOCAL_OPTIONS_MODEL=qwen2.5:7b        (strong structured output)
 *                    LOCAL_OPTIONS_MODEL=llama3.1:8b       (good JSON support)
 *                    LOCAL_OPTIONS_MODEL=mistral:7b-instruct
 *                  If your primary local model doesn't support structured outputs,
 *                  set OPTIONS_PROVIDER=openai or OPTIONS_PROVIDER=openrouter.
 *
 *   "openrouter" — Uses OPENROUTER_OPTIONS_MODEL (default: "openai/gpt-4o-mini").
 *                  Requires OPENROUTER_API_KEY. Choose a model with structured
 *                  output support. Recommended (fast + cheap + reliable JSON):
 *                    OPENROUTER_OPTIONS_MODEL=openai/gpt-4o-mini
 *                    OPENROUTER_OPTIONS_MODEL=google/gemini-2.0-flash-001
 *                    OPENROUTER_OPTIONS_MODEL=anthropic/claude-3-5-haiku
 */
export function getOptionsModel() {
  const provider =
    process.env.OPTIONS_PROVIDER || process.env.AI_PROVIDER || "openai";

  switch (provider) {
    case "local": {
      const modelName = process.env.LOCAL_OPTIONS_MODEL || "llama3.1:8b";
      return buildLocalClient(modelName);
    }

    case "openrouter": {
      const modelName =
        process.env.OPENROUTER_OPTIONS_MODEL || "openai/gpt-4o-mini";
      return buildOpenRouterClient(modelName);
    }

    default: {
      if (provider !== "openai") {
        console.warn(
          `Unknown OPTIONS_PROVIDER "${provider}" — falling back to OpenAI. Check your .env.local file.`
        );
      }
      const modelName =
        process.env.OPENAI_OPTIONS_MODEL ||
        process.env.OPENAI_MODEL ||
        "gpt-4o";
      return openai(modelName);
    }
  }
}
