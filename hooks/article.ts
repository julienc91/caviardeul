import { useQuery } from "react-query";
import { Article } from "../types";
import { decode } from "../utils/encryption";

export const useArticle = () => {
  return useQuery<Article, Error>("getArticle", () => {
    return fetch(`/api/article`)
      .then((res) => res.json())
      .then((res) => {
        const { key, pageName, title, article } = res;
        return {
          pageName: decode(pageName, key),
          title: decode(title, key),
          article: decode(article, key),
        };
      });
  });
};
