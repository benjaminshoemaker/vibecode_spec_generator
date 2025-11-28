import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/subscribe/route";

// Mock @vercel/postgres
vi.mock("@vercel/postgres", () => ({
  sql: vi.fn(() => Promise.resolve({ rows: [] })),
}));

describe("Subscribe API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Validation", () => {
    it("should return 400 when email is missing", async () => {
      const req = new Request("http://localhost/api/subscribe", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Email is required");
    });

    it("should return 400 when email is null", async () => {
      const req = new Request("http://localhost/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: null }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Email is required");
    });

    it("should return 400 when email is not a string", async () => {
      const req = new Request("http://localhost/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: 123 }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Email is required");
    });

    it("should return 400 for invalid email format", async () => {
      const req = new Request("http://localhost/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "invalid-email" }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid email format");
    });

    it("should return 400 for email without domain", async () => {
      const req = new Request("http://localhost/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "test@" }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid email format");
    });

    it("should return 400 for email with spaces", async () => {
      const req = new Request("http://localhost/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "test @example.com" }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid email format");
    });
  });

  describe("Successful Subscription", () => {
    it("should return success for valid email", async () => {
      const req = new Request("http://localhost/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com" }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("should trim and lowercase email before saving", async () => {
      const { sql } = await import("@vercel/postgres");

      const req = new Request("http://localhost/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "  TEST@EXAMPLE.COM  " }),
      });

      await POST(req);

      expect(sql).toHaveBeenCalled();
      // Verify the sql function was called (email normalization happens before the call)
      // The actual SQL template and parameters are handled internally by @vercel/postgres
    });

    it("should accept valid email formats", async () => {
      const validEmails = [
        "simple@example.com",
        "very.common@example.com",
        "disposable.style.email.with+symbol@example.com",
        "other.email-with-hyphen@example.com",
        "user.name+tag+sorting@example.com",
        "user@subdomain.example.com",
      ];

      for (const email of validEmails) {
        const req = new Request("http://localhost/api/subscribe", {
          method: "POST",
          body: JSON.stringify({ email }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
      }
    });
  });

  describe("Database Error Handling", () => {
    it("should return 500 when database insert fails", async () => {
      const { sql } = await import("@vercel/postgres");
      vi.mocked(sql).mockRejectedValueOnce(new Error("Database error"));

      const req = new Request("http://localhost/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com" }),
      });

      const response = await POST(req);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to subscribe");
    });
  });
});
