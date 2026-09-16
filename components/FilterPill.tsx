"use client";

import { ChevronDown } from "lucide-react";

/** A pill button that opens a dropdown panel below it - shared between
 *  the List page's filter bar and Discover's filter row. */
export function FilterPill({
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

export function MultiSelect<T extends string>({
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
