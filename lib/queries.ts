import { db } from "./db";
import { getFamilyToken } from "./viewer";
import type { Item } from "./types";

export async function getFamily() {
  const inviteToken = await getFamilyToken();
  if (!inviteToken) return null;

  const family = await db.family.findUnique({
    where: { inviteToken },
    include: {
      members: { orderBy: { createdAt: "asc" } },
    },
  });
  return family;
}

export async function getItems(familyId: string): Promise<Item[]> {
  const rows = await db.item.findMany({
    where: { familyId },
    include: {
      interests: { select: { memberId: true } },
      addedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category as Item["category"],
    kind: r.kind as Item["kind"],
    date: r.date ?? undefined,
    endDate: r.endDate ?? undefined,
    repeatWeekdays: r.repeatWeekdays
      ? (r.repeatWeekdays.split(",") as Item["repeatWeekdays"])
      : undefined,
    repeatDates: r.repeatDates ? r.repeatDates.split(",") : undefined,
    excludeDates: r.excludeDates ? r.excludeDates.split(",") : undefined,
    startTime: r.startTime ?? undefined,
    endTime: r.endTime ?? undefined,
    timeOfDay: r.timeOfDay.split(",") as Item["timeOfDay"],
    cost: r.cost as Item["cost"],
    pricePerPerson: r.pricePerPerson ?? undefined,
    location: r.location ?? undefined,
    city: r.city ?? undefined,
    notes: r.notes ?? undefined,
    addedBy: r.addedById,
    interestedBy: r.interests.map((i) => i.memberId),
  }));
}

export async function getMemberMap(familyId: string) {
  const members = await db.familyMember.findMany({
    where: { familyId },
    orderBy: { createdAt: "asc" },
  });
  return members;
}

/** Ids (from lib/discoverData.ts) of Discover events this family has already added. */
export async function getDiscoveredAddedIds(familyId: string): Promise<string[]> {
  const rows = await db.discoveredAdd.findMany({
    where: { familyId },
    select: { discoveredId: true },
  });
  return rows.map((r) => r.discoveredId);
}
