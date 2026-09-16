export type CategoryKey =
  | "playgrounds"
  | "parks"
  | "fairs"
  | "markets"
  | "themeparks"
  | "museums"
  | "dining"
  | "sports"
  | "arts"
  | "shows"
  | "daytrips"
  | "seasonal"
  | "holidays"
  | "clubs"
  | "errands"
  | "other";

export type CostTier = "free" | "under10" | "10to25" | "25to50" | "50plus";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "allday";

export type ItemKind = "evergreen" | "dated";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type Item = {
  id: string;
  title: string;
  category: CategoryKey;
  kind: ItemKind;
  /** ISO date, only set when kind === "dated". Also the start date when repeatWeekdays is set. */
  date?: string;
  /** optional end date for multi-day events (ignored when repeatWeekdays is set) */
  endDate?: string;
  /** When set, this dated item repeats weekly on these weekdays from `date` onward, with no end. */
  repeatWeekdays?: Weekday[];
  /** Alternative to repeatWeekdays: an explicit list of ISO dates, for irregular-but-known schedules. */
  repeatDates?: string[];
  /** ISO dates to skip for a repeating item (e.g. a sick day), without deleting the whole series. */
  excludeDates?: string[];
  timeOfDay: TimeOfDay[];
  /** Specific clock time (HH:MM, 24h), alongside the coarse timeOfDay tag. */
  startTime?: string;
  endTime?: string;
  cost: CostTier;
  /** Approximate price per person for sort/tooltip display */
  pricePerPerson?: number;
  location?: string;
  /** Town name, used to pick a representative photo for the card header. */
  city?: string;
  notes?: string;
  addedBy: string;
  interestedBy: string[];
};

export type Category = {
  key: CategoryKey;
  label: string;
  icon: import("lucide-react").LucideIcon;
  /** Tailwind classes for the soft category tint */
  tint: string;
  /** Text color when on tint */
  ink: string;
};

export type View = "ideas" | "calendar" | "discover";

export type SortKey = "newest" | "alphabetical" | "soonest" | "popular";

export type Filters = {
  categories: Set<CategoryKey>;
  costs: Set<CostTier>;
  times: Set<TimeOfDay>;
  when: "any" | "weekend" | "thisweek" | "thismonth";
  interested: string | "any";
  search: string;
};

/** A curated, externally-sourced event/club shown in "Discover".
 *  Lives in code (see lib/discoverData.ts), not the database — only
 *  whether a family has added one to their own list is persisted. */
export type DiscoverEvent = {
  id: string;
  title: string;
  blurb: string;
  category: CategoryKey;
  city: string;
  country: "NL" | "DE";
  /** "dated" gets added as a dated Item; "recurring" gets added as evergreen. */
  kind: "dated" | "recurring";
  /** ISO date, only when kind === "dated" */
  date?: string;
  endDate?: string;
  /** Human recurrence/cadence text, e.g. "Every Tuesday, 20:00" */
  recurrence?: string;
  /** When set (a clean weekly pattern), adding this creates a repeating
   *  dated Item starting the day it's added, instead of an evergreen one. */
  repeatWeekdays?: Weekday[];
  /** When set (specific known dates, e.g. a season's worth of one market),
   *  adding this creates a dated Item that shows on exactly these days. */
  repeatDates?: string[];
  /** Narrower time-of-day tag than the blanket "allday" default, when known. */
  timeOfDay?: TimeOfDay[];
  /** Specific clock time (HH:MM, 24h), when known. */
  startTime?: string;
  endTime?: string;
  cost: CostTier;
  pricePerPerson?: number;
  location?: string;
  sourceName: string;
  sourceUrl: string;
  language: "nl" | "de" | "en";
};
