import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { EncodedArticle, ErrorDetail } from "@caviardeul/types";
import { initAPICall } from "@caviardeul/utils/api";
import { getArticleMarkdown } from "@caviardeul/utils/article/wikipedia";
import { encode, generateKey } from "@caviardeul/utils/encryption";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<EncodedArticle | ErrorDetail>,
) => {
  const ok = await initAPICall(req, res, ["GET"]);
  if (!ok) {
    return;
  }

  const rawArticleId = req.query.articleId as string;
  if (!rawArticleId.match(/\d+/)) {
    res.status(404).json({ error: "La page n'a pas été trouvée" });
    return;
  }

  const articleId = parseInt(rawArticleId, 10);
  const dailyArticle = await prismaClient.dailyArticle.findUnique({
    where: { id: articleId },
  });

  if (!dailyArticle || dailyArticle.date > new Date()) {
    res.status(404).json({ error: "L'article n'est pas encore archivé" });
    return;
  }

  const result = await getArticleMarkdown(
    dailyArticle.pageId,
    dailyArticle.pageName,
  );
  if (result === null) {
    res.status(503).json({ error: "L'article n'a pas été trouvé" });
    return;
  }

  const { content } = result;
  const key = generateKey();

  res.status(200);
  res.setHeader("Cache-Control", `s-maxage=${24 * 60 * 60}`);
  res.json({
    key,
    articleId,
    safety: "SAFE",
    archive: true,
    custom: false,
    pageName: encode(dailyArticle.pageName, key),
    content: encode(content, key),
  });
};

export default handler;
