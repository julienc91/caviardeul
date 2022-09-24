export type Error = {
  error: string;
  debug?: string;
};

export type ArticleId = number | string;

export type Article = {
  articleId: ArticleId;
  pageName: string;
  archive: boolean;
  custom: boolean;
  content: string;
};

export type EncodedArticle = {
  key: string;
  articleId: ArticleId;
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

export type CustomGameCreation = {
  articleId: string;
  pageName: string;
};

export type History = [string, number][];

export type GameState = {
  history: History;
  words: Set<string>;
  isOver: boolean;
  selection: [string, number] | null;
};

export type ArticleStats = {
  distribution: Record<number, number>;
};

export type Settings = {
  lightMode: boolean;
  displayWordLength: boolean;
};

export type SettingsState = {
  settings: Settings | null;
  onChangeSettings: (settings: Partial<Settings>) => void;
};

export type User = {
  id: string;
};

export type UserState = {
  saveScore: (
    articleId: ArticleId,
    custom: boolean,
    nbAttempts: number,
    nbCorrect: number
  ) => void;
};
