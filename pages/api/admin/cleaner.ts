import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { ErrorDetail } from "@caviardeul/types";
import { applyCors, authenticateAdmin } from "@caviardeul/utils/api";
import { ADMIN_CLEANUP_LAST_SEEN_AT_THRESHOLD } from "@caviardeul/utils/config";

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

  const thresholdDate = new Date();
  thresholdDate.setSeconds(
    thresholdDate.getSeconds() - ADMIN_CLEANUP_LAST_SEEN_AT_THRESHOLD
  );
  const { count } = await prismaClient.user.deleteMany({
    where: { lastSeenAt: { lt: thresholdDate } },
  });

  res.status(200).json({ count });
};

export default handler;
