import { describe, it, expect } from "vitest";
import type { Message } from "@/app/types";

import {
  extractQuestionLines,
  getQuestionInstances,
} from "@/app/wizard/utils/questionInstances";

describe("questionInstances", () => {
  describe("extractQuestionLines", () => {
    it("should return all trimmed lines that end with '?'", () => {
      // Arrange
      const content = `
        Great — a couple quick questions:
        Who is the target user?
        What platforms matter most?

        Thanks!
      `;

      // Act
      const result = extractQuestionLines(content);

      // Assert
      expect(result).toEqual([
        "Who is the target user?",
        "What platforms matter most?",
      ]);
    });

    it("should return an empty array when no question lines exist", () => {
      // Arrange
      const content = "This has no questions.";

      // Act
      const result = extractQuestionLines(content);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getQuestionInstances", () => {
    it("should cap to the last 5 question instances", () => {
      // Arrange
      const messages: Message[] = Array.from({ length: 7 }, (_, i) => ({
        id: `a${i}`,
        role: "assistant",
        content: `Question ${i + 1}?`,
      }));

      // Act
      const result = getQuestionInstances(messages, { cap: 5 });

      // Assert
      expect(result).toHaveLength(5);
      expect(result.map((q) => q.questionText)).toEqual([
        "Question 3?",
        "Question 4?",
        "Question 5?",
        "Question 6?",
        "Question 7?",
      ]);
    });

    it("should skip questions from the pending assistant message", () => {
      // Arrange
      const messages: Message[] = [
        { id: "a1", role: "assistant", content: "Finished question?" },
        { id: "a2", role: "assistant", content: "Streaming question?" },
      ];

      // Act
      const result = getQuestionInstances(messages, {
        cap: 5,
        pendingAssistantMessageId: "a2",
      });

      // Assert
      expect(result.map((q) => q.messageId)).toEqual(["a1"]);
    });

    it("should exclude dismissed instance ids", () => {
      // Arrange
      const messages: Message[] = [
        { id: "a1", role: "assistant", content: "Question 1?" },
        { id: "a2", role: "assistant", content: "Question 2?" },
      ];

      // Act
      const result = getQuestionInstances(messages, {
        cap: 5,
        dismissedInstanceIds: new Set(["a2:0"]),
      });

      // Assert
      expect(result.map((q) => q.id)).toEqual(["a1:0"]);
    });
  });
});

