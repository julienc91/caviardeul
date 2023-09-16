import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { ErrorDetail } from "@caviardeul/types";
import { initAPICall } from "@caviardeul/utils/api";
import { ADMIN_CLEANUP_LAST_SEEN_AT_THRESHOLD } from "@caviardeul/utils/config";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ count: number } | ErrorDetail>,
) => {
  const ok = await initAPICall(req, res, ["POST"]);
  if (!ok) {
    return;
  }

  const thresholdDate = new Date();
  thresholdDate.setSeconds(
    thresholdDate.getSeconds() - ADMIN_CLEANUP_LAST_SEEN_AT_THRESHOLD,
  );
  const { count } = await prismaClient.user.deleteMany({
    where: { lastSeenAt: { lt: thresholdDate } },
  });

  res.status(200).json({ count });
};

export default handler;
