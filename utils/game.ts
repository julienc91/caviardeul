import React from "react";

import { GameState, History } from "@caviardeul/types";
import { closeAlternativesSuffixes } from "@caviardeul/utils/caviarding";

export const GameContext = React.createContext<GameState>({
  history: [],
  words: new Set(),
  isOver: false,
  selection: null,
});

export const getSelectedWord = (
  word: string,
  history: History,
  withCloseAlternatives: boolean
): string => {
  const historyWords = new Set([
    ...history.map(([historyWord]) => historyWord),
  ]);
  if (historyWords.has(word)) {
    return word;
  }

  if (withCloseAlternatives) {
    for (let suffix of closeAlternativesSuffixes) {
      if (word.endsWith(suffix) && word !== suffix) {
        const alternative = word.slice(0, -suffix.length);
        if (historyWords.has(alternative)) {
          return alternative;
        }
      }
    }
  }

  return word;
};
