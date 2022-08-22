import { getCookie, setCookie } from "cookies-next";
import React, { useCallback, useEffect, useState } from "react";

import { ScoreHistory, User } from "@caviardeul/types";
import { BASE_URL } from "@caviardeul/utils/config";
import SaveManagement from "@caviardeul/utils/save";
import { UserContext } from "@caviardeul/utils/user";

const UserManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<ScoreHistory[] | null>(null);

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

  useEffect(() => {
    setHistory(SaveManagement.loadHistory());
  }, []);

  useEffect(() => {
    (async () => {
      if (history?.length && !localStorage.getItem("exported_history")) {
        const userId = await getUserId();
        for (let i = 0; i < history.length; i++) {
          if (!history[i].isOver) {
            continue;
          }
          await fetch(`${BASE_URL}/api/users/${userId}/scores`, {
            method: "POST",
            body: JSON.stringify({
              articleId: history[i].puzzleId,
              nbAttempts: history[i].nbTrials,
              nbCorrect: history[i].accuracy,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
        localStorage.setItem("exported_history", "1");
      }
    })().catch(console.log);
  }, [history, getUserId]);

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
