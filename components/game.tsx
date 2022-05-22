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
  const [selection, setSelection] = useState<[string, number]>(["", 0]);
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

  const handleUnselect = useCallback(() => {
    caviardedWordContainers
      .filter((container) => container.current?.getSelected())
      .forEach((ref) => ref.current?.unselect());
  }, [caviardedWordContainers]);

  const handleSelect = useCallback(() => {
    const [word, index] = selection;
    const containers = caviardedWordContainers.filter(
      (container) => container.current?.getWord().toLocaleLowerCase() === word
    );
    if (containers.length) {
      containers.forEach((ref) => ref.current?.select());
      containers[index % containers.length].current?.scrollTo();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [caviardedWordContainers, selection]);

  const handleReveal = useCallback(
    (word: string) => {
      word = word.toLocaleLowerCase();
      handleUnselect();

      if (!word.length || isOver || commonWords.has(word)) {
        return;
      }

      setSelection([word, 0]);
      if (revealedWords.has(word)) {
        handleSelect();
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
    [
      caviardedWordContainers,
      titleWords,
      revealedWords,
      article,
      isOver,
      handleSelect,
      handleUnselect,
    ]
  );

  const handleChangeSelection = useCallback(
    (word: string) => {
      const [selectedWord, index] = selection;
      if (!word.length) {
        return;
      }
      if (word === selectedWord) {
        setSelection([word, index + 1]);
      } else {
        setSelection([word, 0]);
        handleUnselect();
      }
      handleSelect();
    },
    [handleUnselect, handleSelect, selection]
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
          selectedWord={selection[0]}
          onSelectionChange={handleChangeSelection}
        />
      </div>
    </main>
  );
};

export default Game;
