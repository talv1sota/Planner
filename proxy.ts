import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/join") || pathname.startsWith("/setup") || pathname.startsWith("/reset") || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const familyCookie = req.cookies.get("family_token")?.value;
  if (!familyCookie) {
    return NextResponse.redirect(new URL("/join", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
