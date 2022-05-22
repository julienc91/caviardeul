import type { NextApiRequest, NextApiResponse } from "next";
import { Article, Error } from "../../types";
import { encode } from "../../utils/encryption";
import { getArticle } from "../../utils/article";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Article | Error>
) => {
  const key = req.query.key as string;
  if (!key || !key.length) {
    res.status(400).json({ error: "Missing key" });
    return;
  }

  const { article, title } = await getArticle();

  res.status(200);
  res.json({
    article: encode(article, key),
    title: encode(title, key),
  });
};

export default handler;
