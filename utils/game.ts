import React from "react";
import { GameState } from "../types";
import { commonWords } from "./caviarding";

export const GameContext = React.createContext<GameState>({
  history: [],
  words: new Set(Array.from(commonWords)),
  isOver: false,
  selection: null,
});
