"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { FamilyMember } from "@prisma/client";
import { Header } from "./Header";
import { FilterBar } from "./FilterBar";
import { IdeasGrid } from "./IdeasGrid";
import { CalendarView } from "./CalendarView";
import { DiscoverView } from "./DiscoverView";
import { ViewToggle } from "./ViewToggle";
import { ItemSheet } from "./ItemSheet";
import { FamilyProvider } from "./FamilyContext";
import {
  createItem as serverCreateItem,
  updateItem as serverUpdateItem,
  deleteItem as serverDeleteItem,
  toggleInterest as serverToggleInterest,
  addDiscoveredEvent as serverAddDiscoveredEvent,
  skipOccurrence as serverSkipOccurrence,
} from "@/app/actions";
import { applyFilters } from "@/lib/filter";
import { DISCOVER_EVENTS } from "@/lib/discoverData";
import type { DiscoverEvent, Filters, Item, View } from "@/lib/types";

const INITIAL_FILTERS: Filters = {
  categories: new Set(),
  costs: new Set(),
  times: new Set(),
  when: "any",
  interested: "any",
  search: "",
};

export function PlannerApp({
  initialItems,
  members,
  viewerId,
  familyId,
  familyName,
  inviteToken,
  addedDiscoverIds,
}: {
  initialItems: Item[];
  members: FamilyMember[];
  viewerId: string;
  familyId: string;
  familyName: string;
  inviteToken: string;
  addedDiscoverIds: string[];
}) {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [view, setView] = useState<View>("ideas");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);
  const [discoverAdded, setDiscoverAdded] = useState<Set<string>>(
    () => new Set(addedDiscoverIds),
  );
  // Re-sync with the server whenever it hands us a fresh array (e.g. after
  // a revalidate triggered by deleting an item) — otherwise a deleted
  // item's Discover card stays stuck showing "Added" even though it's gone.
  const [syncedIds, setSyncedIds] = useState(addedDiscoverIds);
  if (addedDiscoverIds !== syncedIds) {
    setSyncedIds(addedDiscoverIds);
    setDiscoverAdded(new Set(addedDiscoverIds));
  }
  const [, startTransition] = useTransition();

  const [optimisticItems, addOptimistic] = useOptimistic(
    initialItems,
    (
      state: Item[],
      action:
        | { type: "toggle"; itemId: string; memberId: string }
        | { type: "delete"; itemId: string },
    ) => {
      if (action.type === "toggle") {
        return state.map((it) => {
          if (it.id !== action.itemId) return it;
          const has = it.interestedBy.includes(action.memberId);
          return {
            ...it,
            interestedBy: has
              ? it.interestedBy.filter((m) => m !== action.memberId)
              : [...it.interestedBy, action.memberId],
          };
        });
      }
      if (action.type === "delete") {
        return state.filter((it) => it.id !== action.itemId);
      }
      return state;
    },
  );

  const filtered = useMemo(
    () => applyFilters(optimisticItems, filters),
    [optimisticItems, filters],
  );

  const handleToggleInterested = (itemId: string) => {
    startTransition(async () => {
      addOptimistic({ type: "toggle", itemId, memberId: viewerId });
      await serverToggleInterest(itemId, viewerId);
    });
  };

  const handleSaveItem = async (item: Item) => {
    if (item.id && initialItems.some((i) => i.id === item.id)) {
      await serverUpdateItem(item.id, {
        title: item.title,
        category: item.category,
        kind: item.kind,
        date: item.date,
        endDate: item.endDate,
        repeatWeekdays: item.repeatWeekdays,
        repeatDates: item.repeatDates,
        timeOfDay: item.timeOfDay,
        startTime: item.startTime,
        endTime: item.endTime,
        cost: item.cost,
        pricePerPerson: item.pricePerPerson,
        location: item.location,
        city: item.city,
        notes: item.notes,
        addedById: item.addedBy,
      });
    } else {
      await serverCreateItem({
        familyId,
        title: item.title,
        category: item.category,
        kind: item.kind,
        date: item.date,
        endDate: item.endDate,
        repeatWeekdays: item.repeatWeekdays,
        repeatDates: item.repeatDates,
        timeOfDay: item.timeOfDay,
        startTime: item.startTime,
        endTime: item.endTime,
        cost: item.cost,
        pricePerPerson: item.pricePerPerson,
        location: item.location,
        city: item.city,
        notes: item.notes,
        addedById: item.addedBy,
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    startTransition(async () => {
      addOptimistic({ type: "delete", itemId: id });
      await serverDeleteItem(id);
    });
  };

  const handleSkipOccurrence = async (itemId: string, isoDate: string) => {
    await serverSkipOccurrence(itemId, isoDate);
  };

  const handleAddDiscovered = async (event: DiscoverEvent, chosenDate?: string) => {
    await serverAddDiscoveredEvent({
      familyId,
      discoveredId: event.id,
      addedById: viewerId,
      chosenDate,
    });
    // A chosen-date add is deliberately repeatable (e.g. this month's
    // meetup but not next month's), so it never gets marked "Added".
    if (!chosenDate) {
      setDiscoverAdded((prev) => new Set(prev).add(event.id));
    }
  };

  const openAdd = () => {
    setEditing(null);
    setDefaultDate(undefined);
    setSheetOpen(true);
  };

  const openAddForDate = (isoDate: string) => {
    setEditing(null);
    setDefaultDate(isoDate);
    setSheetOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setDefaultDate(undefined);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditing(null);
    setDefaultDate(undefined);
  };

  return (
    <FamilyProvider members={members} viewerId={viewerId} familyId={familyId}>
      <Header
        search={filters.search}
        onSearchChange={(v) => setFilters({ ...filters, search: v })}
        onAdd={openAdd}
        inviteToken={inviteToken}
      />

      <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-5 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2.5">
          <h1 className="font-display text-[22px] lg:text-[24px] font-medium tracking-tight">
            Things to <span className="italic text-ink-soft">do</span>
          </h1>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold">
            Shared outing calendar
          </span>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {view !== "discover" && (
        <FilterBar
          filters={filters}
          onChange={setFilters}
          totalCount={optimisticItems.length}
          filteredCount={filtered.length}
        />
      )}

      <main className="mt-4">
        {view === "ideas" ? (
          <IdeasGrid
            items={filtered}
            onToggleInterested={handleToggleInterested}
            onEdit={openEdit}
            totalCount={optimisticItems.length}
            onAdd={openAdd}
          />
        ) : view === "calendar" ? (
          <CalendarView
            items={filtered}
            onToggleInterested={handleToggleInterested}
            onEdit={openEdit}
            onAddForDate={openAddForDate}
            onSkipOccurrence={handleSkipOccurrence}
          />
        ) : (
          <DiscoverView
            events={DISCOVER_EVENTS}
            addedIds={discoverAdded}
            onAdd={handleAddDiscovered}
          />
        )}
      </main>

      <ItemSheet
        key={editing?.id ?? `new-${defaultDate ?? "blank"}`}
        open={sheetOpen}
        onClose={closeSheet}
        onSubmit={handleSaveItem}
        onDelete={handleDeleteItem}
        initial={editing}
        defaultDate={defaultDate}
      />
    </FamilyProvider>
  );
}
