import { NextRequest, NextResponse } from "next/server";
import { FAMILY_COOKIE, MEMBER_COOKIE } from "@/lib/viewer";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/join", req.url));
  res.cookies.delete(FAMILY_COOKIE);
  res.cookies.delete(MEMBER_COOKIE);
  return res;
}
