import prismaClient from "@caviardeul/prisma";
import { ArticleStats } from "@caviardeul/types";
import { getOrCreateUser } from "@caviardeul/lib/user";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const nbAttempts = parseInt(body?.nbAttempts, 10);
  const nbCorrect = parseInt(body?.nbCorrect, 10);
  if (
    isNaN(nbCorrect) ||
    isNaN(nbAttempts) ||
    nbCorrect <= 0 ||
    nbAttempts <= 0 ||
    nbCorrect > nbAttempts
  ) {
    return NextResponse.json(
      {
        error: "Invalid score",
      },
      { status: 400 },
    );
  }

  const { articleId, custom } = body;
  if (custom) {
    return await customArticleHandler(articleId, nbAttempts, nbCorrect);
  } else {
    return await dailyArticleHandler(articleId, nbAttempts, nbCorrect);
  }
};

const customArticleHandler = async (
  articleId: string,
  nbAttempts: number,
  nbCorrect: number,
) => {
  const article = await prismaClient.customArticle.findUnique({
    where: { id: articleId },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 400 });
  }

  const user = await getOrCreateUser();
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

  return new Response(null, { status: 204 });
};

const dailyArticleHandler = async (
  articleId: string,
  nbAttempts: number,
  nbCorrect: number,
) => {
  const article = await prismaClient.dailyArticle.findUnique({
    where: { id: parseInt(articleId, 10) },
  });

  if (!article || article.date > new Date()) {
    return NextResponse.json({ error: "Article not found" }, { status: 400 });
  }

  const currentArticle = await prismaClient.dailyArticle.findFirstOrThrow({
    where: { date: { lt: new Date() } },
    orderBy: { date: "desc" },
  });
  const isCurrentArticle = article.id === currentArticle.id;

  const user = await getOrCreateUser();
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
    return NextResponse.json(
      { error: "Score already exists" },
      { status: 409 },
    );
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

  return new Response(null, { status: 204 });
};
