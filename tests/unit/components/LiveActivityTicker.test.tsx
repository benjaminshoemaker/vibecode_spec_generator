import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import LiveActivityTicker from "@/app/components/LiveActivityTicker";

describe("LiveActivityTicker", () => {
  const sampleEvent = {
    id: "1",
    message: "Finalize clicked",
    timestamp: new Date().toISOString(),
    eventType: "finalize_clicked",
  };

  beforeEach(() => {
    // @ts-expect-error - allow overwriting fetch for tests
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ events: [sampleEvent] }),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders activity pulled from the activity API", async () => {
    render(<LiveActivityTicker />);

    await waitFor(() => {
      expect(screen.getByText(/Finalize clicked/i)).toBeInTheDocument();
    });
  });
});
