import { experimental_useObject } from "@ai-sdk/react";
import { useEffect, useMemo, useRef } from "react";

import type { Message } from "@/app/types";
import { questionOptionsSchema, type QuestionOptions } from "@/app/schemas/questionOptions";

export function extractQuestionFromMessage(content: string): string | null {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const questionLines = lines.filter((line) => line.endsWith("?"));
  if (questionLines.length === 0) return null;
  return questionLines[questionLines.length - 1] ?? null;
}

export function summarizeConversation(messages: Message[]): string {
  const slice = messages.slice(Math.max(0, messages.length - 8));

  return slice
    .map((message) => {
      const roleLabel =
        message.role === "user"
          ? "User"
          : message.role === "assistant"
            ? "Assistant"
            : message.role;

      const cleaned = message.content.replace(/\s+/g, " ").trim();
      const truncated = cleaned.length > 280 ? `${cleaned.slice(0, 277)}...` : cleaned;
      return `${roleLabel}: ${truncated}`;
    })
    .join("\n");
}

type UseQuestionOptionsArgs = {
  enabled: boolean;
  messages: Message[];
};

type UseQuestionOptionsResult = {
  questionText: string | null;
  options: string[];
  recommendedIndex: number | null;
  confidence: QuestionOptions["confidence"] | null;
  reasoning: string | null;
  isLoading: boolean;
  error: Error | undefined;
  clear: () => void;
  stop: () => void;
  submit: (input: { questionText: string; conversationSummary: string }) => void;
};

export function useQuestionOptions({
  enabled,
  messages,
}: UseQuestionOptionsArgs): UseQuestionOptionsResult {
  const { submit, object, isLoading, error, clear, stop } =
    experimental_useObject({
      api: "/api/generate-options",
      schema: questionOptionsSchema,
    });

  const lastQuestionRef = useRef<string | null>(null);

  const questionText = useMemo(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return null;
    return extractQuestionFromMessage(last.content);
  }, [messages]);

  const conversationSummary = useMemo(
    () => summarizeConversation(messages),
    [messages]
  );

  useEffect(() => {
    if (!enabled) return;
    if (!questionText) return;
    if (lastQuestionRef.current === questionText) return;

    lastQuestionRef.current = questionText;
    clear();
    submit({ questionText, conversationSummary });
  }, [enabled, questionText, conversationSummary, submit, clear]);

  return {
    questionText,
    reasoning: typeof object?.reasoning === "string" ? object.reasoning : null,
    options: Array.isArray(object?.options) ? object.options.filter((o): o is string => typeof o === "string") : [],
    recommendedIndex:
      typeof object?.recommendedIndex === "number" ? object.recommendedIndex : null,
    confidence:
      object?.confidence === "weak" ||
      object?.confidence === "medium" ||
      object?.confidence === "strong"
        ? object.confidence
        : null,
    isLoading,
    error,
    clear,
    stop,
    submit,
  };
}

