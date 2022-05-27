import { convertToMarkdown, stripArticle } from "./parsing";
import { Article } from "../types";
import { encodedPageList, firstGameDate } from "./settings";
import { decode } from "./encryption";

export const getArticle = async (pageName: string): Promise<Article> => {
  const wikipediaResponse = await fetch(
    `https://fr.wikipedia.org/w/api.php?action=parse&format=json&page=${pageName}&prop=text&formatversion=2&origin=*`
  );
  const content = await wikipediaResponse.json();
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

export const getCurrentArticlePageName = (): string => {
  const now = new Date();
  const diff = now.getTime() - firstGameDate.getTime();
  const diffInDays = Math.floor(diff / (1000 * 3600 * 24));
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw Error("Missing encryption key");
  }
  return decode(
    encodedPageList[diffInDays % encodedPageList.length],
    encryptionKey
  );
};
