"use client";

import { experimental_useObject } from "@ai-sdk/react";
import { useEffect, useRef } from "react";

import { questionOptionsSchema, type QuestionOptions } from "@/app/schemas/questionOptions";
import { OptionButtons } from "./OptionButtons";

type QuestionOptionsWidgetProps = {
  id: string;
  enabled: boolean;
  questionText: string;
  conversationSummary: string;
  onSelect: (option: string) => void;
  onTypeOwn: () => void;
};

export function QuestionOptionsWidget({
  id,
  enabled,
  questionText,
  conversationSummary,
  onSelect,
  onTypeOwn,
}: QuestionOptionsWidgetProps) {
  const { submit, object, isLoading, error } = experimental_useObject({
    id,
    api: "/api/generate-options",
    schema: questionOptionsSchema,
  });

  const lastSubmittedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const submitKey = `${id}:${questionText}:${conversationSummary}`;
    if (lastSubmittedKeyRef.current === submitKey) return;
    lastSubmittedKeyRef.current = submitKey;

    submit({ questionText, conversationSummary });
  }, [conversationSummary, enabled, id, questionText, submit]);

  const options = Array.isArray(object?.options)
    ? object.options.filter((o): o is string => typeof o === "string")
    : [];

  const recommendedIndex =
    typeof object?.recommendedIndex === "number" ? object.recommendedIndex : null;

  const confidence: QuestionOptions["confidence"] | null =
    object?.confidence === "weak" ||
    object?.confidence === "medium" ||
    object?.confidence === "strong"
      ? object.confidence
      : null;

  if (error) {
    return null;
  }

  if (!isLoading && options.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 w-full">
      <div className="text-2xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
        Suggested answers
      </div>
      <OptionButtons
        options={options}
        isLoading={isLoading}
        recommendedIndex={
          typeof recommendedIndex === "number" &&
          recommendedIndex >= 0 &&
          recommendedIndex < options.length
            ? recommendedIndex
            : null
        }
        confidence={confidence}
        onSelect={onSelect}
        onTypeOwn={onTypeOwn}
      />
    </div>
  );
}

