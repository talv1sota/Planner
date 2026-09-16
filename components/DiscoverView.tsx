"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { DiscoverEvent } from "@/lib/types";
import { DiscoverCard } from "./DiscoverCard";

type Area = "all" | "enschede" | "nl" | "de";

const AREA_LABELS: Record<Area, string> = {
  all: "Everywhere",
  enschede: "Enschede",
  nl: "Nearby NL towns",
  de: "Germany",
};

function areaOf(e: DiscoverEvent): Exclude<Area, "all"> {
  if (e.country === "DE") return "de";
  if (e.city.startsWith("Enschede")) return "enschede";
  return "nl";
}

export function DiscoverView({
  events,
  addedIds,
  onSelect,
}: {
  events: DiscoverEvent[];
  addedIds: Set<string>;
  onSelect: (event: DiscoverEvent) => void;
}) {
  const [area, setArea] = useState<Area>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => (area === "all" ? true : areaOf(e) === area))
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
  }, [events, area, search]);

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
        {(Object.keys(AREA_LABELS) as Area[]).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setArea(a)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium border transition ${
              area === a
                ? "bg-ink text-cream-raised border-ink"
                : "bg-cream-raised text-ink border-line hover:border-line-strong"
            }`}
          >
            {AREA_LABELS[a]}
          </button>
        ))}

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
            className="w-full rounded-full bg-cream-raised border border-line focus:border-line-strong focus:outline-none pl-9 pr-4 py-2 text-sm placeholder:text-ink-mute"
          />
        </div>

        <div className="w-full text-xs text-ink-mute">
          {filtered.length} {filtered.length === 1 ? "find" : "finds"}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-xl text-ink-soft">No matches</p>
          <p className="text-sm text-ink-mute mt-1">
            Try a different area or search term.
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
