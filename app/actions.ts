"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getViewerId, setViewerId } from "@/lib/viewer";

async function requireViewer() {
  const id = await getViewerId();
  if (!id) throw new Error("Not authenticated");
  const member = await db.familyMember.findUnique({ where: { id } });
  if (!member) throw new Error("Unknown member");
  return member;
}

async function requireItemAccess(itemId: string) {
  const viewer = await requireViewer();
  const item = await db.item.findUnique({ where: { id: itemId } });
  if (!item || item.familyId !== viewer.familyId) {
    throw new Error("Not authorized");
  }
  return { viewer, item };
}

export async function addNewMember(data: {
  familyId: string;
  name: string;
  color: string;
}) {
  const initial = data.name.charAt(0).toUpperCase();
  const member = await db.familyMember.create({
    data: {
      familyId: data.familyId,
      name: data.name,
      initial,
      color: data.color,
      isOrganizer: false,
    },
  });
  await setViewerId(member.id);
  revalidatePath("/");
}

export async function pickMember(memberId: string) {
  const member = await db.familyMember.findUnique({
    where: { id: memberId },
  });
  if (!member) throw new Error("Unknown member");
  await setViewerId(memberId);
  revalidatePath("/");
}

export async function createItem(data: {
  familyId: string;
  title: string;
  category: string;
  kind: string;
  date?: string;
  endDate?: string;
  timeOfDay: string[];
  cost: string;
  pricePerPerson?: number;
  location?: string;
  notes?: string;
  addedById: string;
}) {
  const viewer = await requireViewer();
  if (data.familyId !== viewer.familyId) throw new Error("Not authorized");

  const item = await db.item.create({
    data: {
      familyId: data.familyId,
      title: data.title,
      category: data.category,
      kind: data.kind,
      date: data.date || null,
      endDate: data.endDate || null,
      timeOfDay: data.timeOfDay.join(","),
      cost: data.cost,
      pricePerPerson: data.pricePerPerson ?? null,
      location: data.location || null,
      notes: data.notes || null,
      addedById: data.addedById,
    },
  });

  await db.interest.create({
    data: { itemId: item.id, memberId: viewer.id },
  });

  revalidatePath("/");
  return item.id;
}

export async function updateItem(
  itemId: string,
  data: {
    title: string;
    category: string;
    kind: string;
    date?: string;
    endDate?: string;
    timeOfDay: string[];
    cost: string;
    pricePerPerson?: number;
    location?: string;
    notes?: string;
    addedById: string;
  },
) {
  await requireItemAccess(itemId);

  await db.item.update({
    where: { id: itemId },
    data: {
      title: data.title,
      category: data.category,
      kind: data.kind,
      date: data.date || null,
      endDate: data.endDate || null,
      timeOfDay: data.timeOfDay.join(","),
      cost: data.cost,
      pricePerPerson: data.pricePerPerson ?? null,
      location: data.location || null,
      notes: data.notes || null,
      addedById: data.addedById,
    },
  });
  revalidatePath("/");
}

export async function deleteItem(itemId: string) {
  await requireItemAccess(itemId);
  await db.item.delete({ where: { id: itemId } });
  revalidatePath("/");
}

export async function toggleInterest(itemId: string, memberId: string) {
  const viewer = await requireViewer();
  if (memberId !== viewer.id) throw new Error("Not authorized");
  const item = await db.item.findUnique({ where: { id: itemId } });
  if (!item || item.familyId !== viewer.familyId) {
    throw new Error("Not authorized");
  }

  const existing = await db.interest.findUnique({
    where: { itemId_memberId: { itemId, memberId } },
  });
  if (existing) {
    await db.interest.delete({ where: { id: existing.id } });
  } else {
    await db.interest.create({ data: { itemId, memberId } });
  }
  revalidatePath("/");
}
