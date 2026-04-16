"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, X, ChevronDown, LogOut } from "lucide-react";
import { Avatar } from "./Avatar";
import { useFamily } from "./FamilyContext";
import { InviteButton } from "./InviteButton";
import { pickMember } from "@/app/actions";

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
  const { members, memberById, viewerId } = useFamily();
  const viewer = memberById[viewerId];
  const [mobileSearch, setMobileSearch] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenu]);

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

          {/* User menu */}
          {viewer && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-raised border border-line hover:border-line-strong transition"
              >
                <Avatar member={viewer} size={22} />
                <span className="text-xs text-ink-soft font-medium hidden sm:inline">
                  {viewer.name}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-ink-mute transition ${userMenu ? "rotate-180" : ""}`}
                />
              </button>

              {userMenu && (
                <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl bg-cream-raised border border-line shadow-[0_18px_48px_-24px_rgba(42,38,32,0.22)] overflow-hidden animate-fade-in">
                  <div className="px-3.5 py-2.5 border-b border-line">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold">
                      Signed in as
                    </div>
                    <div className="text-sm font-medium mt-0.5">
                      {viewer.name}
                    </div>
                  </div>
                  <div className="py-1.5">
                    <div className="px-3.5 py-1.5 text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold">
                      Switch to
                    </div>
                    {members
                      .filter((m) => m.id !== viewerId)
                      .map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={async () => {
                            setUserMenu(false);
                            await pickMember(m.id);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-cream transition"
                        >
                          <Avatar member={m} size={22} />
                          {m.name}
                        </button>
                      ))}
                  </div>
                  <div className="border-t border-line py-1.5">
                    <a
                      href="/reset"
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-soft hover:text-ink hover:bg-cream transition"
                    >
                      <LogOut size={14} />
                      Sign out
                    </a>
                  </div>
                </div>
              )}
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
