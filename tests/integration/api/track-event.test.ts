import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/track-event/route";

// Mock @vercel/postgres
vi.mock("@vercel/postgres", () => ({
  sql: vi.fn(() => Promise.resolve({ rows: [] })),
}));

describe("Track Event API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Validation", () => {
    it("should return 400 when clientId is missing", async () => {
      const req = new Request("http://localhost/api/track-event", {
        method: "POST",
        body: JSON.stringify({ eventType: "session_start" }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Missing required fields");
    });

    it("should return 400 when eventType is missing", async () => {
      const req = new Request("http://localhost/api/track-event", {
        method: "POST",
        body: JSON.stringify({ clientId: "test-client-id" }),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Missing required fields");
    });

    it("should return 400 when both fields are missing", async () => {
      const req = new Request("http://localhost/api/track-event", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Missing required fields");
    });
  });

  describe("Successful Event Tracking", () => {
    it("should return success for valid event", async () => {
      const req = new Request("http://localhost/api/track-event", {
        method: "POST",
        body: JSON.stringify({
          clientId: "550e8400-e29b-41d4-a716-446655440000",
          eventType: "session_start",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("should call sql to insert event", async () => {
      const { sql } = await import("@vercel/postgres");

      const req = new Request("http://localhost/api/track-event", {
        method: "POST",
        body: JSON.stringify({
          clientId: "test-client-id",
          eventType: "wizard_start",
        }),
      });

      await POST(req);

      expect(sql).toHaveBeenCalled();
    });

    it("should handle event with metadata", async () => {
      const req = new Request("http://localhost/api/track-event", {
        method: "POST",
        body: JSON.stringify({
          clientId: "test-client-id",
          eventType: "doc_generated",
          metadata: { step_name: "ONE_PAGER" },
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("should handle event without metadata", async () => {
      const req = new Request("http://localhost/api/track-event", {
        method: "POST",
        body: JSON.stringify({
          clientId: "test-client-id",
          eventType: "wizard_complete",
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("should accept all valid event types", async () => {
      const eventTypes = [
        "session_start",
        "wizard_start",
        "chat_message",
        "doc_generated",
        "wizard_complete",
        "download",
      ];

      for (const eventType of eventTypes) {
        const req = new Request("http://localhost/api/track-event", {
          method: "POST",
          body: JSON.stringify({
            clientId: "test-client-id",
            eventType,
          }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
      }
    });
  });

  describe("Database Error Handling", () => {
    it("should return success: false when database insert fails", async () => {
      const { sql } = await import("@vercel/postgres");
      vi.mocked(sql).mockRejectedValueOnce(new Error("Database error"));

      const req = new Request("http://localhost/api/track-event", {
        method: "POST",
        body: JSON.stringify({
          clientId: "test-client-id",
          eventType: "session_start",
        }),
      });

      const response = await POST(req);

      // Returns 200 with success: false (fire and forget pattern)
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(false);
    });
  });

  describe("Metadata Handling", () => {
    it("should handle complex metadata objects", async () => {
      const req = new Request("http://localhost/api/track-event", {
        method: "POST",
        body: JSON.stringify({
          clientId: "test-client-id",
          eventType: "session_start",
          metadata: {
            returning: true,
            nested: { value: 123 },
            array: [1, 2, 3],
          },
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("should handle empty metadata object", async () => {
      const req = new Request("http://localhost/api/track-event", {
        method: "POST",
        body: JSON.stringify({
          clientId: "test-client-id",
          eventType: "wizard_complete",
          metadata: {},
        }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });
  });
});
