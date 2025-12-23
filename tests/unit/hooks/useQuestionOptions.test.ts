import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import type { Message } from "@/app/types";
import {
  extractQuestionFromMessage,
  summarizeConversation,
  useQuestionOptions,
} from "@/app/hooks/useQuestionOptions";
import { questionOptionsSchema } from "@/app/schemas/questionOptions";

const submitMock = vi.fn();
const clearMock = vi.fn();
const stopMock = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  experimental_useObject: vi.fn(() => ({
    submit: submitMock,
    object: undefined,
    error: undefined,
    isLoading: false,
    stop: stopMock,
    clear: clearMock,
  })),
}));

describe("useQuestionOptions helpers", () => {
  it("extractQuestionFromMessage should return the last line ending with '?'", () => {
    // Arrange
    const content =
      "Got it.\nWhat is your target audience?\nAny constraints we should consider?";

    // Act
    const result = extractQuestionFromMessage(content);

    // Assert
    expect(result).toBe("Any constraints we should consider?");
  });

  it("extractQuestionFromMessage should return null when no question exists", () => {
    // Arrange
    const content = "This message has no question.";

    // Act
    const result = extractQuestionFromMessage(content);

    // Assert
    expect(result).toBeNull();
  });

  it("summarizeConversation should include roles and trim whitespace", () => {
    // Arrange
    const messages: Message[] = [
      { id: "1", role: "user", content: "  We are building a product.  " },
      { id: "2", role: "assistant", content: "Nice! What's the problem?" },
    ];

    // Act
    const result = summarizeConversation(messages);

    // Assert
    expect(result).toContain("User: We are building a product.");
    expect(result).toContain("Assistant: Nice! What's the problem?");
  });
});

describe("useQuestionOptions hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submitMock.mockClear();
    clearMock.mockClear();
    stopMock.mockClear();
  });

  it("should configure experimental_useObject with schema and API endpoint", async () => {
    // Arrange
    const { experimental_useObject } = await import("@ai-sdk/react");

    // Act
    renderHook(() => useQuestionOptions({ enabled: true, messages: [] }));

    // Assert
    expect(experimental_useObject).toHaveBeenCalledWith(
      expect.objectContaining({
        api: "/api/generate-options",
        schema: questionOptionsSchema,
      })
    );
  });

  it("should submit when enabled and the last assistant message contains a question", () => {
    // Arrange
    const messages: Message[] = [
      { id: "1", role: "user", content: "We want a todo app." },
      { id: "2", role: "assistant", content: "Who is the primary user?" },
    ];

    // Act
    renderHook(() => useQuestionOptions({ enabled: true, messages }));

    // Assert
    return waitFor(() => {
      expect(submitMock).toHaveBeenCalledWith(
        expect.objectContaining({
          questionText: "Who is the primary user?",
        })
      );
    });
  });

  it("should not submit when disabled", () => {
    // Arrange
    const messages: Message[] = [
      { id: "1", role: "assistant", content: "What is the target audience?" },
    ];

    // Act
    renderHook(() => useQuestionOptions({ enabled: false, messages }));

    // Assert
    return waitFor(() => {
      expect(submitMock).not.toHaveBeenCalled();
    });
  });

  it("should not submit when no question is present in the last assistant message", () => {
    // Arrange
    const messages: Message[] = [
      { id: "1", role: "assistant", content: "Thanks for the details." },
    ];

    // Act
    renderHook(() => useQuestionOptions({ enabled: true, messages }));

    // Assert
    return waitFor(() => {
      expect(submitMock).not.toHaveBeenCalled();
    });
  });
});
