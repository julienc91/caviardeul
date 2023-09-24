import { User } from "@prisma/client";
import { cookies } from "next/headers";
import prismaClient from "@caviardeul/prisma";
import {
  COOKIE_MAX_AGE,
  LAST_SEEN_AT_UPDATE_THRESHOLD,
} from "@caviardeul/utils/config";

export const getUser = async (): Promise<User | null> => {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value ?? "";

  let user: User | null = null;
  if (userId) {
    user = await prismaClient.user.findUnique({ where: { id: userId } });
  }

  if (userId && !user) {
    cookieStore.delete("userId");
  } else if (user) {
    const lastSeenAtThreshold = new Date();
    lastSeenAtThreshold.setSeconds(
      lastSeenAtThreshold.getSeconds() - LAST_SEEN_AT_UPDATE_THRESHOLD,
    );
    if (user.lastSeenAt < lastSeenAtThreshold) {
      await prismaClient.user.updateMany({
        where: { id: user.id, lastSeenAt: { lt: lastSeenAtThreshold } },
        data: { lastSeenAt: new Date() },
      });
    }
  }
  return user;
};

export const getOrCreateUser = async (): Promise<User> => {
  let user = await getUser();
  if (!user) {
    user = await prismaClient.user.create({ data: {} });
    const cookieStore = cookies();
    cookieStore.set("userId", user.id, { maxAge: COOKIE_MAX_AGE });
  }
  return user;
};
