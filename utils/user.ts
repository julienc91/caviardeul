import { createContext } from "react";
import { UserState } from "../types";

export const UserContext = createContext<UserState>({
  saveScore: () => null,
});
