import { convertToMarkdown, stripArticle } from "./parsing";
import { Article } from "../types";

export const getArticle = async (): Promise<Article> => {
  const page = "Charlie_Chaplin";
  const wikipediaResponse = await fetch(
    `https://fr.wikipedia.org/w/api.php?action=parse&format=json&page=${page}&prop=text&formatversion=2&origin=*`
  );
  const content = await wikipediaResponse.json();
  const title = content.parse.title;
  const rawArticle = content.parse.text;
  const article =
    `# ${title}\n\n` + convertToMarkdown(stripArticle(rawArticle));
  return {
    title,
    article,
  };
};
