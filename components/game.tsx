import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { History } from "../types";
import ArticleContainer from "./article";
import Input from "./input";
import {
  countOccurrences,
  isCommonWord,
  isWord,
  splitWords,
  standardizeText,
} from "../utils/caviarding";
import HistoryContainer from "./history";
import { useArticle } from "../hooks/article";
import Loader from "./loader";
import SaveManagement from "../utils/save";
import { GameContext } from "../utils/game";
import GameInformation from "./gameInformation";

const Game: React.FC<{ pageId?: string }> = ({ pageId }) => {
  const custom = !!pageId;
  const { data, isLoading, error } = useArticle(pageId);
  const article = isLoading ? "" : data?.article ?? "";
  const title = isLoading ? "" : data?.title ?? "";
  const pageName = isLoading ? "" : data?.pageName ?? "";
  const puzzleId = isLoading ? -1 : data?.puzzleId ?? -1;

  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<[string, number] | null>(null);
  const [history, setHistory] = useState<History>([]);
  const [isOver, setIsOver] = useState(false);
  const [saveLoaded, setSaveLoaded] = useState(false);

  const titleWords = useMemo(() => {
    return splitWords(title).filter(isWord).map(standardizeText);
  }, [title]);

  const standardizedArticle = useMemo(() => {
    return standardizeText(article);
  }, [article]);

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
      if (isOver || isCommonWord(word)) {
        handleChangeSelection(null);
        return;
      }

      word = word.toLocaleLowerCase();
      const standardizedWord = standardizeText(word);
      if (!word.length) {
        if (selection) {
          const [selectedWord, _] = selection;
          handleChangeSelection(selectedWord);
        } else {
          handleChangeSelection(null);
        }
        return;
      }

      handleChangeSelection(standardizedWord);
      if (revealedWords.has(standardizedWord)) {
        return;
      }

      const nbOccurrences = countOccurrences(
        article,
        standardizedArticle,
        word
      );
      const newRevealedWords = revealedWords.add(standardizedWord);
      setRevealedWords(new Set(newRevealedWords));
      setHistory((prev) => [...prev, [standardizedWord, nbOccurrences]]);
    },
    [
      revealedWords,
      isOver,
      selection,
      handleChangeSelection,
      article,
      standardizedArticle,
    ]
  );

  // Check if game is over
  useLayoutEffect(() => {
    if (
      !isOver &&
      titleWords.length &&
      titleWords.every(
        (titleWord) => revealedWords.has(titleWord) || isCommonWord(titleWord)
      )
    ) {
      setIsOver(true);
    }
  }, [isOver, titleWords, revealedWords]);

  // Scroll to selection
  useEffect(() => {
    if (selection) {
      const [_, index] = selection;
      const articleContainer =
        document.querySelector<HTMLElement>(".article-container");
      const elements =
        articleContainer?.querySelectorAll<HTMLElement>(".word.selected");
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
  useLayoutEffect((): void => {
    if (puzzleId >= 0) {
      const savedHistory = SaveManagement.loadProgress(puzzleId, pageId);
      if (savedHistory) {
        setHistory(savedHistory);
        setRevealedWords(new Set(savedHistory.map(([word]) => word)));
      }
      setSaveLoaded(true);
    }
  }, [custom, puzzleId, pageId]);

  // Save progress and history
  useEffect((): void => {
    if (puzzleId >= 0 && saveLoaded) {
      SaveManagement.saveProgress(puzzleId, history, pageId);
    }
  }, [custom, puzzleId, pageId, history, saveLoaded]);

  useEffect((): void => {
    if (!custom && puzzleId > 0 && saveLoaded) {
      SaveManagement.saveHistory(puzzleId, title, history, isOver);
    }
  }, [custom, puzzleId, title, history, isOver, saveLoaded]);

  if (error) {
    return (
      <main>
        <div className="error">{error.toString()}</div>
      </main>
    );
  }

  return (
    <main id="game">
      <GameContext.Provider
        value={{ history, words: revealedWords, isOver, selection }}
      >
        <div className="left-container">
          {!isLoading && !error && (
            <ArticleContainer
              customGame={custom}
              article={article}
              reveal={isOver}
            />
          )}
          {(isLoading || (!saveLoaded && !error)) && <Loader />}
          <Input onConfirm={handleReveal} disabled={isOver} />
        </div>
        <div className="right-container">
          {isOver && (
            <GameInformation
              pageId={pageId}
              history={history}
              pageName={pageName}
              puzzleId={puzzleId}
            />
          )}
          {!isLoading && (
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
