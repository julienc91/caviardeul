import { Article, GameHistory } from "@caviardeul/types";

/**
 * Represents the current state of the game.
 */
export interface GameState {
  revealedWords: Set<string>;
  history: GameHistory;
  selection: [string, number] | null;
  isOver: boolean;
}

/**
 * Represents a player in the game.
 */
export interface Player {
  id: string;
  name: string;
}

/**
 * Callback type for state change listeners.
 */
export type StateChangeListener = (state: GameState) => void;

/**
 * Abstract strategy interface for different game modes (single player, multiplayer, etc.)
 *
 * This interface defines the contract for game logic implementations.
 * Different game modes can implement this interface to provide their own
 * game mechanics while reusing the same UI components.
 */
export interface GameStrategy {
  /**
   * Get the current game state.
   */
  getState(): GameState;

  /**
   * Get the current player (the one who should play now).
   * Returns null if there's no specific current player.
   */
  getCurrentPlayer(): Player | null;

  /**
   * Check if the current player can make a move.
   */
  canCurrentPlayerPlay(): boolean;

  /**
   * Make an attempt with the given word.
   * This method should update the game state accordingly.
   */
  makeAttempt(word: string): void;

  /**
   * Update the current selection.
   */
  updateSelection(word: string | null): void;

  /**
   * Initialize the game strategy with the given article.
   * This method should load any necessary state (from local storage, server, etc.)
   * and prepare the game to be played.
   */
  initialize(article: Article): Promise<void>;

  /**
   * Check if the game is over.
   */
  checkGameOver(): boolean;

  /**
   * Called when the game ends.
   * This method should handle any cleanup or final actions (e.g., save score).
   */
  onGameEnd(): Promise<void>;

  /**
   * Subscribe to state changes.
   * Returns an unsubscribe function.
   */
  onStateChange(callback: StateChangeListener): () => void;
}
