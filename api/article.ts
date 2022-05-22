import {useQuery} from "react-query";
import {Article} from "../types";
import {decode} from "../utils/encryption";


export const useArticle = () => {
  const key = '123'
  return useQuery<Article, Error>('getArticle', () => {
    return fetch(`/api/article?key=${key}`)
      .then(res => res.json())
      .then(res => {
        const decodedArticle = decode(res.article, key)
        return {
          ...res,
          article: decodedArticle
        }
      })
  })
}
