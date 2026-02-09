import React, { useMemo } from "react";
import { useContextSelector } from "use-context-selector";

import { GameContext } from "@caviardeul/components/game/gameManager";
import { isSelected, standardizeText } from "@caviardeul/utils/caviarding";

const useStandardizedWord = (word: string) => {
  return useMemo(() => standardizeText(word), [word]);
};

const useIsSelected = (word: string) => {
  const standardizedWord = useStandardizedWord(word);
  const selection = useContextSelector(
    GameContext,
    (context) => context.selection?.[0],
  );
  return !!(selection && isSelected(standardizedWord, selection));
};

const useIsRevealed = (word: string) => {
  const standardizedWord = useStandardizedWord(word);
  return useContextSelector(GameContext, (context) =>
    context.revealedWords.has(standardizedWord),
  );
};

const SelectedWrapper: React.FC<{
  word: string;
  children: React.ReactNode;
}> = React.memo(({ word, children }) => {
  const selected = useIsSelected(word);
  if (!selected) {
    return children;
  }
  return <span className="selected">{children}</span>;
});
SelectedWrapper.displayName = "SelectedWrapper";

const RevealedWord = React.memo<{ word: string }>(({ word }) => {
  return (
    <span className="word">
      <SelectedWrapper word={word}>{word}</SelectedWrapper>
    </span>
  );
});
RevealedWord.displayName = "RevealedWord";

const CaviardedWord = React.memo<{ word: string }>(({ word }) => {
  return (
    <span className="word caviarded" data-word-length={word.length}>
      {"█".repeat(word.length)}
    </span>
  );
});
CaviardedWord.displayName = "CaviardedWord";

const MaybeRevealedWord = React.memo<{ word: string }>(({ word }) => {
  const revealed = useIsRevealed(word);
  if (revealed) {
    return <RevealedWord word={word} />;
  }
  return <CaviardedWord word={word} />;
});
MaybeRevealedWord.displayName = "MaybeRevealedWord";

const WordContainer = React.memo<{ word: string }>(({ word }) => {
  const isOver = useContextSelector(GameContext, (context) => context.isOver);
  if (word === undefined) {
    return null;
  }

  if (isOver) {
    return <RevealedWord word={word} />;
  }
  return <MaybeRevealedWord word={word} />;
});
WordContainer.displayName = "WordContainer";

export default WordContainer;
