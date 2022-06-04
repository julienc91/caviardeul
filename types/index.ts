export type Article = {
  key?: string;
  puzzleId: number;
  pageName: string;
  article: string;
  title: string;
};

export type History = [string, number][];

export type GameState = {
  history: History;
  words: Set<string>;
  isOver: boolean;
  selection: [string, number] | null;
};

export type ScoreHistory = {
  puzzleId: number;
  title: string;
  isOver: boolean;
  nbTrials: number;
  accuracy: number;
}[];

export type Settings = {
  lightMode: boolean;
};
