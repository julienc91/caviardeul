import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAdminToken, getAuthorizationToken } from "@caviardeul/utils/api";

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/admin/")) {
    const token = getAuthorizationToken(request);
    if (!token) {
      return NextResponse.json(
        {
          error: "Invalid authorization header",
        },
        { status: 401 },
      );
    }

    if (!checkAdminToken(token)) {
      return NextResponse.json(
        {
          error: "Invalid admin token",
        },
        { status: 403 },
      );
    }
  }

  return NextResponse.next();
};
export const config = {
  matcher: "/api/:path*",
};
