import React from "react";
import ReactMarkdown from "react-markdown";
import { commonWords, isWord, splitWords } from "../utils/caviarding";

export class WordContainer extends React.PureComponent<
  { node: any },
  { revealed: boolean }
> {
  state = {
    revealed: false,
  };

  reveal() {
    this.setState({ revealed: true });
  }

  getWord() {
    return this.props.node.children[0].value;
  }

  render() {
    const { node } = this.props;
    const { revealed } = this.state;
    const word = node.children[0].value;
    if (revealed) {
      return <>{word}</>;
    }
    return <span className="caviarded">{"█".repeat(word.length)}</span>;
  }
}

const MarkdownContainer = React.memo(ReactMarkdown);

const ArticleContainer: React.FC<{
  article: string;
  reveal: boolean;
  onCaviardedWordContainerAdded: (ref: React.RefObject<WordContainer>) => void;
}> = ({ article, reveal, onCaviardedWordContainerAdded }) => {
  console.log("rendering article container");
  return (
    <div className="article-container">
      <MarkdownContainer
        components={{
          strong: ({ node }) => {
            const ref = React.createRef<WordContainer>();
            onCaviardedWordContainerAdded(ref);
            return <WordContainer node={node} ref={ref} />;
          },
        }}
      >
        {reveal
          ? article
          : splitWords(article).reduce((value, word) => {
              let currentValue;
              if (!commonWords.has(word) && isWord(word)) {
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
