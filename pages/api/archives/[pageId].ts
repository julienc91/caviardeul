import type { NextApiRequest, NextApiResponse } from "next";
import { EncodedArticle, Error } from "../../../types";
import { encode, generateKey } from "../../../utils/encryption";
import {
  getArticle,
  getCurrentPageNameAndID,
  getPageNameFromPageId,
} from "../../../utils/article";
import { applyCors } from "../../../utils/api";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<EncodedArticle | Error>
) => {
  await applyCors(req, res);
  const { method } = req;
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
    return;
  }

  const { pageId: rawPageId } = req.query;
  if (typeof rawPageId !== "string" || !rawPageId.match(/\d+/)) {
    res.status(404).json({ error: "La page n'a pas été trouvée" });
    return;
  }

  const pageId = parseInt(rawPageId, 10);
  const [_, currentPageId] = getCurrentPageNameAndID();

  if (pageId >= currentPageId) {
    res.status(404).json({ error: "L'article n'est pas encore archivé" });
    return;
  }

  let pageName;
  try {
    pageName = getPageNameFromPageId(pageId);
  } catch (e) {
    res.status(404).json({ error: "La page n'a pas été trouvée" });
    return;
  }

  const result = await getArticle(pageName);
  if (result === null) {
    res.status(503).json({ error: "L'article n'a pas été trouvé" });
    return;
  }

  const { article, title } = result;
  const key = generateKey();

  res.status(200);
  res.setHeader("Cache-Control", `s-maxage=${24 * 60 * 60}`);
  res.json({
    key,
    puzzleId: pageId,
    pageName: encode(pageName, key),
    article: encode(article, key),
    title: encode(title, key),
  });
};

export default handler;
