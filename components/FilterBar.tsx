"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { CategoryKey, CostTier, Filters, TimeOfDay } from "@/lib/types";
import { CATEGORIES, COST_TIERS, TIMES } from "@/lib/taxonomy";
import { Avatar } from "./Avatar";
import { useFamily } from "./FamilyContext";

type PopoverKey = "category" | "cost" | "time" | "when" | "interested" | null;

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
    ...Array.from(filters.costs).map((k) => ({
      kind: "cost" as const,
      key: k,
      label: COST_TIERS.find((c) => c.key === k)?.shortLabel ?? k,
      onRemove: () => {
        const next = new Set(filters.costs);
        next.delete(k);
        update({ costs: next });
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
              leading: <span className="text-base leading-none">{c.emoji}</span>,
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
          label={chipCountLabel("Cost", filters.costs.size)}
          active={filters.costs.size > 0}
          open={open === "cost"}
          onToggle={() => setOpen(open === "cost" ? null : "cost")}
        >
          <MultiSelect
            options={COST_TIERS.map((c) => ({
              value: c.key,
              label: c.label,
            }))}
            selected={filters.costs}
            onToggle={(v: CostTier) => {
              const next = new Set(filters.costs);
              if (next.has(v)) next.delete(v);
              else next.add(v);
              update({ costs: next });
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
              leading: <span className="text-base leading-none">{t.emoji}</span>,
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
            ? `${totalCount} ${totalCount === 1 ? "idea" : "ideas"}`
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

function FilterPill({
  label,
  active,
  open,
  onToggle,
  children,
}: {
  label: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition border ${
          active
            ? "bg-ink text-cream-raised border-ink"
            : "bg-cream-raised text-ink border-line hover:border-line-strong"
        }`}
      >
        {label}
        <ChevronDown
          size={15}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
            aria-hidden
          />
          <div className="absolute left-0 top-full z-20 mt-2 min-w-[240px] rounded-2xl bg-cream-raised border border-line shadow-[0_18px_48px_-24px_rgba(42,38,32,0.22)] overflow-hidden animate-fade-in">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function MultiSelect<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { value: T; label: string; leading?: React.ReactNode }[];
  selected: Set<T>;
  onToggle: (v: T) => void;
}) {
  return (
    <div className="py-1.5 max-h-[360px] overflow-y-auto">
      {options.map((o) => {
        const checked = selected.has(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left hover:bg-cream transition"
          >
            <span
              className={`h-[18px] w-[18px] rounded-md flex items-center justify-center border transition ${
                checked
                  ? "bg-ink border-ink"
                  : "bg-cream-raised border-line-strong"
              }`}
            >
              {checked && (
                <svg
                  viewBox="0 0 12 12"
                  className="h-3 w-3 text-cream-raised"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2.5,6.5 5,9 9.5,3.5" />
                </svg>
              )}
            </span>
            {o.leading}
            <span className={checked ? "text-ink" : "text-ink-soft"}>
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
