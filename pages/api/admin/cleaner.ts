import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { EncodedArticle, ErrorDetail } from "@caviardeul/types";
import { applyCors, authenticateAdmin } from "@caviardeul/utils/api";
import { ADMIN_CLEANUP_LAST_SEEN_AT_THRESHOLD } from "@caviardeul/utils/config";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<EncodedArticle | ErrorDetail>
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

  const thresholdDate = new Date();
  thresholdDate.setSeconds(
    thresholdDate.getSeconds() - ADMIN_CLEANUP_LAST_SEEN_AT_THRESHOLD
  );
  await prismaClient.user.deleteMany({
    where: { lastSeenAt: { lt: thresholdDate } },
  });

  res.status(204).end();
};

export default handler;
