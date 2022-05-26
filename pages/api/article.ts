import type { NextApiRequest, NextApiResponse } from "next";
import { Article } from "../../types";
import { encode } from "../../utils/encryption";
import { getArticle, getCurrentArticlePageName } from "../../utils/article";

const handler = async (req: NextApiRequest, res: NextApiResponse<Article>) => {
  const pageName = getCurrentArticlePageName();
  const { article, title } = await getArticle(pageName);
  const key = Math.random().toString();

  res.status(200);
  res.json({
    key,
    pageName: encode(pageName, key),
    article: encode(article, key),
    title: encode(title, key),
  });
};

export default handler;
