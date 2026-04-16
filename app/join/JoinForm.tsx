"use client";

import { useState } from "react";
import { joinWithCode } from "./actions";

export function JoinForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        await joinWithCode(code.trim());
        setLoading(false);
      }}
      className="flex flex-col gap-3"
    >
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste invite code or link"
        autoFocus
        className="w-full rounded-2xl bg-cream-raised border border-line px-4 py-3 text-center text-lg font-medium tracking-wide placeholder:text-ink-mute focus:outline-none focus:border-line-strong"
      />
      <button
        type="submit"
        disabled={!code.trim() || loading}
        className={`w-full rounded-full py-3 text-sm font-medium transition ${
          code.trim() && !loading
            ? "bg-ink text-cream-raised hover:opacity-90"
            : "bg-line-strong text-ink-mute cursor-not-allowed"
        }`}
      >
        {loading ? "Checking..." : "Join family"}
      </button>
    </form>
  );
}
