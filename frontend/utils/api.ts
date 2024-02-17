import { User } from "@prisma/client";
import { deleteCookie, getCookie } from "cookies-next";
import { IncomingMessage, ServerResponse } from "http";
import { NextRequest } from "next/server";

import prismaClient from "@caviardeul/prisma";
import { LAST_SEEN_AT_UPDATE_THRESHOLD } from "@caviardeul/utils/config";

export const getAuthorizationToken = (request: NextRequest): string | null => {
  const headers = new Headers(request.headers);
  const authorizationHeader = headers.get("Authorization");
  if (!authorizationHeader) {
    return null;
  }

  const prefix = "Bearer ";
  if (!authorizationHeader.startsWith(prefix)) {
    return null;
  }

  return authorizationHeader.slice(prefix.length);
};

export const checkAdminToken = (token: string): boolean => {
  if (!process.env.ADMIN_TOKEN) {
    throw new Error("ADMIN_TOKEN isn't set");
  }
  return token === process.env.ADMIN_TOKEN;
};

type ServerRequest = IncomingMessage & {
  cookies?: { [key: string]: string } | Partial<{ [key: string]: string }>;
};

export const getUser = async (
  req: ServerRequest,
  res: ServerResponse,
): Promise<User | null> => {
  const userId = (getCookie("userId", { req, res }) || "") as string;

  let user: User | null = null;
  if (userId !== "") {
    user = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!user) {
      deleteCookie("userId", { req, res });
    } else {
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
  }
  return user;
};
