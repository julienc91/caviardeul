import { User } from "@prisma/client";
import { deleteCookie, getCookie } from "cookies-next";
import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { CustomGameCreation, Error } from "@caviardeul/types";
import { applyCors } from "@caviardeul/utils/api";
import { getArticleContent } from "@caviardeul/utils/article";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<CustomGameCreation | Error>
) => {
  await applyCors(req, res);
  const { method } = req;
  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
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

  const userId = (getCookie("userId", { req, res }) || "") as string;
  let user: User | null = null;
  if (userId) {
    user = await prismaClient.user.findUnique({ where: { id: userId } });
  }

  if (!user) {
    deleteCookie("userId", { req, res });
    res.status(401).json({ error: "Vous n'êtes pas authentifié" });
    return;
  }

  let customArticle = await prismaClient.customArticle.findFirst({
    where: { pageId, createdById: userId },
  });
  if (!customArticle) {
    const result = await getArticleContent(pageId);
    if (result === null) {
      res.status(400).json({ error: "L'article n'a pas été trouvé" });
      return;
    }

    const { pageName } = result;
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
