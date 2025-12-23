import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ChatInterfaceWithOptions from "@/app/wizard/components/ChatInterfaceWithOptions";

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

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Mock fetch API
global.fetch = vi.fn();

describe("ChatInterfaceWithOptions - batched options modal", () => {
  const mockOnMessagesChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    hydrationFlag = true;
  });

  it("should only open the modal after ALL question options are ready", async () => {
    // Arrange
    const user = userEvent.setup();
    const encoder = new TextEncoder();

    const deferred1 = createDeferred<any>();
    const deferred2 = createDeferred<any>();
    let optionsCallCount = 0;

    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url) => {
      if (url === "/api/chat") {
        const read = vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: encoder.encode(
              "Quick questions:\nWhat platform are you targeting?\nWhat authentication do you need?\n"
            ),
          })
          .mockResolvedValueOnce({ done: true, value: undefined });

        return Promise.resolve({
          ok: true,
          clone: () => ({ text: () => Promise.resolve("") }),
          body: { getReader: () => ({ read }) },
        } as any);
      }

      if (url === "/api/generate-options") {
        optionsCallCount += 1;
        return optionsCallCount === 1 ? deferred1.promise : deferred2.promise;
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
        json: () => Promise.resolve({}),
      } as any);
    });

    render(
      <ChatInterfaceWithOptions
        systemPrompt="Test prompt"
        initialMessages={[]}
        onMessagesChange={mockOnMessagesChange}
        stepName="ONE_PAGER"
      />
    );

    const textarea = screen.getByPlaceholderText("Describe your idea...");
    await user.type(textarea, "Hello");
    await user.keyboard("{Enter}");

    // Assert: options requests started, but modal not shown until both resolved
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/generate-options",
        expect.anything()
      );
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Act: resolve both option calls
    deferred1.resolve(
      new Response(
        JSON.stringify({
          reasoning: "Pick a platform option.",
          options: ["Web app", "Mobile app", "Desktop app"],
          recommendedIndex: 0,
          confidence: "strong",
        })
      )
    );

    deferred2.resolve(
      new Response(
        JSON.stringify({
          reasoning: "Pick an auth option.",
          options: ["OAuth with Google", "Email/password", "SAML SSO"],
          recommendedIndex: 0,
          confidence: "strong",
        })
      )
    );

    // Assert: modal opens after both complete
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("should submit combined selections as a single chat message", async () => {
    // Arrange
    const user = userEvent.setup();
    const encoder = new TextEncoder();
    let chatCall = 0;

    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url, init) => {
      if (url === "/api/chat") {
        chatCall += 1;
        const reply = chatCall === 1
          ? "Questions:\nWhat platform are you targeting?\nWhat authentication do you need?\n"
          : "Thanks!";

        const read = vi
          .fn()
          .mockResolvedValueOnce({ done: false, value: encoder.encode(reply) })
          .mockResolvedValueOnce({ done: true, value: undefined });

        return Promise.resolve({
          ok: true,
          clone: () => ({ text: () => Promise.resolve("") }),
          body: { getReader: () => ({ read }) },
        } as any);
      }

      if (url === "/api/generate-options") {
        const body = JSON.parse((init as any)?.body ?? "{}");
        const questionText = body.questionText as string;
        if (questionText.includes("platform")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                reasoning: "Pick a platform option.",
                options: ["Web app", "Mobile app", "Desktop app"],
                recommendedIndex: 0,
                confidence: "strong",
              })
            )
          );
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({
              reasoning: "Pick an auth option.",
              options: ["OAuth with Google", "Email/password", "SAML SSO"],
              recommendedIndex: 0,
              confidence: "strong",
            })
          )
        );
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
        json: () => Promise.resolve({}),
      } as any);
    });

    render(
      <ChatInterfaceWithOptions
        systemPrompt="Test prompt"
        initialMessages={[]}
        onMessagesChange={mockOnMessagesChange}
        stepName="ONE_PAGER"
      />
    );

    const textarea = screen.getByPlaceholderText("Describe your idea...");
    await user.type(textarea, "Hello");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Act: change first selection then submit
    await user.click(screen.getByRole("button", { name: /mobile app/i }));
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // Assert: modal closes and combined user message is added
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Here are my answers:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/What platform are you targeting: Mobile app/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/What authentication do you need: OAuth with Google/i)
    ).toBeInTheDocument();
  });
});
