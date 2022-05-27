import type { NextApiRequest, NextApiResponse } from "next";
import { Article } from "../../types";
import { encode } from "../../utils/encryption";
import { getArticle, getCurrentArticlePageId } from "../../utils/article";

const handler = async (req: NextApiRequest, res: NextApiResponse<Article>) => {
  const [pageName, puzzleId] = getCurrentArticlePageId();
  const { article, title } = await getArticle(puzzleId, pageName);
  const key = Math.random().toString();

  res.status(200);
  res.json({
    key,
    puzzleId,
    pageName: encode(pageName, key),
    article: encode(article, key),
    title: encode(title, key),
  });
};

export default handler;
