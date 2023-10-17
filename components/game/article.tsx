import React, { Key, ReactNode, useContext, useEffect } from "react";

import {
  isCommonWord,
  isRevealed,
  isSelected,
  isWord,
  splitWords,
} from "@caviardeul/utils/caviarding";
import { GameContext } from "@caviardeul/utils/game";
import { SettingsContext, defaultSettings } from "@caviardeul/utils/settings";

const _WordContainer: React.FC<{ word: string }> = ({ word }) => {
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

const WordContainer = React.memo(_WordContainer);

const parseHTML = (content: string, reveal: boolean): ReactNode => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  return parseNodes(doc.body.childNodes, reveal);
};

const parseNodes = (nodes: NodeList, reveal: boolean): ReactNode => {
  const array = Array.from(nodes);
  return <>{array.map((node, i) => parseNode(node, i, reveal))}</>;
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

const parseNode = (node: Node, key: Key, reveal: boolean): ReactNode => {
  if (node.nodeName === "#text") {
    return parseText(node.textContent ?? "", reveal);
  } else if (node.nodeName === "BR") {
    return <br key={key} />;
  }

  if (skippedTags.has(node.nodeName) || node.nodeName.startsWith("#")) {
    return null;
  }

  const children = parseNodes(node.childNodes, reveal);
  switch (node.nodeName) {
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

const parseText = (text: string, reveal: boolean): ReactNode => {
  if (reveal) {
    return text;
  }

  const tokens = splitWords(text);
  return tokens.map((token, i) => {
    if (isWord(token) && !isCommonWord(token)) {
      return <WordContainer key={i} word={token} />;
    } else {
      return token;
    }
  });
};

const ArticleContainer: React.FC<{
  content: string;
  custom: boolean;
  reveal: boolean;
  onContentLoaded: () => void;
}> = ({ content, reveal, onContentLoaded }) => {
  useEffect(onContentLoaded, [onContentLoaded]);
  return (
    <div id="article" className="article-container">
      {parseHTML(content, reveal)}
    </div>
  );
};

export default React.memo(ArticleContainer);
