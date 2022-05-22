import React, { useCallback, useMemo, useState } from "react";
import { History } from "../types";
import ArticleContainer, { WordContainer } from "./article";
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

const Game: React.FC = () => {
  const { data, isLoading, error } = useArticle();
  const article = data?.article ?? "";
  const title = data?.title ?? "";

  const [revealedWords, setRevealedWords] = useState<Set<string>>(
    new Set(Array.from(commonWords))
  );
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [history, setHistory] = useState<History>([]);
  const [isOver, setIsOver] = useState(false);
  const [caviardedWordContainers] = useState<React.RefObject<WordContainer>[]>(
    []
  );

  const titleWords = useMemo(() => {
    return splitWords(title)
      .filter(isWord)
      .map((word) => word.toLocaleLowerCase());
  }, [title]);

  const handleCaviadedWordContainerAdded = useCallback(
    (ref: React.RefObject<WordContainer>) => {
      caviardedWordContainers.push(ref);
    },
    [caviardedWordContainers]
  );

  const handleReveal = useCallback(
    (word: string) => {
      word = word.toLocaleLowerCase();
      handleUnselect();

      if (!word.length || isOver || commonWords.has(word)) {
        return;
      }

      setSelectedWord(word);
      if (revealedWords.has(word)) {
        handleSelect(word);
        return;
      }

      const nbOccurrences = countOccurrences(article, word);
      const newRevealedWords = revealedWords.add(word);
      setRevealedWords(new Set(newRevealedWords));
      setHistory((prev) => [...prev, [word, nbOccurrences]]);

      caviardedWordContainers.forEach((ref) => {
        if (ref.current?.getWord()?.toLocaleLowerCase() === word) {
          ref.current.reveal();
        }
      });

      if (titleWords.every((titleWord) => newRevealedWords.has(titleWord))) {
        setIsOver(true);
      }
    },
    [titleWords, revealedWords, article, isOver]
  );

  const handleUnselect = useCallback(() => {
    caviardedWordContainers
      .filter((container) => container.current?.getSelected())
      .forEach((ref) => ref.current?.unselect());
  }, [caviardedWordContainers]);

  const handleSelect = useCallback(
    (word: string) => {
      caviardedWordContainers
        .filter(
          (container) =>
            container.current?.getWord().toLocaleLowerCase() === word
        )
        .forEach((ref) => ref.current?.select());
    },
    [caviardedWordContainers]
  );

  const handleSelectWord = useCallback(
    (word: string) => {
      setSelectedWord(word);
      handleUnselect();
      if (word.length) {
        handleSelect(word);
      }
    },
    [handleUnselect, handleSelect]
  );

  return (
    <main id="game">
      <div className="left-container">
        {!isLoading && !error && (
          <ArticleContainer
            article={article}
            reveal={isOver}
            onCaviardedWordContainerAdded={handleCaviadedWordContainerAdded}
          />
        )}
        {isLoading && <Loader />}
        <Input onConfirm={handleReveal} disabled={isOver} />
      </div>
      <div className="right-container">
        <HistoryContainer
          history={history}
          selectedWord={selectedWord}
          onSelectionChange={handleSelectWord}
        />
      </div>
    </main>
  );
};

export default Game;
