import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatInterface from "@/app/wizard/components/ChatInterface";
import { analytics } from "@/app/utils/analytics";

let hydrationFlag = true;
const useHasHydratedMock = vi.fn(() => hydrationFlag);

vi.mock("@/app/store", () => ({
  useHasHydrated: () => useHasHydratedMock(),
}));

// Mock the analytics module
vi.mock("@/app/utils/analytics", () => ({
  analytics: {
    trackChatMessage: vi.fn(),
  },
}));

// Mock fetch API
global.fetch = vi.fn();

describe("ChatInterface - Analytics Tracking", () => {
  const mockOnMessagesChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    hydrationFlag = true;

    // Setup default fetch mock
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode("Hello"),
            })
            .mockResolvedValueOnce({
              done: true,
              value: undefined,
            }),
        }),
      },
    } as any);
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

      const textarea = screen.getByPlaceholderText("Describe your requirements...");

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

      const textarea = screen.getByPlaceholderText("Describe your requirements...");

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

      const textarea = screen.getByPlaceholderText("Describe your requirements...");

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

      const textarea2 = screen.getByPlaceholderText("Describe your requirements...");
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

      const textarea = screen.getByPlaceholderText("Describe your requirements...");

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

      const textarea = screen.getByPlaceholderText("Describe your requirements...");

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

      const textarea = screen.getByPlaceholderText("Describe your requirements...");

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

      const textarea = screen.getByPlaceholderText("Describe your requirements...");

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

      const textarea = screen.getByPlaceholderText("Describe your requirements...");

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
