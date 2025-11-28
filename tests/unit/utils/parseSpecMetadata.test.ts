import { describe, it, expect } from "vitest";
import { parseSpecMetadata, SpecMetadata } from "@/app/utils/parseSpecMetadata";
import { sampleDocs } from "@/app/wizard/utils/sampleDocs";

describe("parseSpecMetadata", () => {
  describe("with sample documents", () => {
    it("should extract app name from one-pager title", () => {
      const result = parseSpecMetadata(sampleDocs.onePager, null);
      expect(result.appName).toBe("Parent Time Tracking App");
    });

    it("should extract problem statement (truncated to 150 chars)", () => {
      const result = parseSpecMetadata(sampleDocs.onePager, null);
      expect(result.problem).not.toBeNull();
      expect(result.problem!.length).toBeLessThanOrEqual(150);
      expect(result.problem).toContain("Parents need");
    });

    it("should extract ideal user from target audience section", () => {
      const result = parseSpecMetadata(sampleDocs.onePager, null);
      expect(result.idealUser).not.toBeNull();
      expect(result.idealUser!.length).toBeLessThanOrEqual(150);
    });

    it("should extract platform information", () => {
      const result = parseSpecMetadata(sampleDocs.onePager, null);
      expect(result.platform).not.toBeNull();
      // Sample doc mentions iOS, Android, Web
      expect(result.platform).toContain("iOS");
      expect(result.platform).toContain("Android");
    });

    it("should extract tech stack from dev spec", () => {
      const result = parseSpecMetadata(null, sampleDocs.devSpec);
      expect(result.techStack.length).toBeGreaterThan(0);
      // Sample devSpec mentions React Native, TypeScript, etc.
      expect(result.techStack.some(t => t.toLowerCase().includes("react"))).toBe(true);
    });

    it("should count integrations from dev spec", () => {
      const result = parseSpecMetadata(null, sampleDocs.devSpec);
      expect(result.integrationCount).toBeGreaterThanOrEqual(0);
    });

    it("should compute complexity tier", () => {
      const result = parseSpecMetadata(null, sampleDocs.devSpec);
      expect(["simple", "moderate", "complex"]).toContain(result.complexityTier);
    });

    it("should handle both documents together", () => {
      const result = parseSpecMetadata(sampleDocs.onePager, sampleDocs.devSpec);
      expect(result.appName).toBe("Parent Time Tracking App");
      expect(result.techStack.length).toBeGreaterThan(0);
    });
  });

  describe("with null inputs", () => {
    it("should handle null one-pager", () => {
      const result = parseSpecMetadata(null, sampleDocs.devSpec);
      expect(result.appName).toBeNull();
      expect(result.problem).toBeNull();
      expect(result.idealUser).toBeNull();
      expect(result.platform).toBeNull();
      expect(result.techStack.length).toBeGreaterThan(0);
    });

    it("should handle null dev spec", () => {
      const result = parseSpecMetadata(sampleDocs.onePager, null);
      expect(result.appName).toBe("Parent Time Tracking App");
      expect(result.techStack).toEqual([]);
      expect(result.integrationCount).toBe(0);
      expect(result.complexityTier).toBe("moderate");
    });

    it("should handle both null", () => {
      const result = parseSpecMetadata(null, null);
      expect(result).toEqual({
        appName: null,
        problem: null,
        idealUser: null,
        platform: null,
        techStack: [],
        integrationCount: 0,
        complexityTier: "moderate",
      });
    });
  });

  describe("with malformed inputs", () => {
    it("should handle empty strings", () => {
      const result = parseSpecMetadata("", "");
      expect(result.appName).toBeNull();
      expect(result.problem).toBeNull();
      expect(result.techStack).toEqual([]);
    });

    it("should handle documents without expected sections", () => {
      const result = parseSpecMetadata("# Just a title\n\nSome content", "Random text");
      expect(result.appName).toBe("Just a title");
      expect(result.problem).toBeNull();
      expect(result.platform).toBeNull();
    });

    it("should handle markdown with only headers", () => {
      const result = parseSpecMetadata("# Title\n## Problem Statement\n## Target Audience", null);
      expect(result.appName).toBe("Title");
      expect(result.problem).toBeNull(); // Section is empty
    });

    it("should handle special characters in content", () => {
      const onePager = `# One-Pager — Test App <script>alert('xss')</script>

## Problem Statement
Users need **bold** and *italic* text with [links](http://example.com).
`;
      const result = parseSpecMetadata(onePager, null);
      expect(result.appName).toContain("Test App");
      expect(result.problem).not.toContain("**");
    });
  });

  describe("complexity tier calculation", () => {
    it("should return simple for short docs with few integrations", () => {
      // < 1500 words AND < 3 integrations
      const shortDoc = "Short document ".repeat(100); // ~200 words
      const result = parseSpecMetadata(null, shortDoc);
      expect(result.complexityTier).toBe("simple");
    });

    it("should return complex for long docs", () => {
      // > 4000 words
      const longDoc = "This is a word ".repeat(5000); // 5000 words
      const result = parseSpecMetadata(null, longDoc);
      expect(result.complexityTier).toBe("complex");
    });

    it("should return complex for many integrations", () => {
      // > 6 integrations
      const docWithIntegrations = `
        We use Auth0 for authentication.
        Stripe for payments.
        Twilio for SMS.
        SendGrid for email.
        Segment for analytics.
        Sentry for errors.
        Slack for notifications.
        OpenAI for AI features.
      `;
      const result = parseSpecMetadata(null, docWithIntegrations);
      expect(result.integrationCount).toBeGreaterThan(6);
      expect(result.complexityTier).toBe("complex");
    });

    it("should return moderate for medium docs", () => {
      // Between 1500-4000 words AND 3-6 integrations
      const mediumDoc = "This is a word ".repeat(500) + " Auth0 Stripe Twilio SendGrid ";
      const result = parseSpecMetadata(null, mediumDoc);
      expect(result.complexityTier).toBe("moderate");
    });
  });

  describe("tech stack extraction", () => {
    it("should find common technologies", () => {
      const devSpec = `
        Built with React and TypeScript.
        Backend uses Node.js with Express.
        Database is PostgreSQL.
        Deployed on AWS with Docker.
      `;
      const result = parseSpecMetadata(null, devSpec);
      expect(result.techStack).toContain("React");
      expect(result.techStack).toContain("TypeScript");
      expect(result.techStack).toContain("Node.js");
      expect(result.techStack).toContain("Express");
      expect(result.techStack).toContain("PostgreSQL");
      expect(result.techStack).toContain("AWS");
      expect(result.techStack).toContain("Docker");
    });

    it("should limit tech stack to 15 items", () => {
      const devSpec = `
        React Vue Angular Svelte Next.js Node.js Express Python Django Flask
        FastAPI Ruby Rails Go Java Spring Kotlin Swift Flutter PostgreSQL
        MySQL MongoDB Redis AWS Firebase Vercel
      `;
      const result = parseSpecMetadata(null, devSpec);
      expect(result.techStack.length).toBeLessThanOrEqual(15);
    });

    it("should be case insensitive", () => {
      const devSpec = "Using REACT and Node.js with POSTGRESQL";
      const result = parseSpecMetadata(null, devSpec);
      expect(result.techStack).toContain("React");
      expect(result.techStack).toContain("Node.js");
      expect(result.techStack).toContain("PostgreSQL");
    });
  });

  describe("platform extraction", () => {
    it("should detect web platform", () => {
      const onePager = `# App
## Platform & Tech Recommendations
Web application with browser support.
`;
      const result = parseSpecMetadata(onePager, null);
      expect(result.platform).toContain("Web");
    });

    it("should detect mobile platforms", () => {
      const onePager = `# App
## Platform & Tech Recommendations
iOS and Android native apps.
`;
      const result = parseSpecMetadata(onePager, null);
      expect(result.platform).toContain("iOS");
      expect(result.platform).toContain("Android");
    });

    it("should detect cross-platform", () => {
      const onePager = `# App
## Platform & Tech Recommendations
React Native for cross-platform development.
`;
      const result = parseSpecMetadata(onePager, null);
      expect(result.platform).toContain("Cross-platform");
    });

    it("should detect desktop", () => {
      const onePager = `# App
## Platform & Tech Recommendations
Desktop application for Windows and Mac.
`;
      const result = parseSpecMetadata(onePager, null);
      expect(result.platform).toContain("Desktop");
    });
  });
});
