import prismaClient from "@caviardeul/prisma";
import { NextResponse } from "next/server";

const data: [string, string][] = []; // list of [pageId, pageName], must be shuffled!
const exceptions: Set<string> = new Set(); // exceptions to pageId <-> pageName mismatch

const datePlusNbDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

export const POST = async () => {
  const currentArticles = await prismaClient.dailyArticle.findMany({
    orderBy: { id: "asc" },
  });
  const currentPageIds = new Set(
    currentArticles.map(({ pageId }) => pageId.toLowerCase()),
  );

  const duplicates = [];
  const invalid = [];

  for (let [pageId, pageName] of data) {
    const key = pageId.toLowerCase();
    if (currentPageIds.has(key)) {
      duplicates.push(pageId);
    }
    if (pageId.indexOf(" ") >= 0) {
      invalid.push(pageId);
    } else if (pageName.indexOf("_") >= 0) {
      invalid.push(pageId);
    } else if (
      pageId.replace(/_/g, " ") !== pageName &&
      !exceptions.has(pageId)
    ) {
      invalid.push(pageId);
    }
    currentPageIds.add(key);
  }

  if (duplicates.length > 0) {
    return NextResponse.json(
      {
        error: `Duplicated articles`,
        detail: `${duplicates.join(", ")}`,
      },
      { status: 400 },
    );
  } else if (invalid.length > 0) {
    return NextResponse.json(
      {
        error: `Invalid articles`,
        detail: `${invalid.join(", ")}`,
      },
      { status: 400 },
    );
  }

  const latestArticle = currentArticles[currentArticles.length - 1];

  const { count } = await prismaClient.dailyArticle.createMany({
    data: data.map(([pageId, pageName], index) => ({
      id: latestArticle.id + 1 + index,
      date: datePlusNbDays(latestArticle.date, index + 1),
      pageId,
      pageName,
    })),
  });

  return NextResponse.json({ count }, { status: 201 });
};
