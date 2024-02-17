import { DailyArticleScore, User } from "@prisma/client";
import { setCookie } from "cookies-next";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@caviardeul/lib/user";
import prismaClient from "@caviardeul/prisma";
import { COOKIE_MAX_AGE } from "@caviardeul/utils/config";

export const POST = async (request: NextRequest) => {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: "You are not authenticated" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const targetUserId = body?.userId;
  if (!targetUserId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const targetUser = await prismaClient.user.findUnique({
    where: { id: targetUserId },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  if (targetUser.id !== user.id) {
    await mergeUserScores(user, targetUser);
    await mergeCustomArticles(user, targetUser);

    /* Delete current user */
    await prismaClient.user.delete({ where: { id: user.id } });
    await prismaClient.user.update({
      where: { id: targetUser.id },
      data: { lastSeenAt: new Date() },
    });

    const cookieStore = cookies();
    cookieStore.set("userId", targetUser.id);
    setCookie("userId", targetUser.id, { maxAge: COOKIE_MAX_AGE });
  }

  return new Response(null, { status: 204 });
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
            ({ dailyArticleId }) => dailyArticleId,
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
            ({ dailyArticleId }) => dailyArticleId,
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
    ({ pageId }) => pageId,
  );
  await prismaClient.customArticle.updateMany({
    where: {
      createdById: user.id,
      pageId: { notIn: targetUserArticlesPageIds },
    },
    data: { createdById: targetUser.id },
  });
};
