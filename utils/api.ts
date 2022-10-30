import { User } from "@prisma/client";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import Cors from "cors";
import { IncomingMessage, ServerResponse } from "http";
import { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import {
  COOKIE_MAX_AGE,
  LAST_SEEN_AT_UPDATE_THRESHOLD,
} from "@caviardeul/utils/config";

const cors = Cors();

export const applyCors = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export const authenticateAdmin = (
  req: NextApiRequest,
  res: NextApiResponse
): boolean => {
  if (!process.env.ADMIN_TOKEN) {
    throw new Error("ADMIN_TOKEN isn't set");
  }

  const authenticationHeader = req.headers.authorization;
  if (!authenticationHeader) {
    res.status(401).json({ error: "Missing authorization header" });
    return false;
  }

  const prefix = "Bearer ";
  if (!authenticationHeader.startsWith(prefix)) {
    res.status(401).json({ error: "Invalid authorization header" });
    return false;
  }

  const token = authenticationHeader.slice(prefix.length);
  if (token !== process.env.ADMIN_TOKEN) {
    res.status(403).json({ error: "Invalid admin token" });
    return false;
  }
  return true;
};

type ServerRequest = IncomingMessage & {
  cookies?: { [key: string]: string } | Partial<{ [key: string]: string }>;
};

export const getUser = async (
  req: ServerRequest,
  res: ServerResponse
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
        lastSeenAtThreshold.getSeconds() - LAST_SEEN_AT_UPDATE_THRESHOLD
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
  res: ServerResponse
): Promise<User> => {
  let user = await getUser(req, res);
  if (!user) {
    user = await prismaClient.user.create({ data: {} });
    setCookie("userId", user.id, { req, res, maxAge: COOKIE_MAX_AGE });
  }
  return user;
};
