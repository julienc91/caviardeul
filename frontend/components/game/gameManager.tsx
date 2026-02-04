import React, { useCallback, useEffect, useState } from "react";
import { createContext } from "use-context-selector";

import { Article, GameHistory } from "@caviardeul/types";
import { GameStrategy, Player } from "@caviardeul/components/game/strategies/gameStrategy";

type UserScore = {
  nbAttempts: number;
  nbCorrect: number;
};

export const GameContext = createContext<{
  article?: Article;
  isOver: boolean;
  selection: [string, number] | null;
  revealedWords: Set<string>;
  history: GameHistory;
  userScore?: UserScore;
  canPlay: boolean;
  currentPlayer: Player | null;
  // callbacks
  updateSelection: (_word: string | null) => void;
  makeAttempt: (_word: string) => void;
}>({
  isOver: false,
  canPlay: false,
  selection: null,
  revealedWords: new Set(),
  history: [],
  userScore: undefined,
  currentPlayer: null,
  updateSelection: () => null,
  makeAttempt: () => null,
});

export const Manager: React.FC<{
  article: Article;
  strategy: GameStrategy;
  userScore?: UserScore;
  children: React.ReactNode;
}> = ({ article, strategy, userScore, children }) => {
  const [selection, setSelection] = useState<[string, number] | null>(null);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<GameHistory>([]);
  const [isOver, setIsOver] = useState(!!userScore);
  const [canPlay, setCanPlay] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [initialized, setInitialized] = useState(false);

  /**
   * Initialize the game strategy and subscribe to state changes.
   */
  useEffect(() => {
    let mounted = true;

    const initializeGame = async () => {
      await strategy.initialize(article);

      if (!mounted) return;

      // Get initial state
      const state = strategy.getState();
      setSelection(state.selection);
      setRevealedWords(state.revealedWords);
      setHistory(state.history);
      setIsOver(state.isOver);
      setCanPlay(strategy.canCurrentPlayerPlay());
      setCurrentPlayer(strategy.getCurrentPlayer());
      setInitialized(true);
    };

    initializeGame();

    // Subscribe to state changes from the strategy
    const unsubscribe = strategy.onStateChange((state) => {
      if (!mounted) return;

      setSelection(state.selection);
      setRevealedWords(state.revealedWords);
      setHistory(state.history);
      setIsOver(state.isOver);
      setCanPlay(strategy.canCurrentPlayerPlay());
      setCurrentPlayer(strategy.getCurrentPlayer());
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [strategy, article]);

  /**
   * Update the current selection by delegating to the strategy.
   */
  const updateSelection = useCallback(
    (word: string | null) => {
      if (!initialized) return;
      strategy.updateSelection(word);
    },
    [strategy, initialized],
  );

  /**
   * Make an attempt by delegating to the strategy.
   */
  const makeAttempt = useCallback(
    (word: string) => {
      if (!initialized) return;
      strategy.makeAttempt(word);
    },
    [strategy, initialized],
  );

  return (
    <GameContext.Provider
      value={{
        article,
        selection,
        revealedWords,
        history,
        isOver,
        canPlay,
        currentPlayer,
        userScore,
        updateSelection,
        makeAttempt,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default Manager;
