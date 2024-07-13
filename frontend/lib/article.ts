import { ArticleId, EncodedArticle } from "@caviardeul/types";
import { API_URL } from "@caviardeul/utils/config";

export const getEncodedArticle = async (
  articleId?: ArticleId,
  custom?: boolean,
  userId?: string,
): Promise<EncodedArticle> => {
  let url = `${API_URL}/articles/`;
  if (!articleId) {
    url += "current";
  } else if (custom) {
    url += `custom/${articleId}`;
  } else {
    url += `${articleId}`;
  }

  const res = await fetch(url, {
    headers: {
      Cookie: (userId ?? "") !== "" ? `userId=${userId}` : "",
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw data.detail;
  }

  return {
    key: data.key,
    articleId: data.articleId,
    safety: data.safety,
    archive: data.archive,
    custom: data.custom,
    pageName: data.pageName,
    content: data.content,
    userScore: data.userScore,
  };
};
