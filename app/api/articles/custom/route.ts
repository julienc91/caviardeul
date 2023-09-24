import { NextRequest, NextResponse } from "next/server";

import { getOrCreateUser, getUser } from "@caviardeul/lib/user";
import prismaClient from "@caviardeul/prisma";
import { getArticleHtml } from "@caviardeul/utils/article/wikipedia";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const pageId = body?.pageId;
  if (
    typeof pageId !== "string" ||
    pageId.length === 0 ||
    pageId.match(/[:/]/)
  ) {
    return NextResponse.json(
      {
        error: "La page est invalide",
        debug: pageId,
      },
      { status: 400 },
    );
  }

  let user = await getUser();
  let customArticle = null;
  let pageName;

  if (user) {
    customArticle = await prismaClient.customArticle.findFirst({
      where: { pageId, createdById: user.id },
    });
  }

  if (!customArticle) {
    const result = await getArticleHtml(pageId);
    if (result === null) {
      return NextResponse.json(
        {
          error: "L'article n'a pas été trouvé",
          debug: pageId,
        },
        { status: 400 },
      );
    }

    pageName = result.pageName;
  }

  if (!user) {
    user = await getOrCreateUser();
  }

  if (!customArticle) {
    customArticle = await prismaClient.customArticle.create({
      data: { pageId, pageName, createdById: user.id },
    });
  }

  return NextResponse.json(
    {
      articleId: customArticle.id,
      pageName: customArticle.pageName,
    },
    { status: 201 },
  );
};
