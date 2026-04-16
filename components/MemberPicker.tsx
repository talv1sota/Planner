"use client";

import { useState } from "react";
import type { FamilyMember as PrismaMember } from "@prisma/client";
import { pickMember } from "@/app/actions";
import { addNewMember } from "@/app/actions";
import { Plus } from "lucide-react";

const COLORS = [
  "#F4A7B9", "#8FB8E8", "#F6C784", "#9CCFA1", "#C9A7E8",
  "#F2A96B", "#7FC5C9", "#E88F8F", "#A0C4E8", "#D4A7D0",
];

export function MemberPicker({ members, familyId }: { members: PrismaMember[]; familyId: string }) {
  const [mode, setMode] = useState<"pick" | "new">("pick");
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  if (mode === "new") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-6">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="font-display text-[36px] font-medium tracking-tight leading-tight">
              Outing Planner
            </h1>
            <p className="text-ink-soft mt-2">Set up your profile.</p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim()) return;
              setLoading(true);
              await addNewMember({ familyId, name: name.trim(), color });
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold mb-2">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mom, Alex, Dad"
                autoFocus
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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode("pick")}
                className="flex-1 rounded-full py-3 text-sm text-ink-soft hover:text-ink border border-line hover:border-line-strong transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!name.trim() || loading}
                className={`flex-1 rounded-full py-3 text-sm font-medium transition ${
                  name.trim() && !loading
                    ? "bg-ink text-cream-raised hover:opacity-90"
                    : "bg-line-strong text-ink-mute cursor-not-allowed"
                }`}
              >
                {loading ? "Joining..." : "Join"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-display text-[36px] font-medium tracking-tight leading-tight">
            Outing Planner
          </h1>
          <p className="text-ink-soft mt-2">Who are you?</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => pickMember(m.id)}
              className="flex items-center gap-3 rounded-2xl bg-cream-raised border border-line p-4 hover:border-line-strong hover:shadow-sm transition text-left"
            >
              <span
                className="h-11 w-11 rounded-full inline-flex items-center justify-center text-white font-display font-semibold text-lg shrink-0"
                style={{ backgroundColor: m.color }}
              >
                {m.initial}
              </span>
              <span className="font-medium text-ink">{m.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMode("new")}
            className="flex items-center gap-3 rounded-2xl border border-dashed border-line-strong p-4 hover:border-ink/40 hover:bg-cream-raised transition text-left"
          >
            <span className="h-11 w-11 rounded-full inline-flex items-center justify-center bg-cream border border-line-strong text-ink-soft shrink-0">
              <Plus size={20} />
            </span>
            <span className="font-medium text-ink-soft">I&apos;m new</span>
          </button>
        </div>
        <p className="text-center text-xs text-ink-mute mt-6">
          This device will remember your choice.
        </p>
      </div>
    </div>
  );
}
