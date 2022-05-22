import { useQuery } from "react-query";
import { Article } from "../types";
import { decode } from "../utils/encryption";
import { useState } from "react";

export const useArticle = () => {
  const [key] = useState(Math.random().toString());
  return useQuery<Article, Error>("getArticle", () => {
    return fetch(`/api/article?key=${key}`)
      .then((res) => res.json())
      .then((res) => {
        return {
          title: decode(res.title, key),
          article: decode(res.article, key),
        };
      });
  });
};
