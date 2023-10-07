import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import ArticleContainer from "@caviardeul/components/game/article";
import CustomGameBanner from "@caviardeul/components/game/customGameBanner";
import GameInformation from "@caviardeul/components/game/gameInformation";
import HistoryContainer from "@caviardeul/components/game/history";
import Input from "@caviardeul/components/game/input";
import Loader from "@caviardeul/components/utils/loader";
import { saveGameScore } from "@caviardeul/lib/queries";
import { Article, History } from "@caviardeul/types";
import {
  buildAlternatives,
  countOccurrences,
  isCommonWord,
  isWord,
  splitWords,
  standardizeText,
} from "@caviardeul/utils/caviarding";
import { GameContext, getSelectedWord } from "@caviardeul/utils/game";
import SaveManagement from "@caviardeul/utils/save";
import { SettingsContext, defaultSettings } from "@caviardeul/utils/settings";

const Game: React.FC<{
  article: Article;
  userScore?: { nbAttempts: number; nbCorrect: number };
}> = ({ article, userScore }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<[string, number] | null>(null);
  const [history, setHistory] = useState<History>([]);
  const [isOver, setIsOver] = useState(!!userScore);
  const [saveLoaded, setSaveLoaded] = useState(false);
  const loading = isLoading || !saveLoaded;

  const { articleId, archive, custom, pageName, content } = article;

  const { settings } = useContext(SettingsContext);

  const withCloseAlternatives =
    settings?.withCloseAlternatives ?? defaultSettings.withCloseAlternatives;
  const autoScroll = settings?.autoScroll ?? defaultSettings.autoScroll;

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
      } else {
        word = getSelectedWord(word, history, withCloseAlternatives);
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
    [selection, history, withCloseAlternatives],
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
        content,
        standardizedArticle,
        word,
        withCloseAlternatives,
      );
      const newRevealedWords = revealedWords.add(standardizedWord);
      if (withCloseAlternatives) {
        buildAlternatives(standardizedWord).forEach((alternative) =>
          newRevealedWords.add(alternative),
        );
      }
      setRevealedWords(new Set(newRevealedWords));
      setHistory((prev) => [...prev, [standardizedWord, nbOccurrences]]);
    },
    [
      revealedWords,
      isOver,
      selection,
      handleChangeSelection,
      content,
      standardizedArticle,
      withCloseAlternatives,
    ],
  );

  // Check if game is over
  useLayoutEffect(() => {
    if (
      !isOver &&
      titleWords.length &&
      titleWords.every(
        (titleWord) => revealedWords.has(titleWord) || isCommonWord(titleWord),
      )
    ) {
      setIsOver(true);
    }
  }, [isOver, titleWords, revealedWords]);

  // Scroll to selection
  useEffect(() => {
    if (selection && autoScroll) {
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
  }, [selection, autoScroll]);

  // Load history from save
  useEffect((): void => {
    if (saveLoaded) {
      return;
    }

    const savedHistory = SaveManagement.loadProgress(
      articleId,
      archive,
      custom,
    );
    if (savedHistory) {
      setHistory(
        savedHistory.map(([word]) => [
          word,
          countOccurrences(
            content,
            standardizedArticle,
            word,
            withCloseAlternatives,
          ),
        ]),
      );
      setRevealedWords(
        new Set(
          savedHistory
            .map(([word]) => {
              const res = [word];
              if (withCloseAlternatives) {
                res.push(...buildAlternatives(word));
              }
              return res;
            })
            .flat(),
        ),
      );
    }
    setSaveLoaded(true);
  }, [
    archive,
    content,
    standardizedArticle,
    custom,
    articleId,
    saveLoaded,
    withCloseAlternatives,
  ]);

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
        ([, nbOccurrences]) => nbOccurrences > 0,
      ).length;
      saveGameScore(articleId, custom, nbAttempts, nbCorrect);
    }
  }, [custom, articleId, history, isOver, saveLoaded]);

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
              userScore={userScore}
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
