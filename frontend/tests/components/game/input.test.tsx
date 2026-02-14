import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Input from "@caviardeul/components/game/input";

import { renderWithProviders } from "../../helpers/renderWithProviders";

describe("Input", () => {
  it("renders input field and submit button", () => {
    renderWithProviders(<Input />, {
      gameContext: { canPlay: true },
    });
    expect(screen.getByPlaceholderText("Un mot ?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Valider" }),
    ).toBeInTheDocument();
  });

  it("disables input when canPlay is false", () => {
    renderWithProviders(<Input />, {
      gameContext: { canPlay: false },
    });
    expect(screen.getByPlaceholderText("Un mot ?")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Valider" })).toBeDisabled();
  });

  it("calls makeAttempt on submit button click", async () => {
    const makeAttempt = vi.fn();
    renderWithProviders(<Input />, {
      gameContext: { canPlay: true, makeAttempt },
    });

    const input = screen.getByPlaceholderText("Un mot ?");
    await userEvent.type(input, "tour");
    await userEvent.click(screen.getByRole("button", { name: "Valider" }));

    expect(makeAttempt).toHaveBeenCalledWith("tour");
  });

  it("calls makeAttempt on Enter key", async () => {
    const makeAttempt = vi.fn();
    renderWithProviders(<Input />, {
      gameContext: { canPlay: true, makeAttempt },
    });

    const input = screen.getByPlaceholderText("Un mot ?");
    await userEvent.type(input, "eiffel{Enter}");

    expect(makeAttempt).toHaveBeenCalledWith("eiffel");
  });

  it("clears input after submit", async () => {
    const makeAttempt = vi.fn();
    renderWithProviders(<Input />, {
      gameContext: { canPlay: true, makeAttempt },
    });

    const input = screen.getByPlaceholderText("Un mot ?");
    await userEvent.type(input, "tour{Enter}");

    expect(input).toHaveValue("");
  });

  it("strips spaces from input", async () => {
    const makeAttempt = vi.fn();
    renderWithProviders(<Input />, {
      gameContext: { canPlay: true, makeAttempt },
    });

    const input = screen.getByPlaceholderText("Un mot ?");
    // userEvent.type simulates one character at a time, spaces get stripped
    await userEvent.type(input, "hello world");
    // After stripping spaces, the value should not contain spaces
    expect((input as HTMLInputElement).value).not.toContain(" ");
  });
});
