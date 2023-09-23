import prismaClient from "@caviardeul/prisma";
import { getArticleHtml } from "@caviardeul/utils/article/wikipedia";
import { sendAdminEmail } from "@caviardeul/utils/email";
import { NextResponse } from "next/server";

export const POST = async () => {
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

  if (!article) {
    await sendAdminEmail(
      "No daily article left",
      `Hi,
We're running out of daily articles, please populate the table with new ones.
Caviardeul Monitoring`,
    );
    return NextResponse.json({ status: "missing" });
  }

  const result = await getArticleHtml(article.pageId);
  if (!result) {
    await sendAdminEmail(
      "Error when retrieving daily article",
      `Hi,
  The daily article for tomorrow ${article.pageId} cannot be retrieved, please have a look.
  Caviardeul Monitoring`,
    );
    return NextResponse.json({ status: "error" });
  }

  const { content } = result;
  if (content.includes("redirectMsg")) {
    await sendAdminEmail(
      "Error when retrieving daily article",
      `Hi,
  The daily article for tomorrow ${article.pageId} has a redirect, please have a look.
  Caviardeul Monitoring`,
    );
    return NextResponse.json({ status: "error" });
  }

  return NextResponse.json({ status: "ok" });
};
