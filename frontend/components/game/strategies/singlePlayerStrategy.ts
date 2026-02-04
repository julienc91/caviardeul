import { Article, GameHistory } from "@caviardeul/types";
import {
  buildAlternatives,
  countOccurrences,
  isCommonWord,
  isWord,
  splitWords,
  standardizeText,
  stripHtmlTags,
} from "@caviardeul/utils/caviarding";
import { getSelectedWord } from "@caviardeul/utils/game";
import SaveManagement from "@caviardeul/utils/save";
import { saveGameScore } from "@caviardeul/lib/queries";
import {
  GameState,
  GameStrategy,
  Player,
  StateChangeListener,
} from "./gameStrategy";

/**
 * Single player game strategy implementation.
 *
 * This strategy implements the classic single-player mode where:
 * - One player tries to guess all words in the article title
 * - Progress is saved locally
 * - The player can always play (until game is over)
 * - Game ends when all non-common title words are revealed
 */
export class SinglePlayerStrategy implements GameStrategy {
  private state: GameState;
  private listeners: Set<StateChangeListener> = new Set();
  private article!: Article;
  private escapedContent!: string;
  private titleWords!: string[];
  private hasScore: boolean;

  constructor(hasScore = false) {
    this.state = {
      revealedWords: new Set(),
      history: [],
      selection: null,
      isOver: hasScore,
    };
    this.hasScore = hasScore;
  }

  getState(): GameState {
    return this.state;
  }

  getCurrentPlayer(): Player {
    return {
      id: "local",
      name: "You",
    };
  }

  canCurrentPlayerPlay(): boolean {
    return !this.state.isOver;
  }

  updateSelection(word: string | null): void {
    if (!word || !word.length) {
      this.state.selection = null;
    } else {
      word = getSelectedWord(word, this.state.history);
      if (!this.state.selection) {
        this.state.selection = [word, 0];
      } else {
        const [selectedWord, index] = this.state.selection;
        if (selectedWord !== word) {
          this.state.selection = [word, 0];
        } else {
          this.state.selection = [word, index + 1];
        }
      }
    }
    this.notifyListeners();
  }

  makeAttempt(word: string): void {
    if (!this.canCurrentPlayerPlay() || isCommonWord(word)) {
      this.state.selection = null;
      this.notifyListeners();
      return;
    }

    if (!word.length) {
      if (this.state.selection) {
        const [selectedWord, index] = this.state.selection;
        this.state.selection = [selectedWord, index + 1];
      } else {
        this.state.selection = null;
      }
      this.notifyListeners();
      return;
    }

    word = standardizeText(word);
    this.state.selection = [
      word,
      this.state.selection && word === this.state.selection[0]
        ? this.state.selection[1] + 1
        : 0,
    ];

    if (this.state.revealedWords.has(word)) {
      this.notifyListeners();
      return;
    }

    const nbOccurrences = countOccurrences(word, this.escapedContent);
    const newRevealedWords = new Set(this.state.revealedWords);
    newRevealedWords.add(word);
    buildAlternatives(word).forEach((alternative) =>
      newRevealedWords.add(alternative),
    );

    this.state.revealedWords = newRevealedWords;
    this.state.history = [...this.state.history, [word, nbOccurrences]];

    // Save progress locally
    SaveManagement.saveProgress(this.article, this.state.history);

    this.notifyListeners();

    // Check if game is over after this attempt
    if (this.checkGameOver()) {
      this.state.isOver = true;
      this.state.selection = null;
      this.notifyListeners();
      this.onGameEnd();
    }
  }

  async initialize(article: Article): Promise<void> {
    this.article = article;
    this.escapedContent = stripHtmlTags(article.content);
    this.titleWords = splitWords(article.pageName)
      .filter(isWord)
      .map(standardizeText);

    // Load saved progress if available
    const savedHistory = SaveManagement.loadProgress(article);
    if (savedHistory) {
      const newHistory: GameHistory = [];
      const newRevealedWords = new Set<string>();

      savedHistory.forEach(([word]) => {
        word = standardizeText(word);
        newRevealedWords.add(word);
        buildAlternatives(word).forEach((alternative) =>
          newRevealedWords.add(alternative),
        );
        newHistory.push([word, countOccurrences(word, this.escapedContent)]);
      });

      this.state.history = newHistory;
      this.state.revealedWords = newRevealedWords;
    }

    // Check if game was already over (from loaded state)
    if (this.checkGameOver()) {
      this.state.isOver = true;
      this.state.selection = null;
    }

    this.notifyListeners();
  }

  checkGameOver(): boolean {
    if (this.state.isOver) {
      return true;
    }

    return (
      this.titleWords.length > 0 &&
      this.titleWords.every(
        (titleWord) =>
          this.state.revealedWords.has(titleWord) || isCommonWord(titleWord),
      )
    );
  }

  async onGameEnd(): Promise<void> {
    // Only save score if the game wasn't already scored
    if (!this.hasScore) {
      const nbAttempts = this.state.history.length;
      const nbCorrect = this.state.history.filter(
        ([, nbOccurrences]) => nbOccurrences > 0,
      ).length;
      await saveGameScore(this.article, nbAttempts, nbCorrect);
    }
  }

  onStateChange(callback: StateChangeListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.state));
  }
}
