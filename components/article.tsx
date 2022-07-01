import React from "react";
import ReactMarkdown from "react-markdown";
import {
  isCommonWord,
  isWord,
  splitWords,
  standardizeText,
} from "../utils/caviarding";
import { GameContext } from "../utils/game";

const _WordContainer: React.FC<{ node: any }> = ({ node }) => {
  const word = node.children[0].value;
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
            <span className="word caviarded" data-word-length={word.length}>
              {"█".repeat(word.length)}
            </span>
          );
        }
      }}
    </GameContext.Consumer>
  );
};

const WordContainer = React.memo(_WordContainer);
const MarkdownContainer = React.memo(ReactMarkdown);

const ArticleContainer: React.FC<{
  article: string;
  reveal: boolean;
}> = ({ article, reveal }) => {
  return (
    <div id="article" className="article-container">
      <MarkdownContainer
        components={{
          strong: ({ node }) => {
            return <WordContainer node={node} />;
          },
        }}
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
