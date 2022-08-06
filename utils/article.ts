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

export const getCurrentPageNameAndID = (): [string, number] => {
  return getPageNameAndIDFromDate(new Date());
};

export const getPageNameAndIDFromDate = (date: Date): [string, number] => {
  if (date > new Date()) {
    throw Error("Date in the future");
  } else if (date < firstGameDate) {
    throw Error("Date before the first game");
  }
  const diff = date.getTime() - firstGameDate.getTime();
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

export const getPageNameFromPageId = (pageId: number): string => {
  if (pageId <= 0) {
    throw Error("Invalid page id");
  }

  const articleDate = new Date(
    firstGameDate.getTime() + (pageId - 1) * 1000 * 3600 * 24
  );

  const [pageName, _] = getPageNameAndIDFromDate(articleDate);
  return pageName;
};
