import type { NextApiRequest, NextApiResponse } from "next";
import { EncodedArticle, Error } from "../../types";
import { encode, generateKey } from "../../utils/encryption";
import {
  getArticle,
  getCurrentArticlePageId,
  getNextArticleCountdown,
} from "../../utils/article";
import { applyCors } from "../../utils/api";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<EncodedArticle | Error>
) => {
  await applyCors(req, res);
  const { method } = req;
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
    return;
  }

  const [pageName, puzzleId] = getCurrentArticlePageId();
  const nextArticleCountdown = getNextArticleCountdown();
  const result = await getArticle(pageName);
  if (result === null) {
    res.status(503).json({ error: "L'article n'a pas été trouvé" });
    return;
  }

  const { article, title } = result;
  const key = generateKey();

  res.status(200);
  res.setHeader("Cache-Control", `s-maxage=${nextArticleCountdown}`);
  res.json({
    key,
    puzzleId,
    pageName: encode(pageName, key),
    article: encode(article, key),
    title: encode(title, key),
  });
};

export default handler;
