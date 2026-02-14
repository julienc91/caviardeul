import { render, RenderOptions } from "@testing-library/react";
import React from "react";

import { GameContext } from "@caviardeul/components/game/gameManager";
import { SettingsContext } from "@caviardeul/components/settings/manager";
import { Article, GameHistory, Settings } from "@caviardeul/types";

import { createArticle, createSettings } from "./fixtures";

type GameContextValue = {
  article?: Article;
  isOver?: boolean;
  selection?: [string, number] | null;
  revealedWords?: Set<string>;
  history?: GameHistory;
  userScore?: { nbAttempts: number; nbCorrect: number };
  canPlay?: boolean;
  currentPlayer?: { id: string; name: string } | null;
  updateSelection?: (word: string | null) => void;
  makeAttempt?: (word: string) => void;
};

type SettingsContextValue = {
  settings?: Settings;
  onChangeSettings?: (newSettings: Partial<Settings>) => void;
};

type ProviderOptions = {
  settingsContext?: SettingsContextValue;
  gameContext?: GameContextValue;
};

const defaultGameContext = {
  article: createArticle(),
  isOver: false,
  selection: null,
  revealedWords: new Set<string>(),
  history: [] as GameHistory,
  userScore: undefined,
  canPlay: true,
  currentPlayer: null,
  updateSelection: () => {},
  makeAttempt: () => {},
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: ProviderOptions & Omit<RenderOptions, "wrapper">,
) => {
  const { settingsContext, gameContext, ...renderOptions } = options ?? {};

  const settingsValue = {
    settings: settingsContext?.settings ?? createSettings(),
    onChangeSettings: settingsContext?.onChangeSettings ?? (() => {}),
  };

  const gameValue = {
    ...defaultGameContext,
    ...gameContext,
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SettingsContext.Provider value={settingsValue}>
      <GameContext.Provider value={gameValue}>{children}</GameContext.Provider>
    </SettingsContext.Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
