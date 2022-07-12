import React, { useContext, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  isCommonWord,
  isWord,
  splitWords,
  standardizeText,
} from "../utils/caviarding";
import { GameContext } from "../utils/game";
import { SettingsContext } from "../utils/settings";
import CustomGameBanner from "./customGameBanner";
import { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";

const _WordContainer: React.FC<{ node: any }> = ({ node }) => {
  const word = node.children[0].value;
  const { settings } = useContext(SettingsContext);
  return (
    <GameContext.Consumer>
      {({ words, selection }) => {
        const standardizedWord = standardizeText(word);
        const revealed = words.has(standardizedWord);
        const selected = selection && selection[0] === standardizedWord;
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
  article: string;
  customGame: boolean;
  reveal: boolean;
  onContentLoaded: () => void;
}> = ({ article, customGame, reveal, onContentLoaded }) => {
  return (
    <div id="article" className="article-container">
      {customGame && <CustomGameBanner />}
      <MarkdownContainer
        components={{
          strong: ({ node }) => {
            return <WordContainer node={node} />;
          },
        }}
        onContentLoaded={onContentLoaded}
      >
        {reveal
          ? article
          : splitWords(article, true).reduce((value, word) => {
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
