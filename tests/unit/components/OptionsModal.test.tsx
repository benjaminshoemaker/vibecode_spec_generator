import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OptionsModal } from "@/app/wizard/components/OptionsModal";

describe("OptionsModal", () => {
  it("should auto-select recommended options on open", () => {
    // Arrange
    render(
      <OptionsModal
        open={true}
        title="Answer these questions"
        items={[
          {
            question: "What platform are you targeting?",
            options: ["Web app", "Mobile app", "Desktop app"],
            recommendedIndex: 0,
            confidence: "strong",
          },
          {
            question: "What authentication do you need?",
            options: ["OAuth with Google", "Email/password", "SAML SSO"],
            recommendedIndex: null,
            confidence: "medium",
          },
        ]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    // Act / Assert
    expect(
      screen.getByRole("button", { name: /web app/i })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /mobile app/i })
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("should toggle selection off when clicking the selected option again", async () => {
    // Arrange
    render(
      <OptionsModal
        open={true}
        title="Answer these questions"
        items={[
          {
            question: "What platform are you targeting?",
            options: ["Web app", "Mobile app", "Desktop app"],
            recommendedIndex: 0,
            confidence: "strong",
          },
        ]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const web = screen.getByRole("button", { name: /web app/i });
    expect(web).toHaveAttribute("aria-pressed", "true");

    // Act
    await userEvent.click(web);

    // Assert
    expect(web).toHaveAttribute("aria-pressed", "false");
  });

  it("should allow only one selection per question", async () => {
    // Arrange
    render(
      <OptionsModal
        open={true}
        title="Answer these questions"
        items={[
          {
            question: "What platform are you targeting?",
            options: ["Web app", "Mobile app", "Desktop app"],
            recommendedIndex: null,
            confidence: "weak",
          },
        ]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const web = screen.getByRole("button", { name: /web app/i });
    const mobile = screen.getByRole("button", { name: /mobile app/i });

    // Act
    await userEvent.click(web);
    await userEvent.click(mobile);

    // Assert
    expect(web).toHaveAttribute("aria-pressed", "false");
    expect(mobile).toHaveAttribute("aria-pressed", "true");
  });

  it("should call onClose when clicking the close button", async () => {
    // Arrange
    const onClose = vi.fn();
    render(
      <OptionsModal
        open={true}
        title="Answer these questions"
        items={[
          {
            question: "What platform are you targeting?",
            options: ["Web app", "Mobile app", "Desktop app"],
            recommendedIndex: null,
            confidence: "weak",
          },
        ]}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    );

    // Act
    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    // Assert
    expect(onClose).toHaveBeenCalled();
  });

  it("should call onSubmit with selections when submitting", async () => {
    // Arrange
    const onSubmit = vi.fn();
    render(
      <OptionsModal
        open={true}
        title="Answer these questions"
        items={[
          {
            question: "What platform are you targeting?",
            options: ["Web app", "Mobile app", "Desktop app"],
            recommendedIndex: null,
            confidence: "weak",
          },
          {
            question: "What authentication do you need?",
            options: ["OAuth with Google", "Email/password", "SAML SSO"],
            recommendedIndex: 0,
            confidence: "strong",
          },
        ]}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    // Act
    await userEvent.click(screen.getByRole("button", { name: /mobile app/i }));
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Assert
    expect(onSubmit).toHaveBeenCalledWith([1, 0]);
  });

  it("should disable submit when nothing is selected", () => {
    // Arrange
    render(
      <OptionsModal
        open={true}
        title="Answer these questions"
        items={[
          {
            question: "What platform are you targeting?",
            options: ["Web app", "Mobile app", "Desktop app"],
            recommendedIndex: null,
            confidence: "weak",
          },
        ]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    // Act
    const submit = screen.getByRole("button", { name: /submit/i });

    // Assert
    expect(submit).toBeDisabled();
  });
});
