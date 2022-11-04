import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { ErrorDetail } from "@caviardeul/types";
import { applyCors, authenticateAdmin } from "@caviardeul/utils/api";

const data: [string, string][] = []; // list of [pageId, pageName], must be shuffled!
const exceptions: Set<string> = new Set(); // exceptions to pageId <-> pageName mismatch

const datePlusNbDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ count: number } | ErrorDetail>
) => {
  await applyCors(req, res);
  if (!authenticateAdmin(req, res)) {
    return;
  }

  const { method } = req;
  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
    return;
  }

  const currentArticles = await prismaClient.dailyArticle.findMany({
    orderBy: { id: "asc" },
  });
  const currentPageIds = new Set(
    currentArticles.map(({ pageId }) => pageId.toLowerCase())
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
    res
      .status(400)
      .json({ error: `Duplicated articles: ${duplicates.join(", ")}` });
    return;
  } else if (invalid.length > 0) {
    res.status(400).json({ error: `Invalid articles: ${invalid.join(", ")}` });
    return;
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

  res.status(200).json({ count });
};

export default handler;
