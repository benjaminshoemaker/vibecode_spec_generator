import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepConfig } from "@/app/types";

// Mock the analytics module BEFORE importing components
vi.mock("@/app/utils/analytics", () => ({
  analytics: {
    trackDocumentGenerate: vi.fn(),
    trackWizardReset: vi.fn(),
  },
}));

vi.mock("@/app/wizard/components/ChatInterface", () => ({
  __esModule: true,
  default: () => <div data-testid="chat-interface" />,
}));

vi.mock("@/app/wizard/components/ChatInterfaceWithOptions", () => ({
  __esModule: true,
  default: () => <div data-testid="chat-interface-with-options" />,
}));

import WizardStep from "@/app/wizard/components/WizardStep";
import { useWizardStore } from "@/app/store";
import { analytics } from "@/app/utils/analytics";

// Mock fetch API
global.fetch = vi.fn();

describe("WizardStep - Analytics Tracking", () => {
  const mockConfig: StepConfig = {
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

    // Reset wizard store
    const state = useWizardStore.getState();
    state.resetWizard();
    state.setIsGenerating(false);

    // Setup default fetch mock for successful document generation
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url) => {
      if (url === "/api/generate-doc") {
        return Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: vi.fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode("# Test Document"),
                })
                .mockResolvedValueOnce({
                  done: true,
                  value: undefined,
                }),
            }),
          },
        } as any);
      }

      // For chat API
      return Promise.resolve({
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode("Test response"),
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined,
              }),
          }),
        },
      } as any);
    });
  });

  describe("Multiple choice options integration", () => {
    it("should render ChatInterfaceWithOptions for step 1 (onePager)", () => {
      render(
        <WizardStep config={mockConfig} stepKey="onePager" onApproveAndNext={vi.fn()} />
      );
      expect(
        screen.getByTestId("chat-interface-with-options")
      ).toBeInTheDocument();
    });

    it("should render ChatInterface for non-step-1 steps", () => {
      const devSpecConfig: StepConfig = { ...mockConfig, stepName: "DEV_SPEC" };
      render(
        <WizardStep config={devSpecConfig} stepKey="devSpec" onApproveAndNext={vi.fn()} />
      );
      expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
    });
  });

  describe("Document generation tracking", () => {
    it("should track successful document generation", async () => {
      const mockOnApprove = vi.fn();

      render(
        <WizardStep
          config={mockConfig}
          stepKey="onePager"
          onApproveAndNext={mockOnApprove}
        />
      );

      // Add a chat message first (required for generation)
      const { updateStepChat } = useWizardStore.getState();
      await act(async () => {
        updateStepChat("onePager", [
          { id: "1", role: "user", content: "Test message" },
        ]);
      });

      // Trigger generation via custom event
      await act(async () => {
        window.dispatchEvent(new CustomEvent("triggerGenerate"));
      });

      await waitFor(
        () => {
          expect(analytics.trackDocumentGenerate).toHaveBeenCalledTimes(1);
          expect(analytics.trackDocumentGenerate).toHaveBeenCalledWith(
            "ONE_PAGER",
            true
          );
        },
        { timeout: 3000 }
      );
    });

    it("should track failed document generation", async () => {
      // Mock fetch to fail
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Generation failed")
      );

      const mockOnApprove = vi.fn();

      render(
        <WizardStep
          config={mockConfig}
          stepKey="onePager"
          onApproveAndNext={mockOnApprove}
        />
      );

      // Add a chat message first
      const { updateStepChat } = useWizardStore.getState();
      await act(async () => {
        updateStepChat("onePager", [
          { id: "1", role: "user", content: "Test message" },
        ]);
      });

      // Trigger generation
      await act(async () => {
        window.dispatchEvent(new CustomEvent("triggerGenerate"));
      });

      await waitFor(
        () => {
          expect(analytics.trackDocumentGenerate).toHaveBeenCalledTimes(1);
          expect(analytics.trackDocumentGenerate).toHaveBeenCalledWith(
            "ONE_PAGER",
            false
          );
        },
        { timeout: 3000 }
      );
    });

    it("should track generation with correct step name for different steps", async () => {
      const devSpecConfig: StepConfig = {
        ...mockConfig,
        stepName: "DEV_SPEC",
      };

      const mockOnApprove = vi.fn();

      render(
        <WizardStep
          config={devSpecConfig}
          stepKey="devSpec"
          onApproveAndNext={mockOnApprove}
        />
      );

      const { updateStepChat } = useWizardStore.getState();
      await act(async () => {
        updateStepChat("devSpec", [
          { id: "1", role: "user", content: "Test message" },
        ]);
      });

      await act(async () => {
        window.dispatchEvent(new CustomEvent("triggerGenerate"));
      });

      await waitFor(
        () => {
          expect(analytics.trackDocumentGenerate).toHaveBeenCalledWith(
            "DEV_SPEC",
            true
          );
        },
        { timeout: 3000 }
      );
    });

    it("should track multiple regenerations", async () => {
      const mockOnApprove = vi.fn();

      render(
        <WizardStep
          config={mockConfig}
          stepKey="onePager"
          onApproveAndNext={mockOnApprove}
        />
      );

      const { updateStepChat } = useWizardStore.getState();
      await act(async () => {
        updateStepChat("onePager", [
          { id: "1", role: "user", content: "Test message" },
        ]);
      });

      // First generation
      await act(async () => {
        window.dispatchEvent(new CustomEvent("triggerGenerate"));
      });

      await waitFor(
        () => {
          expect(analytics.trackDocumentGenerate).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 }
      );

      vi.clearAllMocks();

      // Second generation (regenerate)
      await act(async () => {
        window.dispatchEvent(new CustomEvent("triggerGenerate"));
      });

      await waitFor(
        () => {
          expect(analytics.trackDocumentGenerate).toHaveBeenCalledTimes(1);
          expect(analytics.trackDocumentGenerate).toHaveBeenCalledWith(
            "ONE_PAGER",
            true
          );
        },
        { timeout: 3000 }
      );
    });

    it("should track when response is not ok", async () => {
      // Mock fetch to return not ok
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      } as any);

      const mockOnApprove = vi.fn();

      render(
        <WizardStep
          config={mockConfig}
          stepKey="onePager"
          onApproveAndNext={mockOnApprove}
        />
      );

      const { updateStepChat } = useWizardStore.getState();
      await act(async () => {
        updateStepChat("onePager", [
          { id: "1", role: "user", content: "Test message" },
        ]);
      });

      await act(async () => {
        window.dispatchEvent(new CustomEvent("triggerGenerate"));
      });

      await waitFor(
        () => {
          expect(analytics.trackDocumentGenerate).toHaveBeenCalledWith(
            "ONE_PAGER",
            false
          );
        },
        { timeout: 3000 }
      );
    });

    it("should track when response body is missing", async () => {
      // Mock fetch to return no body
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        body: null,
      } as any);

      const mockOnApprove = vi.fn();

      render(
        <WizardStep
          config={mockConfig}
          stepKey="onePager"
          onApproveAndNext={mockOnApprove}
        />
      );

      const { updateStepChat } = useWizardStore.getState();
      await act(async () => {
        updateStepChat("onePager", [
          { id: "1", role: "user", content: "Test message" },
        ]);
      });

      await act(async () => {
        window.dispatchEvent(new CustomEvent("triggerGenerate"));
      });

      await waitFor(
        () => {
          expect(analytics.trackDocumentGenerate).toHaveBeenCalledWith(
            "ONE_PAGER",
            false
          );
        },
        { timeout: 3000 }
      );
    });
  });

  describe("UI behaviors", () => {
    it("keeps the previous document visible while regenerating and replaces it when done", async () => {
      const mockOnApprove = vi.fn();
      const encoder = new TextEncoder();

      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === "/api/generate-doc") {
          const read = vi
            .fn()
            .mockResolvedValueOnce({
              done: false,
              value: encoder.encode("# New Doc"),
            })
            .mockResolvedValueOnce({
              done: true,
              value: undefined,
            });

          return Promise.resolve({
            ok: true,
            body: { getReader: () => ({ read }) },
          } as any);
        }

        return Promise.resolve({
          ok: true,
          body: { getReader: () => ({ read: vi.fn().mockResolvedValue({ done: true, value: undefined }) }) },
        } as any);
      });

      const store = useWizardStore.getState();
      await act(async () => {
        store.updateStepDoc("onePager", "# Old Doc");
      });
      await act(async () => {
        store.updateStepChat("onePager", [{ id: "u1", role: "user", content: "Regenerate" }]);
      });

      render(
        <WizardStep
          config={mockConfig}
          stepKey="onePager"
          onApproveAndNext={mockOnApprove}
        />
      );

      expect(screen.getByText("Old Doc")).toBeInTheDocument();

      await act(async () => {
        window.dispatchEvent(new CustomEvent("triggerGenerate"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Doc")).toBeInTheDocument();
      });
    });

    it("shows an error message when generation fails", async () => {
      const mockOnApprove = vi.fn();

      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === "/api/generate-doc") {
          return Promise.reject(new Error("boom"));
        }

        return Promise.resolve({
          ok: true,
          body: { getReader: () => ({ read: vi.fn().mockResolvedValue({ done: true, value: undefined }) }) },
        } as any);
      });

      const store = useWizardStore.getState();
      await act(async () => {
        store.updateStepChat("onePager", [{ id: "u1", role: "user", content: "Generate please" }]);
      });

      render(
        <WizardStep
          config={mockConfig}
          stepKey="onePager"
          onApproveAndNext={mockOnApprove}
        />
      );

      await act(async () => {
        window.dispatchEvent(new CustomEvent("triggerGenerate"));
      });

      await waitFor(() => {
        expect(screen.getByText(/ERROR: boom/i)).toBeInTheDocument();
      });
    });
  });
});
