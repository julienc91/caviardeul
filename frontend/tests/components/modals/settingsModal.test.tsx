import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SettingsModal from "@caviardeul/components/modals/settingsModal";

import { createSettings } from "../../helpers/fixtures";
import { renderWithProviders } from "../../helpers/renderWithProviders";

describe("SettingsModal", () => {
  it("renders nothing when not open", () => {
    const { container } = renderWithProviders(
      <SettingsModal open={false} onClose={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders options heading when open", () => {
    renderWithProviders(<SettingsModal open={true} onClose={vi.fn()} />, {
      settingsContext: { settings: createSettings() },
    });
    expect(screen.getByText("Options")).toBeInTheDocument();
  });

  it("renders dark mode checkbox", () => {
    renderWithProviders(<SettingsModal open={true} onClose={vi.fn()} />, {
      settingsContext: { settings: createSettings({ lightMode: false }) },
    });
    const checkbox = screen.getByLabelText("Activer le mode sombre");
    expect(checkbox).toBeChecked(); // lightMode=false means dark mode is on
  });

  it("renders autoscroll checkbox", () => {
    renderWithProviders(<SettingsModal open={true} onClose={vi.fn()} />, {
      settingsContext: { settings: createSettings({ autoScroll: true }) },
    });
    const checkbox = screen.getByLabelText(
      "Défilement automatique vers le mot sélectionné",
    );
    expect(checkbox).toBeChecked();
  });

  it("calls onChangeSettings when toggling dark mode", async () => {
    const onChangeSettings = vi.fn();
    renderWithProviders(<SettingsModal open={true} onClose={vi.fn()} />, {
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
    renderWithProviders(<SettingsModal open={true} onClose={vi.fn()} />, {
      settingsContext: {
        settings: createSettings({ autoScroll: true }),
        onChangeSettings,
      },
    });

    await userEvent.click(
      screen.getByLabelText(
        "Défilement automatique vers le mot sélectionné",
      ),
    );
    expect(onChangeSettings).toHaveBeenCalledWith({ autoScroll: false });
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    renderWithProviders(<SettingsModal open={true} onClose={onClose} />, {
      settingsContext: { settings: createSettings() },
    });

    await userEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
