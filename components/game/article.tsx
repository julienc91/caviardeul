import React, { useContext, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";

import {
  isCommonWord,
  isRevealed,
  isSelected,
  isWord,
  splitWords,
} from "@caviardeul/utils/caviarding";
import { GameContext } from "@caviardeul/utils/game";
import { SettingsContext, defaultSettings } from "@caviardeul/utils/settings";

const _WordContainer: React.FC<{ node: any }> = ({ node }) => {
  const word = node.children[0].value;
  const { settings } = useContext(SettingsContext);
  if (word === undefined) {
    return null;
  }
  const withCloseAlternatives =
    settings?.withCloseAlternatives ?? defaultSettings.withCloseAlternatives;

  return (
    <GameContext.Consumer>
      {({ words, selection }) => {
        const revealed = isRevealed(word, words);
        const selected =
          selection && isSelected(word, selection[0], withCloseAlternatives);
        if (revealed) {
          return (
            <span className={`word` + (selected ? " selected" : "")}>
              {word}
            </span>
          );
        } else {
          return (
            <span
              className={
                "word caviarded" +
                (settings?.displayWordLength ? " word-length" : "")
              }
              data-word-length={word.length}
            >
              {"█".repeat(word.length)}
            </span>
          );
        }
      }}
    </GameContext.Consumer>
  );
};

const _MarkdownContainer: React.FC<
  ReactMarkdownOptions & { onContentLoaded: () => void }
> = ({ children, onContentLoaded, ...props }) => {
  useEffect(() => {
    onContentLoaded();
  });
  return <ReactMarkdown {...props}>{children}</ReactMarkdown>;
};

const WordContainer = React.memo(_WordContainer);
const MarkdownContainer = React.memo(_MarkdownContainer);

const ArticleContainer: React.FC<{
  content: string;
  custom: boolean;
  reveal: boolean;
  onContentLoaded: () => void;
}> = ({ content, reveal, onContentLoaded }) => {
  return (
    <div id="article" className="article-container">
      <MarkdownContainer
        components={{
          strong: ({ node }) => {
            return <WordContainer node={node} />;
          },
        }}
        onContentLoaded={onContentLoaded}
      >
        {reveal
          ? content
          : splitWords(content, true).reduce((value, word) => {
              let currentValue;
              if (!isCommonWord(word) && isWord(word)) {
                currentValue = `**${word}**`;
              } else {
                currentValue = word;
              }
              return value + currentValue;
            })}
      </MarkdownContainer>
    </div>
  );
};

export default React.memo(ArticleContainer);
