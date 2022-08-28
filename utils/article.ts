import prismaClient from "@caviardeul/prisma";
import { Article } from "@caviardeul/types";
import { convertToMarkdown, stripArticle } from "@caviardeul/utils/parsing";

export const getNextArticleCountdown = () => {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const diff = tomorrow.getTime() - now.getTime();
  return Math.round(diff / 1000);
};

export const getArticle = async (
  pageName: string
): Promise<Omit<Article, "puzzleId"> | null> => {
  const wikipediaResponse = await fetch(
    `https://fr.wikipedia.org/w/api.php?action=parse&format=json&page=${pageName}&prop=text&formatversion=2&origin=*`
  );
  if (wikipediaResponse.status !== 200) {
    return null;
  }
  const content = await wikipediaResponse.json();
  if (content?.error) {
    return null;
  }

  const title = content.parse.title;
  const rawArticle = content.parse.text;
  const article =
    `# ${title}\n\n` + convertToMarkdown(stripArticle(rawArticle));
  return {
    pageName,
    title,
    article,
  };
};

export const getTotalGames = async (): Promise<number> => {
  return await prismaClient.dailyArticle.count({
    where: { date: { lt: new Date() } },
  });
};
