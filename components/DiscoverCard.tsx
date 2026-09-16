"use client";

import { CalendarDays, Check, MapPin, Repeat } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { DiscoverEvent } from "@/lib/types";
import { CATEGORY_BY_KEY, COST_BY_KEY } from "@/lib/taxonomy";

const FLAG: Record<DiscoverEvent["country"], string> = { NL: "🇳🇱", DE: "🇩🇪" };

/** A scannable preview only — clicking it opens DiscoverDetailSheet, where
 *  the actual date(s)/time and "add" action live. */
export function DiscoverCard({
  event,
  added,
  onOpen,
}: {
  event: DiscoverEvent;
  added: boolean;
  onOpen: () => void;
}) {
  const category = CATEGORY_BY_KEY[event.category];
  const cost = COST_BY_KEY[event.cost];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group relative flex flex-col text-left rounded-[22px] bg-cream-raised border border-line overflow-hidden hover:border-line-strong transition shadow-[0_1px_0_rgba(42,38,32,0.02)] cursor-pointer"
    >
      <div className={`relative h-20 ${category.tint}`}>
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-cream-raised/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-ink">
          <span>{category.emoji}</span>
          {category.label}
        </div>
        {added ? (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#DDEAD0] px-2.5 py-1 text-[11px] font-semibold text-[#3F5A2B]">
            <Check size={11} strokeWidth={2.6} />
            Added
          </div>
        ) : (
          event.category !== "errands" && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-cream-raised/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-ink">
              {cost.shortLabel}
            </div>
          )
        )}
      </div>

      <div className="flex-1 flex flex-col gap-2.5 p-4">
        <div>
          <h3 className="font-display text-[18px] leading-tight text-ink">
            {event.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-soft">
            {event.kind === "dated" && event.date ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={13} className="text-ink-mute" />
                {formatDateRange(event.date, event.endDate)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Repeat size={13} className="text-ink-mute" />
                {event.recurrence ?? "Recurring"}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <span>{FLAG[event.country]}</span>
              {event.city}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} className="text-ink-mute" />
                {event.location}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-ink-soft leading-snug line-clamp-3">
          {event.blurb}
        </p>

        <span className="mt-auto pt-1 text-[11px] font-medium text-ink-mute group-hover:text-ink transition">
          View details &amp; add →
        </span>
      </div>
    </article>
  );
}

function formatDateRange(startIso: string, endIso?: string) {
  const start = parseISO(startIso);
  if (!endIso || endIso === startIso) return format(start, "EEE, MMM d yyyy");
  const end = parseISO(endIso);
  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}
