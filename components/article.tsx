import React from "react";
import ReactMarkdown from "react-markdown";
import { commonWords, isWord, splitWords } from "../utils/caviarding";
import { GameContext } from "../utils/game";

export class WordContainer extends React.PureComponent<{ node: any }> {
  private readonly ref: React.RefObject<HTMLSpanElement>;

  constructor(props: { node: any }) {
    super(props);
    this.ref = React.createRef();
  }

  scrollTo() {
    const y = this.ref.current?.getBoundingClientRect()?.top ?? 0;
    window.scrollTo({
      top: Math.max(y + window.scrollY - 100, 0),
      behavior: "smooth",
    });
  }

  render() {
    const { node } = this.props;
    const word = node.children[0].value;
    return (
      <GameContext.Consumer>
        {({ words, selection }) => {
          const lowercaseWord = word.toLocaleLowerCase();
          const revealed = words.has(lowercaseWord);
          const selected = selection && selection[0] === lowercaseWord;
          if (revealed) {
            return (
              <span
                ref={this.ref}
                className={`word` + (selected ? " selected" : "")}
              >
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
  }
}

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
