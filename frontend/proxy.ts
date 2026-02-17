import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname.replace(/^\/api/, "");
  const search = request.nextUrl.search;
  return NextResponse.rewrite(new URL(`${path}${search}`, backendUrl));
}

export const config = {
  matcher: "/api/:path*",
};
