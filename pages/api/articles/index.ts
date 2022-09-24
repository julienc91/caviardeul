import { DailyArticleScore } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { ArticleInfo, Error } from "@caviardeul/types";
import { applyCors, getUser } from "@caviardeul/utils/api";
import { getArticleInfoStats } from "@caviardeul/utils/stats";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ArticleInfo[] | Error>
) => {
  await applyCors(req, res);
  const { method } = req;
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
    return;
  }

  const user = await getUser(req, res);
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

  res.status(200);
  res.json(result);
};

export default handler;
