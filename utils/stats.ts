import { DailyArticle } from "@prisma/client";

import {
  ArticleInfoStats,
  ArticleStats,
  StatsCategory,
} from "@caviardeul/types";

export const getArticleInfoStats = (
  article: DailyArticle
): ArticleInfoStats => {
  const articleStats = article.stats as ArticleStats | null;
  const attempts = articleStats?.distribution
    ? Object.keys(articleStats.distribution)
        .map((nbAttempts: string) =>
          Array(articleStats.distribution[parseInt(nbAttempts)]).fill(
            parseInt(nbAttempts) * 10
          )
        )
        .flat()
        .sort()
    : [];

  const mean = attempts.reduce((a, b) => a + b, 0) / (attempts.length || 1);
  const median = Math.max(
    attempts.length > 0 ? attempts[Math.floor(attempts.length / 2)] : 0,
    10
  );

  return {
    mean,
    median,
    nbWinners: article.nbWinners,
    category: getStatsCategoryFromMedianAttempts(median),
  };
};

const getStatsCategoryFromMedianAttempts = (median: number): StatsCategory => {
  if (median < 30) {
    return 0;
  } else if (median < 75) {
    return 1;
  } else if (median < 125) {
    return 2;
  } else if (median < 200) {
    return 3;
  } else {
    return 4;
  }
};
