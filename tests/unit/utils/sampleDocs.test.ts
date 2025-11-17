import { describe, it, expect } from "vitest";
import { sampleDocs } from "@/app/wizard/utils/sampleDocs";

describe("Sample Docs Utility", () => {
  describe("Structure", () => {
    it("should export an object with sample docs", () => {
      expect(sampleDocs).toBeDefined();
      expect(typeof sampleDocs).toBe("object");
    });

    it("should contain all expected document keys", () => {
      expect(sampleDocs).toHaveProperty("onePager");
      expect(sampleDocs).toHaveProperty("devSpec");
      expect(sampleDocs).toHaveProperty("promptPlan");
      expect(sampleDocs).toHaveProperty("agentsMd");
    });
  });

  describe("onePager", () => {
    it("should be a non-empty string", () => {
      expect(typeof sampleDocs.onePager).toBe("string");
      expect(sampleDocs.onePager.length).toBeGreaterThan(0);
    });

    it("should be markdown formatted", () => {
      expect(sampleDocs.onePager).toContain("#");
    });

    it("should contain key one-pager sections", () => {
      expect(sampleDocs.onePager).toContain("Executive Summary");
      expect(sampleDocs.onePager).toContain("Problem Statement");
      expect(sampleDocs.onePager).toContain("Target Audience");
      expect(sampleDocs.onePager).toContain("Value Proposition");
    });
  });

  describe("devSpec", () => {
    it("should be a non-empty string", () => {
      expect(typeof sampleDocs.devSpec).toBe("string");
      expect(sampleDocs.devSpec.length).toBeGreaterThan(0);
    });

    it("should be markdown formatted", () => {
      expect(sampleDocs.devSpec).toContain("#");
    });

    it("should reference development specification", () => {
      expect(sampleDocs.devSpec).toContain("Developer Specification");
    });
  });

  describe("promptPlan", () => {
    it("should be a non-empty string", () => {
      expect(typeof sampleDocs.promptPlan).toBe("string");
      expect(sampleDocs.promptPlan.length).toBeGreaterThan(0);
    });

    it("should be markdown formatted", () => {
      expect(sampleDocs.promptPlan).toContain("#");
    });

    it("should reference prompt plan content", () => {
      expect(sampleDocs.promptPlan).toContain("Prompt Plan");
    });
  });

  describe("agentsMd", () => {
    it("should be a non-empty string", () => {
      expect(typeof sampleDocs.agentsMd).toBe("string");
      expect(sampleDocs.agentsMd.length).toBeGreaterThan(0);
    });

    it("should be markdown formatted", () => {
      expect(sampleDocs.agentsMd).toContain("#");
    });

    it("should contain AGENTS.md content", () => {
      expect(sampleDocs.agentsMd).toContain("AGENTS.md");
      expect(sampleDocs.agentsMd).toContain("Purpose");
    });

    it("should contain agent responsibility guidelines", () => {
      expect(sampleDocs.agentsMd).toContain("Agent responsibility");
      expect(sampleDocs.agentsMd).toContain("Testing policy");
    });
  });

  describe("Data Integrity", () => {
    it("should not have empty documents", () => {
      Object.entries(sampleDocs).forEach(([key, value]) => {
        expect(value, `${key} should not be empty`).not.toBe("");
      });
    });

    it("should have all documents with reasonable length", () => {
      Object.entries(sampleDocs).forEach(([key, value]) => {
        expect(
          value.length,
          `${key} should have at least 100 characters`
        ).toBeGreaterThan(100);
      });
    });
  });
});
