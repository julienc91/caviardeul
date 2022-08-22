import { createContext } from "react";

import { UserState } from "@caviardeul/types";

export const UserContext = createContext<UserState>({
  saveScore: () => null,
});
