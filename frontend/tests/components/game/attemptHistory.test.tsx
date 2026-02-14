import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AttemptHistory from "@caviardeul/components/game/attemptHistory";
import { GameHistory } from "@caviardeul/types";

import { renderWithProviders } from "../../helpers/renderWithProviders";

describe("AttemptHistory", () => {
  const history: GameHistory = [
    ["tour", 3],
    ["paris", 0],
    ["eiffel", 2],
  ];

  it("renders history entries", () => {
    renderWithProviders(<AttemptHistory />, {
      gameContext: { history, isOver: false },
    });
    expect(screen.getByText("tour")).toBeInTheDocument();
    expect(screen.getByText("paris")).toBeInTheDocument();
    expect(screen.getByText("eiffel")).toBeInTheDocument();
  });

  it("displays occurrence counts", () => {
    renderWithProviders(<AttemptHistory />, {
      gameContext: { history, isOver: false },
    });
    // Each row has: index, word, count. Check count column cells.
    const rows = screen.getAllByRole("row").slice(1); // skip header
    const counts = rows.map((row) => {
      const cells = row.querySelectorAll("td");
      return cells[2]?.textContent;
    });
    expect(counts).toContain("3");
    expect(counts).toContain("0");
    expect(counts).toContain("2");
  });

  it("shows entries in reverse order (latest first)", () => {
    renderWithProviders(<AttemptHistory />, {
      gameContext: { history, isOver: false },
    });
    const rows = screen.getAllByRole("row").slice(1); // skip header
    expect(rows[0]).toHaveTextContent("eiffel");
    expect(rows[1]).toHaveTextContent("paris");
    expect(rows[2]).toHaveTextContent("tour");
  });

  it("calls updateSelection on row click", async () => {
    const updateSelection = vi.fn();
    renderWithProviders(<AttemptHistory />, {
      gameContext: { history, isOver: false, updateSelection },
    });

    await userEvent.click(screen.getByText("tour"));
    expect(updateSelection).toHaveBeenCalledWith("tour");
  });

  it("renders nothing when game is over and history is empty", () => {
    const { container } = renderWithProviders(<AttemptHistory />, {
      gameContext: { history: [], isOver: true },
    });
    expect(container.querySelector(".guess-history")).not.toBeInTheDocument();
  });

  it("renders table headers", () => {
    renderWithProviders(<AttemptHistory />, {
      gameContext: { history, isOver: false },
    });
    expect(screen.getByText("Essai")).toBeInTheDocument();
    expect(screen.getByText("Occurrences")).toBeInTheDocument();
  });

  it("highlights selected word", () => {
    renderWithProviders(<AttemptHistory />, {
      gameContext: { history, isOver: false, selection: ["tour", 0] },
    });
    const rows = screen.getAllByRole("row").slice(1);
    // "tour" is the last displayed row (reversed from index 0)
    const tourRow = rows.find((row) => row.textContent?.includes("tour"));
    expect(tourRow?.className).toContain("selected");
  });
});
