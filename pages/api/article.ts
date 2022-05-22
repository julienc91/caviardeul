import type { NextApiRequest, NextApiResponse } from "next";
import { Article } from "../../types";
import { convertToMarkdown, stripArticle } from "../../utils/parsing";

const handler = async (req: NextApiRequest, res: NextApiResponse<Article>) => {
  const page = "Charlie_Chaplin";
  const wikipediaResponse = await fetch(
    `https://fr.wikipedia.org/w/api.php?action=parse&format=json&page=${page}&prop=text&formatversion=2&origin=*`
  );
  const content = await wikipediaResponse.json();
  const title = content.parse.title;
  const rawArticle = content.parse.text;
  const article =
    `# ${title}\n\n` + convertToMarkdown(stripArticle(rawArticle));

  res.status(200);
  res.json({
    article,
    title,
  });
};

export default handler;
