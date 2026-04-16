"use client";

import { useState } from "react";
import { Check, Link, X } from "lucide-react";

export function InviteButton({ inviteToken }: { inviteToken: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${inviteToken}`
      : `/join/${inviteToken}`;

  const copy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-9 w-9 rounded-full border border-line bg-cream-raised inline-flex items-center justify-center hover:border-line-strong transition"
        aria-label="Invite"
      >
        <Link size={15} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-2xl bg-cream-raised border border-line shadow-[0_18px_48px_-24px_rgba(42,38,32,0.22)] overflow-hidden animate-fade-in">
            <div className="px-4 py-3 flex items-center justify-between border-b border-line">
              <span className="text-sm font-medium">Invite to this calendar</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-6 w-6 rounded-full inline-flex items-center justify-center hover:bg-cream transition"
                aria-label="Close"
              >
                <X size={13} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-ink-soft">
                Share this link with anyone you want to join.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 rounded-xl bg-cream border border-line px-3 py-2 text-xs text-ink-soft truncate focus:outline-none"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={copy}
                  className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition ${
                    copied
                      ? "bg-[#D5EFE7] text-[#255049]"
                      : "bg-ink text-cream-raised hover:opacity-90"
                  }`}
                >
                  {copied ? (
                    <span className="inline-flex items-center gap-1">
                      <Check size={12} /> Copied
                    </span>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
              <p className="text-[11px] text-ink-mute">
                They&apos;ll pick their name and color when they join.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
