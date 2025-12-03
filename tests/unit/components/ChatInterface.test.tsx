import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatInterface from "@/app/wizard/components/ChatInterface";
import { analytics } from "@/app/utils/analytics";
import { spikelog } from "@/app/utils/spikelog";

vi.mock("@/app/utils/analytics", () => {
  const trackChatMessage = vi.fn();
  const getOrCreateClientId = vi.fn(() => "client-123");
  return {
    analytics: {
      trackChatMessage,
    },
    getOrCreateClientId,
  };
});

vi.mock("@/app/utils/spikelog", () => ({
  spikelog: {
    trackChatMessage: vi.fn(),
    trackChatResponseTime: vi.fn(),
    trackStreamingFallback: vi.fn(),
  },
}));

let hydrationFlag = true;
const useHasHydratedMock = vi.fn(() => hydrationFlag);

vi.mock("@/app/store", () => ({
  useHasHydrated: () => useHasHydratedMock(),
}));

// Mock fetch API
global.fetch = vi.fn();

describe("ChatInterface - Analytics Tracking", () => {
  const mockOnMessagesChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    hydrationFlag = true;

    const encoder = new TextEncoder();

    // Setup default fetch mock
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url) => {
      if (url === "/api/chat") {
        const read = vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: encoder.encode("Hello"),
          })
          .mockResolvedValueOnce({
            done: true,
            value: undefined,
          });

        return Promise.resolve({
          ok: true,
          clone: () => ({ text: () => Promise.resolve("Hello") }),
          body: {
            getReader: () => ({
              read,
            }),
          },
        } as any);
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
        json: () => Promise.resolve({}),
      } as any);
    });
  });

  describe("Chat message submission tracking", () => {
    it("should track analytics when user submits a message via Enter key", async () => {
      const user = userEvent.setup();

      render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="ONE_PAGER"
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");

      // Type a message
      await user.type(textarea, "Hello AI");

      // Submit with Enter
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(analytics.trackChatMessage).toHaveBeenCalledTimes(1);
        expect(analytics.trackChatMessage).toHaveBeenCalledWith("ONE_PAGER");
      });
    });

    it("should track analytics when user submits a message via button click", async () => {
      const user = userEvent.setup();

      render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="DEV_SPEC"
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");

      // Type a message
      await user.type(textarea, "Test message");

      // Click submit button
      const submitButton = screen.getByRole("button", { name: "" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(analytics.trackChatMessage).toHaveBeenCalledTimes(1);
        expect(analytics.trackChatMessage).toHaveBeenCalledWith("DEV_SPEC");
      });
    });

    it("should track analytics for different step names", async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="PROMPT_PLAN"
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");

      await user.type(textarea, "Message 1");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(analytics.trackChatMessage).toHaveBeenCalledWith("PROMPT_PLAN");
      });

      vi.clearAllMocks();

      rerender(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="AGENTS_MD"
        />
      );

      const textarea2 = screen.getByPlaceholderText("Describe your idea...");
      await user.type(textarea2, "Message 2");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(analytics.trackChatMessage).toHaveBeenCalledWith("AGENTS_MD");
      });
    });

    it("should not track analytics if stepName is not provided", async () => {
      const user = userEvent.setup();

      render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");

      await user.type(textarea, "Test message");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(analytics.trackChatMessage).not.toHaveBeenCalled();
      });
    });

    it("should not track analytics when submitting empty message", async () => {
      const user = userEvent.setup();

      render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="ONE_PAGER"
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");

      // Try to submit empty message
      await user.click(textarea);
      await user.keyboard("{Enter}");

      expect(analytics.trackChatMessage).not.toHaveBeenCalled();
    });

    it("should not track analytics when submitting whitespace-only message", async () => {
      const user = userEvent.setup();

      render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="ONE_PAGER"
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");

      await user.type(textarea, "   ");
      await user.keyboard("{Enter}");

      expect(analytics.trackChatMessage).not.toHaveBeenCalled();
    });

    it("should track analytics for multiple messages in sequence", async () => {
      const user = userEvent.setup();

      render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="ONE_PAGER"
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");

      // Submit first message
      await user.type(textarea, "First message");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(analytics.trackChatMessage).toHaveBeenCalledTimes(1);
      });

      // Submit second message
      await user.type(textarea, "Second message");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(analytics.trackChatMessage).toHaveBeenCalledTimes(2);
      });
    });

    it("tracks chat response time when the assistant replies", async () => {
      const user = userEvent.setup();

      render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="ONE_PAGER"
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");
      await user.type(textarea, "Measure response time");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(spikelog.trackChatResponseTime).toHaveBeenCalledTimes(1);
        expect(spikelog.trackChatResponseTime).toHaveBeenCalledWith(
          "ONE_PAGER",
          expect.any(Number)
        );
        const duration =
          (spikelog.trackChatResponseTime as ReturnType<typeof vi.fn>).mock.calls[0][1];
        expect(duration).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Streaming behavior", () => {
    it("streams assistant chunks incrementally", async () => {
      const user = userEvent.setup();
      const encoder = new TextEncoder();

      let resolveFirst: (() => void) | undefined;
      let resolveSecond: (() => void) | undefined;

      const read = vi
        .fn()
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolveFirst = () =>
              resolve({
                done: false,
                value: encoder.encode("Chunk A "),
              });
          })
        )
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolveSecond = () =>
              resolve({
                done: true,
                value: encoder.encode("Chunk B"),
              });
          })
        );

      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === "/api/chat") {
          return Promise.resolve({
            ok: true,
            clone: () => ({ text: () => Promise.resolve("Chunk A Chunk B") }),
            body: {
              getReader: () => ({ read }),
            },
          } as any);
        }

        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(""),
          json: () => Promise.resolve({}),
        } as any);
      });

      render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="ONE_PAGER"
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");
      await user.type(textarea, "Start streaming");
      await user.keyboard("{Enter}");

      resolveFirst?.();

      await waitFor(() => {
        expect(screen.getByText(/Chunk A/)).toBeInTheDocument();
      });

      resolveSecond?.();

      await waitFor(() => {
        expect(screen.getByText("Chunk A Chunk B")).toBeInTheDocument();
      });
    });

    it("falls back to full text when no response body is available", async () => {
      const user = userEvent.setup();

      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url === "/api/chat") {
          return Promise.resolve({
            ok: true,
            body: null,
            clone: () => ({ text: () => Promise.resolve("Fallback content") }),
          } as any);
        }

        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(""),
          json: () => Promise.resolve({}),
        } as any);
      });

      render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="DEV_SPEC"
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");
      await user.type(textarea, "Trigger fallback");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByText("Fallback content")).toBeInTheDocument();
      });
    });
  });

  describe("Error handling", () => {
    it("should still track analytics even if fetch fails", async () => {
      const user = userEvent.setup();

      // Mock fetch to fail
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error")
      );

      render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={[]}
          onMessagesChange={mockOnMessagesChange}
          stepName="ONE_PAGER"
        />
      );

      const textarea = screen.getByPlaceholderText("Describe your idea...");

      await user.type(textarea, "Test message");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(analytics.trackChatMessage).toHaveBeenCalledTimes(1);
        expect(analytics.trackChatMessage).toHaveBeenCalledWith("ONE_PAGER");
      });
    });
  });

  describe("Hydration handling", () => {
    it("should not overwrite persisted chat history before hydration finishes", async () => {
      hydrationFlag = false;
      const persistedMessages = [
        { id: "1", role: "assistant" as const, content: "Earlier context" },
        { id: "2", role: "user" as const, content: "Need a dev spec" },
      ];

      const { rerender } = render(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={persistedMessages}
          onMessagesChange={mockOnMessagesChange}
          stepName="ONE_PAGER"
        />
      );

      expect(mockOnMessagesChange).not.toHaveBeenCalled();

      hydrationFlag = true;
      rerender(
        <ChatInterface
          systemPrompt="Test prompt"
          initialMessages={persistedMessages}
          onMessagesChange={mockOnMessagesChange}
          stepName="ONE_PAGER"
        />
      );

      await waitFor(() => {
        expect(mockOnMessagesChange).toHaveBeenCalledWith(persistedMessages);
      });
    });
  });
});
