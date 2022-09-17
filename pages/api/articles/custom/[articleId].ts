import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { EncodedArticle, Error } from "@caviardeul/types";
import { applyCors } from "@caviardeul/utils/api";
import { getArticleContent } from "@caviardeul/utils/article";
import {
  decode,
  encode,
  fromBase64Url,
  generateKey,
} from "@caviardeul/utils/encryption";

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

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw Error("Missing encryption key");
  }

  res.setHeader("Cache-Control", `s-maxage=${24 * 60 * 60}`);

  const articleId = req.query.articleId as string;

  let customArticle = await prismaClient.customArticle.findUnique({
    where: { id: articleId },
  });
  let pageId;

  if (customArticle) {
    pageId = customArticle.pageId;
  } else {
    try {
      pageId = decode(fromBase64Url(articleId), encryptionKey);
    } catch (e) {
      res.status(404).json({ error: "La page n'a pas été trouvée" });
      return;
    }
  }

  const result = await getArticleContent(pageId);
  if (result === null) {
    res.status(404).json({ error: "L'article n'a pas été trouvé" });
    return;
  }

  const { content, pageName } = result;
  const key = generateKey();

  res.status(200);
  res.setHeader("Cache-Control", `s-maxage=${24 * 60 * 60}`);
  res.json({
    key,
    articleId,
    archive: false,
    custom: true,
    pageName: encode(pageName, key),
    content: encode(content, key),
  });
};

export default handler;
