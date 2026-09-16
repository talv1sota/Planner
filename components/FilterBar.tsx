"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { CategoryKey, Filters, TimeOfDay } from "@/lib/types";
import { CATEGORIES, TIMES } from "@/lib/taxonomy";
import { Avatar } from "./Avatar";
import { useFamily } from "./FamilyContext";
import { FilterPill, MultiSelect } from "./FilterPill";

type PopoverKey = "category" | "time" | "when" | "interested" | null;

export function FilterBar({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  totalCount: number;
  filteredCount: number;
}) {
  const { members } = useFamily();
  const [open, setOpen] = useState<PopoverKey>(null);
  const update = (patch: Partial<Filters>) =>
    onChange({ ...filters, ...patch });

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const clearAll = () =>
    onChange({
      categories: new Set(),
      costs: new Set(),
      times: new Set(),
      when: "any",
      interested: "any",
      search: filters.search,
    });

  const activeChips = [
    ...Array.from(filters.categories).map((k) => ({
      kind: "category" as const,
      key: k,
      label: CATEGORIES.find((c) => c.key === k)?.label ?? k,
      onRemove: () => {
        const next = new Set(filters.categories);
        next.delete(k);
        update({ categories: next });
      },
    })),
    ...Array.from(filters.times).map((k) => ({
      kind: "time" as const,
      key: k,
      label: TIMES.find((t) => t.key === k)?.label ?? k,
      onRemove: () => {
        const next = new Set(filters.times);
        next.delete(k);
        update({ times: next });
      },
    })),
    ...(filters.when !== "any"
      ? [
          {
            kind: "when" as const,
            key: filters.when,
            label: WHEN_LABELS[filters.when],
            onRemove: () => update({ when: "any" }),
          },
        ]
      : []),
    ...(filters.interested !== "any"
      ? [
          {
            kind: "interested" as const,
            key: filters.interested,
            label: `${members.find((f) => f.id === filters.interested)?.name ?? ""} interested`,
            onRemove: () => update({ interested: "any" }),
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-6">
      <div className="flex items-center gap-2 flex-wrap">
        <FilterPill
          label={chipCountLabel("Category", filters.categories.size)}
          active={filters.categories.size > 0}
          open={open === "category"}
          onToggle={() => setOpen(open === "category" ? null : "category")}
        >
          <MultiSelect
            options={CATEGORIES.map((c) => ({
              value: c.key,
              label: c.label,
              leading: <c.icon size={15} className="text-ink-mute" />,
            }))}
            selected={filters.categories}
            onToggle={(v: CategoryKey) => {
              const next = new Set(filters.categories);
              if (next.has(v)) next.delete(v);
              else next.add(v);
              update({ categories: next });
            }}
          />
        </FilterPill>

        <FilterPill
          label={chipCountLabel("Time of day", filters.times.size)}
          active={filters.times.size > 0}
          open={open === "time"}
          onToggle={() => setOpen(open === "time" ? null : "time")}
        >
          <MultiSelect
            options={TIMES.map((t) => ({
              value: t.key,
              label: t.label,
              leading: <t.icon size={15} className="text-ink-mute" />,
            }))}
            selected={filters.times}
            onToggle={(v: TimeOfDay) => {
              const next = new Set(filters.times);
              if (next.has(v)) next.delete(v);
              else next.add(v);
              update({ times: next });
            }}
          />
        </FilterPill>

        <FilterPill
          label={filters.when === "any" ? "When" : WHEN_LABELS[filters.when]}
          active={filters.when !== "any"}
          open={open === "when"}
          onToggle={() => setOpen(open === "when" ? null : "when")}
        >
          <div className="py-1.5">
            {(["any", "weekend", "thisweek", "thismonth"] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  update({ when: w });
                  setOpen(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-cream transition ${
                  filters.when === w ? "text-ink" : "text-ink-soft"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    filters.when === w ? "bg-accent" : "bg-line-strong"
                  }`}
                />
                {WHEN_LABELS[w]}
              </button>
            ))}
          </div>
        </FilterPill>

        <FilterPill
          label={
            filters.interested === "any"
              ? "Interested"
              : `${members.find((f) => f.id === filters.interested)?.name} interested`
          }
          active={filters.interested !== "any"}
          open={open === "interested"}
          onToggle={() =>
            setOpen(open === "interested" ? null : "interested")
          }
        >
          <div className="py-1.5">
            <button
              type="button"
              onClick={() => {
                update({ interested: "any" });
                setOpen(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-cream transition ${
                filters.interested === "any" ? "text-ink" : "text-ink-soft"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  filters.interested === "any" ? "bg-accent" : "bg-line-strong"
                }`}
              />
              Anyone
            </button>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  update({ interested: m.id });
                  setOpen(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-cream transition ${
                  filters.interested === m.id ? "text-ink" : "text-ink-soft"
                }`}
              >
                <Avatar member={m} size={20} />
                {m.name}
              </button>
            ))}
          </div>
        </FilterPill>

        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-sm text-ink-mute hover:text-ink transition underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        )}

        <div className="ml-auto text-xs text-ink-mute">
          {filteredCount === totalCount
            ? `${totalCount} ${totalCount === 1 ? "item" : "items"}`
            : `${filteredCount} of ${totalCount}`}
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <button
              key={`${chip.kind}-${String(chip.key)}`}
              type="button"
              onClick={chip.onRemove}
              className="group inline-flex items-center gap-1.5 rounded-full bg-cream-raised border border-line pl-3 pr-2 py-1 text-xs text-ink-soft hover:text-ink hover:border-line-strong transition"
            >
              {chip.label}
              <X
                size={13}
                className="text-ink-mute group-hover:text-ink transition"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const WHEN_LABELS: Record<Filters["when"], string> = {
  any: "Anytime",
  weekend: "This weekend",
  thisweek: "This week",
  thismonth: "This month",
};

function chipCountLabel(base: string, n: number) {
  return n > 0 ? `${base} · ${n}` : base;
}
