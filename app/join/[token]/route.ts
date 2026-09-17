import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signValue } from "@/lib/auth";
import { FAMILY_COOKIE, COOKIE_OPTS } from "@/lib/viewer";

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
  res.cookies.set(FAMILY_COOKIE, signValue(family.inviteToken), COOKIE_OPTS);
  return res;
}
