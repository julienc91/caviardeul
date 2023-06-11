import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { CustomGameCreation, ErrorDetail } from "@caviardeul/types";
import { getOrCreateUser, getUser, initAPICall } from "@caviardeul/utils/api";
import { getArticleContent } from "@caviardeul/utils/article";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<CustomGameCreation | ErrorDetail>
) => {
  const ok = await initAPICall(req, res, ["POST"]);
  if (!ok) {
    return;
  }

  const { pageId } = req.body;
  if (
    typeof pageId !== "string" ||
    pageId.length === 0 ||
    pageId.match(/[:/]/)
  ) {
    res.status(400).json({ error: "La page est invalide", debug: pageId });
    return;
  }

  let user = await getUser(req, res);
  let customArticle = null;
  let pageName;

  if (user) {
    customArticle = await prismaClient.customArticle.findFirst({
      where: { pageId, createdById: user.id },
    });
  }

  if (!customArticle) {
    const result = await getArticleContent(pageId);
    if (result === null) {
      res.status(400).json({ error: "L'article n'a pas été trouvé" });
      return;
    }

    pageName = result.pageName;
  }

  if (!user) {
    user = await getOrCreateUser(req, res);
  }

  if (!customArticle) {
    customArticle = await prismaClient.customArticle.create({
      data: { pageId, pageName, createdById: user.id },
    });
  }

  res.status(201);
  res.json({
    articleId: customArticle.id,
    pageName: customArticle.pageName,
  });
};

export default handler;
