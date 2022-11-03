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

export const getArticleContent = async (
  pageId: string,
  pageTitle?: string
): Promise<{ pageName: string; content: string } | null> => {
  const wikipediaResponse = await fetch(
    `https://fr.wikipedia.org/w/api.php?action=parse&format=json&page=${pageId}&prop=text&formatversion=2&origin=*`
  );
  if (wikipediaResponse.status !== 200) {
    return null;
  }
  const result = await wikipediaResponse.json();
  if (result?.error) {
    return null;
  }

  const pageName = pageTitle ?? result.parse.title;
  const rawArticle = result.parse.text;
  const content =
    `# ${pageName}\n\n` + convertToMarkdown(stripArticle(rawArticle));
  return { pageName, content };
};
