"use client";

import { useState, useMemo } from "react";
import {
  addMonths,
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
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Heart, MapPin, Plus } from "lucide-react";
import type { Item } from "@/lib/types";
import { CATEGORY_BY_KEY } from "@/lib/taxonomy";
import { AvatarStack } from "./Avatar";
import { useFamily } from "./FamilyContext";

export function CalendarView({
  items,
  onToggleInterested,
  onEdit,
  onAddForDate,
}: {
  items: Item[];
  onToggleInterested: (id: string) => void;
  onEdit: (item: Item) => void;
  onAddForDate: (isoDate: string) => void;
}) {
  const { memberById, viewerId } = useFamily();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const datedItems = useMemo(
    () => items.filter((i) => i.kind === "dated" && i.date),
    [items],
  );

  const itemsOnDay = (d: Date) =>
    datedItems.filter((i) => {
      const start = parseISO(i.date!);
      const end = i.endDate ? parseISO(i.endDate) : start;
      return isWithinInterval(d, { start, end });
    });

  const selectedDay = selected ?? new Date();
  const selectedItems = itemsOnDay(selectedDay);

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-[28px] lg:text-[32px] font-medium tracking-tight">
          {format(cursor, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCursor(subMonths(cursor, 1))}
            className="h-9 w-9 rounded-full border border-line bg-cream-raised inline-flex items-center justify-center hover:border-line-strong transition"
            aria-label="Previous month"
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
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="h-9 w-9 rounded-full border border-line bg-cream-raised inline-flex items-center justify-center hover:border-line-strong transition"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="rounded-[22px] bg-cream-raised border border-line overflow-hidden">
          <div className="grid grid-cols-7 border-b border-line bg-cream">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-mute"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-[112px]">
            {days.map((day, idx) => {
              const inMonth = isSameMonth(day, cursor);
              const dayItems = itemsOnDay(day);
              const isSelected = isSameDay(day, selectedDay);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelected(day)}
                  className={`relative border-line text-left p-1.5 transition overflow-hidden ${
                    idx % 7 !== 6 ? "border-r" : ""
                  } ${
                    idx < days.length - 7 ? "border-b" : ""
                  } ${
                    inMonth
                      ? "bg-cream-raised hover:bg-cream/70"
                      : "bg-cream/50 text-ink-mute"
                  } ${isSelected ? "bg-cream" : ""}`}
                >
                  <div className="flex items-center justify-between px-1 mb-1">
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

                  <div className="space-y-1 px-0.5">
                    {dayItems.slice(0, 3).map((it) => {
                      const cat = CATEGORY_BY_KEY[it.category];
                      return (
                        <div
                          key={it.id}
                          className={`${cat.tint} ${cat.ink} text-[11px] leading-tight rounded-md px-1.5 py-0.5 truncate`}
                        >
                          {it.title}
                        </div>
                      );
                    })}
                    {dayItems.length > 3 && (
                      <div className="text-[11px] text-ink-mute pl-1">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-[22px] bg-cream-raised border border-line p-5 flex flex-col gap-4 h-fit lg:sticky lg:top-28">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold">
              {isSameDay(selectedDay, new Date())
                ? "Today"
                : format(selectedDay, "EEEE")}
            </div>
            <div className="font-display text-[24px] tracking-tight mt-0.5">
              {format(selectedDay, "MMMM d")}
            </div>
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
                    {it.location && (
                      <div className="mt-1 inline-flex items-center gap-1 text-xs text-ink-soft">
                        <MapPin size={12} className="text-ink-mute" />
                        {it.location}
                      </div>
                    )}
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
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            onClick={() => onAddForDate(toIso(selectedDay))}
            className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-line-strong text-ink-soft hover:text-ink hover:border-ink/40 hover:bg-cream transition py-2.5 text-sm font-medium"
          >
            <Plus size={15} strokeWidth={2.2} />
            Add for {format(selectedDay, "MMM d")}
          </button>
        </aside>
      </div>
    </div>
  );
}

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
