import type { NextApiRequest, NextApiResponse } from "next";
import { EncodedArticle, Error } from "../../../types";
import {
  decode,
  encode,
  fromBase64Url,
  generateKey,
} from "../../../utils/encryption";
import { getArticle } from "../../../utils/article";
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

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw Error("Missing encryption key");
  }

  res.setHeader("Cache-Control", `s-maxage=${24 * 60 * 60}`);

  const { pageId } = req.query;
  if (typeof pageId !== "string" || pageId.length === 0) {
    res.status(404).json({ error: "La page n'a pas été trouvée" });
    return;
  }

  let pageName;
  try {
    pageName = decode(fromBase64Url(pageId), encryptionKey);
  } catch (e) {
    res.status(404).json({ error: "La page n'a pas été trouvée" });
    return;
  }

  const result = await getArticle(pageName);
  if (result === null) {
    res.status(404).json({ error: "L'article n'a pas été trouvé" });
    return;
  }

  const { article, title } = result;
  const key = generateKey();

  res.status(200);
  res.setHeader("Cache-Control", `s-maxage=${24 * 60 * 60}`);
  res.json({
    key,
    puzzleId: 0,
    pageName: encode(pageName, key),
    article: encode(article, key),
    title: encode(title, key),
  });
};

export default handler;
