import React from "react";
import ReactMarkdown from "react-markdown";
import { commonWords, isWord, splitWords } from "../utils/caviarding";

export class WordContainer extends React.PureComponent<
  { node: any },
  { revealed: boolean; selected: boolean }
> {
  private readonly ref: React.RefObject<HTMLSpanElement>;
  state = {
    revealed: false,
    selected: false,
  };

  constructor(props: { node: any }) {
    super(props);
    this.ref = React.createRef();
  }

  reveal() {
    this.setState({ revealed: true, selected: true });
  }

  scrollTo() {
    const y = this.ref.current?.getBoundingClientRect()?.top ?? 0;
    window.scrollTo({
      top: Math.max(y + window.scrollY - 100, 0),
      behavior: "smooth",
    });
  }

  select() {
    if (this.state.revealed) {
      this.setState({ selected: true });
    }
  }

  unselect() {
    this.setState({ selected: false });
  }

  getWord() {
    return this.props.node.children[0].value;
  }

  getSelected() {
    return this.state.selected;
  }

  render() {
    const { node } = this.props;
    const { revealed, selected } = this.state;
    const word = node.children[0].value;
    if (revealed) {
      return (
        <span ref={this.ref} className={`word` + (selected ? " selected" : "")}>
          {word}
        </span>
      );
    }
    const caviardingStyle = Math.floor(Math.random() * 5) + 1;
    return (
      <span className={`word caviarded v${caviardingStyle}`}>
        {"█".repeat(word.length)}
      </span>
    );
  }
}

const MarkdownContainer = React.memo(ReactMarkdown);

const ArticleContainer: React.FC<{
  article: string;
  reveal: boolean;
  onCaviardedWordContainerAdded: (ref: React.RefObject<WordContainer>) => void;
}> = ({ article, reveal, onCaviardedWordContainerAdded }) => {
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
