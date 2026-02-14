import { describe, expect, it } from "vitest";

import WordContainer from "@caviardeul/components/game/word";

import { renderWithProviders } from "../../helpers/renderWithProviders";

describe("WordContainer", () => {
  it("renders caviarded block when word is not revealed and game not over", () => {
    const { container } = renderWithProviders(<WordContainer word="tour" />, {
      gameContext: {
        isOver: false,
        revealedWords: new Set(),
      },
    });
    const caviarded = container.querySelector(".caviarded");
    expect(caviarded).toBeInTheDocument();
    expect(caviarded?.textContent).toBe("████");
  });

  it("renders actual text when word is revealed", () => {
    const { container } = renderWithProviders(<WordContainer word="tour" />, {
      gameContext: {
        isOver: false,
        revealedWords: new Set(["tour"]),
      },
    });
    expect(container.querySelector(".caviarded")).not.toBeInTheDocument();
    expect(container.textContent).toBe("tour");
  });

  it("renders all words when game is over", () => {
    const { container } = renderWithProviders(<WordContainer word="secret" />, {
      gameContext: {
        isOver: true,
        revealedWords: new Set(),
      },
    });
    expect(container.querySelector(".caviarded")).not.toBeInTheDocument();
    expect(container.textContent).toBe("secret");
  });

  it("applies selected class when word matches selection", () => {
    const { container } = renderWithProviders(<WordContainer word="tour" />, {
      gameContext: {
        isOver: false,
        revealedWords: new Set(["tour"]),
        selection: ["tour", 0],
      },
    });
    expect(container.querySelector(".selected")).toBeInTheDocument();
  });

  it("does not apply selected class when word does not match selection", () => {
    const { container } = renderWithProviders(<WordContainer word="tour" />, {
      gameContext: {
        isOver: false,
        revealedWords: new Set(["tour"]),
        selection: ["paris", 0],
      },
    });
    expect(container.querySelector(".selected")).not.toBeInTheDocument();
  });

  it("shows caviarded blocks with correct length", () => {
    const { container } = renderWithProviders(
      <WordContainer word="elephant" />,
      {
        gameContext: {
          isOver: false,
          revealedWords: new Set(),
        },
      },
    );
    const caviarded = container.querySelector(".caviarded");
    expect(caviarded?.textContent).toBe("████████");
    expect(caviarded?.getAttribute("data-word-length")).toBe("8");
  });
});
