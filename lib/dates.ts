/** Local-date ISO formatting (YYYY-MM-DD) using the machine's own
 *  timezone, not UTC. `Date.toISOString()` converts to UTC first, which
 *  silently shifts the date by a day for part of the evening/early morning
 *  in any timezone ahead of UTC (e.g. Netherlands) — this doesn't. */
export function toLocalIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayLocalIso(): string {
  return toLocalIso(new Date());
}
