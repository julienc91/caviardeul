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
});
