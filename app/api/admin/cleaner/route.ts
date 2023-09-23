import prismaClient from "@caviardeul/prisma";
import { ADMIN_CLEANUP_LAST_SEEN_AT_THRESHOLD } from "@caviardeul/utils/config";
import { NextResponse } from "next/server";

export const POST = async () => {
  const thresholdDate = new Date();
  thresholdDate.setSeconds(
    thresholdDate.getSeconds() - ADMIN_CLEANUP_LAST_SEEN_AT_THRESHOLD,
  );
  const { count } = await prismaClient.user.deleteMany({
    where: { lastSeenAt: { lt: thresholdDate } },
  });

  return NextResponse.json({ count });
};
