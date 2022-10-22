import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import ArticleContainer from "@caviardeul/components/article";
import CustomGameBanner from "@caviardeul/components/customGameBanner";
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
import { SettingsContext } from "@caviardeul/utils/settings";

const Game: React.FC<{
  article: Article;
}> = ({ article }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<[string, number] | null>(null);
  const [history, setHistory] = useState<History>([]);
  const [isOver, setIsOver] = useState(false);
  const [saveLoaded, setSaveLoaded] = useState(false);
  const loading = isLoading || !saveLoaded;

  const { articleId, archive, custom, pageName, content } = article;
  const { settings } = useContext(SettingsContext);  
  const { saveScore } = useContext(UserContext);

  const titleWords = useMemo(() => {
    return splitWords(pageName).filter(isWord).map(standardizeText);
  }, [pageName]);

  const standardizedArticle = useMemo(() => {
    return standardizeText(content) || "";
  }, [content]);

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

      const { count: nbOccurrences, extra } = countOccurrences(
        content,
        standardizedArticle,
        word,
        settings?.guessWithPrefix ?? false,
      );

      const newRevealedWords = revealedWords.add(standardizedWord);
      Object.keys(extra).forEach((word) => newRevealedWords.add(word));

      setRevealedWords(new Set(newRevealedWords));
      setHistory((prev) => [
        ...prev,
        [standardizedWord, nbOccurrences],
        ...Object.entries(extra).map<[ string, number ]>((e) => ([ e[0], e[1] ])) ]);
    },
    [
      revealedWords,
      isOver,
      selection,
      handleChangeSelection,
      content,
      standardizedArticle,
      settings,
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
    const savedHistory = SaveManagement.loadProgress(
      articleId,
      archive,
      custom
    );
    if (savedHistory) {
      setHistory(savedHistory);
      setRevealedWords(new Set(savedHistory.map(([word]) => word)));
    }
    setSaveLoaded(true);
  }, [archive, custom, articleId]);

  // Save progress and history
  useEffect((): void => {
    if (saveLoaded) {
      SaveManagement.saveProgress(articleId, history, archive, custom);
    }
  }, [articleId, archive, custom, history, saveLoaded]);

  useEffect((): void => {
    if (saveLoaded && isOver) {
      const nbAttempts = history.length;
      const nbCorrect = history.filter(
        ([, nbOccurrences]) => nbOccurrences > 0
      ).length;
      saveScore(articleId, custom, nbAttempts, nbCorrect);
    }
  }, [custom, articleId, history, isOver, saveLoaded, saveScore]);

  return (
    <main id="game">
      <GameContext.Provider
        value={{ history, words: revealedWords, isOver, selection }}
      >
        <div className="left-container">
          {custom && <CustomGameBanner safetyLevel={article.safety} />}
          {saveLoaded && (
            <ArticleContainer
              custom={custom}
              content={content}
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
              articleId={articleId}
              archive={archive}
              custom={custom}
              history={history}
              pageName={pageName}
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
