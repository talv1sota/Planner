import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/join", req.url));
  res.cookies.delete("family_token");
  res.cookies.delete("viewer_member_id");
  return res;
}
