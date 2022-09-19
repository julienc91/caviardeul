import React, { useCallback } from "react";

import { ArticleId } from "@caviardeul/types";
import { BASE_URL } from "@caviardeul/utils/config";
import { UserContext } from "@caviardeul/utils/user";

const UserManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const saveScore = useCallback(
    async (
      articleId: ArticleId,
      custom: boolean,
      nbAttempts: number,
      nbCorrect: number
    ) => {
      await fetch(`${BASE_URL}/api/scores`, {
        method: "POST",
        body: JSON.stringify({ articleId, custom, nbAttempts, nbCorrect }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    []
  );

  return (
    <UserContext.Provider value={{ saveScore }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserManager;
