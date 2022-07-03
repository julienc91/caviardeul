import type { NextApiRequest, NextApiResponse } from "next";
import { CustomGameCreation, Error } from "../../../types";
import { encode, toBase64Url } from "../../../utils/encryption";
import { getArticle } from "../../../utils/article";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<CustomGameCreation | Error>
) => {
  const { method } = req;
  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
    return;
  }

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw Error("Missing encryption key");
  }

  res.setHeader("Cache-Control", `s-maxage=${24 * 60 * 60}`);

  const { pageName } = req.body;
  if (
    typeof pageName !== "string" ||
    pageName.length === 0 ||
    pageName.match(/[:/]/)
  ) {
    res.status(400).json({ error: "Invalid page name", debug: pageName });
    return;
  }

  const result = await getArticle(pageName);
  if (result === null) {
    res.status(400).json({ error: "Article not found" });
    return;
  }

  const { title } = result;
  const pageId = toBase64Url(encode(pageName, encryptionKey));

  res.status(201);
  res.json({
    title,
    pageId,
  });
};

export default handler;
