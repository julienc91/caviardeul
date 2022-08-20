import { useMutation } from "react-query";
import { BASE_URL } from "../utils/config";
import { EncodedArticle } from "../types";

export const getEncodedArticle = (
  pageId?: string,
  custom?: boolean
): Promise<EncodedArticle> => {
  let url = `${BASE_URL}/api/articles/`;
  if (!pageId) {
    url += "current";
  } else if (custom) {
    url += `custom/${pageId}`;
  } else {
    url += `${pageId}`;
  }
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
      return fetch("/api/articles/custom", {
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
