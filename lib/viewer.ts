import { cookies } from "next/headers";
import { signValue, verifyValue } from "./auth";

const MEMBER_COOKIE = "viewer_member_id";
const FAMILY_COOKIE = "family_token";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
};

export async function getViewerId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(MEMBER_COOKIE)?.value;
  if (!raw) return null;
  return verifyValue(raw);
}

export async function setViewerId(memberId: string) {
  const jar = await cookies();
  jar.set(MEMBER_COOKIE, signValue(memberId), COOKIE_OPTS);
}

export async function getFamilyToken(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(FAMILY_COOKIE)?.value;
  if (!raw) return null;
  return verifyValue(raw);
}

export async function setFamilyToken(inviteToken: string) {
  const jar = await cookies();
  jar.set(FAMILY_COOKIE, signValue(inviteToken), COOKIE_OPTS);
}
