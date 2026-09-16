"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Item } from "@/lib/types";

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

/** Google-Calendar-style Year view: all 12 mini-months fit the window at
 *  once (no scrolling) - a dot on days with something scheduled. Click a
 *  day to drill into Day view, a month name to drill into Month view. */
export function YearGrid({
  year,
  itemsOnDay,
  onSelectDay,
  onSelectMonth,
}: {
  year: number;
  itemsOnDay: (d: Date) => Item[];
  onSelectDay: (d: Date) => void;
  onSelectMonth: (d: Date) => void;
}) {
  const today = new Date();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  return (
    <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-rows-6 sm:grid-rows-4 lg:grid-rows-3 gap-3 lg:gap-4">
      {months.map((monthDate) => {
        const mStart = startOfMonth(monthDate);
        const mEnd = endOfMonth(monthDate);
        const gStart = startOfWeek(mStart, { weekStartsOn: 0 });
        const gEnd = endOfWeek(mEnd, { weekStartsOn: 0 });
        const days = eachDayOfInterval({ start: gStart, end: gEnd });
        const weekRows = Math.ceil(days.length / 7);
        return (
          <div
            key={monthDate.getMonth()}
            className="rounded-2xl border border-line bg-cream-raised p-2.5 flex flex-col min-h-0 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => onSelectMonth(monthDate)}
              className="font-display text-sm font-medium mb-1 shrink-0 text-left hover:text-accent-ink transition"
            >
              {format(monthDate, "MMMM")}
            </button>
            <div
              className="grid grid-cols-7 gap-y-0.5 flex-1 min-h-0"
              style={{ gridTemplateRows: `auto repeat(${weekRows}, 1fr)` }}
            >
              {WEEKDAY_LETTERS.map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[9px] text-ink-mute font-medium"
                >
                  {d}
                </div>
              ))}
              {days.map((day, idx) => {
                const inMonth = isSameMonth(day, monthDate);
                const hasItems = inMonth && itemsOnDay(day).length > 0;
                const isToday = isSameDay(day, today);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectDay(day)}
                    disabled={!inMonth}
                    tabIndex={inMonth ? 0 : -1}
                    className={`relative flex items-center justify-center transition ${
                      inMonth ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 text-[10px] rounded-full flex items-center justify-center ${
                        !inMonth
                          ? "text-transparent"
                          : isToday
                            ? "bg-ink text-cream-raised font-medium"
                            : "text-ink hover:bg-cream"
                      }`}
                    >
                      {inMonth ? format(day, "d") : ""}
                    </span>
                    {hasItems && !isToday && (
                      <span className="absolute bottom-0 h-1 w-1 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
