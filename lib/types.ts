export type CategoryKey =
  | "playgrounds"
  | "parks"
  | "fairs"
  | "themeparks"
  | "museums"
  | "dining"
  | "sports"
  | "arts"
  | "shows"
  | "daytrips"
  | "seasonal"
  | "other";

export type CostTier = "free" | "under10" | "10to25" | "25to50" | "50plus";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "allday";

export type ItemKind = "evergreen" | "dated";

export type Item = {
  id: string;
  title: string;
  category: CategoryKey;
  kind: ItemKind;
  /** ISO date, only set when kind === "dated" */
  date?: string;
  /** optional end date for multi-day events */
  endDate?: string;
  timeOfDay: TimeOfDay[];
  cost: CostTier;
  /** Approximate price per person for sort/tooltip display */
  pricePerPerson?: number;
  location?: string;
  notes?: string;
  addedBy: string;
  interestedBy: string[];
};

export type Category = {
  key: CategoryKey;
  label: string;
  emoji: string;
  /** Tailwind classes for the soft category tint */
  tint: string;
  /** Text color when on tint */
  ink: string;
};

export type View = "ideas" | "calendar";

export type SortKey = "newest" | "alphabetical" | "soonest" | "popular";

export type Filters = {
  categories: Set<CategoryKey>;
  costs: Set<CostTier>;
  times: Set<TimeOfDay>;
  when: "any" | "weekend" | "thisweek" | "thismonth";
  interested: string | "any";
  search: string;
};
