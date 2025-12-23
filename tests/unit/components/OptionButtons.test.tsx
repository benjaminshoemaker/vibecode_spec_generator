import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OptionButtons } from "@/app/wizard/components/OptionButtons";

describe("OptionButtons", () => {
  it("should show a loading skeleton when generating", () => {
    // Arrange
    render(
      <OptionButtons
        options={[]}
        isLoading={true}
        recommendedIndex={null}
        confidence={null}
        onSelect={vi.fn()}
        onTypeOwn={vi.fn()}
      />
    );

    // Act
    const status = screen.getByRole("status", { name: /generating options/i });

    // Assert
    expect(status).toBeInTheDocument();
  });

  it("should render option buttons and call onSelect when clicked", async () => {
    // Arrange
    const onSelect = vi.fn();
    render(
      <OptionButtons
        options={["Option A", "Option B", "Option C"]}
        isLoading={false}
        recommendedIndex={null}
        confidence={null}
        onSelect={onSelect}
        onTypeOwn={vi.fn()}
      />
    );

    // Act
    await userEvent.click(screen.getByRole("button", { name: "Option B" }));

    // Assert
    expect(onSelect).toHaveBeenCalledWith("Option B");
  });

  it("should highlight the recommended option and show a confidence badge", () => {
    // Arrange
    render(
      <OptionButtons
        options={["Alpha", "Beta", "Gamma"]}
        isLoading={false}
        recommendedIndex={1}
        confidence={"strong"}
        onSelect={vi.fn()}
        onTypeOwn={vi.fn()}
      />
    );

    // Act
    const recommendedButton = screen.getByRole("button", { name: /^Beta/ });

    // Assert
    expect(recommendedButton).toHaveAttribute("data-recommended", "true");
    expect(
      screen.getByText(/recommended/i, { selector: "span" })
    ).toBeInTheDocument();
    expect(screen.getByText(/strong/i, { selector: "span" })).toBeInTheDocument();
  });

  it("should render 'or type your own response' and call onTypeOwn when clicked", async () => {
    // Arrange
    const onTypeOwn = vi.fn();
    render(
      <OptionButtons
        options={["Alpha", "Beta", "Gamma"]}
        isLoading={false}
        recommendedIndex={null}
        confidence={null}
        onSelect={vi.fn()}
        onTypeOwn={onTypeOwn}
      />
    );

    // Act
    await userEvent.click(
      screen.getByRole("button", { name: /or type your own response/i })
    );

    // Assert
    expect(onTypeOwn).toHaveBeenCalled();
  });

  it("should support keyboard selection with Enter", async () => {
    // Arrange
    const onSelect = vi.fn();
    render(
      <OptionButtons
        options={["Alpha", "Beta", "Gamma"]}
        isLoading={false}
        recommendedIndex={null}
        confidence={null}
        onSelect={onSelect}
        onTypeOwn={vi.fn()}
      />
    );

    const alpha = screen.getByRole("button", { name: "Alpha" });
    alpha.focus();

    // Act
    await userEvent.keyboard("{Enter}");

    // Assert
    expect(onSelect).toHaveBeenCalledWith("Alpha");
  });
});
