import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FinalInstructionsModal } from "@/app/wizard/components/FinalInstructionsModal";

describe("FinalInstructionsModal", () => {
  const agentCommand =
    "Read AGENTS.md first, then ONE_PAGER.md, DEV_SPEC.md, and PROMPT_PLAN.md. Confirm when finished loading them.";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when closed", () => {
    render(
      <FinalInstructionsModal
        open={false}
        onClose={vi.fn()}
        onDownloadAll={vi.fn()}
        agentCommand={agentCommand}
      />
    );

    expect(
      screen.queryByText(/Hand off to your AI coding agent/i)
    ).not.toBeInTheDocument();
  });

  it("should trigger download when clicking the download button", async () => {
    const onDownloadAll = vi.fn();
    render(
      <FinalInstructionsModal
        open
        onClose={vi.fn()}
        onDownloadAll={onDownloadAll}
        agentCommand={agentCommand}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /download/i })
    );

    expect(onDownloadAll).toHaveBeenCalledTimes(1);
  });

  it("should copy the agent command", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    const onCopyCommand = vi.fn();

    render(
      <FinalInstructionsModal
        open
        onClose={vi.fn()}
        onDownloadAll={vi.fn()}
        agentCommand={agentCommand}
        onCopyCommand={onCopyCommand}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /copy/i }));

    expect(writeText).toHaveBeenCalledWith(agentCommand);
    expect(screen.getByText(/Copied/i)).toBeInTheDocument();
    expect(onCopyCommand).toHaveBeenCalledTimes(1);
  });
});
