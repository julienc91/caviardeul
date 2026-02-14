import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GameInformation from "@caviardeul/components/game/gameInformation";

import { createArticle } from "../../helpers/fixtures";
import { renderWithProviders } from "../../helpers/renderWithProviders";

describe("GameInformation", () => {
  it("renders nothing when game is not over", () => {
    const { container } = renderWithProviders(<GameInformation />, {
      gameContext: { isOver: false, article: createArticle() },
    });
    expect(
      container.querySelector(".game-information"),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when article is undefined", () => {
    const { container } = renderWithProviders(<GameInformation />, {
      gameContext: { isOver: true, article: undefined },
    });
    expect(
      container.querySelector(".game-information"),
    ).not.toBeInTheDocument();
  });

  it("shows bravo message when game is over", () => {
    renderWithProviders(<GameInformation />, {
      gameContext: {
        isOver: true,
        article: createArticle(),
        history: [
          ["tour", 3],
          ["eiffel", 2],
        ],
      },
    });
    expect(screen.getByText("Bravo !")).toBeInTheDocument();
  });

  it("shows number of attempts", () => {
    renderWithProviders(<GameInformation />, {
      gameContext: {
        isOver: true,
        article: createArticle(),
        history: [
          ["tour", 3],
          ["eiffel", 2],
          ["paris", 0],
        ],
      },
    });
    expect(screen.getByText(/3 coups/)).toBeInTheDocument();
  });

  it("shows Wikipedia link", () => {
    const article = createArticle({ pageName: "Tour_Eiffel" });
    renderWithProviders(<GameInformation />, {
      gameContext: {
        isOver: true,
        article,
        history: [["tour", 3]],
      },
    });
    const link = screen.getByText("sur Wikipédia");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://fr.wikipedia.org/wiki/Tour_Eiffel",
    );
  });

  it("uses userScore when available", () => {
    renderWithProviders(<GameInformation />, {
      gameContext: {
        isOver: true,
        article: createArticle(),
        history: [
          ["a", 1],
          ["b", 0],
          ["c", 1],
        ],
        userScore: { nbAttempts: 5, nbCorrect: 3 },
      },
    });
    expect(screen.getByText(/5 coups/)).toBeInTheDocument();
  });

  it("shows 'come back tomorrow' for daily non-archive article", () => {
    renderWithProviders(<GameInformation />, {
      gameContext: {
        isOver: true,
        article: createArticle({ archive: false, custom: false }),
        history: [["tour", 3]],
      },
    });
    expect(
      screen.getByText(/Revenez demain pour une nouvelle page/),
    ).toBeInTheDocument();
  });

  it("shows custom game link for custom articles", () => {
    renderWithProviders(<GameInformation />, {
      gameContext: {
        isOver: true,
        article: createArticle({ custom: true }),
        history: [["tour", 3]],
      },
    });
    expect(screen.getByText("partie personnalisée")).toBeInTheDocument();
  });
});
