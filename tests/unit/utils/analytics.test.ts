import { describe, it, expect, beforeEach, vi } from "vitest";
import { analytics } from "@/app/utils/analytics";

describe("Analytics Utility", () => {
  let gtagMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a fresh mock for each test
    gtagMock = vi.fn();

    // Mock window.gtag
    Object.defineProperty(window, 'gtag', {
      value: gtagMock,
      writable: true,
      configurable: true,
    });
  });

  describe("trackStepView", () => {
    it("should call gtag with correct parameters for step view", () => {
      analytics.trackStepView(1, "ONE_PAGER");

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "step_view", {
        step_number: 1,
        step_name: "ONE_PAGER",
      });
    });

    it("should track different step numbers and names", () => {
      analytics.trackStepView(2, "DEV_SPEC");

      expect(gtagMock).toHaveBeenCalledWith("event", "step_view", {
        step_number: 2,
        step_name: "DEV_SPEC",
      });
    });

    it("should not call gtag if window.gtag is undefined", () => {
      // Remove gtag from window
      delete (window as any).gtag;

      analytics.trackStepView(1, "ONE_PAGER");

      // Should not throw error and gtag should not be called
      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe("trackWizardStart", () => {
    it("should call gtag with correct parameters for wizard start", () => {
      analytics.trackWizardStart("hero_start_building");

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "wizard_start", {
        source: "hero_start_building",
      });
    });

    it("should not call gtag if window.gtag is undefined", () => {
      delete (window as any).gtag;

      analytics.trackWizardStart("nav_get_started");

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe("trackChatMessage", () => {
    it("should call gtag with correct parameters for chat message", () => {
      analytics.trackChatMessage("ONE_PAGER");

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "chat_message", {
        step_name: "ONE_PAGER",
      });
    });

    it("should track messages from different steps", () => {
      analytics.trackChatMessage("DEV_SPEC");

      expect(gtagMock).toHaveBeenCalledWith("event", "chat_message", {
        step_name: "DEV_SPEC",
      });
    });

    it("should not call gtag if window.gtag is undefined", () => {
      delete (window as any).gtag;

      analytics.trackChatMessage("ONE_PAGER");

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe("trackStepApproved", () => {
    it("should call gtag with correct parameters when approving a step", () => {
      analytics.trackStepApproved(2, "DEV_SPEC");

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "step_approved", {
        step_number: 2,
        step_name: "DEV_SPEC",
      });
    });

    it("should not call gtag if window.gtag is undefined", () => {
      delete (window as any).gtag;

      analytics.trackStepApproved(1, "ONE_PAGER");

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe("trackDocumentGenerate", () => {
    it("should call gtag with success true", () => {
      analytics.trackDocumentGenerate("ONE_PAGER", true);

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "document_generate", {
        step_name: "ONE_PAGER",
        success: true,
      });
    });

    it("should call gtag with success false", () => {
      analytics.trackDocumentGenerate("DEV_SPEC", false);

      expect(gtagMock).toHaveBeenCalledWith("event", "document_generate", {
        step_name: "DEV_SPEC",
        success: false,
      });
    });

    it("should not call gtag if window.gtag is undefined", () => {
      delete (window as any).gtag;

      analytics.trackDocumentGenerate("ONE_PAGER", true);

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe("trackDocumentDownload", () => {
    it("should call gtag with correct parameters for individual download", () => {
      analytics.trackDocumentDownload("ONE_PAGER");

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "document_download", {
        step_name: "ONE_PAGER",
        download_type: "individual",
      });
    });

    it("should track downloads from different steps", () => {
      analytics.trackDocumentDownload("PROMPT_PLAN");

      expect(gtagMock).toHaveBeenCalledWith("event", "document_download", {
        step_name: "PROMPT_PLAN",
        download_type: "individual",
      });
    });

    it("should not call gtag if window.gtag is undefined", () => {
      delete (window as any).gtag;

      analytics.trackDocumentDownload("ONE_PAGER");

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe("trackBulkDownload", () => {
    it("should call gtag with correct parameters for bulk download", () => {
      analytics.trackBulkDownload(4);

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "bulk_download", {
        document_count: 4,
        download_type: "zip",
      });
    });

    it("should track different document counts", () => {
      analytics.trackBulkDownload(2);

      expect(gtagMock).toHaveBeenCalledWith("event", "bulk_download", {
        document_count: 2,
        download_type: "zip",
      });
    });

    it("should not call gtag if window.gtag is undefined", () => {
      delete (window as any).gtag;

      analytics.trackBulkDownload(4);

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe("trackWizardReset", () => {
    it("should call gtag with correct event name", () => {
      analytics.trackWizardReset();

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "wizard_reset");
    });

    it("should not call gtag if window.gtag is undefined", () => {
      delete (window as any).gtag;

      analytics.trackWizardReset();

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe("trackWizardComplete", () => {
    it("should call gtag with correct event name", () => {
      analytics.trackWizardComplete();

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "wizard_complete");
    });

    it("should not call gtag if window.gtag is undefined", () => {
      delete (window as any).gtag;

      analytics.trackWizardComplete();

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe("Multiple events", () => {
    it("should track multiple events in sequence", () => {
      analytics.trackStepView(1, "ONE_PAGER");
      analytics.trackChatMessage("ONE_PAGER");
      analytics.trackDocumentGenerate("ONE_PAGER", true);
      analytics.trackDocumentDownload("ONE_PAGER");

      expect(gtagMock).toHaveBeenCalledTimes(4);
    });

    it("should maintain correct parameters for each event", () => {
      analytics.trackStepView(1, "ONE_PAGER");
      analytics.trackStepView(2, "DEV_SPEC");

      expect(gtagMock).toHaveBeenNthCalledWith(1, "event", "step_view", {
        step_number: 1,
        step_name: "ONE_PAGER",
      });

      expect(gtagMock).toHaveBeenNthCalledWith(2, "event", "step_view", {
        step_number: 2,
        step_name: "DEV_SPEC",
      });
    });
  });
});
