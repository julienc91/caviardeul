import { User } from "@prisma/client";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { IncomingMessage, ServerResponse } from "http";
import { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import {
  COOKIE_MAX_AGE,
  LAST_SEEN_AT_UPDATE_THRESHOLD,
} from "@caviardeul/utils/config";
import { NextRequest } from "next/server";

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

export const initAPICall = async (
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: string[],
) => {
  const { method } = req;
  if (!method || !allowedMethods.includes(method)) {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
    return false;
  }
  return true;
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

export const getOrCreateUser = async (
  req: ServerRequest,
  res: ServerResponse,
): Promise<User> => {
  let user = await getUser(req, res);
  if (!user) {
    user = await prismaClient.user.create({ data: {} });
    setCookie("userId", user.id, { req, res, maxAge: COOKIE_MAX_AGE });
  }
  return user;
};
