import { NextResponse } from "next/server";

import prismaClient from "@caviardeul/prisma";
import { getNextArticleCountdown } from "@caviardeul/utils/article/article";
import { getArticleMarkdown } from "@caviardeul/utils/article/wikipedia";
import { encode, generateKey } from "@caviardeul/utils/encryption";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const dailyArticle = await prismaClient.dailyArticle.findFirstOrThrow({
    where: {
      date: {
        lt: new Date(),
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  const nextArticleCountdown = getNextArticleCountdown();
  const result = await getArticleMarkdown(
    dailyArticle.pageId,
    dailyArticle.pageName,
  );
  if (result === null) {
    return NextResponse.json(
      { error: "L'article n'a pas été trouvé" },
      { status: 503 },
    );
  }

  const { content } = result;
  const key = generateKey();
  return NextResponse.json(
    {
      key,
      articleId: dailyArticle.id,
      safety: "SAFE",
      archive: false,
      custom: false,
      pageName: encode(dailyArticle.pageName, key),
      content: encode(content, key),
    },
    {
      headers: {
        "Cache-Control": `s-maxage=${nextArticleCountdown}`,
      },
    },
  );
};
