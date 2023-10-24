import { GameHistory } from "@caviardeul/types";
import { closeAlternativesSuffixes } from "@caviardeul/utils/caviarding";

export const getSelectedWord = (
  word: string,
  history: GameHistory,
  withCloseAlternatives: boolean,
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
