"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  ExternalLink,
  MapPin,
  Plus,
  Repeat,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { DiscoverEvent } from "@/lib/types";
import { CATEGORY_BY_KEY, COST_BY_KEY } from "@/lib/taxonomy";

const FLAG: Record<DiscoverEvent["country"], string> = { NL: "🇳🇱", DE: "🇩🇪" };

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DiscoverCard({
  event,
  added,
  onAdd,
}: {
  event: DiscoverEvent;
  added: boolean;
  onAdd: (chosenDate?: string) => Promise<void> | void;
}) {
  const category = CATEGORY_BY_KEY[event.category];
  const cost = COST_BY_KEY[event.cost];
  const [pending, setPending] = useState(false);

  // No fixed schedule we can auto-place: let the family pick the specific
  // date they mean to go, and let them do it again for a different date
  // later (e.g. this month's meetup but not next month's).
  const isManual =
    event.kind === "recurring" &&
    !event.repeatWeekdays?.length &&
    !event.repeatDates?.length;

  // A multi-day event (e.g. a week-long fair) defaults to blocking the
  // whole range — offer picking just the one day the family actually plans
  // to go instead.
  const isMultiDay =
    event.kind === "dated" && !!event.endDate && event.endDate !== event.date;

  const [picking, setPicking] = useState(false);
  const [chosenDate, setChosenDate] = useState(event.date ?? todayIso());
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = async () => {
    if (added || pending) return;
    setPending(true);
    try {
      await onAdd();
    } finally {
      setPending(false);
    }
  };

  const handleManualAdd = async () => {
    if (!chosenDate || pending) return;
    setPending(true);
    try {
      await onAdd(chosenDate);
      setJustAdded(true);
      setPicking(false);
      setTimeout(() => setJustAdded(false), 3000);
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="group relative flex flex-col rounded-[22px] bg-cream-raised border border-line overflow-hidden hover:border-line-strong transition shadow-[0_1px_0_rgba(42,38,32,0.02)]">
      <div className={`relative h-24 ${category.tint}`}>
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-cream-raised/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-ink">
          <span>{category.emoji}</span>
          {category.label}
        </div>
        {event.category !== "errands" && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-cream-raised/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-ink">
            {cost.shortLabel}
          </div>
        )}
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-cream-raised/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-ink">
          <span>{FLAG[event.country]}</span>
          {event.city}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-4">
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

        <div className="mt-auto pt-2 space-y-2.5">
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-ink-mute hover:text-ink transition"
          >
            <ExternalLink size={11} />
            via {event.sourceName}
          </a>

          {(isManual || isMultiDay) && picking ? (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={chosenDate}
                onChange={(e) => setChosenDate(e.target.value)}
                min={isMultiDay ? event.date : undefined}
                max={isMultiDay ? event.endDate : undefined}
                className="flex-1 min-w-0 rounded-full bg-cream border border-line px-2.5 py-1.5 text-xs focus:outline-none focus:border-line-strong"
              />
              <button
                type="button"
                onClick={handleManualAdd}
                disabled={!chosenDate || pending}
                aria-label="Confirm date"
                className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-full bg-ink text-cream-raised hover:opacity-90 transition disabled:opacity-50"
              >
                <Check size={14} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={() => setPicking(false)}
                aria-label="Cancel"
                className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-full border border-line text-ink-soft hover:text-ink transition"
              >
                <X size={14} strokeWidth={2.4} />
              </button>
            </div>
          ) : isManual ? (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium border bg-ink text-cream-raised border-ink hover:opacity-90 transition"
            >
              <CalendarDays size={13} strokeWidth={2.4} />
              {justAdded ? "Added — pick another date?" : "Add for a date…"}
            </button>
          ) : (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleAdd}
                disabled={added || pending}
                className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium border transition ${
                  added
                    ? "bg-[#DDEAD0] border-transparent text-[#3F5A2B] cursor-default"
                    : "bg-ink text-cream-raised border-ink hover:opacity-90"
                } ${pending ? "opacity-60" : ""}`}
              >
                {added ? (
                  <>
                    <Check size={13} strokeWidth={2.4} />
                    Added to your list
                  </>
                ) : (
                  <>
                    <Plus size={13} strokeWidth={2.4} />
                    {pending
                      ? "Adding…"
                      : isMultiDay
                        ? "Add all days"
                        : event.kind === "dated"
                          ? "Add to calendar"
                          : "Add to my list"}
                  </>
                )}
              </button>
              {isMultiDay && !added && (
                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  className="w-full text-center text-[11px] text-ink-mute hover:text-ink transition"
                >
                  {justAdded ? "Added that day — pick another?" : "…or just one day"}
                </button>
              )}
            </div>
          )}
        </div>
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
