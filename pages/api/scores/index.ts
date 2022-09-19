import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { ArticleStats, Error, User } from "@caviardeul/types";
import { applyCors, getOrCreateUser } from "@caviardeul/utils/api";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{} | Error>
) => {
  await applyCors(req, res);
  const { method } = req;
  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
    return;
  }

  const user = await getOrCreateUser(req, res);
  await postHandler(req, res, user);
};

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{} | Error>,
  user: User
) => {
  const nbAttempts = parseInt(req.body.nbAttempts, 10);
  const nbCorrect = parseInt(req.body.nbCorrect, 10);
  if (
    isNaN(nbCorrect) ||
    isNaN(nbAttempts) ||
    nbCorrect <= 0 ||
    nbAttempts <= 0 ||
    nbCorrect > nbAttempts
  ) {
    res.status(400).json({ error: "Invalid score" });
    return;
  }

  const { articleId, custom } = req.body;
  if (custom) {
    return customArticleHandler(res, user, articleId, nbAttempts, nbCorrect);
  } else {
    return dailyArticleHandler(res, user, articleId, nbAttempts, nbCorrect);
  }
};

const customArticleHandler = async (
  res: NextApiResponse,
  user: User,
  articleId: string,
  nbAttempts: number,
  nbCorrect: number
) => {
  const article = await prismaClient.customArticle.findUnique({
    where: { id: articleId },
  });

  if (!article) {
    res.status(400).json({ error: "Article not found" });
    return;
  }

  if (article.createdById !== user.id) {
    const stats = (article.stats || { distribution: {} }) as ArticleStats;
    const distributionKey = Math.min(Math.floor(nbAttempts / 10), 500);
    stats.distribution[distributionKey] =
      (stats.distribution[distributionKey] || 0) + 1;

    await prismaClient.customArticle.update({
      where: { id: article.id },
      data: {
        nbWinners: { increment: 1 },
        stats,
      },
    });
  }

  res.status(204).json({});
};

const dailyArticleHandler = async (
  res: NextApiResponse,
  user: User,
  articleId: string,
  nbAttempts: number,
  nbCorrect: number
) => {
  const article = await prismaClient.dailyArticle.findUnique({
    where: { id: parseInt(articleId, 10) },
  });

  if (!article || article.date > new Date()) {
    res.status(400).json({ error: "Article not found" });
    return;
  }

  const currentArticle = await prismaClient.dailyArticle.findFirstOrThrow({
    where: { date: { lt: new Date() } },
    orderBy: { date: "desc" },
  });
  const isCurrentArticle = article.id === currentArticle.id;

  try {
    await prismaClient.dailyArticleScore.create({
      data: {
        userId: user.id,
        dailyArticleId: article.id,
        nbAttempts,
        nbCorrect,
      },
    });
  } catch (error) {
    res.status(409).json({ error: "Score already exists" });
    return;
  }

  const stats = (article.stats || { distribution: {} }) as ArticleStats;
  const distributionKey = Math.min(Math.floor(nbAttempts / 10), 500);
  stats.distribution[distributionKey] =
    (stats.distribution[distributionKey] || 0) + 1;

  await prismaClient.dailyArticle.update({
    where: { id: article.id },
    data: {
      nbDailyWinners: isCurrentArticle ? { increment: 1 } : undefined,
      nbWinners: { increment: 1 },
      stats,
    },
  });

  res.status(204).json({});
};

export default handler;
