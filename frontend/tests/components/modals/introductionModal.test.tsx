import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import IntroductionModal from "@caviardeul/components/modals/introductionModal";

vi.mock("@caviardeul/utils/save", () => ({
  default: {
    getIsTutorialSkipped: vi.fn().mockReturnValue(false),
    setSkipTutorial: vi.fn(),
  },
}));

describe("IntroductionModal", () => {
  it("renders intro text when tutorial not skipped", () => {
    render(<IntroductionModal />);
    expect(screen.getByText("Caviardeul")).toBeInTheDocument();
    expect(
      screen.getByText(/est un jeu de réflexion/),
    ).toBeInTheDocument();
  });

  it("renders 'Commencer' button", () => {
    render(<IntroductionModal />);
    expect(
      screen.getByRole("button", { name: "Commencer" }),
    ).toBeInTheDocument();
  });

  it("calls setSkipTutorial and closes on button click", async () => {
    const { default: SaveManagement } = await import(
      "@caviardeul/utils/save"
    );

    render(<IntroductionModal />);
    await userEvent.click(
      screen.getByRole("button", { name: "Commencer" }),
    );

    expect(SaveManagement.setSkipTutorial).toHaveBeenCalled();
    expect(screen.queryByText("Caviardeul")).not.toBeInTheDocument();
  });

  it("does not render when tutorial is already skipped", async () => {
    const { default: SaveManagement } = await import(
      "@caviardeul/utils/save"
    );
    vi.mocked(SaveManagement.getIsTutorialSkipped).mockReturnValue(true);

    const { container } = render(<IntroductionModal />);
    expect(container.innerHTML).toBe("");
  });
});
