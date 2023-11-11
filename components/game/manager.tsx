import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { saveGameScore } from "@caviardeul/lib/queries";
import { Article, GameHistory } from "@caviardeul/types";
import {
  buildAlternatives,
  countOccurrences,
  isCommonWord,
  isWord,
  splitWords,
  standardizeText,
} from "@caviardeul/utils/caviarding";
import { getSelectedWord } from "@caviardeul/utils/game";
import SaveManagement from "@caviardeul/utils/save";

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
  // callbacks
  updateSelection: (word: string | null) => void;
  makeAttempt: (word: string) => void;
}>({
  isOver: false,
  canPlay: false,
  selection: null,
  revealedWords: new Set(),
  history: [],
  userScore: undefined,
  updateSelection: () => null,
  makeAttempt: () => null,
});

export const Manager: React.FC<{
  article: Article;
  userScore?: UserScore;
  children: React.ReactNode;
}> = ({ article, userScore, children }) => {
  const [saveLoaded, setSaveLoaded] = useState(false);
  const [selection, setSelection] = useState<[string, number] | null>(null);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<GameHistory>([]);
  const [isOver, setIsOver] = useState(!!userScore);
  const [canPlay, setCanPlay] = useState(false);

  const { pageName, content } = article;

  const titleWords = useMemo(
    () => splitWords(pageName).filter(isWord).map(standardizeText),
    [pageName],
  );

  /**
   * Send the final score to the server.
   */
  useEffect(() => {
    if (!isOver || !!userScore) {
      return;
    }
    const nbAttempts = history.length;
    const nbCorrect = history.filter(
      ([, nbOccurrences]) => nbOccurrences > 0,
    ).length;
    saveGameScore(article, nbAttempts, nbCorrect);
  }, [isOver, userScore, article, history]);

  /**
   * Check if the game is over.
   */
  useEffect(() => {
    if (
      !isOver &&
      titleWords.length &&
      titleWords.every(
        (titleWord) => revealedWords.has(titleWord) || isCommonWord(titleWord),
      )
    ) {
      setIsOver(true);
      setSelection(null);
      setCanPlay(false);
    }
  }, [isOver, revealedWords, titleWords]);

  /**
   * Update the current selection.
   */
  const updateSelection = useCallback(
    (word: string | null) => {
      if (!word || !word.length) {
        setSelection(null);
      } else {
        word = getSelectedWord(word, history);
        if (!selection) {
          setSelection([word, 0]);
        } else {
          const [selectedWord, index] = selection;
          if (selectedWord !== word) {
            setSelection([word, 0]);
          } else {
            setSelection([word, index + 1]);
          }
        }
      }
    },
    [selection, history],
  );

  /**
   * Update saved game
   */
  useEffect(() => {
    if (saveLoaded) {
      SaveManagement.saveProgress(article, history);
    }
  }, [saveLoaded, article, history]);

  /**
   * Add a new word to the attempt history.
   */
  const makeAttempt = useCallback(
    (word: string) => {
      if (!canPlay || isCommonWord(word)) {
        setSelection(null);
        return;
      } else if (!word.length) {
        if (selection) {
          const [selectedWord, index] = selection;
          setSelection([selectedWord, index + 1]);
        } else {
          setSelection(null);
        }
        return;
      }

      word = standardizeText(word);
      setSelection([
        word,
        selection && word === selection[0] ? selection[1] + 1 : 0,
      ]);
      if (revealedWords.has(word)) {
        return;
      }

      const nbOccurrences = countOccurrences(word, content);
      const newRevealedWords = new Set(revealedWords);
      newRevealedWords.add(word);
      buildAlternatives(word).forEach((alternative) =>
        newRevealedWords.add(alternative),
      );
      setRevealedWords(newRevealedWords);
      setHistory((prev) => [...prev, [word, nbOccurrences]]);
    },
    [canPlay, content, revealedWords, selection],
  );

  /**
   * Initialize the game from the save file, if it exists
   */
  useEffect(() => {
    if (saveLoaded) {
      return;
    }

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
        newHistory.push([word, countOccurrences(word, content)]);
      });

      setHistory(newHistory);
      setRevealedWords(newRevealedWords);
    }

    setSaveLoaded(true);
    setCanPlay(!isOver);
  }, [isOver, saveLoaded, article, content]);

  return (
    <GameContext.Provider
      value={{
        article,
        selection,
        revealedWords,
        history,
        isOver,
        canPlay,
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
