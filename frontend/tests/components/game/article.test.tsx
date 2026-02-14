import { describe, expect, it } from "vitest";

import ArticleContainer from "@caviardeul/components/game/article";

import { createArticle } from "../../helpers/fixtures";
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

  it("renders article HTML content", () => {
    const article = createArticle({
      content: "<p>Hello world</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: { article, revealedWords: new Set(["hello", "world"]) },
    });
    expect(container.querySelector(".article-container")).toBeInTheDocument();
    expect(container.textContent).toContain("Hello");
    expect(container.textContent).toContain("world");
  });

  it("skips blocked tags like IMG and SCRIPT", () => {
    const article = createArticle({
      content:
        '<p>Text</p><img alt="" src="test.jpg" /><script>alert("x")</script><p>More</p>',
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: {
        article,
        isOver: true,
        revealedWords: new Set(),
      },
    });
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
  });

  it("renders various HTML elements", () => {
    const article = createArticle({
      content: "<h1>Title</h1><h2>Sub</h2><ul><li>Item</li></ul><p>Text</p>",
    });
    const { container } = renderWithProviders(<ArticleContainer />, {
      gameContext: {
        article,
        isOver: true,
        revealedWords: new Set(),
      },
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
});
