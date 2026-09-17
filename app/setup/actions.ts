"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
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

function isUniqueConstraintError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
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
  const familyName = data.familyName.trim();
  const memberName = data.memberName.trim();
  if (!familyName || !memberName) {
    return { error: "Please fill in both names." };
  }

  // inviteToken is unique; a collision is extremely unlikely (31^6 space)
  // but retry a few times rather than 500ing on the rare hit.
  let family;
  for (let attempt = 0; ; attempt++) {
    try {
      family = await db.family.create({
        data: { name: familyName, inviteToken: generateInviteCode() },
      });
      break;
    } catch (e) {
      if (isUniqueConstraintError(e) && attempt < 5) continue;
      throw e;
    }
  }

  const initial = memberName.charAt(0).toUpperCase();

  const member = await db.familyMember.create({
    data: {
      familyId: family.id,
      name: memberName,
      initial,
      color: data.color,
      isOrganizer: true,
    },
  });

  await setFamilyToken(family.inviteToken);
  await setViewerId(member.id);
  redirect("/");
}
