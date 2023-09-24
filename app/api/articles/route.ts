import { DailyArticleScore } from "@prisma/client";
import { NextResponse } from "next/server";

import { getUser } from "@caviardeul/lib/user";
import prismaClient from "@caviardeul/prisma";
import { ArticleInfo } from "@caviardeul/types";
import { getArticleInfoStats } from "@caviardeul/utils/stats";

export const GET = async () => {
  const user = await getUser();
  const dailyArticles = await prismaClient.dailyArticle.findMany({
    where: { date: { lt: new Date() } },
    orderBy: { id: "asc" },
  });

  let dailyArticleScores: DailyArticleScore[] = [];
  if (user) {
    dailyArticleScores = await prismaClient.dailyArticleScore.findMany({
      where: { userId: user.id },
      orderBy: { dailyArticleId: "asc" },
    });
  }

  let scoreIndex = 0;
  const result = dailyArticles.map((dailyArticle) => {
    const data: ArticleInfo = {
      articleId: dailyArticle.id,
      stats: getArticleInfoStats(dailyArticle),
    };
    if (scoreIndex < dailyArticleScores.length) {
      const articleScore = dailyArticleScores[scoreIndex];
      if (articleScore.dailyArticleId === dailyArticle.id) {
        data.pageName = dailyArticle.pageName;
        data.userScore = {
          nbAttempts: articleScore.nbAttempts,
          nbCorrect: articleScore.nbCorrect,
        };
        scoreIndex += 1;
      }
    }
    return data;
  });

  return NextResponse.json(result);
};
