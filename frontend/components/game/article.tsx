import {
  HTMLElement as HTMLParserElement,
  Node,
  NodeType,
  parse,
} from "node-html-parser";
import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useContextSelector } from "use-context-selector";

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

const escapeHTML = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

const validTags = new Set(["H1", "H2", "H3", "H4", "LI", "OL", "P", "UL"]);

export type WordRegistry = Map<number, { std: string; word: string }>;

export const buildArticleHTML = (
  content: string,
): { html: string; registry: WordRegistry } => {
  const registry: WordRegistry = new Map();
  const doc = parse(content);
  return { html: buildNodes(doc.childNodes, registry), registry };
};

const buildNodes = (nodes: Node[], registry: WordRegistry): string => {
  return Array.from(nodes)
    .map((node) => buildNode(node, registry))
    .join("");
};

const buildNode = (node: Node, registry: WordRegistry): string => {
  if (node.nodeType === NodeType.TEXT_NODE) {
    return buildText(node.textContent ?? "", registry);
  } else if (node.nodeType === NodeType.COMMENT_NODE) {
    return "";
  } else if (node.nodeType !== NodeType.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLParserElement;
  const tagName = element.tagName.toUpperCase();

  if (tagName === "BR") {
    return "<br>";
  } else if (skippedTags.has(tagName)) {
    return "";
  }

  const children = buildNodes(node.childNodes, registry);

  if (validTags.has(tagName)) {
    const tag = tagName.toLowerCase();
    return `<${tag}>${children}</${tag}>`;
  }

  if (!children) {
    return "";
  }
  return `<span>${children}</span>`;
};

const buildText = (text: string, registry: WordRegistry): string => {
  const tokens = splitWords(text);
  return tokens
    .map((token) => {
      if (isWord(token) && !isCommonWord(token)) {
        const std = standardizeText(token);
        const index = registry.size;
        registry.set(index, { std, word: token });
        return `<span class="word caviarded" data-i="${index}" data-word-length="${token.length}">${"\u2588".repeat(token.length)}</span>`;
      }
      return escapeHTML(token);
    })
    .join("");
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
      const [, index] = selection;
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
  const revealedWords = useContextSelector(
    GameContext,
    (context) => context.revealedWords,
  );
  const selection = useContextSelector(
    GameContext,
    (context) => context.selection,
  );
  const isOver = useContextSelector(GameContext, (context) => context.isOver);
  const contentRef = useRef<HTMLDivElement>(null);

  const { articleHTML, wordRegistry } = useMemo(
    () =>
      article
        ? (() => {
            const { html, registry } = buildArticleHTML(article.content);
            return { articleHTML: html, wordRegistry: registry };
          })()
        : { articleHTML: null, wordRegistry: null },
    [article],
  );

  useLayoutEffect(() => {
    if (contentRef.current && articleHTML) {
      contentRef.current.innerHTML = articleHTML;
    }
  }, [articleHTML]);

  // Reveal effect
  useLayoutEffect(() => {
    if (!contentRef.current || !wordRegistry) return;
    const caviardedWords =
      contentRef.current.querySelectorAll<HTMLElement>(".word.caviarded");
    caviardedWords.forEach((el) => {
      const entry = wordRegistry.get(Number(el.dataset.i));
      if (entry && (isOver || revealedWords.has(entry.std))) {
        el.textContent = entry.word;
        el.classList.remove("caviarded");
      }
    });
  }, [revealedWords, isOver, articleHTML, wordRegistry]);

  // Selection effect
  useLayoutEffect(() => {
    if (!contentRef.current || !wordRegistry) return;

    // Clear existing selections
    contentRef.current
      .querySelectorAll<HTMLElement>(".word .selected")
      .forEach((selectedEl) => {
        const parent = selectedEl.parentElement;
        if (parent) {
          const entry = wordRegistry.get(Number(parent.dataset.i));
          parent.textContent = entry?.word ?? parent.textContent ?? "";
        }
      });

    if (!selection) return;
    const [selectedWord] = selection;

    contentRef.current
      .querySelectorAll<HTMLElement>(".word:not(.caviarded)")
      .forEach((el) => {
        const entry = wordRegistry.get(Number(el.dataset.i));
        if (entry && isSelected(entry.std, selectedWord)) {
          const text = el.textContent ?? "";
          el.innerHTML = `<span class="selected">${escapeHTML(text)}</span>`;
        }
      });
  }, [selection, revealedWords, isOver, articleHTML, wordRegistry]);

  if (!article) {
    return null;
  }

  const { custom, safety } = article;

  return (
    <div className="article-container">
      {custom && <CustomGameBanner safetyLevel={safety} />}
      <AutoScrollerManager />
      <div ref={contentRef} />
    </div>
  );
};

export default ArticleContainer;
