import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import ArticleContainer from "@caviardeul/components/article";
import GameInformation from "@caviardeul/components/gameInformation";
import HistoryContainer from "@caviardeul/components/history";
import Input from "@caviardeul/components/input";
import Loader from "@caviardeul/components/loader";
import { Article, History } from "@caviardeul/types";
import {
  countOccurrences,
  isCommonWord,
  isWord,
  splitWords,
  standardizeText,
} from "@caviardeul/utils/caviarding";
import { GameContext } from "@caviardeul/utils/game";
import SaveManagement from "@caviardeul/utils/save";
import { UserContext } from "@caviardeul/utils/user";

const Game: React.FC<{
  article: Article;
  pageId?: string;
  custom: boolean;
}> = ({ article: articleObject, pageId, custom }) => {
  const archive = !!pageId && !custom;
  const [isLoading, setIsLoading] = useState(true);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<[string, number] | null>(null);
  const [history, setHistory] = useState<History>([]);
  const [isOver, setIsOver] = useState(false);
  const [saveLoaded, setSaveLoaded] = useState(false);
  const loading = isLoading || !saveLoaded;

  const article = articleObject.article;
  const title = articleObject.title;
  const pageName = articleObject.pageName;
  const puzzleId = articleObject.puzzleId;

  const { saveScore } = useContext(UserContext);

  const titleWords = useMemo(() => {
    return splitWords(title).filter(isWord).map(standardizeText);
  }, [title]);

  const standardizedArticle = useMemo(() => {
    return standardizeText(article) || "";
  }, [article]);

  const handleContentLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

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
  useEffect((): void => {
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
    if (!custom && puzzleId > 0 && saveLoaded && isOver) {
      const nbAttempts = history.length;
      const nbCorrect = history.filter(
        ([, nbOccurrences]) => nbOccurrences > 0
      ).length;
      saveScore(puzzleId, nbAttempts, nbCorrect);
    }
  }, [custom, puzzleId, title, history, isOver, saveLoaded, saveScore]);

  return (
    <main id="game">
      <GameContext.Provider
        value={{ history, words: revealedWords, isOver, selection }}
      >
        <div className="left-container">
          {saveLoaded && (
            <ArticleContainer
              customGame={custom}
              article={article}
              reveal={isOver}
              onContentLoaded={handleContentLoaded}
            />
          )}
          {isLoading && <Loader />}
          <Input onConfirm={handleReveal} disabled={isOver} />
        </div>
        <div className="right-container">
          {isOver && (
            <GameInformation
              archive={archive}
              pageId={pageId}
              history={history}
              pageName={pageName}
              puzzleId={puzzleId}
            />
          )}
          {!loading && (
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
