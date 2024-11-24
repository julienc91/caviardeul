import {
  HTMLElement as HTMLParserElement,
  Node,
  NodeType,
  parse,
} from "node-html-parser";
import React, { Key, ReactNode, useContext, useEffect, useMemo } from "react";
import { useContextSelector } from "use-context-selector";

import CustomGameBanner from "@caviardeul/components/game/customGameBanner";
import { GameContext } from "@caviardeul/components/game/gameManager";
import WordContainer from "@caviardeul/components/game/word";
import { SettingsContext } from "@caviardeul/components/settings/manager";
import { isCommonWord, isWord, splitWords } from "@caviardeul/utils/caviarding";

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

const AutoScrollerManager = () => {
  const { settings } = useContext(SettingsContext);
  const { autoScroll } = settings;
  const selection = useContextSelector(
    GameContext,
    (context) => context.selection,
  );

  // Scroll to selection
  useEffect(() => {
    if (selection && autoScroll) {
      const [_, index] = selection;
      const articleContainer =
        document.querySelector<HTMLElement>(".article-container");
      const elements =
        articleContainer?.querySelectorAll<HTMLElement>(".word .selected");
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

  return null;
};

const ArticleContainer = () => {
  const article = useContextSelector(GameContext, (context) => context.article);
  const inner = useMemo(
    () => (article ? parseHTML(article.content) : null),
    [article],
  );

  if (!article) {
    return null;
  }

  const { custom, safety } = article;

  return (
    <div className="article-container">
      {custom && <CustomGameBanner safetyLevel={safety} />}
      <AutoScrollerManager />
      {inner}
    </div>
  );
};

export default ArticleContainer;
