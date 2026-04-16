"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import type { Item, SortKey } from "@/lib/types";
import { IdeaCard } from "./IdeaCard";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest first" },
  { key: "alphabetical", label: "A – Z" },
  { key: "soonest", label: "Soonest date" },
  { key: "popular", label: "Most popular" },
];

function sortItems(items: Item[], sort: SortKey): Item[] {
  const sorted = [...items];
  switch (sort) {
    case "newest":
      return sorted; // already ordered by createdAt desc from server
    case "alphabetical":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "soonest":
      return sorted.sort((a, b) => (a.date ?? "9").localeCompare(b.date ?? "9"));
    case "popular":
      return sorted.sort((a, b) => b.interestedBy.length - a.interestedBy.length);
  }
}

export function IdeasGrid({
  items,
  onToggleInterested,
  onEdit,
  totalCount,
  onAdd,
  sort,
  onSortChange,
}: {
  items: Item[];
  onToggleInterested: (id: string) => void;
  onEdit: (item: Item) => void;
  totalCount: number;
  onAdd: () => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
}) {
  const [sortOpen, setSortOpen] = useState(false);

  const sorted = useMemo(() => sortItems(items, sort), [items, sort]);
  const dated = sorted
    .filter((i) => i.kind === "dated")
    .sort((a, b) =>
      sort === "soonest" ? 0 : (a.date ?? "").localeCompare(b.date ?? ""),
    );
  const evergreen = sorted.filter((i) => i.kind === "evergreen");

  if (totalCount === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-24 text-center">
        <p className="font-display text-2xl text-ink">
          No outings yet
        </p>
        <p className="text-sm text-ink-soft mt-2 max-w-sm mx-auto">
          Start building your shared list of things to do. Add a dated event or an anytime idea.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-ink text-cream-raised font-medium text-sm px-5 py-2.5 hover:opacity-90 transition"
        >
          Add your first idea
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-24 text-center">
        <p className="font-display text-xl text-ink-soft">
          No matches
        </p>
        <p className="text-sm text-ink-mute mt-1 max-w-xs mx-auto">
          Nothing matches your current filters. Try broadening your search or clearing some filters.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 pb-24 space-y-12">
      <div className="flex justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen(!sortOpen)}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium bg-cream-raised border border-line hover:border-line-strong transition"
          >
            <ArrowUpDown size={14} className="text-ink-mute" />
            {SORT_OPTIONS.find((o) => o.key === sort)?.label}
          </button>
          {sortOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSortOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 top-full z-20 mt-2 min-w-[180px] rounded-2xl bg-cream-raised border border-line shadow-[0_18px_48px_-24px_rgba(42,38,32,0.22)] overflow-hidden animate-fade-in py-1.5">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => {
                      onSortChange(o.key);
                      setSortOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-cream transition ${
                      sort === o.key ? "text-ink" : "text-ink-soft"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        sort === o.key ? "bg-accent" : "bg-line-strong"
                      }`}
                    />
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {dated.length > 0 && (
        <Section
          eyebrow="On the calendar"
          title="Coming up"
          subtitle="Dated plans, soonest first"
        >
          <Grid items={dated} onToggleInterested={onToggleInterested} onEdit={onEdit} />
        </Section>
      )}
      {evergreen.length > 0 && (
        <Section
          eyebrow="Anytime"
          title="Ideas to come back to"
          subtitle="Evergreen favorites and wish-list picks"
        >
          <Grid items={evergreen} onToggleInterested={onToggleInterested} onEdit={onEdit} />
        </Section>
      )}
    </div>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold">
          {eyebrow}
        </div>
        <h2 className="font-display text-[28px] lg:text-[32px] font-medium tracking-tight mt-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-ink-soft mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Grid({
  items,
  onToggleInterested,
  onEdit,
}: {
  items: Item[];
  onToggleInterested: (id: string) => void;
  onEdit: (item: Item) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
      {items.map((item) => (
        <IdeaCard
          key={item.id}
          item={item}
          onToggleInterested={onToggleInterested}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
