import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/log-metadata/route";
import { SpecMetadata } from "@/app/utils/parseSpecMetadata";

// Mock @vercel/postgres
vi.mock("@vercel/postgres", () => ({
  sql: vi.fn(() => Promise.resolve({ rows: [] })),
}));

// Mock resend
const mockSend = vi.fn(() => Promise.resolve({ id: "mock-email-id" }));
vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = { send: mockSend };
  },
}));

const validMetadata: SpecMetadata = {
  appName: "Test App",
  problem: "Test problem statement",
  idealUser: "Test user description",
  platform: "Web, iOS",
  techStack: ["React", "Node.js", "PostgreSQL"],
  integrationCount: 3,
  complexityTier: "moderate",
};

describe("Log Metadata API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockClear();
    mockSend.mockResolvedValue({ id: "mock-email-id" });
    // Reset environment
    delete process.env.RESEND_API_KEY;
  });

  describe("Successful Logging", () => {
    it("should return success when metadata is logged", async () => {
      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(validMetadata),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("should call sql to insert metadata", async () => {
      const { sql } = await import("@vercel/postgres");

      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(validMetadata),
      });

      await POST(req);

      expect(sql).toHaveBeenCalled();
    });

    it("should handle metadata with null fields", async () => {
      const metadataWithNulls: SpecMetadata = {
        appName: null,
        problem: null,
        idealUser: null,
        platform: null,
        techStack: [],
        integrationCount: 0,
        complexityTier: "simple",
      };

      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(metadataWithNulls),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("should handle metadata with empty tech stack", async () => {
      const metadataEmptyStack: SpecMetadata = {
        ...validMetadata,
        techStack: [],
      };

      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(metadataEmptyStack),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("should handle tech stack with special characters", async () => {
      const metadataSpecialChars: SpecMetadata = {
        ...validMetadata,
        techStack: ["C++", 'Node"js', "C#"],
      };

      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(metadataSpecialChars),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });
  });

  describe("Database Error Handling", () => {
    it("should return success: false when database insert fails", async () => {
      const { sql } = await import("@vercel/postgres");
      vi.mocked(sql).mockRejectedValueOnce(new Error("Database error"));

      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(validMetadata),
      });

      const response = await POST(req);

      // Returns 200 with success: false (fire and forget pattern)
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(false);
    });
  });

  describe("Email Notification", () => {
    it("should skip email when RESEND_API_KEY is not set", async () => {
      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(validMetadata),
      });

      await POST(req);

      // Give the fire-and-forget a moment
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Email send should not be called when API key is missing
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("should send email when RESEND_API_KEY is set", async () => {
      process.env.RESEND_API_KEY = "test-api-key";

      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(validMetadata),
      });

      await POST(req);

      // Give the fire-and-forget email a moment to process
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockSend).toHaveBeenCalled();
    });

    it("should not block response if email fails", async () => {
      process.env.RESEND_API_KEY = "test-api-key";

      // Make email send fail
      mockSend.mockRejectedValueOnce(new Error("Email failed"));

      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(validMetadata),
      });

      const response = await POST(req);

      // Response should still succeed even if email fails
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });
  });

  describe("Complexity Tiers", () => {
    it("should accept simple complexity tier", async () => {
      const metadata: SpecMetadata = {
        ...validMetadata,
        complexityTier: "simple",
      };

      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(metadata),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should accept moderate complexity tier", async () => {
      const metadata: SpecMetadata = {
        ...validMetadata,
        complexityTier: "moderate",
      };

      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(metadata),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should accept complex complexity tier", async () => {
      const metadata: SpecMetadata = {
        ...validMetadata,
        complexityTier: "complex",
      };

      const req = new Request("http://localhost/api/log-metadata", {
        method: "POST",
        body: JSON.stringify(metadata),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });
});
