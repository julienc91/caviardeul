import React from "react";

import { GameState } from "@caviardeul/types";

export const GameContext = React.createContext<GameState>({
  history: [],
  words: new Set(),
  isOver: false,
  selection: null,
});
