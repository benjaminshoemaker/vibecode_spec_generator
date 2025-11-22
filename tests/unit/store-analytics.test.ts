import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the analytics module BEFORE importing store
vi.mock("@/app/utils/analytics", () => ({
  analytics: {
    trackWizardReset: vi.fn(),
  },
}));

import { useWizardStore } from "@/app/store";
import { analytics } from "@/app/utils/analytics";

describe("Wizard Store - Analytics Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state
    const state = useWizardStore.getState();
    state.setCurrentStep(1);
    state.setIsGenerating(false);

    // Clear all step data manually to avoid triggering reset analytics
    state.updateStepChat("onePager", []);
    state.updateStepDoc("onePager", null);
    state.updateStepChat("devSpec", []);
    state.updateStepDoc("devSpec", null);
    state.updateStepChat("checklist", []);
    state.updateStepDoc("checklist", null);
    state.updateStepChat("agentsMd", []);
    state.updateStepDoc("agentsMd", null);
  });

  describe("resetWizard analytics tracking", () => {
    it("should track wizard reset when resetWizard is called", () => {
      const { resetWizard } = useWizardStore.getState();

      resetWizard();

      expect(analytics.trackWizardReset).toHaveBeenCalledTimes(1);
    });

    it("should track reset even with existing data", () => {
      const { updateStepChat, updateStepDoc, approveStep, resetWizard } =
        useWizardStore.getState();

      // Add some data
      updateStepChat("onePager", [
        { id: "1", role: "user", content: "Test" },
      ]);
      updateStepDoc("onePager", "# Test Doc");
      approveStep("onePager");

      // Reset
      resetWizard();

      expect(analytics.trackWizardReset).toHaveBeenCalledTimes(1);
    });

    it("should track multiple resets", () => {
      const { resetWizard } = useWizardStore.getState();

      resetWizard();
      resetWizard();
      resetWizard();

      expect(analytics.trackWizardReset).toHaveBeenCalledTimes(3);
    });

    it("should reset store state after tracking analytics", () => {
      const { updateStepChat, setCurrentStep, resetWizard } =
        useWizardStore.getState();

      // Modify state
      setCurrentStep(3);
      updateStepChat("onePager", [
        { id: "1", role: "user", content: "Test" },
      ]);

      // Reset
      resetWizard();

      // Verify analytics was called
      expect(analytics.trackWizardReset).toHaveBeenCalledTimes(1);

      // Verify state was reset
      const state = useWizardStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.steps.onePager.chatHistory).toEqual([]);
    });
  });
});
