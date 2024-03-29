import {
  HTMLElement as HTMLParserElement,
  Node,
  NodeType,
  parse,
} from "node-html-parser";
import React, { Key, ReactNode, useContext, useEffect, useMemo } from "react";

import CustomGameBanner from "@caviardeul/components/game/customGameBanner";
import { GameContext } from "@caviardeul/components/game/gameManager";
import { SettingsContext } from "@caviardeul/components/settings/manager";
import {
  isCommonWord,
  isSelected,
  isWord,
  splitWords,
  standardizeText,
} from "@caviardeul/utils/caviarding";

const _WordContainer: React.FC<{ word: string }> = ({ word }) => {
  const { settings } = useContext(SettingsContext);

  const { revealedWords, isOver, selection } = useContext(GameContext);
  if (word === undefined) {
    return null;
  }

  const standardizedWord = standardizeText(word);
  const revealed = isOver || revealedWords.has(standardizedWord);
  const selected = selection && isSelected(standardizedWord, selection[0]);

  if (revealed) {
    return (
      <span className={`word` + (selected ? " selected" : "")}>{word}</span>
    );
  } else {
    return (
      <span
        className={
          "word caviarded" + (settings.displayWordLength ? " word-length" : "")
        }
        data-word-length={word.length}
      >
        {"█".repeat(word.length)}
      </span>
    );
  }
};

const WordContainer = React.memo(_WordContainer);

const parseHTML = (content: string): ReactNode => {
  const doc = parse(content);
  return parseNodes(doc.childNodes);
};

const parseNodes = (nodes: Node[]): ReactNode => {
  const array = Array.from(nodes);
  return <>{array.map((node, i) => parseNode(node, i))}</>;
};

const skippedTags = new Set([
  "AUDIO",
  "IFRAME",
  "IMG",
  "SCRIPT",
  "SVG",
  "TRACK",
  "VIDEO",
]);

const parseNode = (node: Node, key: Key): ReactNode => {
  if (node.nodeType === NodeType.TEXT_NODE) {
    return parseText(node.textContent ?? "");
  } else if (node.nodeType === NodeType.COMMENT_NODE) {
    return null;
  } else if (node.nodeType !== NodeType.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLParserElement;
  const tagName = element.tagName.toUpperCase();

  if (tagName === "BR") {
    return <br key={key} />;
  } else if (skippedTags.has(tagName)) {
    return null;
  }

  const children = parseNodes(node.childNodes);
  switch (tagName) {
    case "H1":
      return <h1 key={key}>{children}</h1>;
    case "H2":
      return <h2 key={key}>{children}</h2>;
    case "H3":
      return <h3 key={key}>{children}</h3>;
    case "H4":
      return <h4 key={key}>{children}</h4>;
    case "LI":
      return <li key={key}>{children}</li>;
    case "OL":
      return <ol key={key}>{children}</ol>;
    case "P":
      return <p key={key}>{children}</p>;
    case "UL":
      return <ul key={key}>{children}</ul>;
    default:
      if (children === null || children === "") {
        return null;
      }
      return <span key={key}>{children}</span>;
  }
};

const parseText = (text: string): ReactNode => {
  const tokens = splitWords(text);
  return tokens.map((token, i) => {
    if (isWord(token) && !isCommonWord(token)) {
      return <WordContainer key={i} word={token} />;
    } else {
      return token;
    }
  });
};

const ArticleContainer = () => {
  const { article, selection } = useContext(GameContext);
  const { settings } = useContext(SettingsContext);
  const { autoScroll } = settings;

  const inner = useMemo(
    () => (article ? parseHTML(article.content) : null),
    [article],
  );

  // Scroll to selection
  useEffect(() => {
    if (selection && autoScroll) {
      const [_, index] = selection;
      const articleContainer =
        document.querySelector<HTMLElement>(".article-container");
      const elements =
        articleContainer?.querySelectorAll<HTMLElement>(".word.selected");
      if (elements?.length) {
        const element = elements[index % elements.length];
        const y = element.offsetTop;
        articleContainer?.scrollTo({
          top: Math.max(y - 100, 0),
          behavior: "smooth",
        });
      }
    }
  }, [selection, autoScroll]);

  if (!article) {
    return null;
  }

  const { custom, safety } = article;

  return (
    <div className="article-container">
      {custom && <CustomGameBanner safetyLevel={safety} />}
      {inner}
    </div>
  );
};

export default ArticleContainer;
