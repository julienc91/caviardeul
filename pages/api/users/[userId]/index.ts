import type { NextApiRequest, NextApiResponse } from "next";
import prismaClient from "../../../../prisma";
import { User, Error } from "../../../../types";
import { applyCors } from "../../../../utils/api";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<User | Error>
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

  let user;

  try {
    if (method === "DELETE") {
      user = await prismaClient.user.delete({ where: { id: userId } });
    } else {
      user = await prismaClient.user.update({
        where: { id: userId },
        data: { lastSeenAt: new Date() },
      });
    }
    res.status(200);
    res.json({ id: user.id });
  } catch (error) {
    res.status(404);
    res.json({ error: "User not found" });
  }
};

export default handler;
