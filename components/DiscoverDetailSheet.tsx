"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, MapPin, Plus, Repeat, X } from "lucide-react";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import type { DiscoverEvent } from "@/lib/types";
import { CATEGORY_BY_KEY, COST_BY_KEY } from "@/lib/taxonomy";
import { toLocalIso as toIso } from "@/lib/dates";

const COUNTRY_LABEL: Record<DiscoverEvent["country"], string> = {
  NL: "Netherlands",
  DE: "Germany",
};

// Beyond this, a day-by-day checkbox picker stops being usable (e.g. a
// months-long exhibition) — fall back to "whole run" vs. pick-specific-dates.
const MAX_PICKABLE_RANGE_DAYS = 31;

/** Opens on a Discover card click: full event detail, plus the controls to
 *  choose exactly which date(s) and time to add it for, instead of the old
 *  one-click add straight from the card. */
export function DiscoverDetailSheet({
  event,
  added,
  onClose,
  onAdd,
}: {
  event: DiscoverEvent;
  added: boolean;
  onClose: () => void;
  onAdd: (dates: string[], startTime: string, endTime: string) => Promise<void> | void;
}) {
  const category = CATEGORY_BY_KEY[event.category];
  const cost = COST_BY_KEY[event.cost];

  const hasPattern = !!event.repeatWeekdays?.length || !!event.repeatDates?.length;
  const isMultiDay = event.kind === "dated" && !!event.endDate && event.endDate !== event.date;
  const rangeDays = isMultiDay
    ? eachDayOfInterval({ start: parseISO(event.date!), end: parseISO(event.endDate!) }).map(toIso)
    : [];
  const isLongRange = isMultiDay && rangeDays.length > MAX_PICKABLE_RANGE_DAYS;
  const isShortRange = isMultiDay && !isLongRange;

  const fullDefaultDates = hasPattern
    ? []
    : isShortRange
      ? rangeDays
      : !isMultiDay && event.kind === "dated" && event.date
        ? [event.date]
        : [];

  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set(fullDefaultDates));
  const [rangeMode, setRangeMode] = useState<"whole" | "specific">("whole");
  const [newDate, setNewDate] = useState(event.date ?? toIso(new Date()));
  const [startTime, setStartTime] = useState(event.startTime ?? "");
  const [endTime, setEndTime] = useState(event.endTime ?? "");
  const [pending, setPending] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  let useAutoPath: boolean;
  if (hasPattern) {
    useAutoPath = true;
  } else if (isLongRange) {
    useAutoPath = rangeMode === "whole";
  } else {
    const isFullDefault =
      selectedDates.size === fullDefaultDates.length &&
      fullDefaultDates.every((d) => selectedDates.has(d));
    useAutoPath = fullDefaultDates.length > 0 && isFullDefault;
  }
  const canAdd = useAutoPath ? !added : selectedDates.size > 0;

  const toggleDate = (iso: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      return next;
    });
  };

  const addManualDate = () => {
    if (!newDate) return;
    setSelectedDates((prev) => new Set(prev).add(newDate));
  };

  const removeManualDate = (iso: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.delete(iso);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!canAdd || pending) return;
    setPending(true);
    try {
      await onAdd(useAutoPath ? [] : Array.from(selectedDates).sort(), startTime, endTime);
      if (useAutoPath) {
        onClose();
      } else {
        setSelectedDates(new Set());
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2500);
      }
    } finally {
      setPending(false);
    }
  };

  const label = pending
    ? "Adding…"
    : useAutoPath
      ? "Add to calendar"
      : selectedDates.size > 1
        ? `Add ${selectedDates.size} dates`
        : "Add to calendar";

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-ink/25 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-cream-raised sm:rounded-[28px] rounded-t-[28px] border border-line shadow-[0_30px_80px_-30px_rgba(42,38,32,0.45)] animate-sheet-in"
        role="dialog"
        aria-modal
      >
        <div className={`relative h-28 shrink-0 ${category.tint}`}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 h-8 w-8 rounded-full inline-flex items-center justify-center bg-cream-raised/90 backdrop-blur hover:bg-cream-raised transition"
          >
            <X size={16} />
          </button>
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-cream-raised/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-ink">
            <category.icon size={13} />
            {category.label}
          </div>
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-cream-raised/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-ink">
            {event.city}, {COUNTRY_LABEL[event.country]}
          </div>
          {event.category !== "errands" && (
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-cream-raised/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-ink">
              {cost.shortLabel}
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <h2 className="font-display text-2xl leading-tight text-ink">{event.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-soft">
              {hasPattern ? (
                <span className="inline-flex items-center gap-1">
                  <Repeat size={13} className="text-ink-mute" />
                  {event.recurrence ?? "Recurring"}
                </span>
              ) : event.kind === "dated" && event.date ? (
                <span>{formatDateRange(event.date, event.endDate)}</span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Repeat size={13} className="text-ink-mute" />
                  {event.recurrence ?? "No fixed schedule — pick a date below"}
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

          <p className="text-sm text-ink-soft leading-relaxed">{event.blurb}</p>

          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-ink-mute hover:text-ink transition"
          >
            <ExternalLink size={11} />
            via {event.sourceName}
          </a>

          <div className="border-t border-line pt-5 space-y-4">
            {hasPattern ? (
              <p className="text-xs text-ink-mute">
                This repeats on a set schedule — adding it once puts every occurrence on your calendar.
              </p>
            ) : isLongRange ? (
              <Field label="When?">
                <div className="flex gap-1.5 mb-3">
                  <button
                    type="button"
                    onClick={() => setRangeMode("whole")}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                      rangeMode === "whole"
                        ? "bg-ink text-cream-raised border-ink"
                        : "bg-cream border-line text-ink-soft hover:border-line-strong"
                    }`}
                  >
                    Whole run ({formatDateRange(event.date!, event.endDate)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRangeMode("specific")}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                      rangeMode === "specific"
                        ? "bg-ink text-cream-raised border-ink"
                        : "bg-cream border-line text-ink-soft hover:border-line-strong"
                    }`}
                  >
                    Specific date(s)
                  </button>
                </div>
                {rangeMode === "specific" && (
                  <ManualDatePicker
                    newDate={newDate}
                    setNewDate={setNewDate}
                    min={event.date}
                    max={event.endDate}
                    selectedDates={selectedDates}
                    onAdd={addManualDate}
                    onRemove={removeManualDate}
                  />
                )}
              </Field>
            ) : isShortRange ? (
              <Field label="Which day(s)?">
                <div className="flex flex-wrap gap-1.5">
                  {rangeDays.map((iso) => {
                    const active = selectedDates.has(iso);
                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => toggleDate(iso)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                          active
                            ? "bg-ink text-cream-raised border-ink"
                            : "bg-cream border-line text-ink-soft hover:border-line-strong"
                        }`}
                      >
                        {format(parseISO(iso), "EEE d")}
                      </button>
                    );
                  })}
                </div>
              </Field>
            ) : event.kind === "dated" ? (
              <Field label="Date">
                <p className="text-sm text-ink">
                  {format(parseISO(event.date!), "EEEE, MMM d yyyy")}
                </p>
              </Field>
            ) : (
              <Field label="Which date(s)?">
                <ManualDatePicker
                  newDate={newDate}
                  setNewDate={setNewDate}
                  selectedDates={selectedDates}
                  onAdd={addManualDate}
                  onRemove={removeManualDate}
                />
              </Field>
            )}

            <Field label="Time">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  aria-label="Start time"
                  className="rounded-xl bg-cream border border-line px-3 py-2 text-sm focus:outline-none focus:border-line-strong"
                />
                {startTime && (
                  <>
                    <span className="text-xs text-ink-mute">to</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      aria-label="End time (optional)"
                      className="rounded-xl bg-cream border border-line px-3 py-2 text-sm focus:outline-none focus:border-line-strong"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setStartTime("");
                        setEndTime("");
                      }}
                      className="text-xs text-ink-mute hover:text-ink transition"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </Field>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd || pending}
            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium border transition ${
              useAutoPath && added
                ? "bg-[#DDEAD0] border-transparent text-[#3F5A2B] cursor-default"
                : "bg-ink text-cream-raised border-ink hover:opacity-90"
            } ${pending ? "opacity-60" : ""} ${!canAdd && !(useAutoPath && added) ? "opacity-50" : ""}`}
          >
            {useAutoPath && added ? (
              <>
                <Check size={14} strokeWidth={2.4} />
                Added to your list
              </>
            ) : (
              <>
                <Plus size={14} strokeWidth={2.4} />
                {label}
              </>
            )}
          </button>
          {justAdded && (
            <p className="text-center text-xs text-[#3F5A2B] -mt-2">
              Added — pick another date if you&apos;d like.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ManualDatePicker({
  newDate,
  setNewDate,
  min,
  max,
  selectedDates,
  onAdd,
  onRemove,
}: {
  newDate: string;
  setNewDate: (v: string) => void;
  min?: string;
  max?: string;
  selectedDates: Set<string>;
  onAdd: () => void;
  onRemove: (iso: string) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-1.5 mb-2">
        <input
          type="date"
          value={newDate}
          min={min}
          max={max}
          onChange={(e) => setNewDate(e.target.value)}
          className="flex-1 min-w-0 rounded-xl bg-cream border border-line px-3 py-2 text-sm focus:outline-none focus:border-line-strong"
        />
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add this date"
          className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full bg-ink text-cream-raised hover:opacity-90 transition"
        >
          <Plus size={15} strokeWidth={2.4} />
        </button>
      </div>
      {selectedDates.size > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Array.from(selectedDates)
            .sort()
            .map((iso) => (
              <span
                key={iso}
                className="inline-flex items-center gap-1 rounded-full bg-cream border border-line px-2.5 py-1 text-xs text-ink"
              >
                {format(parseISO(iso), "EEE, MMM d")}
                <button
                  type="button"
                  onClick={() => onRemove(iso)}
                  aria-label={`Remove ${iso}`}
                  className="text-ink-mute hover:text-ink"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
        </div>
      )}
    </>
  );
}

function formatDateRange(startIso: string, endIso?: string) {
  const start = parseISO(startIso);
  if (!endIso || endIso === startIso) return format(start, "EEE, MMM d yyyy");
  const end = parseISO(endIso);
  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
