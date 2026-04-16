"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setFamilyToken } from "@/lib/viewer";

export async function joinWithCode(input: string) {
  const token = input.includes("/join/")
    ? input.split("/join/").pop()?.trim()
    : input.trim();

  if (!token) {
    redirect("/join?error=invalid");
  }

  const family = await db.family.findUnique({
    where: { inviteToken: token },
  });

  if (!family) {
    redirect("/join?error=invalid");
  }

  await setFamilyToken(family.inviteToken);
  redirect("/");
}
