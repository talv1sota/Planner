"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setFamilyToken, setViewerId } from "@/lib/viewer";

function generateInviteCode() {
  return randomBytes(4).toString("hex"); // 8 hex chars, e.g. "a3f1b90c"
}

export async function createFamily(data: {
  familyName: string;
  memberName: string;
  color: string;
}) {
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
