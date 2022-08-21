import type { NextApiRequest, NextApiResponse } from "next";
import { getCookie } from "cookies-next";
import prismaClient from "../../../../prisma";
import { User, Error } from "../../../../types";
import { applyCors } from "../../../../utils/api";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<User | {} | Error>
) => {
  await applyCors(req, res);
  const { method } = req;
  if (method !== "GET" && method !== "DELETE") {
    res.setHeader("Allow", ["GET", "DELETE"]);
    res.status(405).json({ error: `Method ${method} Not Allowed` });
    return;
  }

  const { userId } = req.query;
  if (
    typeof userId !== "string" ||
    !userId.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  ) {
    res.status(404).json({ error: "Page not found" });
    return;
  }

  if (method === "DELETE") {
    await deleteHandler(req, res, userId);
  } else {
    await getHandler(req, res, userId);
  }
};

/**
 * Delete a user
 * @param req
 * @param res
 * @param userId
 */
const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{} | Error>,
  userId: string
) => {
  const cookieUserId = getCookie("userId", { req, res });
  if (cookieUserId !== userId) {
    res.status(401);
    res.json({ error: "Unauthorized" });
    return;
  }

  try {
    await prismaClient.user.delete({ where: { id: userId } });
  } catch (error) {
    res.status(404);
    res.json({ error: "User not found" });
  }
  res.status(204);
  res.json({});
};

/**
 * Get a single user
 * @param req
 * @param res
 * @param userId
 */
const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<User | Error>,
  userId: string
) => {
  let user;
  try {
    user = await prismaClient.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  } catch (error) {
    res.status(404);
    res.json({ error: "User not found" });
    return;
  }
  res.status(200);
  res.json({ id: user.id });
};

export default handler;
