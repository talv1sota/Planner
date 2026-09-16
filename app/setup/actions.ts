"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setFamilyToken, setViewerId } from "@/lib/viewer";

// Lowercase, no ambiguous 0/o/1/i/l — short enough to read out loud or type on a phone.
const INVITE_CODE_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";
function generateInviteCode() {
  const bytes = randomBytes(6);
  let s = "";
  for (let i = 0; i < 6; i++) s += INVITE_CODE_CHARS[bytes[i] % INVITE_CODE_CHARS.length];
  return s;
}

export async function createFamily(data: {
  familyName: string;
  memberName: string;
  color: string;
  inviteCode: string;
}): Promise<{ error: string } | undefined> {
  const validCode = process.env.INVITE_CODE;
  if (!validCode || data.inviteCode !== validCode) {
    return { error: "Invalid invite code." };
  }

  const family = await db.family.create({
    data: { name: data.familyName.trim(), inviteToken: generateInviteCode() },
  });

  const initial = data.memberName.trim().charAt(0).toUpperCase();

  const member = await db.familyMember.create({
    data: {
      familyId: family.id,
      name: data.memberName.trim(),
      initial,
      color: data.color,
      isOrganizer: true,
    },
  });

  await setFamilyToken(family.inviteToken);
  await setViewerId(member.id);
  redirect("/");
}
