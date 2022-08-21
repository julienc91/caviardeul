import React, { useCallback } from "react";
import { UserContext } from "../utils/user";
import { getCookie, setCookie } from "cookies-next";
import { User } from "../types";
import { BASE_URL } from "../utils/config";

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
