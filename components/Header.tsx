"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Avatar } from "./Avatar";
import { useFamily } from "./FamilyContext";
import { InviteButton } from "./InviteButton";

export function Header({
  search,
  onSearchChange,
  onAdd,
  inviteToken,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onAdd: () => void;
  inviteToken: string;
}) {
  const { memberById, viewerId } = useFamily();
  const viewer = memberById[viewerId];
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-cream/85 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-5 flex items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl lg:text-[28px] font-medium tracking-tight">
            Outing Planner
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3 flex-1 justify-end">
          {/* Desktop search */}
          <div className="relative hidden sm:block max-w-xs w-full">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
              size={16}
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search ideas"
              className="w-full rounded-full bg-cream-raised border border-line focus:border-line-strong focus:outline-none pl-9 pr-4 py-2 text-sm placeholder:text-ink-mute"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink transition"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setMobileSearch(!mobileSearch)}
            className="sm:hidden h-9 w-9 rounded-full border border-line bg-cream-raised inline-flex items-center justify-center hover:border-line-strong transition"
            aria-label="Search"
          >
            {mobileSearch ? <X size={15} /> : <Search size={15} />}
          </button>

          {viewer && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-raised border border-line">
              <Avatar member={viewer} size={22} />
              <span className="text-xs text-ink-soft font-medium hidden sm:inline">
                {viewer.name}
              </span>
            </div>
          )}

          <InviteButton inviteToken={inviteToken} />

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink text-cream-raised font-medium text-sm pl-3.5 pr-4 py-2 hover:opacity-90 active:opacity-80 transition"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add idea</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearch && (
        <div className="sm:hidden px-6 pb-4 animate-fade-in">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
              size={16}
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search ideas"
              autoFocus
              className="w-full rounded-full bg-cream-raised border border-line focus:border-line-strong focus:outline-none pl-9 pr-9 py-2 text-sm placeholder:text-ink-mute"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink transition"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
