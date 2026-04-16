"use client";

import { LayoutGrid, Calendar } from "lucide-react";
import type { View } from "@/lib/types";

export function ViewToggle({
  value,
  onChange,
}: {
  value: View;
  onChange: (v: View) => void;
}) {
  const tabs: { key: View; label: string; icon: React.ReactNode }[] = [
    { key: "ideas", label: "Ideas", icon: <LayoutGrid size={15} /> },
    { key: "calendar", label: "Calendar", icon: <Calendar size={15} /> },
  ];
  return (
    <div className="inline-flex items-center rounded-full bg-cream-raised border border-line p-1">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-ink text-cream-raised shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
