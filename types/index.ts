import { ArticleSafety } from "@prisma/client";

export type ArticleId = number | string;

export type Article = {
  articleId: ArticleId;
  safety: ArticleSafety;
  pageName: string;
  archive: boolean;
  custom: boolean;
  content: string;
};

export type EncodedArticle = {
  key: string;
  articleId: ArticleId;
  safety: ArticleSafety;
  pageName: string;
  archive: boolean;
  custom: boolean;
  content: string;
};

export type UserScore = {
  nbAttempts: number;
  nbCorrect: number;
};

export type StatsCategory = 0 | 1 | 2 | 3 | 4;

export type ArticleInfoStats = {
  category: StatsCategory;
  mean: number;
  median: number;
  nbWinners: number;
};

export type ArticleInfo = {
  articleId: number;
  pageName?: string;
  userScore?: UserScore;
  stats: ArticleInfoStats;
};

export type GameHistory = [string, number][];

export type ArticleStats = {
  distribution: Record<number, number>;
};

export type Settings = {
  lightMode: boolean;
  displayWordLength: boolean;
  autoScroll: boolean;
};
