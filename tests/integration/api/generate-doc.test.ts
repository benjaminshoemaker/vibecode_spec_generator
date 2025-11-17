import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/generate-doc/route";

// Mock the AI SDK
vi.mock("ai", () => ({
  generateText: vi.fn(async () => ({
    text: "# Generated Document\n\nThis is a mocked document.",
  })),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mocked-openai-model"),
}));

describe("Generate Doc API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Validation", () => {
    it("should return 400 when chatHistory is missing", async () => {
      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          stepName: "One-Pager",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe("Invalid chat history format");
    });

    it("should return 400 when chatHistory is not an array", async () => {
      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: "not an array",
          stepName: "One-Pager",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe("Invalid chat history format");
    });

    it("should return 400 when stepName is missing", async () => {
      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Hello" }],
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe("Step name is required");
    });

    it("should accept valid request with chatHistory and stepName", async () => {
      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Hello" }],
          stepName: "One-Pager",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
    });
  });

  describe("Prompt Generation", () => {
    it("should format conversation history correctly", async () => {
      const { generateText } = await import("ai");

      const chatHistory = [
        { role: "user", content: "I want to build a time tracker" },
        { role: "assistant", content: "Great! Tell me more..." },
        { role: "user", content: "For parents tracking time with kids" },
      ];

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory,
          stepName: "One-Pager",
        }),
      });

      await POST(req);

      const calls = vi.mocked(generateText).mock.calls;
      const prompt = calls[0][0].prompt;

      expect(prompt).toContain("User: I want to build a time tracker");
      expect(prompt).toContain("Assistant: Great! Tell me more...");
      expect(prompt).toContain("User: For parents tracking time with kids");
    });

    it("should include stepName in the prompt", async () => {
      const { generateText } = await import("ai");

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "Dev Spec",
        }),
      });

      await POST(req);

      const calls = vi.mocked(generateText).mock.calls;
      const prompt = calls[0][0].prompt;

      expect(prompt).toContain("Dev Spec");
      expect(prompt).toContain("generate a comprehensive Dev Spec document");
      expect(prompt).toContain("generate the Dev Spec document now");
    });

    it("should include custom generation prompt when provided", async () => {
      const { generateText } = await import("ai");

      const customPrompt =
        "Create a detailed technical specification with API contracts and data models.";

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "One-Pager",
          generationPrompt: customPrompt,
        }),
      });

      await POST(req);

      const calls = vi.mocked(generateText).mock.calls;
      const prompt = calls[0][0].prompt;

      expect(prompt).toContain(customPrompt);
    });

    it("should include document inputs when provided", async () => {
      const { generateText } = await import("ai");

      const documentInputs = {
        onePager: "# One-Pager\n\nParent time tracking app.",
      };

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "Dev Spec",
          documentInputs,
        }),
      });

      await POST(req);

      const calls = vi.mocked(generateText).mock.calls;
      const prompt = calls[0][0].prompt;

      expect(prompt).toContain("previously generated documents");
      expect(prompt).toContain("onePager");
      expect(prompt).toContain("Parent time tracking app");
    });

    it("should handle multiple document inputs", async () => {
      const { generateText } = await import("ai");

      const documentInputs = {
        onePager: "# One-Pager",
        devSpec: "# Dev Spec",
      };

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "Checklist",
          documentInputs,
        }),
      });

      await POST(req);

      const calls = vi.mocked(generateText).mock.calls;
      const prompt = calls[0][0].prompt;

      expect(prompt).toContain("onePager");
      expect(prompt).toContain("# One-Pager");
      expect(prompt).toContain("devSpec");
      expect(prompt).toContain("# Dev Spec");
    });

    it("should work without document inputs", async () => {
      const { generateText } = await import("ai");

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "One-Pager",
        }),
      });

      await POST(req);

      const calls = vi.mocked(generateText).mock.calls;
      const prompt = calls[0][0].prompt;

      expect(prompt).not.toContain("previously generated documents");
    });
  });

  describe("Model Selection", () => {
    it("should use model from environment variable", async () => {
      const { openai } = await import("@ai-sdk/openai");
      const originalEnv = process.env.OPENAI_MODEL;

      process.env.OPENAI_MODEL = "gpt-4-turbo";

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "One-Pager",
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

      delete process.env.OPENAI_MODEL;

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "One-Pager",
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
    it("should return JSON response with document property", async () => {
      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "One-Pager",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");

      const json = await response.json();
      expect(json).toHaveProperty("document");
      expect(typeof json.document).toBe("string");
    });

    it("should return generated text from AI model", async () => {
      const { generateText } = await import("ai");

      vi.mocked(generateText).mockResolvedValueOnce({
        text: "# Custom Generated Document\n\nThis is custom content.",
      } as any);

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "One-Pager",
        }),
      });

      const response = await POST(req);
      const json = await response.json();

      expect(json.document).toBe(
        "# Custom Generated Document\n\nThis is custom content."
      );
    });
  });

  describe("Error Handling", () => {
    it("should return 500 when generateText throws an error", async () => {
      const { generateText } = await import("ai");

      vi.mocked(generateText).mockRejectedValueOnce(new Error("API Error"));

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "One-Pager",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({ error: "Failed to generate document" });
    });

    it("should return JSON error response with correct content type", async () => {
      const { generateText } = await import("ai");

      vi.mocked(generateText).mockRejectedValueOnce(new Error("API Error"));

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "One-Pager",
        }),
      });

      const response = await POST(req);

      expect(response.headers.get("Content-Type")).toBe("application/json");
    });
  });

  describe("Chat History Processing", () => {
    it("should handle empty chat history", async () => {
      const { generateText } = await import("ai");

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [],
          stepName: "One-Pager",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      expect(generateText).toHaveBeenCalled();
    });

    it("should handle long chat history", async () => {
      const { generateText } = await import("ai");

      const longChatHistory = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Message ${i + 1}`,
      }));

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: longChatHistory,
          stepName: "One-Pager",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);

      const calls = vi.mocked(generateText).mock.calls;
      const prompt = calls[0][0].prompt;

      // Should contain all messages
      expect(prompt).toContain("Message 1");
      expect(prompt).toContain("Message 20");
    });
  });

  describe("Integration with AI SDK", () => {
    it("should call generateText with correct parameters", async () => {
      const { generateText } = await import("ai");
      const { openai } = await import("@ai-sdk/openai");

      const req = new Request("http://localhost/api/generate-doc", {
        method: "POST",
        body: JSON.stringify({
          chatHistory: [{ role: "user", content: "Test" }],
          stepName: "One-Pager",
        }),
      });

      await POST(req);

      expect(generateText).toHaveBeenCalledWith({
        model: "mocked-openai-model",
        prompt: expect.any(String),
      });

      expect(openai).toHaveBeenCalled();
    });
  });
});
