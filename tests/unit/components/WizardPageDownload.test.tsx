import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WizardPage from "@/app/wizard/page";
import { useWizardStore } from "@/app/store";

const zipInstances: any[] = [];

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
  getOrCreateClientId: vi.fn(() => "client-123"),
}));

vi.mock("@/app/utils/spikelog", () => ({
  spikelog: {
    trackWizardStart: vi.fn(),
    startSessionHeartbeat: vi.fn(),
    endSessionHeartbeat: vi.fn(),
    trackStepView: vi.fn(),
    trackDocumentDownload: vi.fn(),
    trackWizardCompletion: vi.fn(),
  },
}));

// Mock JSZip to avoid real zipping in tests
vi.mock("jszip", () => {
  class MockZip {
    files: Record<string, string> = {};
    constructor() {
      zipInstances.push(this);
    }
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

    // Stub fetch for metadata logging and any other fire-and-forget calls
    (global.fetch as any) = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    zipInstances.length = 0;

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

  it("disables navigation to locked steps until prerequisites are approved", async () => {
    render(<WizardPage />);

    const devSpecButton = screen.getByRole("button", { name: /DEV_SPEC/i });
    expect(devSpecButton).toBeDisabled();

    const store = useWizardStore.getState();
    await act(async () => {
      store.approveStep("onePager");
    });

    await waitFor(() => {
      expect(devSpecButton).not.toBeDisabled();
    });
  });

  it("uses the uppercase underscore filename when downloading an individual document", async () => {
    const realCreateElement = document.createElement.bind(document);
    const anchors: HTMLAnchorElement[] = [];
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName: any) => {
        const element = realCreateElement(tagName) as HTMLElement;
        if (tagName === "a") {
          anchors.push(element as HTMLAnchorElement);
          vi.spyOn(element as HTMLAnchorElement, "click").mockImplementation(() => {});
        }
        return element;
      });

    render(<WizardPage />);

    const downloadButtons = screen.getAllByTitle("Download");
    await userEvent.click(downloadButtons[0]);

    const latestAnchor = anchors[anchors.length - 1];
    expect(latestAnchor.download).toBe("ONE_PAGER.md");

    createElementSpy.mockRestore();
  });

  it("uses uppercase underscore filenames inside the ZIP archive", async () => {
    render(<WizardPage />);

    await userEvent.click(screen.getByRole("button", { name: /download_all.zip/i }));

    await waitFor(() => {
      expect(zipInstances[0]?.files).toMatchObject({
        "ONE_PAGER.md": "# One Pager",
        "DEV_SPEC.md": "# Dev Spec",
        "PROMPT_PLAN.md": "# Prompt Plan",
        "AGENTS_MD.md": "# Agents",
      });
    });
  });
});
