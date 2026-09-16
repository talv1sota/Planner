"use client";

import { useState, useMemo } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Heart, MapPin, Plus, Repeat, X } from "lucide-react";
import type { Item } from "@/lib/types";
import { CATEGORY_BY_KEY } from "@/lib/taxonomy";
import { AvatarStack } from "./Avatar";
import { useFamily } from "./FamilyContext";
import { TimeGrid } from "./TimeGrid";
import { YearGrid } from "./YearGrid";

type ViewMode = "month" | "week" | "day" | "year";

// Timed items first (chronological), untimed/all-day items after.
function sortByTime(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return 0;
  });
}

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function CalendarView({
  items,
  onToggleInterested,
  onEdit,
  onAddForDate,
  onSkipOccurrence,
}: {
  items: Item[];
  onToggleInterested: (id: string) => void;
  onEdit: (item: Item) => void;
  onAddForDate: (isoDate: string) => void;
  onSkipOccurrence: (itemId: string, isoDate: string) => void;
}) {
  const { memberById, viewerId } = useFamily();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(cursor, { weekStartsOn: 0 }),
    end: endOfWeek(cursor, { weekStartsOn: 0 }),
  });

  const datedItems = useMemo(
    () => items.filter((i) => i.kind === "dated" && i.date),
    [items],
  );

  const itemsOnDay = (d: Date) => {
    const iso = toIso(d);
    const matches = datedItems.filter((i) => {
      if (i.excludeDates?.includes(iso)) return false;
      if (i.repeatWeekdays && i.repeatWeekdays.length > 0) {
        return iso >= i.date! && i.repeatWeekdays.includes(WEEKDAY_KEYS[d.getDay()]);
      }
      if (i.repeatDates && i.repeatDates.length > 0) {
        return i.repeatDates.includes(iso);
      }
      const start = parseISO(i.date!);
      const end = i.endDate ? parseISO(i.endDate) : start;
      return isWithinInterval(d, { start, end });
    });
    return sortByTime(matches);
  };

  const isRepeating = (i: Item) =>
    !!(i.repeatWeekdays?.length || i.repeatDates?.length);
  const hideInterest = (i: Item) => i.category === "errands" || isRepeating(i);
  // A real multi-day span (not a repeat, which just recurs on single days).
  const isMultiDaySpan = (i: Item) =>
    i.kind === "dated" && !!i.endDate && i.endDate !== i.date && !isRepeating(i);

  const selectedItems = selected ? itemsOnDay(selected) : [];

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  // Google-Calendar-style: a multi-day event becomes one bar spanning the
  // columns it covers in a given week (clipped to that week), instead of
  // repeating as separate same-size chips on every day it touches.
  const DAY_NUM_H = 24;
  const BAR_H = 16;
  const BAR_GAP = 2;
  function weekBars(week: Date[]) {
    const weekStartIso = toIso(week[0]);
    const weekEndIso = toIso(week[6]);
    const seen = new Map<string, Item>();
    week.forEach((d) =>
      itemsOnDay(d).forEach((it) => {
        if (isMultiDaySpan(it)) seen.set(it.id, it);
      }),
    );
    const spans = [...seen.values()]
      .map((item) => {
        const startIso = item.date! < weekStartIso ? weekStartIso : item.date!;
        const endIso = item.endDate! > weekEndIso ? weekEndIso : item.endDate!;
        const startCol = week.findIndex((d) => toIso(d) === startIso);
        const endCol = week.findIndex((d) => toIso(d) === endIso);
        return { item, startCol: Math.max(0, startCol), endCol: Math.max(0, endCol) };
      })
      .sort((a, b) => a.startCol - b.startCol);

    // Greedy row-stacking so overlapping bars don't sit on top of each other.
    const rowEnds: number[] = [];
    const placed = spans.map((s) => {
      let row = rowEnds.findIndex((end) => end < s.startCol);
      if (row === -1) {
        row = rowEnds.length;
        rowEnds.push(s.endCol);
      } else {
        rowEnds[row] = s.endCol;
      }
      return { ...s, row };
    });
    return { bars: placed, spanIds: new Set(seen.keys()), rows: rowEnds.length };
  }

  const goPrev = () => {
    if (viewMode === "year") setCursor(subYears(cursor, 1));
    else if (viewMode === "month") setCursor(subMonths(cursor, 1));
    else if (viewMode === "week") setCursor(subWeeks(cursor, 1));
    else setCursor(subDays(cursor, 1));
  };
  const goNext = () => {
    if (viewMode === "year") setCursor(addYears(cursor, 1));
    else if (viewMode === "month") setCursor(addMonths(cursor, 1));
    else if (viewMode === "week") setCursor(addWeeks(cursor, 1));
    else setCursor(addDays(cursor, 1));
  };

  const headerTitle =
    viewMode === "year"
      ? format(cursor, "yyyy")
      : viewMode === "month"
        ? format(cursor, "MMMM yyyy")
        : viewMode === "day"
          ? format(cursor, "EEEE, MMMM d")
          : formatWeekRange(weekDays[0], weekDays[6]);

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-10 pb-4 flex flex-col animate-fade-in lg:h-[calc(100dvh-173px)] lg:min-h-[520px]">
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-3">
        <h2 className="font-display text-[26px] lg:text-[30px] font-medium tracking-tight">
          {headerTitle}
        </h2>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-full bg-cream border border-line p-1">
            {(["day", "week", "month", "year"] as ViewMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                  viewMode === m
                    ? "bg-ink text-cream-raised"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              className="h-9 w-9 rounded-full border border-line bg-cream-raised inline-flex items-center justify-center hover:border-line-strong transition"
              aria-label={`Previous ${viewMode}`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date())}
              className="px-3 h-9 rounded-full border border-line bg-cream-raised text-sm hover:border-line-strong transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goNext}
              className="h-9 w-9 rounded-full border border-line bg-cream-raised inline-flex items-center justify-center hover:border-line-strong transition"
              aria-label={`Next ${viewMode}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {(viewMode === "week" || viewMode === "day") && (
        <TimeGrid
          days={viewMode === "day" ? [cursor] : weekDays}
          itemsOnDay={itemsOnDay}
          isMultiDaySpan={isMultiDaySpan}
          isRepeating={isRepeating}
          onEdit={onEdit}
          onAddForDate={onAddForDate}
          onSelectDay={
            viewMode === "week"
              ? (d) => {
                  setCursor(d);
                  setViewMode("day");
                }
              : undefined
          }
        />
      )}

      {viewMode === "year" && (
        <YearGrid
          year={cursor.getFullYear()}
          itemsOnDay={itemsOnDay}
          onSelectDay={(d) => {
            setCursor(d);
            setViewMode("day");
          }}
          onSelectMonth={(d) => {
            setCursor(d);
            setViewMode("month");
          }}
        />
      )}

      {viewMode === "month" && (
      <div
        className={`grid grid-cols-1 gap-6 flex-1 min-h-0 ${selected ? "lg:grid-cols-[1fr_320px]" : ""}`}
      >
        <div className="rounded-[22px] bg-cream-raised border border-line overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-line bg-cream shrink-0">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-mute"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            {weeks.map((week, weekIdx) => {
              const { bars, spanIds, rows } = weekBars(week);
              const barsHeight = rows > 0 ? rows * BAR_H + (rows - 1) * BAR_GAP + 3 : 0;
              return (
                <div
                  key={weekIdx}
                  className="relative grid grid-cols-7 flex-1 min-h-0"
                >
                  {week.map((day, colIdx) => {
                    const idx = weekIdx * 7 + colIdx;
                    const inMonth = isSameMonth(day, cursor);
                    const dayItems = itemsOnDay(day).filter((it) => !spanIds.has(it.id));
                    const isSelected = !!selected && isSameDay(day, selected);
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div
                        key={idx}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelected(day)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelected(day);
                          }
                        }}
                        className={`relative flex flex-col border-line text-left p-1.5 transition overflow-hidden cursor-pointer ${
                          colIdx !== 6 ? "border-r" : ""
                        } ${
                          weekIdx !== weeks.length - 1 ? "border-b" : ""
                        } ${
                          inMonth
                            ? "bg-cream-raised hover:bg-cream/70"
                            : "bg-cream/50 text-ink-mute"
                        } ${isSelected ? "bg-cream" : ""}`}
                      >
                        <div
                          className="flex items-center justify-between px-1 shrink-0"
                          style={{ height: DAY_NUM_H, marginBottom: barsHeight }}
                        >
                          <span
                            className={`inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full text-xs font-medium ${
                              isToday
                                ? "bg-ink text-cream-raised"
                                : isSelected
                                  ? "bg-accent/20 text-accent-ink"
                                  : inMonth
                                    ? "text-ink"
                                    : "text-ink-mute"
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                        </div>

                        <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto space-y-0.5 px-0.5">
                          {dayItems.map((it) => {
                            const cat = CATEGORY_BY_KEY[it.category];
                            if (it.startTime) {
                              // Timed, single-day: compact dot + time, like
                              // Google Calendar's non-all-day entries.
                              return (
                                <button
                                  key={it.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(it);
                                  }}
                                  className="flex items-center gap-1 text-[11px] leading-tight text-ink px-1 py-[1px] truncate w-full text-left rounded hover:bg-cream transition"
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${cat.ink} bg-current`}
                                  />
                                  <span className="text-ink-mute shrink-0 tabular-nums">
                                    {it.startTime}
                                  </span>
                                  <span className="truncate">{it.title}</span>
                                </button>
                              );
                            }
                            return (
                              <button
                                key={it.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(it);
                                }}
                                className={`${cat.tint} ${cat.ink} text-[11px] leading-tight rounded-md px-1.5 py-0.5 truncate flex items-center gap-1 w-full text-left hover:brightness-95 transition`}
                              >
                                {isRepeating(it) && (
                                  <Repeat size={9} className="shrink-0" strokeWidth={2.5} />
                                )}
                                <span className="truncate">{it.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {bars.length > 0 && (
                    <div
                      className="absolute left-0 right-0 pointer-events-none px-px"
                      style={{ top: DAY_NUM_H }}
                    >
                      {bars.map(({ item, startCol, endCol, row }) => {
                        const cat = CATEGORY_BY_KEY[item.category];
                        return (
                          <button
                            key={item.id}
                            type="button"
                            title={item.title}
                            onClick={() => onEdit(item)}
                            className={`absolute pointer-events-auto ${cat.tint} ${cat.ink} text-[10px] font-medium leading-none rounded truncate flex items-center px-1.5 text-left hover:brightness-95 transition`}
                            style={{
                              top: row * (BAR_H + BAR_GAP) + 2,
                              height: BAR_H,
                              left: `calc(${(startCol / 7) * 100}% + 2px)`,
                              width: `calc(${((endCol - startCol + 1) / 7) * 100}% - 4px)`,
                            }}
                          >
                            {item.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selected && (
        <aside className="rounded-[22px] bg-cream-raised border border-line p-5 flex flex-col gap-4 h-fit lg:h-full lg:overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold">
                {isSameDay(selected, new Date()) ? "Today" : format(selected, "EEEE")}
              </div>
              <div className="font-display text-[24px] tracking-tight mt-0.5">
                {format(selected, "MMMM d")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="h-8 w-8 shrink-0 rounded-full inline-flex items-center justify-center hover:bg-cream transition"
            >
              <X size={16} />
            </button>
          </div>

          {selectedItems.length === 0 ? (
            <p className="text-sm text-ink-mute">
              Nothing scheduled for this day. Tap the button below to add something.
            </p>
          ) : (
            <ul className="space-y-3">
              {selectedItems.map((it) => {
                const cat = CATEGORY_BY_KEY[it.category];
                const interestedMembers = it.interestedBy
                  .map((id) => memberById[id])
                  .filter(Boolean);
                const isInterested = it.interestedBy.includes(viewerId);
                return (
                  <li
                    key={it.id}
                    onClick={() => onEdit(it)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onEdit(it);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Edit ${it.title}`}
                    className="rounded-2xl border border-line bg-cream/60 p-3.5 cursor-pointer hover:border-line-strong transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full ${cat.tint} ${cat.ink} px-2 py-0.5 text-[10.5px] font-medium mb-2`}
                    >
                      <span>{cat.emoji}</span>
                      {cat.label}
                    </div>
                    <div className="font-display text-base leading-snug text-ink">
                      {it.title}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                      {it.startTime && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} className="text-ink-mute" />
                          {it.startTime}
                          {it.endTime && `–${it.endTime}`}
                        </span>
                      )}
                      {it.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-ink-mute" />
                          {it.location}
                        </span>
                      )}
                      {isRepeating(it) && (
                        <span className="inline-flex items-center gap-1">
                          <Repeat size={12} className="text-ink-mute" />
                          Repeats
                        </span>
                      )}
                    </div>
                    {isRepeating(it) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSkipOccurrence(it.id, toIso(selected));
                        }}
                        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border border-line bg-cream-raised text-ink-soft hover:border-line-strong hover:text-ink transition"
                      >
                        <X size={11} strokeWidth={2.4} />
                        Skip just {format(selected, "MMM d")}
                      </button>
                    )}
                    {!hideInterest(it) && (
                      <div className="mt-3 flex items-center justify-between">
                        <AvatarStack
                          members={interestedMembers}
                          size={20}
                          max={5}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleInterested(it.id);
                          }}
                          aria-pressed={isInterested}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition ${
                            isInterested
                              ? "bg-[#FDE3E3] border-[#F2B9B9] text-[#B93636]"
                              : "bg-cream-raised border-line text-ink-soft hover:border-line-strong hover:text-ink"
                          }`}
                        >
                          <Heart
                            size={12}
                            strokeWidth={2.2}
                            className={isInterested ? "fill-current" : ""}
                          />
                          Interested
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            onClick={() => onAddForDate(toIso(selected))}
            className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-line-strong text-ink-soft hover:text-ink hover:border-ink/40 hover:bg-cream transition py-2.5 text-sm font-medium"
          >
            <Plus size={15} strokeWidth={2.2} />
            Add for {format(selected, "MMM d")}
          </button>
        </aside>
        )}
      </div>
      )}
    </div>
  );
}

function formatWeekRange(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) return `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`;
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameYear) return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
}

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
