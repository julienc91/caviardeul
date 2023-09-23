import { stripArticle } from "@caviardeul/utils/article/parsing";
import { convertArticleToMarkdown } from "@caviardeul/utils/article/markdown";

export const getArticleHtml = async (
  pageId: string,
): Promise<{ pageName: string; content: string } | null> => {
  const wikipediaResponse = await fetch(
    `https://fr.wikipedia.org/w/api.php?action=parse&format=json&page=${pageId}&prop=text&formatversion=2&origin=*`,
  );
  if (wikipediaResponse.status !== 200) {
    return null;
  }

  const result = await wikipediaResponse.json();
  if (result?.error) {
    return null;
  }

  return { pageName: result.parse.title, content: result.parse.text };
};

export const getArticleMarkdown = async (
  pageId: string,
  pageTitle?: string,
): Promise<{ pageName: string; content: string } | null> => {
  const result = await getArticleHtml(pageId);
  if (!result) {
    return null;
  }

  const pageName = pageTitle ?? result.pageName;
  const html = result.content;
  return {
    pageName,
    content: convertArticleToMarkdown(pageName, stripArticle(html)),
  };
};
