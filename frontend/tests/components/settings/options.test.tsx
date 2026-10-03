import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Options from "@caviardeul/components/settings/options";

import { createSettings } from "../../helpers/fixtures";
import { renderWithProviders } from "../../helpers/renderWithProviders";

describe("Options", () => {
  it("renders dark mode switch", () => {
    renderWithProviders(<Options />, {
      settingsContext: { settings: createSettings({ lightMode: false }) },
    });
    const toggle = screen.getByLabelText("Activer le mode sombre");
    expect(toggle).toBeChecked(); // lightMode=false means dark mode is on
  });

  it("renders autoscroll switch", () => {
    renderWithProviders(<Options />, {
      settingsContext: { settings: createSettings({ autoScroll: true }) },
    });
    const toggle = screen.getByLabelText(
      "Défilement automatique vers le mot sélectionné",
    );
    expect(toggle).toBeChecked();
  });

  it("calls onChangeSettings when toggling dark mode", async () => {
    const onChangeSettings = vi.fn();
    renderWithProviders(<Options />, {
      settingsContext: {
        settings: createSettings({ lightMode: false }),
        onChangeSettings,
      },
    });

    await userEvent.click(screen.getByLabelText("Activer le mode sombre"));
    expect(onChangeSettings).toHaveBeenCalledWith({ lightMode: true });
  });

  it("calls onChangeSettings when toggling autoscroll", async () => {
    const onChangeSettings = vi.fn();
    renderWithProviders(<Options />, {
      settingsContext: {
        settings: createSettings({ autoScroll: true }),
        onChangeSettings,
      },
    });

    await userEvent.click(
      screen.getByLabelText("Défilement automatique vers le mot sélectionné"),
    );
    expect(onChangeSettings).toHaveBeenCalledWith({ autoScroll: false });
  });
});
