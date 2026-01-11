import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("mt_token")?.value;
  const path = req.nextUrl.pathname;

  const isProtected = path.startsWith("/admin") || path.startsWith("/owner");

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/owner/:path*"],
};
