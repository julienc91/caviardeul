import { ArticleId, EncodedArticle } from "@caviardeul/types";
import { API_URL } from "@caviardeul/utils/config";

export const getEncodedArticle = (
  articleId?: ArticleId,
  custom?: boolean,
): Promise<EncodedArticle> => {
  let url = `${API_URL}/articles/`;
  if (!articleId) {
    url += "current";
  } else if (custom) {
    url += `custom/${articleId}`;
  } else {
    url += `${articleId}`;
  }
  return fetch(url)
    .then((res) => res.json())
    .then((res) => {
      if (res.error) {
        throw res.error;
      }
      const {
        key,
        articleId,
        safety,
        archive,
        custom,
        pageName,
        content,
        userScore,
      } = res;
      return {
        key,
        articleId,
        safety,
        archive,
        custom,
        pageName,
        content,
        userScore,
      };
    });
};
