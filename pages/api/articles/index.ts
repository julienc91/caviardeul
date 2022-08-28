import { DailyArticleScore } from "@prisma/client";
import { deleteCookie, getCookie } from "cookies-next";
import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { ArticleInfo, Error } from "@caviardeul/types";
import { applyCors } from "@caviardeul/utils/api";

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

  const userId = getCookie("userId", { req, res });
  const dailyArticles = await prismaClient.dailyArticle.findMany({
    where: { date: { lt: new Date() } },
    orderBy: { id: "asc" },
  });

  let dailyArticleScores: DailyArticleScore[] = [];
  if (typeof userId === "string" && userId.length) {
    const user = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!user) {
      deleteCookie("userId", { req, res });
    } else {
      dailyArticleScores = await prismaClient.dailyArticleScore.findMany({
        where: { userId: user.id },
        orderBy: { dailyArticleId: "asc" },
      });
    }
  }

  let scoreIndex = 0;
  const result = dailyArticles.map((dailyArticle) => {
    const data: ArticleInfo = {
      articleId: dailyArticle.id,
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
