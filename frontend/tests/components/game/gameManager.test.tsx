import { render, screen, act } from "@testing-library/react";
import React from "react";
import { useContextSelector } from "use-context-selector";
import { describe, expect, it, vi } from "vitest";

import {
  GameContext,
  Manager,
} from "@caviardeul/components/game/gameManager";
import { GameState, GameStrategy, Player, StateChangeListener } from "@caviardeul/components/game/strategies/gameStrategy";

import { createArticle } from "../../helpers/fixtures";

class MockStrategy implements GameStrategy {
  private listeners = new Set<StateChangeListener>();
  private state: GameState = {
    revealedWords: new Set(),
    history: [],
    selection: null,
    isOver: false,
  };

  async initialize(): Promise<void> {
    this.notifyListeners();
  }

  getState(): GameState {
    return this.state;
  }

  getCurrentPlayer(): Player | null {
    return { id: "local", name: "Test" };
  }

  canCurrentPlayerPlay(): boolean {
    return !this.state.isOver;
  }

  makeAttempt = vi.fn();
  updateSelection = vi.fn();

  checkGameOver(): boolean {
    return this.state.isOver;
  }

  async onGameEnd(): Promise<void> {}

  onStateChange(callback: StateChangeListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.state));
  }

  // Test helper to simulate state changes
  _setState(state: Partial<GameState>): void {
    this.state = { ...this.state, ...state };
    this.notifyListeners();
  }
}

const GameStateDisplay: React.FC = () => {
  const isOver = useContextSelector(GameContext, (c) => c.isOver);
  const canPlay = useContextSelector(GameContext, (c) => c.canPlay);
  const history = useContextSelector(GameContext, (c) => c.history);
  return (
    <div>
      <span data-testid="isOver">{String(isOver)}</span>
      <span data-testid="canPlay">{String(canPlay)}</span>
      <span data-testid="historyLength">{history.length}</span>
    </div>
  );
};

describe("Manager (GameManager)", () => {
  it("provides context to children", async () => {
    const strategy = new MockStrategy();
    const article = createArticle();

    await act(async () => {
      render(
        <Manager article={article} strategy={strategy}>
          <GameStateDisplay />
        </Manager>,
      );
    });

    expect(screen.getByTestId("isOver")).toHaveTextContent("false");
    expect(screen.getByTestId("canPlay")).toHaveTextContent("true");
    expect(screen.getByTestId("historyLength")).toHaveTextContent("0");
  });

  it("reflects strategy state changes", async () => {
    const strategy = new MockStrategy();
    const article = createArticle();

    await act(async () => {
      render(
        <Manager article={article} strategy={strategy}>
          <GameStateDisplay />
        </Manager>,
      );
    });

    await act(async () => {
      strategy._setState({
        history: [["test", 1]],
        isOver: true,
      });
    });

    expect(screen.getByTestId("isOver")).toHaveTextContent("true");
    expect(screen.getByTestId("canPlay")).toHaveTextContent("false");
    expect(screen.getByTestId("historyLength")).toHaveTextContent("1");
  });

  it("shows userScore isOver when strategy reports game over", async () => {
    const strategy = new MockStrategy();
    const article = createArticle();

    // Set strategy state to game over before rendering
    strategy._setState({ isOver: true });

    await act(async () => {
      render(
        <Manager
          article={article}
          strategy={strategy}
          userScore={{ nbAttempts: 10, nbCorrect: 5 }}
        >
          <GameStateDisplay />
        </Manager>,
      );
    });

    expect(screen.getByTestId("isOver")).toHaveTextContent("true");
    expect(screen.getByTestId("canPlay")).toHaveTextContent("false");
  });
});
