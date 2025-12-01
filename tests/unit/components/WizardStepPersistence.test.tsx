import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import WizardStep from "@/app/wizard/components/WizardStep";
import { StepConfig } from "@/app/types";
import { useWizardStore } from "@/app/store";

vi.mock("@/app/utils/analytics", () => ({
  analytics: {
    trackDocumentGenerate: vi.fn(),
    trackWizardReset: vi.fn(),
    trackStepView: vi.fn(),
    trackStepApproved: vi.fn(),
  },
  getOrCreateClientId: vi.fn(() => "client-123"),
}));

vi.mock("@/app/utils/spikelog", () => ({
  spikelog: {
    trackTokenUsage: vi.fn(),
    trackRegeneration: vi.fn(),
    trackStreamingFallback: vi.fn(),
    trackStepView: vi.fn(),
    startSessionHeartbeat: vi.fn(),
    endSessionHeartbeat: vi.fn(),
  },
}));

// Stub fetch to avoid network calls
global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })) as any;

describe("WizardStep - persisted chat hydration", () => {
  const mockConfig: StepConfig = {
    stepNumber: 1,
    stepName: "ONE_PAGER",
    systemPrompt: "Test system prompt",
    userInstructions: "Test instructions",
    generateButtonText: "Generate",
    generationPrompt: "Generate test document",
    documentInputs: [],
    initialGreeting: "Hello!",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const store = useWizardStore.getState();
    store.resetWizard();
    store.setIsGenerating(false);

    (localStorage.getItem as vi.Mock).mockReturnValue(null);
    (localStorage.setItem as vi.Mock).mockClear();
  });

  it("restores persisted chat history after hydration", async () => {
    const persistedState = {
      currentStep: 1,
      resetCounter: 0,
      steps: {
        onePager: {
          chatHistory: [
            { id: "a1", role: "assistant" as const, content: "Earlier context" },
            { id: "u1", role: "user" as const, content: "Need a dev spec" },
          ],
          generatedDoc: null,
          approved: false,
        },
        devSpec: { chatHistory: [], generatedDoc: null, approved: false },
        checklist: { chatHistory: [], generatedDoc: null, approved: false },
        agentsMd: { chatHistory: [], generatedDoc: null, approved: false },
      },
    };

    const payload = JSON.stringify({ state: persistedState, version: 0 });
    (localStorage.getItem as vi.Mock).mockImplementation((key) =>
      key === "wizard-storage" ? payload : null
    );

    await useWizardStore.persist.rehydrate();

    render(
      <WizardStep config={mockConfig} stepKey="onePager" onApproveAndNext={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText("Earlier context")).toBeInTheDocument();
      expect(screen.getByText("Need a dev spec")).toBeInTheDocument();
    });
  });
});
