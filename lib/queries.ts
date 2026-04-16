import { db } from "./db";
import type { Item } from "./types";

export async function getFamily() {
  const family = await db.family.findFirst({
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
    timeOfDay: r.timeOfDay.split(",") as Item["timeOfDay"],
    cost: r.cost as Item["cost"],
    pricePerPerson: r.pricePerPerson ?? undefined,
    location: r.location ?? undefined,
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
