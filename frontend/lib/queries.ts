import { getCookie } from "cookies-next/client";
import useSWRMutation from "swr/mutation";

import { Article, DailyArticleStats } from "@caviardeul/types";
import { API_URL } from "@caviardeul/utils/config";
import { decode } from "@caviardeul/utils/encryption";

export class APIError extends Error {
  status: number;
  details: string;

  constructor(status: number, details: string) {
    super("API Call error");
    this.status = status;
    this.details = details;
  }
}

export const isAPIError = (error: unknown): error is APIError => {
  return !!(
    error &&
    typeof error === "object" &&
    "status" in error &&
    "details" in error
  );
};

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

export const sendLoginRequest = async (userId: string) => {
  return await sendRequest("login", { body: { userId } });
};

export const getUserDailyArticleStats = async (
  userId: string | undefined,
): Promise<DailyArticleStats> => {
  const response = await fetch(`${API_URL}/articles/stats`, {
    headers: {
      Cookie: (userId ?? "") !== "" ? `userId=${userId}` : "",
    },
  });
  return await response.json();
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
    const data = await response.json();
    throw new APIError(status, data?.details ?? "");
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
