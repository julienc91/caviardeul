import { getCookie, setCookie } from "cookies-next";
import React, { useCallback } from "react";

import { User } from "@caviardeul/types";
import { BASE_URL } from "@caviardeul/utils/config";
import { UserContext } from "@caviardeul/utils/user";

const UserManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getUserId = useCallback(async () => {
    let userId = getCookie("userId");
    if (!userId) {
      const user = (await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
      }).then((res) => res.json())) as User;
      setCookie("userId", user.id);
      userId = user.id;
    }
    return userId.toString();
  }, []);

  const saveScore = useCallback(
    async (articleId: number, nbAttempts: number, nbCorrect: number) => {
      const userId = await getUserId();
      await fetch(`${BASE_URL}/api/users/${userId}/scores`, {
        method: "POST",
        body: JSON.stringify({ articleId, nbAttempts, nbCorrect }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    [getUserId]
  );

  return (
    <UserContext.Provider value={{ saveScore }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserManager;
