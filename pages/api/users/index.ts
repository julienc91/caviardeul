import { setCookie } from "cookies-next";
import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { Error, User } from "@caviardeul/types";
import { applyCors } from "@caviardeul/utils/api";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<User | Error>
) => {
  await applyCors(req, res);
  const { method } = req;
  if (method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
    return;
  }

  const user = await prismaClient.user.create({ data: {} });
  setCookie("userId", user.id, { req, res });
  res.status(201);
  res.json({ id: user.id });
};

export default handler;