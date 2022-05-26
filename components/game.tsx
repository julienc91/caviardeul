import React, { useCallback, useEffect, useMemo, useState } from "react";
import { History } from "../types";
import ArticleContainer from "./article";
import Input from "./input";
import {
  commonWords,
  countOccurrences,
  isWord,
  splitWords,
} from "../utils/caviarding";
import HistoryContainer from "./history";
import { useArticle } from "../api/article";
import Loader from "./loader";
import SaveManagement from "../utils/save";
import { GameContext } from "../utils/game";
import GameInformation from "./gameInformation";

const Game: React.FC = () => {
  const { data, isLoading, error } = useArticle();
  const article = data?.article ?? "";
  const title = data?.title ?? "";
  const pageName = data?.pageName ?? "";

  const [revealedWords, setRevealedWords] = useState<Set<string>>(
    new Set(Array.from(commonWords))
  );
  const [selection, setSelection] = useState<[string, number] | null>(null);
  const [history, setHistory] = useState<History>([]);
  const [isOver, setIsOver] = useState(false);
  const [saveLoaded, setSaveLoaded] = useState(false);

  const titleWords = useMemo(() => {
    return splitWords(title)
      .filter(isWord)
      .map((word) => word.toLocaleLowerCase());
  }, [title]);

  const handleChangeSelection = useCallback(
    (word: string | null) => {
      if (!word || !word.length) {
        setSelection(null);
      } else if (!selection) {
        setSelection([word, 0]);
      } else {
        const [selectedWord, index] = selection;
        if (selectedWord !== word) {
          setSelection([word, 0]);
        } else {
          setSelection([word, index + 1]);
        }
      }
    },
    [selection]
  );

  const handleReveal = useCallback(
    (word: string) => {
      word = word.toLocaleLowerCase();

      if (!word.length || isOver || commonWords.has(word)) {
        handleChangeSelection(null);
        return;
      }

      handleChangeSelection(word);
      if (revealedWords.has(word)) {
        return;
      }

      const nbOccurrences = countOccurrences(article, word);
      const newRevealedWords = revealedWords.add(word);
      setRevealedWords(new Set(newRevealedWords));
      setHistory((prev) => [...prev, [word, nbOccurrences]]);
    },
    [revealedWords, article, isOver, handleChangeSelection]
  );

  // Check if game is over
  useEffect(() => {
    if (
      !isOver &&
      titleWords.length &&
      titleWords.every(
        (titleWord) =>
          revealedWords.has(titleWord) || commonWords.has(titleWord)
      )
    ) {
      setIsOver(true);
    }
  }, [isOver, titleWords, revealedWords]);

  // Scroll to selection
  useEffect(() => {
    if (selection) {
      const [_, index] = selection;
      const articleContainer = document.querySelector(".article-container");
      const elements = articleContainer?.querySelectorAll(".word.selected");
      if (elements?.length) {
        const element = elements[index % elements.length];
        const y = element.offsetTop;
        articleContainer?.scrollTo({
          top: Math.max(y - 100, 0),
          behavior: "smooth",
        });
      }
    }
  }, [selection]);

  // Load history from save
  useEffect((): void => {
    if (title) {
      const savedHistory = SaveManagement.loadProgress(title);
      if (savedHistory) {
        setHistory(savedHistory);
        setRevealedWords(new Set(savedHistory.map(([word]) => word)));
      }
      setSaveLoaded(true);
    }
  }, [title]);

  // Save progress and history
  useEffect((): void => {
    if (title) {
      SaveManagement.saveProgress(title, history);
    }
  }, [title, history]);

  useEffect((): void => {
    if (title) {
      SaveManagement.saveHistory(title, history, isOver);
    }
  }, [title, history, isOver]);

  return (
    <main id="game">
      <GameContext.Provider
        value={{ history, words: revealedWords, isOver, selection }}
      >
        <div className="left-container">
          {!isLoading && !error && (
            <ArticleContainer article={article} reveal={isOver} />
          )}
          {(isLoading || !saveLoaded) && <Loader />}
          <Input onConfirm={handleReveal} disabled={isOver} />
        </div>
        <div className="right-container">
          {isOver ? (
            <GameInformation history={history} pageName={pageName} />
          ) : (
            <HistoryContainer
              history={history}
              selectedWord={selection ? selection[0] : null}
              onSelectionChange={handleChangeSelection}
            />
          )}
        </div>
      </GameContext.Provider>
    </main>
  );
};

export default Game;
