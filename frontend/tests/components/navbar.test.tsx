import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Navbar from "@caviardeul/components/navbar";

import { renderWithProviders } from "../helpers/renderWithProviders";

vi.mock("@caviardeul/utils/save", () => ({
  default: {
    getIsTutorialSkipped: vi.fn().mockReturnValue(true),
    setSkipTutorial: vi.fn(),
    getSettings: vi.fn().mockReturnValue(null),
    saveSettings: vi.fn(),
  },
}));

describe("Navbar", () => {
  it("renders the Caviardeul title link", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText("Caviardeul")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText("Archives")).toBeInTheDocument();
    expect(screen.getByText("Partie personnalisée")).toBeInTheDocument();
    expect(screen.getByText("À propos")).toBeInTheDocument();
  });

  it("renders Options menu item", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText("Options")).toBeInTheDocument();
  });

  it("toggles settings modal when Options is clicked", async () => {
    renderWithProviders(<Navbar />);

    await userEvent.click(screen.getByText("Options"));

    // Settings modal should now be visible
    expect(
      screen.getByText("Activer le mode sombre"),
    ).toBeInTheDocument();
  });

  it("toggles hamburger menu", async () => {
    const { container } = renderWithProviders(<Navbar />);

    const hamburger = container.querySelector(".hamburger")!;
    expect(hamburger).not.toHaveClass("active");

    await userEvent.click(hamburger);
    expect(hamburger).toHaveClass("active");
  });
});
