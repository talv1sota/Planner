"use client";

import { format, isSameDay } from "date-fns";
import { CATEGORY_BY_KEY } from "@/lib/taxonomy";
import type { Item } from "@/lib/types";
import { Repeat } from "lucide-react";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function formatHourLabel(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${period}`;
}
function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const PX_PER_HOUR = 56;
const DEFAULT_DURATION_MIN = 60; // for a start time with no known end
const MIN_BLOCK_MIN = 30; // floor duration so short/point events stay legible
const GUTTER = 44;
const ALLDAY_BAR_H = 18;
const ALLDAY_GAP = 3;

/** Google-Calendar-style Week/Day view: a shared hour axis with one column
 *  per visible day, events positioned by start time and sized by duration
 *  (overlaps share columns within a day), plus an all-day strip on top for
 *  multi-day spans and untimed repeats. */
export function TimeGrid({
  days,
  itemsOnDay,
  isMultiDaySpan,
  isRepeating,
  onEdit,
  onAddForDate,
  onSelectDay,
}: {
  days: Date[];
  itemsOnDay: (d: Date) => Item[];
  isMultiDaySpan: (i: Item) => boolean;
  isRepeating: (i: Item) => boolean;
  onEdit: (item: Item) => void;
  onAddForDate: (isoDate: string) => void;
  onSelectDay?: (d: Date) => void;
}) {
  const today = new Date();
  const rangeStartIso = toIso(days[0]);
  const rangeEndIso = toIso(days[days.length - 1]);

  // ---- All-day strip: multi-day spans + untimed repeats/evergreens ----
  const seenSpans = new Map<string, Item>();
  const seenAllDay = new Map<string, Item>();
  days.forEach((d) =>
    itemsOnDay(d).forEach((it) => {
      if (isMultiDaySpan(it)) seenSpans.set(it.id, it);
      else if (!it.startTime) seenAllDay.set(it.id, it);
    }),
  );
  const barCandidates = [
    ...[...seenSpans.values()].map((item) => ({ item, isSpan: true })),
    ...[...seenAllDay.values()].map((item) => ({ item, isSpan: false })),
  ];
  const bars = barCandidates
    .map(({ item, isSpan }) => {
      let startIso: string;
      let endIso: string;
      if (isSpan) {
        startIso = item.date! < rangeStartIso ? rangeStartIso : item.date!;
        endIso = item.endDate! > rangeEndIso ? rangeEndIso : item.endDate!;
      } else {
        const occursOn = days.filter((d) => itemsOnDay(d).some((i) => i.id === item.id)).map(toIso);
        startIso = occursOn[0] ?? rangeStartIso;
        endIso = occursOn[occursOn.length - 1] ?? startIso;
      }
      const startCol = Math.max(0, days.findIndex((d) => toIso(d) === startIso));
      const endCol = Math.max(startCol, days.findIndex((d) => toIso(d) === endIso));
      return { item, startCol, endCol };
    })
    .sort((a, b) => a.startCol - b.startCol);

  const rowEnds: number[] = [];
  const placedBars = bars.map((b) => {
    let row = rowEnds.findIndex((end) => end < b.startCol);
    if (row === -1) {
      row = rowEnds.length;
      rowEnds.push(b.endCol);
    } else {
      rowEnds[row] = b.endCol;
    }
    return { ...b, row };
  });
  const allDayHeight = rowEnds.length > 0 ? rowEnds.length * (ALLDAY_BAR_H + ALLDAY_GAP) + 6 : 0;

  // ---- Timed events, one column per day ----
  const columns = days.map((d) => {
    const timed = itemsOnDay(d).filter((it) => it.startTime && !isMultiDaySpan(it));
    const spans = timed.map((item) => {
      const start = toMinutes(item.startTime!);
      const rawEnd = item.endTime ? toMinutes(item.endTime) : start + DEFAULT_DURATION_MIN;
      const end = Math.max(rawEnd, start + MIN_BLOCK_MIN);
      return { item, start, end };
    });
    return { date: d, spans };
  });

  const allStarts = columns.flatMap((c) => c.spans.map((s) => s.start));
  const allEnds = columns.flatMap((c) => c.spans.map((s) => s.end));
  const rangeStart = allStarts.length ? Math.min(6 * 60, Math.floor(Math.min(...allStarts) / 60) * 60) : 7 * 60;
  const rangeEnd = allEnds.length ? Math.max(21 * 60, Math.ceil(Math.max(...allEnds) / 60) * 60) : 20 * 60;
  const pxPerMin = PX_PER_HOUR / 60;
  const gridHeight = (rangeEnd - rangeStart) * pxPerMin;

  const hourMarks: number[] = [];
  for (let m = rangeStart; m <= rangeEnd; m += 60) hourMarks.push(m);

  return (
    <div className="rounded-[22px] bg-cream-raised border border-line flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex border-b border-line shrink-0" style={{ paddingLeft: GUTTER }}>
        {days.map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <button
              key={toIso(d)}
              type="button"
              onClick={() => onSelectDay?.(d)}
              disabled={!onSelectDay}
              className="flex-1 min-w-0 py-2 flex items-center justify-center gap-1.5 border-l border-line first:border-l-0 hover:bg-cream/50 transition disabled:hover:bg-transparent"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                {format(d, "EEE")}
              </span>
              <span
                className={`inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full text-xs font-medium ${
                  isToday ? "bg-ink text-cream-raised" : "text-ink"
                }`}
              >
                {format(d, "d")}
              </span>
            </button>
          );
        })}
      </div>

      {allDayHeight > 0 && (
        <div
          className="relative border-b border-line shrink-0 py-1.5"
          style={{ paddingLeft: GUTTER, height: allDayHeight }}
        >
          {placedBars.map(({ item, startCol, endCol, row }) => {
            const cat = CATEGORY_BY_KEY[item.category];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onEdit(item)}
                title={item.title}
                className={`absolute ${cat.tint} ${cat.ink} text-[11px] font-medium rounded truncate flex items-center gap-1 px-1.5 hover:brightness-95 transition`}
                style={{
                  top: row * (ALLDAY_BAR_H + ALLDAY_GAP),
                  height: ALLDAY_BAR_H,
                  left: `calc(${GUTTER}px + ${(startCol / days.length) * 100}% + 2px)`,
                  width: `calc(${((endCol - startCol + 1) / days.length) * 100}% - 4px)`,
                }}
              >
                {isRepeating(item) && <Repeat size={9} className="shrink-0" strokeWidth={2.5} />}
                <span className="truncate">{item.title}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <div className="relative flex" style={{ height: gridHeight }}>
          <div className="relative shrink-0" style={{ width: GUTTER }}>
            {hourMarks.map((m) => (
              <div
                key={m}
                className="absolute right-1.5 -translate-y-1/2 text-[10px] text-ink-mute tabular-nums"
                style={{ top: (m - rangeStart) * pxPerMin }}
              >
                {formatHourLabel(m)}
              </div>
            ))}
          </div>
          <div className="relative flex-1 min-w-0 flex">
            {hourMarks.map((m) => (
              <div
                key={m}
                className="absolute left-0 right-0 border-t border-line"
                style={{ top: (m - rangeStart) * pxPerMin }}
              />
            ))}
            {columns.map(({ date, spans }) => {
              const ordered = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
              const columnEnds: number[] = [];
              const placed = ordered.map(({ item, start, end }) => {
                let col = columnEnds.findIndex((e) => e <= start);
                if (col === -1) {
                  col = columnEnds.length;
                  columnEnds.push(end);
                } else {
                  columnEnds[col] = end;
                }
                return { item, start, end, col };
              });
              const totalCols = Math.max(1, columnEnds.length);
              return (
                <div
                  key={toIso(date)}
                  role="button"
                  tabIndex={0}
                  onClick={() => onAddForDate(toIso(date))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onAddForDate(toIso(date));
                    }
                  }}
                  aria-label={`Add for ${format(date, "MMM d")}`}
                  className="relative flex-1 min-w-0 border-l border-line first:border-l-0 hover:bg-cream/40 transition cursor-pointer"
                >
                  {placed.map(({ item, start, end, col }) => {
                    const cat = CATEGORY_BY_KEY[item.category];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        className={`absolute ${cat.tint} ${cat.ink} rounded-md px-1.5 py-1 text-left overflow-hidden border-l-[3px] shadow-sm hover:brightness-95 transition`}
                        style={{
                          top: (start - rangeStart) * pxPerMin,
                          height: (end - start) * pxPerMin,
                          width: `calc(${100 / totalCols}% - 3px)`,
                          left: `calc(${(col * 100) / totalCols}%)`,
                          borderLeftColor: "currentColor",
                        }}
                      >
                        <div className="text-[11px] font-medium leading-tight truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] opacity-75 truncate tabular-nums">
                          {item.startTime}
                          {item.endTime && `–${item.endTime}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
