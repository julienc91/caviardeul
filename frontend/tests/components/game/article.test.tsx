import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

import ArticleContainer, {
  buildArticleHTML,
} from "@caviardeul/components/game/article";
import { GameContext } from "@caviardeul/components/game/gameManager";
import { SettingsContext } from "@caviardeul/components/settings/manager";
import { GameHistory } from "@caviardeul/types";

import { createArticle, createSettings } from "../../helpers/fixtures";
import { renderWithProviders } from "../../helpers/renderWithProviders";

describe("ArticleContainer", () => {
  it("renders nothing when article is undefined", () => {
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: { article: undefined },
    });
    expect(
      container.querySelector(".article-container"),
    ).not.toBeInTheDocument();
  });

  it("renders article HTML content with words caviarded", () => {
    const article = createArticle({
      content: "<p>Bonjour monde</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: { article, revealedWords: new Set() },
    });
    expect(container.querySelector(".article-container")).toBeInTheDocument();
    const caviarded = container.querySelectorAll(".word.caviarded");
    expect(caviarded.length).toBe(2); // "Bonjour" and "monde"
  });

  it("reveals words that are in revealedWords", () => {
    const article = createArticle({
      content: "<p>Bonjour monde</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: { article, revealedWords: new Set(["bonjour"]) },
    });
    // "Bonjour" revealed, "monde" still caviarded
    const caviarded = container.querySelectorAll(".word.caviarded");
    expect(caviarded.length).toBe(1);
    expect(container.textContent).toContain("Bonjour");
  });

  it("reveals all words when game is over", () => {
    const article = createArticle({
      content: "<p>Bonjour monde</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: {
        article,
        isOver: true,
        revealedWords: new Set(),
      },
    });
    expect(container.querySelectorAll(".word.caviarded").length).toBe(0);
    expect(container.textContent).toContain("Bonjour");
    expect(container.textContent).toContain("monde");
  });

  it("applies selected class to matching revealed words", () => {
    const article = createArticle({
      content: "<p>Bonjour monde</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: {
        article,
        revealedWords: new Set(["bonjour"]),
        selection: ["bonjour", 0],
      },
    });
    expect(container.querySelector(".word .selected")).toBeInTheDocument();
    expect(container.querySelector(".word .selected")?.textContent).toBe(
      "Bonjour",
    );
  });

  it("does not apply selected class to non-matching words", () => {
    const article = createArticle({
      content: "<p>Bonjour monde</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: {
        article,
        revealedWords: new Set(["bonjour", "monde"]),
        selection: ["bonjour", 0],
      },
    });
    const selectedEls = container.querySelectorAll(".word .selected");
    expect(selectedEls.length).toBe(1);
    expect(selectedEls[0].textContent).toBe("Bonjour");
  });

  it("shows caviarded blocks with correct length", () => {
    const article = createArticle({
      content: "<p>Bonjour</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: { article, revealedWords: new Set() },
    });
    const caviarded = container.querySelector(".word.caviarded");
    expect(caviarded?.textContent).toBe("███████"); // 7 chars
    expect(caviarded?.getAttribute("data-word-length")).toBe("7");
  });

  it("skips blocked tags like IMG and SCRIPT", () => {
    const article = createArticle({
      content:
        '<p>Text</p><img alt="" src="test.jpg" /><script>alert("x")</script><p>More</p>',
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: { article, isOver: true, revealedWords: new Set() },
    });
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
  });

  it("renders various HTML elements", () => {
    const article = createArticle({
      content:
        "<h1>Title</h1><h2>Sub</h2><ul><li>Item</li></ul><p>Text</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: { article, isOver: true, revealedWords: new Set() },
    });
    expect(container.querySelector("h1")).toBeInTheDocument();
    expect(container.querySelector("h2")).toBeInTheDocument();
    expect(container.querySelector("ul")).toBeInTheDocument();
    expect(container.querySelector("li")).toBeInTheDocument();
    expect(container.querySelector("p")).toBeInTheDocument();
  });

  it("shows custom game banner for custom articles", () => {
    const article = createArticle({
      custom: true,
      safety: "UNSAFE",
      content: "<p>Test</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: { article },
    });
    expect(container.querySelector(".banner")).toBeInTheDocument();
  });

  it("does not show banner for non-custom articles", () => {
    const article = createArticle({
      custom: false,
      content: "<p>Test</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: { article },
    });
    expect(container.querySelector(".banner")).not.toBeInTheDocument();
  });

  it("common words are plain text searchable via Ctrl+F", () => {
    const article = createArticle({
      content: "<p>la tour est grande</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: { article, revealedWords: new Set() },
    });
    // "la" and "est" are common words and should be plain text
    expect(container.textContent).toContain("la ");
    expect(container.textContent).toContain(" est ");
  });

  it("reveals words dynamically when revealedWords changes", () => {
    const article = createArticle({ content: "<p>Bonjour monde</p>" });
    const settings = {
      settings: createSettings(),
      onChangeSettings: () => {},
    };
    const defaultCtx = {
      isOver: false,
      selection: null as [string, number] | null,
      revealedWords: new Set<string>(),
      history: [] as GameHistory,
      userScore: undefined,
      canPlay: true,
      currentPlayer: null,
      updateSelection: () => {},
      makeAttempt: () => {},
    };

    const { container, rerender } = render(
      <SettingsContext.Provider value={settings}>
        <GameContext.Provider value={{ ...defaultCtx, article }}>
          <ArticleContainer />
        </GameContext.Provider>
      </SettingsContext.Provider>,
    );
    expect(container.querySelectorAll(".word.caviarded").length).toBe(2);

    // Simulate guessing "bonjour": both revealedWords and selection change
    rerender(
      <SettingsContext.Provider value={settings}>
        <GameContext.Provider
          value={{
            ...defaultCtx,
            article,
            revealedWords: new Set(["bonjour"]),
            selection: ["bonjour", 0],
          }}
        >
          <ArticleContainer />
        </GameContext.Provider>
      </SettingsContext.Provider>,
    );
    expect(container.querySelectorAll(".word.caviarded").length).toBe(1);
    expect(container.textContent).toContain("Bonjour");

    // Simulate cycling selection (only selection changes, not revealedWords)
    const revealedSet = new Set(["bonjour"]);
    rerender(
      <SettingsContext.Provider value={settings}>
        <GameContext.Provider
          value={{
            ...defaultCtx,
            article,
            revealedWords: revealedSet,
            selection: ["bonjour", 1],
          }}
        >
          <ArticleContainer />
        </GameContext.Provider>
      </SettingsContext.Provider>,
    );
    // Word must still be revealed after selection-only change
    expect(container.querySelectorAll(".word.caviarded").length).toBe(1);
    expect(container.textContent).toContain("Bonjour");
  });
});

describe("buildArticleHTML", () => {
  it("wraps non-common words in spans with correct attributes", () => {
    const { html, registry } = buildArticleHTML("<p>Bonjour monde</p>");
    expect(html).toContain('<span class="word caviarded"');
    expect(html).toContain('data-i="0"');
    expect(html).toContain('data-i="1"');
    expect(html).not.toContain("data-std");
    expect(html).not.toContain("data-word=");
    expect(html).toContain('data-word-length="7"');
    expect(html).toContain("███████"); // 7 block chars
    expect(registry.get(0)).toEqual({ std: "bonjour", word: "Bonjour" });
    expect(registry.get(1)).toEqual({ std: "monde", word: "monde" });
  });

  it("leaves common words as plain text", () => {
    const { html, registry } = buildArticleHTML("<p>la tour</p>");
    expect(html).toContain("la ");
    // "la" should NOT be wrapped in a span
    expect(html).not.toMatch(/data-i=".*".*la/);
    // "tour" should be in the registry
    expect(registry.size).toBe(1);
    expect(registry.get(0)).toEqual({ std: "tour", word: "tour" });
  });

  it("preserves supported HTML tags", () => {
    const { html } = buildArticleHTML(
      "<h1>Title</h1><h2>Sub</h2><p>Text</p><ul><li>Item</li></ul><ol><li>Item</li></ol>",
    );
    expect(html).toContain("<h1>");
    expect(html).toContain("<h2>");
    expect(html).toContain("<p>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>");
  });

  it("skips blocked tags", () => {
    const { html } = buildArticleHTML(
      '<p>Text</p><img src="x.jpg" /><script>alert("x")</script>',
    );
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<script");
  });

  it("renders br tags", () => {
    const { html } = buildArticleHTML("<p>Line1<br>Line2</p>");
    expect(html).toContain("<br>");
  });

  it("wraps unknown tags in span", () => {
    const { html } = buildArticleHTML("<div>Hello</div>");
    expect(html).toContain("<span>");
  });

  it("returns empty string for empty content", () => {
    expect(buildArticleHTML("").html).toBe("");
  });

  it("escapes special characters in text", () => {
    const { html } = buildArticleHTML("<p>A &amp; B</p>");
    // The "&" from the decoded text should be re-escaped in output
    expect(html).toContain("&amp;");
  });

  it("handles h3 and h4 tags", () => {
    const { html } = buildArticleHTML("<h3>H3</h3><h4>H4</h4>");
    expect(html).toContain("<h3>");
    expect(html).toContain("<h4>");
  });

  it("skips comment nodes", () => {
    const { html } = buildArticleHTML("<p><!-- comment -->Text</p>");
    expect(html).not.toContain("comment");
  });

  it("skips empty spans from empty elements", () => {
    const { html } = buildArticleHTML("<div></div>");
    expect(html).toBe("");
  });
});
