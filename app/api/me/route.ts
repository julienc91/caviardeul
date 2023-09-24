import prismaClient from "@caviardeul/prisma";
import { getUser } from "@caviardeul/lib/user";
import { NextResponse } from "next/server";

export const DELETE = async () => {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  } else {
    await prismaClient.user.delete({ where: { id: user.id } });
    return new Response(null, { status: 204 });
  }
};

export const GET = async () => {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  } else {
    return NextResponse.json({ id: user.id });
  }
};
