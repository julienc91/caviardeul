import React from "react";
import ReactMarkdown from "react-markdown";
import { commonWords, isWord, splitWords } from "../utils/caviarding";
import { GameContext } from "../utils/game";

const _WordContainer: React.FC<{ node: any }> = ({ node }) => {
  const word = node.children[0].value;
  return (
    <GameContext.Consumer>
      {({ words, selection }) => {
        const lowercaseWord = word.toLocaleLowerCase();
        const revealed = words.has(lowercaseWord);
        const selected = selection && selection[0] === lowercaseWord;
        if (revealed) {
          return (
            <span className={`word` + (selected ? " selected" : "")}>
              {word}
            </span>
          );
        } else {
          const caviardingStyle = Math.floor(Math.random() * 5) + 1;
          return (
            <span className={`word caviarded v${caviardingStyle}`}>
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
    <div className="article-container">
      <MarkdownContainer
        components={{
          strong: ({ node }) => {
            return <WordContainer node={node} />;
          },
        }}
      >
        {reveal
          ? article
          : splitWords(article).reduce((value, word) => {
              let currentValue;
              if (!commonWords.has(word.toLocaleLowerCase()) && isWord(word)) {
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
