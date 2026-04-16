"use client";

import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import type { CategoryKey, CostTier, Item, TimeOfDay } from "@/lib/types";
import { CATEGORIES, COST_TIERS, TIMES } from "@/lib/taxonomy";
import { useFamily } from "./FamilyContext";
import { Avatar } from "./Avatar";

export function ItemSheet({
  open,
  onClose,
  onSubmit,
  onDelete,
  initial,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: Item) => void;
  onDelete?: (id: string) => void;
  initial?: Item | null;
  defaultDate?: string;
}) {
  const { members, viewerId } = useFamily();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<CategoryKey>(
    (initial?.category as CategoryKey) ?? "playgrounds",
  );
  const [kind, setKind] = useState<"evergreen" | "dated">(
    initial?.kind ?? (defaultDate ? "dated" : "evergreen"),
  );
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? "");
  const [times, setTimes] = useState<Set<TimeOfDay>>(
    new Set(initial?.timeOfDay ?? (["afternoon"] as TimeOfDay[])),
  );
  const [cost, setCost] = useState<CostTier>(
    (initial?.cost as CostTier) ?? "free",
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [addedById, setAddedById] = useState(initial?.addedBy ?? viewerId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit =
    title.trim().length > 0 &&
    times.size > 0 &&
    (kind === "evergreen" || date);

  const submit = () => {
    if (!canSubmit) return;
    const saved: Item = {
      id: initial?.id ?? "",
      title: title.trim(),
      category: category,
      kind,
      date: kind === "dated" ? date : undefined,
      endDate: kind === "dated" ? initial?.endDate : undefined,
      timeOfDay: Array.from(times),
      cost: cost,
      pricePerPerson: initial?.pricePerPerson,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      addedBy: addedById,
      interestedBy: initial?.interestedBy ?? [addedById],
    };
    onSubmit(saved);
    onClose();
  };

  const doDelete = () => {
    if (!initial || !onDelete) return;
    onDelete(initial.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full sm:max-w-xl max-h-[92vh] overflow-y-auto bg-cream-raised sm:rounded-[28px] rounded-t-[28px] border border-line shadow-[0_30px_80px_-30px_rgba(42,38,32,0.45)] animate-sheet-in"
        role="dialog"
        aria-modal
      >
        <div className="sticky top-0 z-10 bg-cream-raised/95 backdrop-blur border-b border-line px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">
            {isEdit ? "Edit idea" : "New idea"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full inline-flex items-center justify-center hover:bg-cream transition"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <Field label="What are we up to?">
            <input
              type="text"
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Evening walk at Riverbend"
              className="w-full bg-transparent font-display text-xl tracking-tight placeholder:text-ink-mute focus:outline-none"
            />
          </Field>

          <Field label="Category">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const active = c.key === category;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                      active
                        ? `${c.tint} ${c.ink} border-transparent`
                        : "bg-cream border-line text-ink-soft hover:border-line-strong"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="When">
            <div className="flex gap-1.5 mb-3">
              {(["evergreen", "dated"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition ${
                    kind === k
                      ? "bg-ink text-cream-raised border-ink"
                      : "bg-cream border-line text-ink-soft hover:border-line-strong"
                  }`}
                >
                  {k === "evergreen" ? "Anytime idea" : "Specific date"}
                </button>
              ))}
            </div>
            {kind === "dated" && (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-cream border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:border-line-strong"
              />
            )}
          </Field>

          <Field label="Time of day">
            <div className="flex flex-wrap gap-1.5">
              {TIMES.map((t) => {
                const active = times.has(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      const next = new Set(times);
                      if (next.has(t.key)) next.delete(t.key);
                      else next.add(t.key);
                      setTimes(next);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                      active
                        ? "bg-ink text-cream-raised border-ink"
                        : "bg-cream border-line text-ink-soft hover:border-line-strong"
                    }`}
                  >
                    <span>{t.emoji}</span>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Cost">
            <div className="flex flex-wrap gap-1.5">
              {COST_TIERS.map((c) => {
                const active = c.key === cost;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCost(c.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                      active
                        ? "bg-ink text-cream-raised border-ink"
                        : "bg-cream border-line text-ink-soft hover:border-line-strong"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Location">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-xl bg-cream border border-line px-3.5 py-2.5 text-sm placeholder:text-ink-mute focus:outline-none focus:border-line-strong"
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything worth remembering"
              className="w-full rounded-xl bg-cream border border-line px-3.5 py-2.5 text-sm placeholder:text-ink-mute focus:outline-none focus:border-line-strong resize-none"
            />
          </Field>

          <Field label="Added by">
            <div className="flex flex-wrap gap-1.5">
              {members.map((m) => {
                const active = m.id === addedById;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAddedById(m.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                      active
                        ? "bg-ink text-cream-raised border-ink"
                        : "bg-cream border-line text-ink-soft hover:border-line-strong"
                    }`}
                  >
                    <Avatar member={m} size={16} />
                    {m.name}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="sticky bottom-0 bg-cream-raised/95 backdrop-blur border-t border-line px-6 py-4 flex items-center gap-3">
          {isEdit && onDelete && !confirmingDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-ink-mute hover:text-[#B93636] hover:bg-[#FDE3E3]/60 transition"
              aria-label="Remove this idea"
            >
              <Trash2 size={14} />
              Remove
            </button>
          )}
          {isEdit && onDelete && confirmingDelete && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-soft">Remove this idea?</span>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="px-2.5 py-1.5 rounded-full text-xs text-ink-soft hover:text-ink transition"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={doDelete}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-[#B93636] text-cream-raised hover:opacity-90 transition"
              >
                <Trash2 size={12} strokeWidth={2.4} />
                Remove
              </button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-sm text-ink-soft hover:text-ink transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                canSubmit
                  ? "bg-ink text-cream-raised hover:opacity-90"
                  : "bg-line-strong text-ink-mute cursor-not-allowed"
              }`}
            >
              {isEdit ? "Save changes" : "Add to the list"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
