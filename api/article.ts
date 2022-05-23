import { useQuery } from "react-query";
import { Article } from "../types";
import { decode } from "../utils/encryption";

export const useArticle = () => {
  return useQuery<Article, Error>("getArticle", () => {
    return fetch(`/api/article`)
      .then((res) => res.json())
      .then((res) => {
        const { key, title, article } = res;
        return {
          title: decode(title, key),
          article: decode(article, key),
        };
      });
  });
};
