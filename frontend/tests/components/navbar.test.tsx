import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import Navbar from "@caviardeul/components/navbar";

import { renderWithProviders } from "../helpers/renderWithProviders";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
}));

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

  it("renders a link to the settings page", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("link", { name: "Paramètres" })).toHaveAttribute(
      "href",
      "/parametres",
    );
  });

  it("marks the current page link as active", () => {
    vi.mocked(usePathname).mockReturnValue("/archives/12");
    renderWithProviders(<Navbar />);
    expect(screen.getByText("Archives").closest("li")).toHaveClass("active");
    expect(screen.getByText("À propos").closest("li")).not.toHaveClass(
      "active",
    );
  });

  it("toggles hamburger menu", async () => {
    const { container } = renderWithProviders(<Navbar />);

    const hamburger = container.querySelector(".hamburger")!;
    expect(hamburger).not.toHaveClass("active");

    await userEvent.click(hamburger);
    expect(hamburger).toHaveClass("active");
  });
});
