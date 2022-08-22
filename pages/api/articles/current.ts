import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { EncodedArticle, Error } from "@caviardeul/types";
import { applyCors } from "@caviardeul/utils/api";
import { getArticle, getNextArticleCountdown } from "@caviardeul/utils/article";
import { encode, generateKey } from "@caviardeul/utils/encryption";

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

  const { id: puzzleId, pageId: pageName } =
    await prismaClient.dailyArticle.findFirstOrThrow({
      where: {
        date: {
          lt: new Date(),
        },
      },
      orderBy: {
        id: "desc",
      },
    });

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
    puzzleId: Number(puzzleId),
    pageName: encode(pageName, key),
    article: encode(article, key),
    title: encode(title, key),
  });
};

export default handler;
