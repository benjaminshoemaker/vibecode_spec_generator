import { describe, it, expect } from "vitest";

import { formatSelectionsAsMessage } from "@/app/wizard/utils/selectionFormat";

describe("formatSelectionsAsMessage", () => {
  it("should return a conversational single-line message for one answered question", () => {
    // Arrange
    const questions = ["What platform are you targeting?"];
    const optionsByQuestion = [["Web app", "Mobile app", "Desktop app"]];
    const selectedIndices = [0];

    // Act
    const result = formatSelectionsAsMessage({
      questions,
      optionsByQuestion,
      selectedIndices,
    });

    // Assert
    expect(result).toBe('For "What platform are you targeting": Web app.');
  });

  it("should return a multi-line message for multiple answered questions", () => {
    // Arrange
    const questions = [
      "What platform are you targeting?",
      "What authentication do you need?",
      "How should data persist?",
    ];
    const optionsByQuestion = [
      ["Web app", "Mobile app", "Desktop app"],
      ["OAuth with Google", "Email/password", "SAML SSO"],
      ["Local-only", "Cloud database", "Hybrid"],
    ];
    const selectedIndices = [0, 0, null];

    // Act
    const result = formatSelectionsAsMessage({
      questions,
      optionsByQuestion,
      selectedIndices,
    });

    // Assert
    expect(result).toContain("Here are my answers:");
    expect(result).toContain("- What platform are you targeting: Web app");
    expect(result).toContain("- What authentication do you need: OAuth with Google");
    expect(result).not.toContain("How should data persist");
  });

  it("should return null when nothing is selected", () => {
    // Arrange
    const questions = ["Question 1?"];
    const optionsByQuestion = [["A", "B", "C"]];
    const selectedIndices = [null];

    // Act
    const result = formatSelectionsAsMessage({
      questions,
      optionsByQuestion,
      selectedIndices,
    });

    // Assert
    expect(result).toBeNull();
  });
});

