import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/chat/route";

// Mock the AI SDK
vi.mock("ai", () => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: vi.fn(() => new Response("Mocked stream response")),
  })),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mocked-openai-model"),
}));

describe("Chat API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Validation", () => {
    it("should return 400 when messages are missing", async () => {
      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({ systemPrompt: "Test prompt" }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe("Invalid messages format");
    });

    it("should return 400 when messages is not an array", async () => {
      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: "not an array",
          systemPrompt: "Test prompt",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe("Invalid messages format");
    });

    it("should accept empty messages array", async () => {
      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [],
          systemPrompt: "Test prompt",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
    });
  });

  describe("System Prompt Construction", () => {
    it("should use provided system prompt", async () => {
      const { streamText } = await import("ai");

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
          systemPrompt: "You are a helpful assistant.",
        }),
      });

      await POST(req);

      expect(streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: "You are a helpful assistant.",
          messages: [{ role: "user", content: "Hello" }],
        })
      );
    });

    it("should use default system prompt when not provided", async () => {
      const { streamText } = await import("ai");

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      });

      await POST(req);

      expect(streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: "You are a helpful assistant.",
        })
      );
    });

    it("should append document context to system prompt", async () => {
      const { streamText } = await import("ai");

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
          systemPrompt: "You are a helpful assistant.",
          documentInputs: {
            onePager: "# Sample One-Pager\n\nThis is a test.",
          },
        }),
      });

      await POST(req);

      const calls = vi.mocked(streamText).mock.calls;
      const systemPrompt = calls[0][0].system;

      expect(systemPrompt).toContain("You are a helpful assistant.");
      expect(systemPrompt).toContain("PREVIOUS DOCUMENTS FOR CONTEXT");
      expect(systemPrompt).toContain("onePager");
      expect(systemPrompt).toContain("# Sample One-Pager");
    });

    it("should handle multiple document inputs", async () => {
      const { streamText } = await import("ai");

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
          systemPrompt: "You are a helpful assistant.",
          documentInputs: {
            onePager: "# One-Pager",
            devSpec: "# Dev Spec",
          },
        }),
      });

      await POST(req);

      const calls = vi.mocked(streamText).mock.calls;
      const systemPrompt = calls[0][0].system;

      expect(systemPrompt).toContain("onePager");
      expect(systemPrompt).toContain("# One-Pager");
      expect(systemPrompt).toContain("devSpec");
      expect(systemPrompt).toContain("# Dev Spec");
    });
  });

  describe("Model Selection", () => {
    it("should use model from environment variable", async () => {
      const { openai } = await import("@ai-sdk/openai");
      const originalEnv = process.env.OPENAI_MODEL;

      // Mock environment variable
      process.env.OPENAI_MODEL = "gpt-4-turbo";

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      });

      await POST(req);

      expect(openai).toHaveBeenCalledWith("gpt-4-turbo");

      // Restore original env
      if (originalEnv) {
        process.env.OPENAI_MODEL = originalEnv;
      } else {
        delete process.env.OPENAI_MODEL;
      }
    });

    it("should default to gpt-4o when no environment variable set", async () => {
      const { openai } = await import("@ai-sdk/openai");
      const originalEnv = process.env.OPENAI_MODEL;

      // Ensure env var is not set
      delete process.env.OPENAI_MODEL;

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      });

      await POST(req);

      expect(openai).toHaveBeenCalledWith("gpt-4o");

      // Restore original env
      if (originalEnv) {
        process.env.OPENAI_MODEL = originalEnv;
      }
    });
  });

  describe("Response Format", () => {
    it("should return streaming text response", async () => {
      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe("Mocked stream response");
    });
  });

  describe("Error Handling", () => {
    it("should return 500 when streamText throws an error", async () => {
      const { streamText } = await import("ai");

      vi.mocked(streamText).mockImplementationOnce(() => {
        throw new Error("API Error");
      });

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({ error: "Failed to process chat request" });
    });

    it("should return JSON error response with correct content type", async () => {
      const { streamText } = await import("ai");

      vi.mocked(streamText).mockImplementationOnce(() => {
        throw new Error("API Error");
      });

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
        }),
      });

      const response = await POST(req);

      expect(response.headers.get("Content-Type")).toBe("application/json");
    });
  });

  describe("Message Processing", () => {
    it("should pass messages to streamText", async () => {
      const { streamText } = await import("ai");

      const messages = [
        { role: "user", content: "What is React?" },
        { role: "assistant", content: "React is a JavaScript library..." },
        { role: "user", content: "Tell me more" },
      ];

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages,
          systemPrompt: "You are a helpful assistant.",
        }),
      });

      await POST(req);

      expect(streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages,
        })
      );
    });
  });
});
