import { convertToMarkdown, stripArticle } from "./parsing";
import { Article } from "../types";
import { encodedPageList, firstGameDate } from "./config";
import { decode } from "./encryption";

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
  puzzleId: number,
  pageName: string
): Promise<Article> => {
  const wikipediaResponse = await fetch(
    `https://fr.wikipedia.org/w/api.php?action=parse&format=json&page=${pageName}&prop=text&formatversion=2&origin=*`
  );
  const content = await wikipediaResponse.json();
  const title = content.parse.title;
  const rawArticle = content.parse.text;
  const article =
    `# ${title}\n\n` + convertToMarkdown(stripArticle(rawArticle));
  return {
    puzzleId,
    pageName,
    title,
    article,
  };
};

export const getCurrentArticlePageId = (): [string, number] => {
  const now = new Date();
  const diff = now.getTime() - firstGameDate.getTime();
  const diffInDays = Math.floor(diff / (1000 * 3600 * 24));
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw Error("Missing encryption key");
  }
  return [
    decode(encodedPageList[diffInDays % encodedPageList.length], encryptionKey),
    diffInDays + 1,
  ];
};
