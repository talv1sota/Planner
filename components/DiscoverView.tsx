"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { CategoryKey, DiscoverEvent } from "@/lib/types";
import { CATEGORIES } from "@/lib/taxonomy";
import { DiscoverCard } from "./DiscoverCard";
import { FilterPill, MultiSelect } from "./FilterPill";

type PopoverKey = "category" | "location" | null;

export function DiscoverView({
  events,
  addedIds,
  onSelect,
}: {
  events: DiscoverEvent[];
  addedIds: Set<string>;
  onSelect: (event: DiscoverEvent) => void;
}) {
  const [categories, setCategories] = useState<Set<CategoryKey>>(new Set());
  const [cities, setCities] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<PopoverKey>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const allCities = useMemo(
    () => [...new Set(events.map((e) => e.city))].sort(),
    [events],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => categories.size === 0 || categories.has(e.category))
      .filter((e) => cities.size === 0 || cities.has(e.city))
      .filter((e) =>
        q
          ? e.title.toLowerCase().includes(q) ||
            e.blurb.toLowerCase().includes(q) ||
            e.city.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => {
        if (a.kind === "dated" && b.kind === "dated") {
          return (a.date ?? "").localeCompare(b.date ?? "");
        }
        if (a.kind === "dated") return -1;
        if (b.kind === "dated") return 1;
        return a.title.localeCompare(b.title);
      });
  }, [events, categories, cities, search]);

  const hasActiveFilters = categories.size > 0 || cities.size > 0;
  const clearAll = () => {
    setCategories(new Set());
    setCities(new Set());
  };

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 pb-24 animate-fade-in">
      <div className="mb-6 max-w-2xl">
        <p className="text-sm text-ink-soft">
          Researched from Enschede&apos;s own listings, expat &amp; club
          communities, and nearby Dutch and German towns. These aren&apos;t on
          your calendar yet — browse, then add anything you like.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <FilterPill
          label={chipCountLabel("Category", categories.size)}
          active={categories.size > 0}
          open={open === "category"}
          onToggle={() => setOpen(open === "category" ? null : "category")}
        >
          <MultiSelect
            options={CATEGORIES.map((c) => ({
              value: c.key,
              label: c.label,
              leading: <c.icon size={15} className="text-ink-mute" />,
            }))}
            selected={categories}
            onToggle={(v: CategoryKey) => {
              const next = new Set(categories);
              if (next.has(v)) next.delete(v);
              else next.add(v);
              setCategories(next);
            }}
          />
        </FilterPill>

        <FilterPill
          label={chipCountLabel("Location", cities.size)}
          active={cities.size > 0}
          open={open === "location"}
          onToggle={() => setOpen(open === "location" ? null : "location")}
        >
          <MultiSelect
            options={allCities.map((c) => ({ value: c, label: c }))}
            selected={cities}
            onToggle={(v: string) => {
              const next = new Set(cities);
              if (next.has(v)) next.delete(v);
              else next.add(v);
              setCities(next);
            }}
          />
        </FilterPill>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-ink-mute hover:text-ink transition underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        )}

        <div className="relative ml-auto max-w-xs w-full">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
            size={16}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Discover"
            className="w-full rounded-full bg-cream-raised border border-line focus:border-line-strong focus:outline-none pl-9 pr-9 py-2 text-sm placeholder:text-ink-mute"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink transition"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="w-full text-xs text-ink-mute">
          {filtered.length} {filtered.length === 1 ? "find" : "finds"}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-xl text-ink-soft">No matches</p>
          <p className="text-sm text-ink-mute mt-1">
            Try different filters or a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((event) => (
            <DiscoverCard
              key={event.id}
              event={event}
              added={addedIds.has(event.id)}
              onOpen={() => onSelect(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function chipCountLabel(base: string, n: number) {
  return n > 0 ? `${base} · ${n}` : base;
}
