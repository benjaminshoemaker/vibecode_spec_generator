import { describe, it, expect } from "vitest";

import { questionOptionsSchema } from "@/app/schemas/questionOptions";

describe("questionOptionsSchema", () => {
  it("should accept valid question options object", () => {
    // Arrange
    const input = {
      reasoning: "The user needs to choose a target audience; provide specific personas.",
      options: ["Individual creators", "Small businesses", "Enterprise teams"],
      recommendedIndex: 1,
      confidence: "medium",
    } as const;

    // Act
    const result = questionOptionsSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it("should reject when reasoning is missing", () => {
    // Arrange
    const input = {
      options: ["A", "B", "C"],
      recommendedIndex: null,
      confidence: "weak",
    };

    // Act
    const result = questionOptionsSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });

  it("should reject when options has fewer than 3 items", () => {
    // Arrange
    const input = {
      reasoning: "Need at least 3 options.",
      options: ["A", "B"],
      recommendedIndex: null,
      confidence: "weak",
    } as const;

    // Act
    const result = questionOptionsSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });

  it("should reject when options has more than 6 items", () => {
    // Arrange
    const input = {
      reasoning: "Need at most 6 options.",
      options: ["A", "B", "C", "D", "E", "F", "G"],
      recommendedIndex: null,
      confidence: "weak",
    } as const;

    // Act
    const result = questionOptionsSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });

  it("should reject when options contain duplicates (case/whitespace-insensitive)", () => {
    // Arrange
    const input = {
      reasoning: "Options should be distinct.",
      options: ["Email onboarding", "  email onboarding  ", "In-app tour"],
      recommendedIndex: null,
      confidence: "medium",
    } as const;

    // Act
    const result = questionOptionsSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });

  it("should reject when options include forbidden generic choices", () => {
    // Arrange
    const input = {
      reasoning: "Generic options are forbidden.",
      options: ["Other", "None of the above", "Something else"],
      recommendedIndex: null,
      confidence: "weak",
    } as const;

    // Act
    const result = questionOptionsSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });

  it("should allow recommendedIndex to be null", () => {
    // Arrange
    const input = {
      reasoning: "No recommendation when confidence is low.",
      options: ["Option 1", "Option 2", "Option 3"],
      recommendedIndex: null,
      confidence: "weak",
    } as const;

    // Act
    const result = questionOptionsSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it("should reject when recommendedIndex is out of bounds", () => {
    // Arrange
    const input = {
      reasoning: "Index must match an option.",
      options: ["Option 1", "Option 2", "Option 3"],
      recommendedIndex: 3,
      confidence: "strong",
    } as const;

    // Act
    const result = questionOptionsSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });

  it("should reject when confidence is invalid", () => {
    // Arrange
    const input = {
      reasoning: "Confidence must be one of the allowed values.",
      options: ["Option 1", "Option 2", "Option 3"],
      recommendedIndex: 0,
      confidence: "high",
    };

    // Act
    const result = questionOptionsSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });
});

