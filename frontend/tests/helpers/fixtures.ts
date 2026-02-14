import {
  Article,
  ArticleSafety,
  EncodedArticle,
  GameHistory,
  Settings,
} from "@caviardeul/types";

export const createArticle = (overrides: Partial<Article> = {}): Article => ({
  articleId: 42,
  safety: "SAFE" as ArticleSafety,
  pageName: "Tour Eiffel",
  archive: false,
  custom: false,
  content: "<p>La <b>tour Eiffel</b> est une tour de fer.</p>",
  ...overrides,
});

export const createEncodedArticle = (
  overrides: Partial<EncodedArticle> = {},
): EncodedArticle => ({
  key: "dGVzdGtleXRlc3RrZXl0ZXN0a2V5dGVzdGtleT0=",
  articleId: 42,
  safety: "SAFE" as ArticleSafety,
  pageName: "encoded-page-name",
  archive: false,
  custom: false,
  content: "encoded-content",
  userScore: null,
  ...overrides,
});

export const createHistory = (
  entries: [string, number][] = [
    ["tour", 3],
    ["paris", 0],
    ["eiffel", 2],
  ],
): GameHistory => entries;

export const createSettings = (
  overrides: Partial<Settings> = {},
): Settings => ({
  lightMode: false,
  autoScroll: true,
  ...overrides,
});
