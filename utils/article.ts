import { convertToMarkdown, stripArticle } from "./parsing";
import { Article } from "../types";

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
