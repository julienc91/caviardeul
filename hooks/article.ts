import { useMutation, useQuery } from "react-query";
import { Article } from "../types";
import { decode } from "../utils/encryption";

export const useArticle = (pageId?: string) => {
  return useQuery<Article, Error>(
    "getArticle",
    () => {
      const url = pageId ? `/api/custom/${pageId}` : "/api/article";
      return fetch(url)
        .then((res) => res.json())
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          const { key, puzzleId, pageName, title, article } = res;
          return {
            puzzleId,
            pageName: decode(pageName, key),
            title: decode(title, key),
            article: decode(article, key),
          };
        });
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
    }
  );
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
