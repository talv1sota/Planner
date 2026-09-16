"use client";

import { CATEGORY_BY_KEY } from "@/lib/taxonomy";
import type { Item } from "@/lib/types";

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

const PX_PER_HOUR = 52;
const DEFAULT_DURATION_MIN = 60; // for a start time with no known end
const MIN_BLOCK_MIN = 40; // floor duration so short/point events stay legible
const PAD_HOURS = 1; // breathing room before the first and after the last event

/** A compact, Google-Calendar-style day timeline: events positioned by start
 *  time and sized by duration, with overlapping events sharing columns.
 *  Ranges to fit the day's actual events (plus a little padding), not a
 *  fixed all-day window — a single 30-minute appointment shouldn't render
 *  inside a mostly-empty 15-hour box. Only renders items with a startTime —
 *  untimed items belong in the plain list next to it. */
export function DayTimeline({
  items,
  onEdit,
}: {
  items: Item[];
  onEdit: (item: Item) => void;
}) {
  const timed = items.filter((i) => i.startTime);
  if (timed.length === 0) return null;

  const spans = timed.map((item) => {
    const start = toMinutes(item.startTime!);
    const rawEnd = item.endTime ? toMinutes(item.endTime) : start + DEFAULT_DURATION_MIN;
    const end = Math.max(rawEnd, start + MIN_BLOCK_MIN);
    return { item, start, end };
  });

  const earliest = Math.min(...spans.map((s) => s.start));
  const latest = Math.max(...spans.map((s) => s.end));

  let rangeStart = Math.max(0, Math.floor(earliest / 60) * 60 - PAD_HOURS * 60);
  let rangeEnd = Math.min(24 * 60, Math.ceil(latest / 60) * 60 + PAD_HOURS * 60);
  // Keep at least a few hours visible so a single short event doesn't
  // render as an oddly tall sliver.
  const MIN_RANGE_MIN = 4 * 60;
  if (rangeEnd - rangeStart < MIN_RANGE_MIN) {
    const mid = (rangeStart + rangeEnd) / 2;
    rangeStart = Math.max(0, mid - MIN_RANGE_MIN / 2);
    rangeEnd = Math.min(24 * 60, rangeStart + MIN_RANGE_MIN);
  }

  const pxPerMin = PX_PER_HOUR / 60;
  const containerHeight = (rangeEnd - rangeStart) * pxPerMin;

  // Greedy column assignment so overlapping events sit side-by-side instead
  // of on top of each other, like Google Calendar's day view.
  const ordered = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
  const columnEnds: number[] = [];
  const placed = ordered.map(({ item, start, end }) => {
    let col = columnEnds.findIndex((colEnd) => colEnd <= start);
    if (col === -1) {
      col = columnEnds.length;
      columnEnds.push(end);
    } else {
      columnEnds[col] = end;
    }
    return { item, start, end, col };
  });
  const totalCols = Math.max(1, columnEnds.length);

  const hourMarks: number[] = [];
  for (let m = rangeStart; m <= rangeEnd; m += 60) hourMarks.push(m);

  const GUTTER = 34;

  return (
    <div className="rounded-2xl border border-line bg-cream/50 py-2 pr-2">
      <div className="relative" style={{ height: containerHeight }}>
        {hourMarks.map((m) => (
          <div
            key={m}
            className="absolute right-0 border-t border-line"
            style={{ top: (m - rangeStart) * pxPerMin, left: GUTTER }}
          >
            <span
              className="absolute -top-[7px] text-[9px] font-medium text-ink-mute tabular-nums"
              style={{ right: `calc(100% - ${GUTTER - 4}px)` }}
            >
              {formatHourLabel(m)}
            </span>
          </div>
        ))}
        <div className="absolute inset-y-0 right-0" style={{ left: GUTTER + 6 }}>
          {placed.map(({ item, start, end, col }) => {
            const cat = CATEGORY_BY_KEY[item.category];
            const top = (start - rangeStart) * pxPerMin;
            const height = (end - start) * pxPerMin;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onEdit(item)}
                className={`absolute ${cat.tint} ${cat.ink} rounded-md pl-2 pr-1.5 py-1 text-left overflow-hidden border-l-[3px] shadow-sm hover:brightness-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30`}
                style={{
                  top,
                  height: Math.max(height, 20),
                  width: `calc(${100 / totalCols}% - 3px)`,
                  left: `calc(${(col * 100) / totalCols}%)`,
                  borderLeftColor: "currentColor",
                }}
              >
                <div className="text-[11px] font-medium leading-tight truncate">
                  {item.title}
                </div>
                {height > 32 && (
                  <div className="text-[10px] opacity-75 truncate tabular-nums">
                    {item.startTime}
                    {item.endTime && `–${item.endTime}`}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
