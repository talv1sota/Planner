import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signValue } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const family = await db.family.findUnique({
    where: { inviteToken: token },
  });

  if (!family) {
    return NextResponse.redirect(new URL("/join?error=invalid", req.url));
  }

  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("family_token", signValue(family.inviteToken), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
