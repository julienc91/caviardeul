import { getCookie } from "cookies-next";
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

export const saveGameScore = async (
  article: Article,
  nbAttempts: number,
  nbCorrect: number,
) => {
  const { articleId, custom } = article;
  await sendRequest("scores", {
    body: { articleId, custom, nbAttempts, nbCorrect },
  });
};

export const useCreateCustomGame = () => {
  const sender = async (
    endpoint: string,
    { arg }: { arg: { pageId: string } },
  ): Promise<{ articleId: string; pageName: string }> => {
    const data = await sendRequest(endpoint, { body: arg });
    return {
      articleId: data.articleId,
      pageName: decode(data.pageName, data.key),
    };
  };
  return useSWRMutation(`articles/custom`, sender, { throwOnError: false });
};

const sendRequest = async (endpoint: string, { body }: any) => {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const status = response.status;
    const details = await response.json();
    throw new APIError(status, details);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
};

const getCsrfToken = async () => {
  const token = getCookie("csrftoken") ?? "";
  if (!token.length) {
    await fetch(`${API_URL}/csrf`, { method: "POST" });
  }
  return getCookie("csrftoken") ?? "";
};
