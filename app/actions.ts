"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getFamilyToken, getViewerId, setViewerId } from "@/lib/viewer";
import { DISCOVER_EVENTS } from "@/lib/discoverData";

async function requireViewer() {
  const id = await getViewerId();
  if (!id) throw new Error("Not authenticated");
  const familyToken = await getFamilyToken();
  if (!familyToken) throw new Error("Not authenticated");
  const member = await db.familyMember.findUnique({
    where: { id },
    include: { family: { select: { inviteToken: true } } },
  });
  if (!member) throw new Error("Unknown member");
  if (member.family.inviteToken !== familyToken) {
    throw new Error("Not authorized");
  }
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
  // Verify the caller has a valid family token for this family
  const familyToken = await getFamilyToken();
  if (!familyToken) throw new Error("Not authenticated");
  const family = await db.family.findUnique({
    where: { id: data.familyId },
    select: { inviteToken: true },
  });
  if (!family || family.inviteToken !== familyToken) {
    throw new Error("Not authorized");
  }

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
  const familyToken = await getFamilyToken();
  if (!familyToken) throw new Error("Not authenticated");
  const member = await db.familyMember.findUnique({
    where: { id: memberId },
    include: { family: { select: { inviteToken: true } } },
  });
  if (!member) throw new Error("Unknown member");
  if (member.family.inviteToken !== familyToken) {
    throw new Error("Not authorized");
  }
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
  repeatWeekdays?: string[];
  repeatDates?: string[];
  timeOfDay: string[];
  startTime?: string;
  endTime?: string;
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
      repeatWeekdays: data.repeatWeekdays?.length ? data.repeatWeekdays.join(",") : null,
      repeatDates: data.repeatDates?.length ? data.repeatDates.join(",") : null,
      timeOfDay: data.timeOfDay.join(","),
      startTime: data.startTime || null,
      endTime: data.endTime || null,
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
    repeatWeekdays?: string[];
    repeatDates?: string[];
    timeOfDay: string[];
    startTime?: string;
    endTime?: string;
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
      repeatWeekdays: data.repeatWeekdays?.length ? data.repeatWeekdays.join(",") : null,
      repeatDates: data.repeatDates?.length ? data.repeatDates.join(",") : null,
      timeOfDay: data.timeOfDay.join(","),
      startTime: data.startTime || null,
      endTime: data.endTime || null,
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

// Skips ONE occurrence of a repeating item (e.g. a sick day) without
// touching the rest of the series. Distinct from deleteItem, which removes
// the whole thing.
export async function skipOccurrence(itemId: string, date: string) {
  const { item } = await requireItemAccess(itemId);
  const existing = item.excludeDates ? item.excludeDates.split(",") : [];
  if (existing.includes(date)) return;
  await db.item.update({
    where: { id: itemId },
    data: { excludeDates: [...existing, date].join(",") },
  });
  revalidatePath("/");
}

// Turns a curated Discover event (lib/discoverData.ts) into a real Item for
// this family. Idempotent: adding the same discoveredId twice just returns
// the Item created the first time, instead of creating a duplicate.
export async function addDiscoveredEvent(data: {
  familyId: string;
  discoveredId: string;
  addedById: string;
  // For events with no fixed schedule (repeatWeekdays/repeatDates unset):
  // the family picked one specific date to attend. This path is NOT
  // idempotency-tracked, since it's a deliberate one-off choice they may
  // want to repeat for a different date later (e.g. "this month's meetup
  // but not next month's").
  chosenDate?: string;
}) {
  const viewer = await requireViewer();
  if (data.familyId !== viewer.familyId) throw new Error("Not authorized");
  if (data.addedById !== viewer.id) throw new Error("Not authorized");

  const event = DISCOVER_EVENTS.find((e) => e.id === data.discoveredId);
  if (!event) throw new Error("Unknown discover event");

  const noteLines = [
    event.blurb,
    event.recurrence,
    `Source: ${event.sourceName} — ${event.sourceUrl}`,
  ].filter(Boolean);

  if (data.chosenDate) {
    const item = await db.item.create({
      data: {
        familyId: data.familyId,
        title: event.title,
        category: event.category,
        kind: "dated",
        date: data.chosenDate,
        timeOfDay: event.timeOfDay?.length ? event.timeOfDay.join(",") : "allday",
        startTime: event.startTime ?? null,
        endTime: event.endTime ?? null,
        cost: event.cost,
        pricePerPerson: event.pricePerPerson ?? null,
        location:
          event.location ??
          `${event.city}, ${event.country === "DE" ? "Germany" : "Netherlands"}`,
        notes: noteLines.join("\n"),
        addedById: data.addedById,
      },
    });
    await db.interest.create({
      data: { itemId: item.id, memberId: data.addedById },
    });
    revalidatePath("/");
    return item.id;
  }

  const existing = await db.discoveredAdd.findUnique({
    where: {
      familyId_discoveredId: {
        familyId: data.familyId,
        discoveredId: data.discoveredId,
      },
    },
  });
  if (existing) {
    return existing.itemId;
  }

  // A clean weekly pattern (e.g. the Saturday market) or a known list of
  // specific dates becomes a real repeating dated Item, so it actually
  // shows up on the calendar. Everything else keeps dated/evergreen as-is.
  const hasWeeklyPattern = !!event.repeatWeekdays?.length;
  const hasDateList = !!event.repeatDates?.length;
  const todayIso = new Date().toISOString().slice(0, 10);

  const itemId = await db.$transaction(async (tx) => {
    const item = await tx.item.create({
      data: {
        familyId: data.familyId,
        title: event.title,
        category: event.category,
        kind:
          hasWeeklyPattern || hasDateList || event.kind === "dated"
            ? "dated"
            : "evergreen",
        date: hasWeeklyPattern
          ? todayIso
          : hasDateList
            ? event.repeatDates![0]
            : event.kind === "dated"
              ? (event.date ?? null)
              : null,
        endDate:
          !hasWeeklyPattern && !hasDateList && event.kind === "dated"
            ? (event.endDate ?? null)
            : null,
        repeatWeekdays: hasWeeklyPattern ? event.repeatWeekdays!.join(",") : null,
        repeatDates: hasDateList ? event.repeatDates!.join(",") : null,
        timeOfDay: event.timeOfDay?.length ? event.timeOfDay.join(",") : "allday",
        startTime: event.startTime ?? null,
        endTime: event.endTime ?? null,
        cost: event.cost,
        pricePerPerson: event.pricePerPerson ?? null,
        location:
          event.location ??
          `${event.city}, ${event.country === "DE" ? "Germany" : "Netherlands"}`,
        notes: noteLines.join("\n"),
        addedById: data.addedById,
      },
    });
    await tx.interest.create({
      data: { itemId: item.id, memberId: data.addedById },
    });
    await tx.discoveredAdd.create({
      data: {
        familyId: data.familyId,
        discoveredId: data.discoveredId,
        itemId: item.id,
      },
    });
    return item.id;
  });

  revalidatePath("/");
  return itemId;
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
