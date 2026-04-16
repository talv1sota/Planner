"use client";

import { useState } from "react";
import { createFamily } from "./actions";

const COLORS = [
  "#F4A7B9", "#8FB8E8", "#F6C784", "#9CCFA1", "#C9A7E8",
  "#F2A96B", "#7FC5C9", "#E88F8F", "#A0C4E8", "#D4A7D0",
];

export function SetupForm() {
  const [familyName, setFamilyName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const canSubmit = familyName.trim().length > 0 && memberName.trim().length > 0;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        await createFamily({ familyName: familyName.trim(), memberName: memberName.trim(), color });
      }}
      className="space-y-6"
    >
      <div>
        <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold mb-2">
          Name your group
        </label>
        <input
          type="text"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="e.g. The Smiths, Weekend Crew"
          autoFocus
          className="w-full rounded-2xl bg-cream-raised border border-line px-4 py-3 text-sm placeholder:text-ink-mute focus:outline-none focus:border-line-strong"
        />
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold mb-2">
          Your name
        </label>
        <input
          type="text"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          placeholder="e.g. Mom, Alex, Dad"
          className="w-full rounded-2xl bg-cream-raised border border-line px-4 py-3 text-sm placeholder:text-ink-mute focus:outline-none focus:border-line-strong"
        />
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold mb-2">
          Pick a color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-9 w-9 rounded-full transition ${
                color === c
                  ? "ring-2 ring-ink ring-offset-2 ring-offset-cream"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || loading}
        className={`w-full rounded-full py-3 text-sm font-medium transition ${
          canSubmit && !loading
            ? "bg-ink text-cream-raised hover:opacity-90"
            : "bg-line-strong text-ink-mute cursor-not-allowed"
        }`}
      >
        {loading ? "Creating..." : "Create calendar"}
      </button>
    </form>
  );
}
