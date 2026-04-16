import {
  endOfMonth,
  endOfWeek,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { Filters, Item } from "./types";

export function applyFilters(items: Item[], filters: Filters): Item[] {
  const q = filters.search.trim().toLowerCase();
  const now = new Date();
  const today = startOfDay(now);

  const inWhen = (i: Item) => {
    if (filters.when === "any") return true;
    // Evergreen items are always eligible — they can be done anytime.
    if (i.kind !== "dated" || !i.date) return true;
    const start = parseISO(i.date);
    const end = i.endDate ? parseISO(i.endDate) : start;
    if (filters.when === "weekend") {
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const friday = new Date(weekStart);
      friday.setDate(friday.getDate() + 5); // Fri evening in spirit
      const sunday = new Date(weekStart);
      sunday.setDate(sunday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return !(end < friday || start > sunday);
    }
    if (filters.when === "thisweek") {
      const wStart = startOfWeek(today, { weekStartsOn: 0 });
      const wEnd = endOfWeek(today, { weekStartsOn: 0 });
      return !(end < wStart || start > wEnd);
    }
    if (filters.when === "thismonth") {
      const mStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const mEnd = endOfMonth(today);
      return !(end < mStart || start > mEnd);
    }
    return true;
  };

  return items.filter((i) => {
    if (filters.categories.size > 0 && !filters.categories.has(i.category))
      return false;
    if (filters.costs.size > 0 && !filters.costs.has(i.cost)) return false;
    if (
      filters.times.size > 0 &&
      !i.timeOfDay.some((t) => filters.times.has(t))
    )
      return false;
    if (
      filters.interested !== "any" &&
      !i.interestedBy.includes(filters.interested)
    )
      return false;
    if (!inWhen(i)) return false;
    if (
      q &&
      !(
        i.title.toLowerCase().includes(q) ||
        i.location?.toLowerCase().includes(q) ||
        i.notes?.toLowerCase().includes(q)
      )
    )
      return false;
    return true;
  });
}
