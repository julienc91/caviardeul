import { useMutation } from "react-query";
import { BASE_URL } from "../utils/config";
import { EncodedArticle } from "../types";

export const getEncodedArticle = (pageId?: string): Promise<EncodedArticle> => {
  const url = `${BASE_URL}/${pageId ? `api/custom/${pageId}` : "api/article"}`;
  return fetch(url)
    .then((res) => res.json())
    .then((res) => {
      if (res.error) {
        throw res.error;
      }
      const { key, puzzleId, pageName, title, article } = res;
      return {
        key,
        puzzleId,
        pageName,
        title,
        article,
      };
    });
};

export const useCreateCustomGame = () => {
  return useMutation(
    (pageName: string) => {
      return fetch("/api/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pageName }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          const { title, pageId } = res;
          return { title, pageId };
        });
    },
    {
      retry: false,
    }
  );
};
