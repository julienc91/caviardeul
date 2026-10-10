import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Input from "@caviardeul/components/game/input";

import { createSettings } from "../../helpers/fixtures";
import { renderWithProviders } from "../../helpers/renderWithProviders";

describe("Input", () => {
  it("renders input field and submit button", () => {
    renderWithProviders(<Input />, {
      gameContext: { canPlay: true },
    });
    expect(screen.getByPlaceholderText("Un mot ?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Valider" })).toBeInTheDocument();
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

  describe("pin", () => {
    it("offers to block the scrolling when the view follows the words", () => {
      renderWithProviders(<Input />);
      const pin = screen.getByRole("button", {
        name: "Bloquer le défilement auto",
      });
      expect(pin).toHaveAttribute(
        "title",
        "Bloquer le défilement auto (Ctrl+Entrée)",
      );
      expect(pin).not.toHaveClass("pinned");
    });

    it("offers to enable the scrolling when the view is pinned", () => {
      renderWithProviders(<Input />, {
        settingsContext: { settings: createSettings({ autoScroll: false }) },
      });
      const pin = screen.getByRole("button", {
        name: "Activer le défilement auto",
      });
      expect(pin).toHaveAttribute(
        "title",
        "Activer le défilement auto (Ctrl+Entrée)",
      );
      expect(pin).toHaveClass("pinned");
    });

    it("pins the view on click", async () => {
      const onChangeSettings = vi.fn();
      renderWithProviders(<Input />, { settingsContext: { onChangeSettings } });
      await userEvent.click(
        screen.getByRole("button", { name: "Bloquer le défilement auto" }),
      );
      expect(onChangeSettings).toHaveBeenCalledWith({ autoScroll: false });
    });

    it("toggles with Ctrl+Enter without submitting", async () => {
      const onChangeSettings = vi.fn();
      const makeAttempt = vi.fn();
      renderWithProviders(<Input />, {
        settingsContext: {
          settings: createSettings({ autoScroll: false }),
          onChangeSettings,
        },
        gameContext: { makeAttempt },
      });
      const input = screen.getByPlaceholderText("Un mot ?");
      await userEvent.type(input, "tour{Control>}{Enter}{/Control}");

      expect(onChangeSettings).toHaveBeenCalledWith({ autoScroll: true });
      expect(makeAttempt).not.toHaveBeenCalled();
      expect(input).toHaveValue("tour");
    });

    it("toggles with Cmd+Enter", async () => {
      const onChangeSettings = vi.fn();
      renderWithProviders(<Input />, { settingsContext: { onChangeSettings } });
      await userEvent.type(
        screen.getByPlaceholderText("Un mot ?"),
        "{Meta>}{Enter}{/Meta}",
      );
      expect(onChangeSettings).toHaveBeenCalledWith({ autoScroll: false });
    });

    it("ignores Ctrl+Enter outside the input", async () => {
      const onChangeSettings = vi.fn();
      renderWithProviders(<Input />, { settingsContext: { onChangeSettings } });
      await userEvent.keyboard("{Control>}{Enter}{/Control}");
      expect(onChangeSettings).not.toHaveBeenCalled();
    });

    it("is hidden when the game is over", () => {
      renderWithProviders(<Input />, {
        gameContext: { isOver: true, canPlay: false },
      });
      expect(
        screen.queryByRole("button", { name: /défilement auto/ }),
      ).not.toBeInTheDocument();
    });
  });
});
