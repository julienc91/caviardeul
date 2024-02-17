import { NextRequest, NextResponse } from "next/server";

import prismaClient from "@caviardeul/prisma";
import { getParsedArticle } from "@caviardeul/utils/article/wikipedia";
import { encode, generateKey } from "@caviardeul/utils/encryption";

export const GET = async (
  request: NextRequest,
  { params }: { params: { articleId: string } },
) => {
  const rawArticleId = params.articleId;
  if (!rawArticleId.match(/\d+/)) {
    return NextResponse.json(
      { error: "La page n'a pas été trouvée" },
      { status: 404 },
    );
  }

  const articleId = parseInt(rawArticleId, 10);
  const dailyArticle = await prismaClient.dailyArticle.findUnique({
    where: { id: articleId },
  });

  if (!dailyArticle || dailyArticle.date > new Date()) {
    return NextResponse.json(
      { error: "L'article n'est pas encore archivé" },
      { status: 404 },
    );
  }

  const result = await getParsedArticle(
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
      articleId,
      safety: "SAFE",
      archive: true,
      custom: false,
      pageName: encode(dailyArticle.pageName, key),
      content: encode(content, key),
    },
    {
      headers: {
        "Cache-Control": `s-maxage=${24 * 60 * 60}`,
      },
    },
  );
};
