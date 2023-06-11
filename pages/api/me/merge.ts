import { DailyArticleScore, User } from "@prisma/client";
import { setCookie } from "cookies-next";
import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { ErrorDetail } from "@caviardeul/types";
import { getUser, initAPICall } from "@caviardeul/utils/api";
import { COOKIE_MAX_AGE } from "@caviardeul/utils/config";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{} | ErrorDetail>
) => {
  const ok = await initAPICall(req, res, ["POST"]);
  if (!ok) {
    return;
  }

  const user = await getUser(req, res);
  if (!user) {
    res.status(401).json({ error: `You are not authenticated` });
    return;
  }

  await postHandler(req, res, user);
};

/**
 * Merge two users
 * @param req
 * @param res
 * @param user
 */
const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{} | ErrorDetail>,
  user: User
) => {
  const targetUserId = req.body.userId;
  if (!targetUserId) {
    res.status(400).json({ error: "Missing userId" });
    return;
  }

  const targetUser = await prismaClient.user.findUnique({
    where: { id: targetUserId },
  });
  if (!targetUser) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  if (targetUser.id === user.id) {
    res.status(204).end();
    return;
  }

  /* Merge user scores */
  await mergeUserScores(user, targetUser);

  /* Merge custom articles */
  await mergeCustomArticles(user, targetUser);

  /* Delete current user */
  await prismaClient.user.delete({ where: { id: user.id } });
  await prismaClient.user.update({
    where: { id: targetUser.id },
    data: { lastSeenAt: new Date() },
  });

  setCookie("userId", targetUser.id, { res, req, maxAge: COOKIE_MAX_AGE });
  res.status(204).end();
};

const mergeUserScores = async (user: User, targetUser: User) => {
  const currentUserScores = await prismaClient.dailyArticleScore.findMany({
    where: { userId: user.id },
  });
  const targetUserScores = await prismaClient.dailyArticleScore.findMany({
    where: { userId: targetUser.id },
  });

  const targetUserScoresById: Record<number, DailyArticleScore> = {};
  const currentUserScoresToMigrate: DailyArticleScore[] = [];
  const targetUserScoresToDelete: DailyArticleScore[] = [];

  targetUserScores.forEach((score) => {
    targetUserScoresById[score.dailyArticleId] = score;
  });
  currentUserScores.forEach((score) => {
    const targetUserScore = targetUserScoresById[score.dailyArticleId];
    if (!targetUserScore) {
      currentUserScoresToMigrate.push(score);
    } else if (targetUserScore.createdAt > score.createdAt) {
      targetUserScoresToDelete.push(targetUserScore);
      currentUserScoresToMigrate.push(score);
    }
  });

  if (targetUserScoresToDelete.length) {
    await prismaClient.dailyArticleScore.deleteMany({
      where: {
        userId: targetUser.id,
        dailyArticleId: {
          in: targetUserScoresToDelete.map(
            ({ dailyArticleId }) => dailyArticleId
          ),
        },
      },
    });
  }

  if (currentUserScoresToMigrate.length) {
    await prismaClient.dailyArticleScore.updateMany({
      where: {
        userId: user.id,
        dailyArticleId: {
          in: currentUserScoresToMigrate.map(
            ({ dailyArticleId }) => dailyArticleId
          ),
        },
      },
      data: {
        userId: targetUser.id,
      },
    });
  }
};

const mergeCustomArticles = async (user: User, targetUser: User) => {
  const targetUserArticles = await prismaClient.customArticle.findMany({
    where: { createdById: targetUser.id },
  });
  const targetUserArticlesPageIds = targetUserArticles.map(
    ({ pageId }) => pageId
  );
  await prismaClient.customArticle.updateMany({
    where: {
      createdById: user.id,
      pageId: { notIn: targetUserArticlesPageIds },
    },
    data: { createdById: targetUser.id },
  });
};

export default handler;
