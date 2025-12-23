import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/generate-options/route";
import { questionOptionsSchema } from "@/app/schemas/questionOptions";

vi.mock("ai", () => ({
  streamObject: vi.fn(() => ({
    toTextStreamResponse: vi.fn(() => new Response("Mocked stream response")),
  })),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mocked-openai-model"),
}));

describe("Generate Options API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Validation", () => {
    it("should return 400 when questionText is missing", async () => {
      // Arrange
      const req = new Request("http://localhost/api/generate-options", {
        method: "POST",
        body: JSON.stringify({ conversationSummary: "Context" }),
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("questionText is required");
    });

    it("should return 400 when questionText is not a string", async () => {
      // Arrange
      const req = new Request("http://localhost/api/generate-options", {
        method: "POST",
        body: JSON.stringify({ questionText: 123 }),
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("questionText is required");
    });
  });

  describe("Model Selection", () => {
    it("should use OPENAI_OPTIONS_MODEL when set", async () => {
      // Arrange
      const { openai } = await import("@ai-sdk/openai");
      const originalOptionsModel = process.env.OPENAI_OPTIONS_MODEL;
      const originalModel = process.env.OPENAI_MODEL;
      process.env.OPENAI_OPTIONS_MODEL = "options-model";
      process.env.OPENAI_MODEL = "fallback-model";

      const req = new Request("http://localhost/api/generate-options", {
        method: "POST",
        body: JSON.stringify({ questionText: "What is the target audience?" }),
      });

      // Act
      await POST(req);

      // Assert
      expect(openai).toHaveBeenCalledWith("options-model");

      // Cleanup
      if (originalOptionsModel) process.env.OPENAI_OPTIONS_MODEL = originalOptionsModel;
      else delete process.env.OPENAI_OPTIONS_MODEL;
      if (originalModel) process.env.OPENAI_MODEL = originalModel;
      else delete process.env.OPENAI_MODEL;
    });

    it("should fall back to OPENAI_MODEL when OPENAI_OPTIONS_MODEL is not set", async () => {
      // Arrange
      const { openai } = await import("@ai-sdk/openai");
      const originalOptionsModel = process.env.OPENAI_OPTIONS_MODEL;
      const originalModel = process.env.OPENAI_MODEL;
      delete process.env.OPENAI_OPTIONS_MODEL;
      process.env.OPENAI_MODEL = "fallback-model";

      const req = new Request("http://localhost/api/generate-options", {
        method: "POST",
        body: JSON.stringify({ questionText: "What is the target audience?" }),
      });

      // Act
      await POST(req);

      // Assert
      expect(openai).toHaveBeenCalledWith("fallback-model");

      // Cleanup
      if (originalOptionsModel) process.env.OPENAI_OPTIONS_MODEL = originalOptionsModel;
      else delete process.env.OPENAI_OPTIONS_MODEL;
      if (originalModel) process.env.OPENAI_MODEL = originalModel;
      else delete process.env.OPENAI_MODEL;
    });

    it("should default to gpt-4o when no environment variables are set", async () => {
      // Arrange
      const { openai } = await import("@ai-sdk/openai");
      const originalOptionsModel = process.env.OPENAI_OPTIONS_MODEL;
      const originalModel = process.env.OPENAI_MODEL;
      delete process.env.OPENAI_OPTIONS_MODEL;
      delete process.env.OPENAI_MODEL;

      const req = new Request("http://localhost/api/generate-options", {
        method: "POST",
        body: JSON.stringify({ questionText: "What is the target audience?" }),
      });

      // Act
      await POST(req);

      // Assert
      expect(openai).toHaveBeenCalledWith("gpt-4o");

      // Cleanup
      if (originalOptionsModel) process.env.OPENAI_OPTIONS_MODEL = originalOptionsModel;
      else delete process.env.OPENAI_OPTIONS_MODEL;
      if (originalModel) process.env.OPENAI_MODEL = originalModel;
      else delete process.env.OPENAI_MODEL;
    });
  });

  describe("streamObject usage", () => {
    it("should call streamObject with schema and forbid generic options in system prompt", async () => {
      // Arrange
      const { streamObject } = await import("ai");
      const req = new Request("http://localhost/api/generate-options", {
        method: "POST",
        body: JSON.stringify({
          questionText: "Who is the primary user?",
          conversationSummary: "The product is a scheduling assistant for teams.",
        }),
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(200);
      expect(streamObject).toHaveBeenCalledWith(
        expect.objectContaining({
          schema: questionOptionsSchema,
        })
      );

      const system = vi.mocked(streamObject).mock.calls[0]?.[0]?.system;
      expect(system).toContain("Do not include generic options");
      expect(system).toContain("Never include");
      expect(system).toContain("Other");
      expect(system).toContain("None of the above");
    });
  });
});

