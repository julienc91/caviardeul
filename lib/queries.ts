import { ArticleId } from "@caviardeul/types";
import { BASE_URL } from "@caviardeul/utils/config";

export const saveGameScore = (
  articleId: ArticleId,
  custom: boolean,
  nbAttempts: number,
  nbCorrect: number,
) => {
  return fetch(`${BASE_URL}/api/scores`, {
    method: "POST",
    body: JSON.stringify({ articleId, custom, nbAttempts, nbCorrect }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};
