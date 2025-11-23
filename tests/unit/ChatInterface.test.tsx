import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatInterface from "@/app/wizard/components/ChatInterface";
import { vi } from "vitest";

const encoder = new TextEncoder();

const createStreamResponse = (chunks: string[]) =>
  new Response(
    new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
        controller.close();
      },
    })
  );

describe("ChatInterface streaming", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders streamed assistant text into the conversation", async () => {
    const user = userEvent.setup();
    const onMessagesChange = vi.fn();

    global.fetch = vi.fn().mockResolvedValue(
      createStreamResponse(["Hello ", "world!"])
    ) as any;

    render(
      <ChatInterface
        systemPrompt="test prompt"
        initialMessages={[]}
        onMessagesChange={onMessagesChange}
      />
    );

    const textarea = screen.getByPlaceholderText("Type your ideas here...");
    await user.type(textarea, "Hi{enter}");

    await waitFor(() =>
      expect(screen.getByText(/Hello world!/)).toBeInTheDocument()
    );
  });

  it("falls back to non-streaming response when the stream is empty", async () => {
    const user = userEvent.setup();
    const onMessagesChange = vi.fn();

    const emptyStream = new Response(
      new ReadableStream({
        start(controller) {
          controller.close();
        },
      })
    );

    const fallbackResponse = new Response("Fallback text");

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(emptyStream)
      .mockResolvedValueOnce(fallbackResponse) as any;

    render(
      <ChatInterface
        systemPrompt="test prompt"
        initialMessages={[]}
        onMessagesChange={onMessagesChange}
      />
    );

    const textarea = screen.getByPlaceholderText("Type your ideas here...");
    await user.type(textarea, "Hi{enter}");

    await waitFor(() =>
      expect(screen.getByText(/Fallback text/)).toBeInTheDocument()
    );
  });
});
