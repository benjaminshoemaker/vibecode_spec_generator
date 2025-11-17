import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWizardStore } from "@/app/store";
import { Message } from "@/app/types";

describe("Zustand Wizard Store", () => {
  // Reset store state before each test using the built-in resetWizard action
  beforeEach(() => {
    const state = useWizardStore.getState();
    state.resetWizard();
    state.setIsGenerating(false);
  });

  describe("Initial State", () => {
    it("should initialize with step 1", () => {
      const state = useWizardStore.getState();
      expect(state.currentStep).toBe(1);
    });

    it("should initialize with isGenerating false", () => {
      const state = useWizardStore.getState();
      expect(state.isGenerating).toBe(false);
    });

    it("should initialize all steps with empty state", () => {
      const state = useWizardStore.getState();

      expect(state.steps.onePager).toEqual({
        chatHistory: [],
        generatedDoc: null,
        approved: false,
      });

      expect(state.steps.devSpec).toEqual({
        chatHistory: [],
        generatedDoc: null,
        approved: false,
      });

      expect(state.steps.checklist).toEqual({
        chatHistory: [],
        generatedDoc: null,
        approved: false,
      });

      expect(state.steps.agentsMd).toEqual({
        chatHistory: [],
        generatedDoc: null,
        approved: false,
      });
    });
  });

  describe("setCurrentStep", () => {
    it("should update current step to 2", () => {
      const { setCurrentStep } = useWizardStore.getState();
      setCurrentStep(2);

      const state = useWizardStore.getState();
      expect(state.currentStep).toBe(2);
    });

    it("should update current step to 4", () => {
      const { setCurrentStep } = useWizardStore.getState();
      setCurrentStep(4);

      const state = useWizardStore.getState();
      expect(state.currentStep).toBe(4);
    });
  });

  describe("setIsGenerating", () => {
    it("should set isGenerating to true", () => {
      const { setIsGenerating } = useWizardStore.getState();
      setIsGenerating(true);

      const state = useWizardStore.getState();
      expect(state.isGenerating).toBe(true);
    });

    it("should set isGenerating to false", () => {
      const { setIsGenerating } = useWizardStore.getState();
      setIsGenerating(true);
      setIsGenerating(false);

      const state = useWizardStore.getState();
      expect(state.isGenerating).toBe(false);
    });
  });

  describe("updateStepChat", () => {
    const mockMessages: Message[] = [
      { id: "1", role: "user", content: "Hello" },
      { id: "2", role: "assistant", content: "Hi there!" },
    ];

    it("should update chat history for onePager step", () => {
      const { updateStepChat } = useWizardStore.getState();
      updateStepChat("onePager", mockMessages);

      const state = useWizardStore.getState();
      expect(state.steps.onePager.chatHistory).toEqual(mockMessages);
    });

    it("should update chat history for devSpec step", () => {
      const { updateStepChat } = useWizardStore.getState();
      updateStepChat("devSpec", mockMessages);

      const state = useWizardStore.getState();
      expect(state.steps.devSpec.chatHistory).toEqual(mockMessages);
    });

    it("should not affect other step data when updating chat", () => {
      const { updateStepChat, updateStepDoc } = useWizardStore.getState();

      // Set a document first
      updateStepDoc("onePager", "Test document");

      // Then update chat
      updateStepChat("onePager", mockMessages);

      const state = useWizardStore.getState();
      expect(state.steps.onePager.chatHistory).toEqual(mockMessages);
      expect(state.steps.onePager.generatedDoc).toBe("Test document");
      expect(state.steps.onePager.approved).toBe(false);
    });

    it("should not affect other steps when updating one step", () => {
      const { updateStepChat } = useWizardStore.getState();
      updateStepChat("onePager", mockMessages);

      const state = useWizardStore.getState();
      expect(state.steps.onePager.chatHistory).toEqual(mockMessages);
      expect(state.steps.devSpec.chatHistory).toEqual([]);
      expect(state.steps.checklist.chatHistory).toEqual([]);
      expect(state.steps.agentsMd.chatHistory).toEqual([]);
    });
  });

  describe("updateStepDoc", () => {
    const mockDoc = "# Test Document\n\nThis is a test document.";

    it("should update generated document for onePager step", () => {
      const { updateStepDoc } = useWizardStore.getState();
      updateStepDoc("onePager", mockDoc);

      const state = useWizardStore.getState();
      expect(state.steps.onePager.generatedDoc).toBe(mockDoc);
    });

    it("should update generated document for devSpec step", () => {
      const { updateStepDoc } = useWizardStore.getState();
      updateStepDoc("devSpec", mockDoc);

      const state = useWizardStore.getState();
      expect(state.steps.devSpec.generatedDoc).toBe(mockDoc);
    });

    it("should not affect other step data when updating document", () => {
      const { updateStepDoc, updateStepChat } = useWizardStore.getState();

      const mockMessages: Message[] = [
        { id: "1", role: "user", content: "Test" },
      ];

      updateStepChat("onePager", mockMessages);
      updateStepDoc("onePager", mockDoc);

      const state = useWizardStore.getState();
      expect(state.steps.onePager.generatedDoc).toBe(mockDoc);
      expect(state.steps.onePager.chatHistory).toEqual(mockMessages);
      expect(state.steps.onePager.approved).toBe(false);
    });
  });

  describe("approveStep", () => {
    it("should approve onePager step", () => {
      const { approveStep } = useWizardStore.getState();
      approveStep("onePager");

      const state = useWizardStore.getState();
      expect(state.steps.onePager.approved).toBe(true);
    });

    it("should approve devSpec step", () => {
      const { approveStep } = useWizardStore.getState();
      approveStep("devSpec");

      const state = useWizardStore.getState();
      expect(state.steps.devSpec.approved).toBe(true);
    });

    it("should not affect other step data when approving", () => {
      const { approveStep, updateStepDoc, updateStepChat } =
        useWizardStore.getState();

      const mockMessages: Message[] = [
        { id: "1", role: "user", content: "Test" },
      ];
      const mockDoc = "# Test";

      updateStepChat("onePager", mockMessages);
      updateStepDoc("onePager", mockDoc);
      approveStep("onePager");

      const state = useWizardStore.getState();
      expect(state.steps.onePager.approved).toBe(true);
      expect(state.steps.onePager.chatHistory).toEqual(mockMessages);
      expect(state.steps.onePager.generatedDoc).toBe(mockDoc);
    });

    it("should not affect other steps when approving one step", () => {
      const { approveStep } = useWizardStore.getState();
      approveStep("onePager");

      const state = useWizardStore.getState();
      expect(state.steps.onePager.approved).toBe(true);
      expect(state.steps.devSpec.approved).toBe(false);
      expect(state.steps.checklist.approved).toBe(false);
      expect(state.steps.agentsMd.approved).toBe(false);
    });
  });

  describe("resetWizard", () => {
    it("should reset all steps to initial state", () => {
      const { updateStepChat, updateStepDoc, approveStep, setCurrentStep, resetWizard } =
        useWizardStore.getState();

      // Modify state
      setCurrentStep(3);
      updateStepChat("onePager", [
        { id: "1", role: "user", content: "Test" },
      ]);
      updateStepDoc("onePager", "# Test");
      approveStep("onePager");

      updateStepChat("devSpec", [
        { id: "2", role: "user", content: "Test 2" },
      ]);
      updateStepDoc("devSpec", "# Test 2");
      approveStep("devSpec");

      // Reset
      resetWizard();

      const state = useWizardStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.steps.onePager).toEqual({
        chatHistory: [],
        generatedDoc: null,
        approved: false,
      });
      expect(state.steps.devSpec).toEqual({
        chatHistory: [],
        generatedDoc: null,
        approved: false,
      });
      expect(state.steps.checklist).toEqual({
        chatHistory: [],
        generatedDoc: null,
        approved: false,
      });
      expect(state.steps.agentsMd).toEqual({
        chatHistory: [],
        generatedDoc: null,
        approved: false,
      });
    });

    it("should reset currentStep to 1", () => {
      const { setCurrentStep, resetWizard } = useWizardStore.getState();

      setCurrentStep(4);
      resetWizard();

      const state = useWizardStore.getState();
      expect(state.currentStep).toBe(1);
    });
  });

  describe("loadSampleDocs", () => {
    it("should reset all steps to initial state", () => {
      const { updateStepChat, updateStepDoc, approveStep, loadSampleDocs } =
        useWizardStore.getState();

      // Modify state
      updateStepChat("onePager", [
        { id: "1", role: "user", content: "Test" },
      ]);
      updateStepDoc("onePager", "# Test");
      approveStep("onePager");

      // Load sample docs
      loadSampleDocs();

      const state = useWizardStore.getState();
      expect(state.steps.onePager).toEqual({
        chatHistory: [],
        generatedDoc: null,
        approved: false,
      });
    });

    it("should reset currentStep to 1", () => {
      const { setCurrentStep, loadSampleDocs } = useWizardStore.getState();

      setCurrentStep(3);
      loadSampleDocs();

      const state = useWizardStore.getState();
      expect(state.currentStep).toBe(1);
    });
  });

  describe("Complex workflows", () => {
    it("should handle a complete step 1 workflow", () => {
      const { updateStepChat, updateStepDoc, approveStep, setCurrentStep } =
        useWizardStore.getState();

      // User chats
      const messages: Message[] = [
        { id: "1", role: "user", content: "I want to build a time tracker" },
        { id: "2", role: "assistant", content: "Great! Tell me more..." },
      ];
      updateStepChat("onePager", messages);

      // Generate document
      updateStepDoc("onePager", "# Time Tracker One-Pager");

      // Approve
      approveStep("onePager");

      // Move to next step
      setCurrentStep(2);

      const state = useWizardStore.getState();
      expect(state.currentStep).toBe(2);
      expect(state.steps.onePager.chatHistory).toEqual(messages);
      expect(state.steps.onePager.generatedDoc).toBe(
        "# Time Tracker One-Pager"
      );
      expect(state.steps.onePager.approved).toBe(true);
    });

    it("should handle regeneration workflow", () => {
      const { updateStepDoc } = useWizardStore.getState();

      // First generation
      updateStepDoc("onePager", "# First Draft");
      let state = useWizardStore.getState();
      expect(state.steps.onePager.generatedDoc).toBe("# First Draft");

      // Regeneration
      updateStepDoc("onePager", "# Second Draft");
      state = useWizardStore.getState();
      expect(state.steps.onePager.generatedDoc).toBe("# Second Draft");
    });
  });
});
