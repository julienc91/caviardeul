import prismaClient from "@caviardeul/prisma";
import { getArticleMarkdown } from "@caviardeul/utils/article/wikipedia";
import {
  decode,
  encode,
  fromBase64Url,
  generateKey,
} from "@caviardeul/utils/encryption";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { articleId: string } },
) => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw Error("Missing encryption key");
  }

  const articleId = params.articleId;
  let customArticle = await prismaClient.customArticle.findUnique({
    where: { id: articleId },
  });
  let pageId;

  if (customArticle) {
    pageId = customArticle.pageId;
  } else {
    try {
      pageId = decode(fromBase64Url(articleId), encryptionKey);
    } catch (e) {
      return NextResponse.json(
        { error: "La page n'a pas été trouvée" },
        { status: 404 },
      );
    }
  }

  const result = await getArticleMarkdown(pageId, customArticle?.pageName);
  if (result === null) {
    return NextResponse.json(
      { error: "L'artcile n'a pas été trouvée" },
      { status: 404 },
    );
  }

  const { content, pageName } = result;
  const key = generateKey();

  return NextResponse.json(
    {
      key,
      articleId,
      safety: customArticle?.safety ?? "UNKNOWN",
      archive: false,
      custom: true,
      pageName: encode(pageName, key),
      content: encode(content, key),
    },
    { headers: { "Cache-Control": `s-maxage=${24 * 60 * 60}` } },
  );
};
