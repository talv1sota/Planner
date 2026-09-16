"use client";

import type { Item } from "@/lib/types";
import { IdeaCard } from "./IdeaCard";

export function IdeasGrid({
  items,
  onToggleInterested,
  onEdit,
  totalCount,
  onAdd,
}: {
  items: Item[];
  onToggleInterested: (id: string) => void;
  onEdit: (item: Item) => void;
  totalCount: number;
  onAdd: () => void;
}) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const isRepeating = (i: Item) =>
    !!(i.repeatWeekdays?.length || i.repeatDates?.length);
  // A multi-day span (e.g. a festival running several days) belongs on the
  // Calendar, not as its own "coming up" card - a notable multi-day thing
  // like a car rental is modeled as separate pickup/drop-off items instead,
  // so those still show up fine on their own.
  const isMultiDaySpan = (i: Item) =>
    i.kind === "dated" && !!i.endDate && i.endDate !== i.date && !isRepeating(i);
  const dated = items
    .filter(
      (i) =>
        i.kind === "dated" &&
        !isRepeating(i) &&
        !isMultiDaySpan(i) &&
        (i.date ?? "") >= todayIso,
    )
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  if (totalCount === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-24 text-center">
        <p className="font-display text-2xl text-ink">
          No outings yet
        </p>
        <p className="text-sm text-ink-soft mt-2 max-w-sm mx-auto">
          Start building your shared list of things to do. Add a dated event or an anytime item.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-ink text-cream-raised font-medium text-sm px-5 py-2.5 hover:opacity-90 transition"
        >
          Add your first item
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-24 text-center">
        <p className="font-display text-xl text-ink-soft">
          No matches
        </p>
        <p className="text-sm text-ink-mute mt-1 max-w-xs mx-auto">
          Nothing matches your current filters. Try broadening your search or clearing some filters.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 pb-24">
      <Section title="Upcoming">
        {dated.length > 0 ? (
          <Grid items={dated} onToggleInterested={onToggleInterested} onEdit={onEdit} />
        ) : (
          <p className="text-sm text-ink-mute">
            Nothing one-off coming up. Repeating things live on the Calendar tab.
          </p>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-[28px] lg:text-[32px] font-medium tracking-tight mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({
  items,
  onToggleInterested,
  onEdit,
}: {
  items: Item[];
  onToggleInterested: (id: string) => void;
  onEdit: (item: Item) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
      {items.map((item) => (
        <IdeaCard
          key={item.id}
          item={item}
          onToggleInterested={onToggleInterested}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
