import useSWRMutation from "swr/mutation";

import { Article } from "@caviardeul/types";
import { API_URL } from "@caviardeul/utils/config";
import { decode } from "@caviardeul/utils/encryption";

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
  return fetch(`${API_URL}/scores`, {
    method: "POST",
    body: JSON.stringify({ articleId, custom, nbAttempts, nbCorrect }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const sendRequest = async (endpoint: string, { arg }: any) => {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
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
    const data = await sendRequest(endpoint, { arg });
    return {
      articleId: data.articleId,
      pageName: decode(data.pageName, data.key),
    };
  };
  return useSWRMutation(`articles/custom`, sender, { throwOnError: false });
};
