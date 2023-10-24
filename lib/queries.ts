import useSWRMutation from "swr/mutation";

import { Article } from "@caviardeul/types";
import { BASE_URL } from "@caviardeul/utils/config";

class APIError extends Error {
  status: number;
  details: any;

  constructor(status: number, details: any) {
    super("API Call error");
    this.status = status;
    this.details = details;
  }
}

export const saveGameScore = (
  article: Article,
  nbAttempts: number,
  nbCorrect: number,
) => {
  const { articleId, custom } = article;
  return fetch(`${BASE_URL}/api/scores`, {
    method: "POST",
    body: JSON.stringify({ articleId, custom, nbAttempts, nbCorrect }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const sendRequest = async (endpoint: string, { arg }: any) => {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const status = response.status;
    const details = await response.json();
    throw new APIError(status, details);
  }

  return response.json();
};

export const useCreateCustomGame = () => {
  const sender = async (
    endpoint: string,
    { arg }: { arg: { pageId: string } },
  ): Promise<{ articleId: string; pageName: string }> => {
    return await sendRequest(endpoint, { arg });
  };
  return useSWRMutation(`api/articles/custom`, sender, { throwOnError: false });
};
