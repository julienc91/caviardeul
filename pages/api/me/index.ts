import { User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import prismaClient from "@caviardeul/prisma";
import { ErrorDetail } from "@caviardeul/types";
import { getUser, initAPICall } from "@caviardeul/utils/api";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ id: string } | {} | ErrorDetail>
) => {
  const ok = await initAPICall(req, res, ["GET", "DELETE"]);
  if (!ok) {
    return;
  }

  let user = await getUser(req, res);
  const { method } = req;
  if (method === "DELETE") {
    await deleteHandler(req, res, user);
  } else {
    await getHandler(req, res, user);
  }
};

/**
 * Delete a user
 * @param req
 * @param res
 * @param user
 */
const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{} | ErrorDetail>,
  user: User | null
) => {
  if (!user) {
    res.status(401);
    res.json({ error: "Unauthenticated" });
  } else {
    await prismaClient.user.delete({ where: { id: user.id } });
    res.status(204);
    res.end();
  }
};

/**
 * Get a single user
 * @param req
 * @param res
 * @param user
 */
const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ id: string } | ErrorDetail>,
  user: User | null
) => {
  if (!user) {
    res.status(401);
    res.json({ error: "Unauthenticated" });
  } else {
    res.status(200);
    res.json({ id: user.id });
  }
};

export default handler;
