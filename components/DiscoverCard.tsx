"use client";

import { CalendarDays, Check, Repeat } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { DiscoverEvent } from "@/lib/types";
import { CATEGORY_BY_KEY } from "@/lib/taxonomy";
import { getTownImage } from "@/lib/townImages";

function categoryArt(seed: string, tintVarClass: string) {
  const rand = (n: number) => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    return Math.abs((h >> (n * 3)) % 100) / 100;
  };
  const cx = 40 + rand(1) * 20;
  const cy = 40 + rand(2) * 20;
  const r = 38 + rand(3) * 16;
  return (
    <svg
      viewBox="0 0 120 80"
      className={`absolute inset-0 h-full w-full ${tintVarClass}`}
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`g-${seed}`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <rect width="120" height="80" fill="currentColor" opacity="0.35" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#g-${seed})`} opacity="0.8" />
      <circle
        cx={110 - cx * 0.6}
        cy={70 - cy * 0.5}
        r={r * 0.55}
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

/** A scannable preview only — clicking it opens DiscoverDetailSheet, where
 *  the actual date(s)/time and "add" action live. Category/location/price
 *  are filterable from the toolbar above instead of shown per-card. */
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
  const townImage = getTownImage(event.city);

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
      <div className={`relative h-28 ${category.ink}`}>
        {townImage ? (
          <img
            src={townImage}
            alt={event.city}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          categoryArt(event.id, category.tint.replace("bg-", "text-"))
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-cream-raised/15" />
        {added && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#DDEAD0] px-2.5 py-1 text-[11px] font-semibold text-[#3F5A2B]">
            <Check size={11} strokeWidth={2.6} />
            Added
          </div>
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
