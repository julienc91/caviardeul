import TurndownService from "turndown";

import { stripArticle } from "@caviardeul/utils/article/parsing";

const convertToMarkdown = (htmlContent: string): string => {
  return new TurndownService().turndown(htmlContent);
};

export const convertArticleToMarkdown = (
  pageTitle: string,
  htmlContent: string,
): string => {
  return `# ${pageTitle}\n\n` + convertToMarkdown(stripArticle(htmlContent));
};
