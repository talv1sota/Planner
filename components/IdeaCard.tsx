"use client";

import { MapPin, CalendarDays, Heart } from "lucide-react";
import { format, parseISO, isSameDay, isSameMonth } from "date-fns";
import type { Item } from "@/lib/types";
import { CATEGORY_BY_KEY, COST_BY_KEY, TIME_BY_KEY } from "@/lib/taxonomy";
import { Avatar, AvatarStack } from "./Avatar";
import { useFamily } from "./FamilyContext";

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

export function IdeaCard({
  item,
  onToggleInterested,
  onEdit,
}: {
  item: Item;
  onToggleInterested: (id: string) => void;
  onEdit: (item: Item) => void;
}) {
  const { memberById, viewerId } = useFamily();
  const category = CATEGORY_BY_KEY[item.category];
  const cost = COST_BY_KEY[item.cost];
  const addedByMember = memberById[item.addedBy];
  const interestedMembers = item.interestedBy
    .map((id) => memberById[id])
    .filter(Boolean);
  const isInterested = item.interestedBy.includes(viewerId);

  return (
    <article
      onClick={() => onEdit(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(item);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Edit ${item.title}`}
      className="group relative flex flex-col rounded-[22px] bg-cream-raised border border-line overflow-hidden hover:border-line-strong transition shadow-[0_1px_0_rgba(42,38,32,0.02)] cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      <div className={`relative h-28 ${category.ink}`}>
        {categoryArt(item.id, category.tint.replace("bg-", "text-"))}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cream-raised/15" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-cream-raised/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-ink">
          <span>{category.emoji}</span>
          {category.label}
        </div>
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-cream-raised/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-ink">
          {cost.shortLabel}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-[19px] leading-tight text-ink">
            {item.title}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-soft">
            {item.kind === "dated" && item.date && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={13} className="text-ink-mute" />
                {formatDateRange(item.date, item.endDate)}
              </span>
            )}
            {item.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} className="text-ink-mute" />
                {item.location}
              </span>
            )}
          </div>
        </div>

        {item.notes && (
          <p className="text-sm text-ink-soft leading-snug line-clamp-2">
            {item.notes}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {item.timeOfDay.map((t) => {
            const time = TIME_BY_KEY[t];
            return (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[11px] text-ink-soft"
              >
                <span className="text-xs">{time.emoji}</span>
                {time.label}
              </span>
            );
          })}
        </div>

        <div className="mt-auto pt-2 space-y-2.5">
          {addedByMember && (
            <div className="flex items-center gap-1.5 text-[11px] text-ink-mute">
              <Avatar member={addedByMember} size={16} />
              Added by {addedByMember.name}
            </div>
          )}
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {interestedMembers.length > 0 ? (
              <>
                <AvatarStack members={interestedMembers} size={22} max={4} />
                <span className="text-xs text-ink-soft">
                  {interestedMembers.length} interested
                </span>
              </>
            ) : (
              <span className="text-xs text-ink-mute">No one yet</span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleInterested(item.id);
            }}
            aria-pressed={isInterested}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition ${
              isInterested
                ? "bg-[#FDE3E3] border-[#F2B9B9] text-[#B93636]"
                : "bg-cream-raised border-line text-ink-soft hover:border-line-strong hover:text-ink"
            }`}
          >
            <Heart
              size={13}
              strokeWidth={2.2}
              className={isInterested ? "fill-current" : ""}
            />
            Interested
          </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function formatDateRange(startIso: string, endIso?: string) {
  const start = parseISO(startIso);
  if (!endIso || endIso === startIso) {
    return format(start, "EEE, MMM d");
  }
  const end = parseISO(endIso);
  if (isSameDay(start, end)) return format(start, "EEE, MMM d");
  if (isSameMonth(start, end)) {
    return `${format(start, "MMM d")} – ${format(end, "d")}`;
  }
  return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
}
