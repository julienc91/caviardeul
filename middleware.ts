import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { BASE_URL, DEPRECATED_DOMAIN } from "@caviardeul/utils/config";

export const middleware = async (req: NextRequest, event: NextFetchEvent) => {
  if (req.nextUrl.host === DEPRECATED_DOMAIN) {
    return NextResponse.redirect(
      new URL(`${BASE_URL}${req.nextUrl.pathname}`),
      308
    );
  }
  return NextResponse.next();
};
