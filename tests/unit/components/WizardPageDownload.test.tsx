import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WizardPage from "@/app/wizard/page";
import { useWizardStore } from "@/app/store";

// Mock analytics to avoid network calls
vi.mock("@/app/utils/analytics", () => ({
  analytics: {
    trackWizardStart: vi.fn(),
    trackStepView: vi.fn(),
    trackStepApproved: vi.fn(),
    trackDocumentDownload: vi.fn(),
    trackBulkDownload: vi.fn(),
    trackWizardComplete: vi.fn(),
    trackWizardReset: vi.fn(),
    trackDocumentGenerate: vi.fn(),
    trackChatMessage: vi.fn(),
    trackFinalizeClick: vi.fn(),
    trackCompletionDownload: vi.fn(),
    trackCompletionCopy: vi.fn(),
  },
}));

// Mock JSZip to avoid real zipping in tests
vi.mock("jszip", () => {
  class MockZip {
    files: Record<string, string> = {};
    file(name: string, content: string) {
      this.files[name] = content;
    }
    async generateAsync() {
      return new Blob(["zip"]);
    }
  }

  return { __esModule: true, default: MockZip };
});

describe("WizardPage download all", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store and seed all four documents
    const store = useWizardStore.getState();
    store.resetWizard();
    store.updateStepDoc("onePager", "# One Pager");
    store.updateStepDoc("devSpec", "# Dev Spec");
    store.updateStepDoc("checklist", "# Prompt Plan");
    store.updateStepDoc("agentsMd", "# Agents");

    // Mock URL helpers used for download
    // @ts-expect-error override for tests
    global.URL.createObjectURL = vi.fn(() => "blob:zip");
    // @ts-expect-error override for tests
    global.URL.revokeObjectURL = vi.fn();
  });

  it("opens completion modal after download-all when all documents exist", async () => {
    render(<WizardPage />);

    await userEvent.click(screen.getByRole("button", { name: /download_all.zip/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Hand off to your AI coding agent/i)
      ).toBeInTheDocument();
    });
  });
});
