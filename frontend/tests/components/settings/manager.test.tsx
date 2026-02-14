import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useContext } from "react";
import { describe, expect, it, vi } from "vitest";

import SettingsManager, {
  SettingsContext,
} from "@caviardeul/components/settings/manager";


vi.mock("@caviardeul/utils/save", () => ({
  default: {
    getSettings: vi.fn().mockReturnValue(null),
    saveSettings: vi.fn(),
  },
}));

const SettingsDisplay: React.FC = () => {
  const { settings, onChangeSettings } = useContext(SettingsContext);
  return (
    <div>
      <span data-testid="lightMode">{String(settings.lightMode)}</span>
      <span data-testid="autoScroll">{String(settings.autoScroll)}</span>
      <button onClick={() => onChangeSettings({ lightMode: true })}>
        Enable light mode
      </button>
    </div>
  );
};

describe("SettingsManager", () => {
  it("provides default settings", () => {
    render(
      <SettingsManager>
        <SettingsDisplay />
      </SettingsManager>,
    );
    expect(screen.getByTestId("lightMode")).toHaveTextContent("false");
    expect(screen.getByTestId("autoScroll")).toHaveTextContent("true");
  });

  it("updates settings via onChangeSettings", async () => {
    render(
      <SettingsManager>
        <SettingsDisplay />
      </SettingsManager>,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Enable light mode" }),
    );
    expect(screen.getByTestId("lightMode")).toHaveTextContent("true");
  });

  it("loads settings from localStorage via SaveManagement", async () => {
    const { default: SaveManagement } = await import(
      "@caviardeul/utils/save"
    );
    vi.mocked(SaveManagement.getSettings).mockReturnValue({
      lightMode: true,
      autoScroll: false,
    });

    render(
      <SettingsManager>
        <SettingsDisplay />
      </SettingsManager>,
    );

    expect(screen.getByTestId("lightMode")).toHaveTextContent("true");
    expect(screen.getByTestId("autoScroll")).toHaveTextContent("false");
  });
});
