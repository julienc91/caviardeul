import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { ErrorDetail } from "@caviardeul/types";
import { initAPICall } from "@caviardeul/utils/api";
import { getArticleContent } from "@caviardeul/utils/article";
import { sendAdminEmail } from "@caviardeul/utils/email";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ status: string } | ErrorDetail>
) => {
  const ok = await initAPICall(req, res, ["POST"], true);
  if (!ok) {
    return;
  }

  const article = await prismaClient.dailyArticle.findFirst({
    where: {
      date: {
        gt: new Date(),
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  res.status(200);

  if (!article) {
    await sendAdminEmail(
      "No daily article left",
      `Hi,
We're running out of daily articles, please populate the table with new ones.
Caviardeul Monitoring`
    );
    res.json({ status: "missing" });
    return;
  }

  const result = await getArticleContent(article.pageId, article.pageName);
  if (!result) {
    await sendAdminEmail(
      "Error when retrieving daily article",
      `Hi,
The daily article for tomorrow ${article.pageId} cannot be retrieved, please have a look.
Caviardeul Monitoring`
    );
    res.json({ status: "error" });
    return;
  }

  const { content } = result;
  if (content.includes("redirectMsg")) {
    await sendAdminEmail(
      "Error when retrieving daily article",
      `Hi,
The daily article for tomorrow ${article.pageId} has a redirect, please have a look.
Caviardeul Monitoring`
    );
    res.json({ status: "error" });
    return;
  }

  res.json({ status: "ok" });
};

export default handler;
