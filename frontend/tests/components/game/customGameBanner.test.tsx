import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import CustomGameBanner from "@caviardeul/components/game/customGameBanner";

describe("CustomGameBanner", () => {
  it("renders nothing for SAFE safety level", () => {
    const { container } = render(<CustomGameBanner safetyLevel="SAFE" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders warning for UNSAFE safety level", () => {
    render(<CustomGameBanner safetyLevel="UNSAFE" />);
    expect(screen.getByText("Mise en garde")).toBeInTheDocument();
    expect(
      screen.getByText(/n'est pas adapté à tous les publics/),
    ).toBeInTheDocument();
  });

  it("renders warning for UNKNOWN safety level", () => {
    render(<CustomGameBanner safetyLevel="UNKNOWN" />);
    expect(screen.getByText("Mise en garde")).toBeInTheDocument();
    expect(
      screen.getByText(/peut ne pas être adapté à tous les publics/),
    ).toBeInTheDocument();
  });

  it("hides banner when close button is clicked", async () => {
    render(<CustomGameBanner safetyLevel="UNSAFE" />);
    expect(screen.getByText("Mise en garde")).toBeInTheDocument();

    await userEvent.click(screen.getByTitle("Masquer"));
    expect(screen.queryByText("Mise en garde")).not.toBeInTheDocument();
  });
});
