"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { FamilyMember } from "@prisma/client";
import { Header } from "./Header";
import { FilterBar } from "./FilterBar";
import { IdeasGrid } from "./IdeasGrid";
import { CalendarView } from "./CalendarView";
import { ViewToggle } from "./ViewToggle";
import { ItemSheet } from "./ItemSheet";
import { FamilyProvider } from "./FamilyContext";
import {
  createItem as serverCreateItem,
  updateItem as serverUpdateItem,
  deleteItem as serverDeleteItem,
  toggleInterest as serverToggleInterest,
} from "@/app/actions";
import { applyFilters } from "@/lib/filter";
import type { Filters, Item, SortKey, View } from "@/lib/types";

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
}: {
  initialItems: Item[];
  members: FamilyMember[];
  viewerId: string;
  familyId: string;
  familyName: string;
  inviteToken: string;
}) {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [view, setView] = useState<View>("ideas");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);
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
        timeOfDay: item.timeOfDay,
        cost: item.cost,
        pricePerPerson: item.pricePerPerson,
        location: item.location,
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
        timeOfDay: item.timeOfDay,
        cost: item.cost,
        pricePerPerson: item.pricePerPerson,
        location: item.location,
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

      <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-10 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold">
            Shared outing calendar
          </div>
          <h1 className="font-display text-[40px] lg:text-[52px] font-medium tracking-tight mt-1 leading-[1.05]">
            Things to
            <span className="italic text-ink-soft"> do</span>
          </h1>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        totalCount={optimisticItems.length}
        filteredCount={filtered.length}
      />

      <main className="mt-8">
        {view === "ideas" ? (
          <IdeasGrid
            items={filtered}
            onToggleInterested={handleToggleInterested}
            onEdit={openEdit}
            totalCount={optimisticItems.length}
            onAdd={openAdd}
            sort={sort}
            onSortChange={setSort}
          />
        ) : (
          <CalendarView
            items={filtered}
            onToggleInterested={handleToggleInterested}
            onEdit={openEdit}
            onAddForDate={openAddForDate}
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
