import type { Category, CostTier, TimeOfDay } from "./types";

export const CATEGORIES: Category[] = [
  {
    key: "playgrounds",
    label: "Playgrounds",
    emoji: "🛝",
    tint: "bg-[#FFE8D1]",
    ink: "text-[#8A4F1A]",
  },
  {
    key: "parks",
    label: "Parks & Hikes",
    emoji: "🌳",
    tint: "bg-[#DDEAD0]",
    ink: "text-[#3F5A2B]",
  },
  {
    key: "fairs",
    label: "Fairs & Festivals",
    emoji: "🎡",
    tint: "bg-[#FDD7D7]",
    ink: "text-[#8C2B2B]",
  },
  {
    key: "themeparks",
    label: "Theme Parks",
    emoji: "🎢",
    tint: "bg-[#EACBE9]",
    ink: "text-[#5A2663]",
  },
  {
    key: "museums",
    label: "Museums",
    emoji: "🏛️",
    tint: "bg-[#E3DAF3]",
    ink: "text-[#4C3780]",
  },
  {
    key: "dining",
    label: "Dining",
    emoji: "🍽️",
    tint: "bg-[#FDE8BE]",
    ink: "text-[#7A5310]",
  },
  {
    key: "sports",
    label: "Sports",
    emoji: "⚽",
    tint: "bg-[#CFE5F5]",
    ink: "text-[#2D5878]",
  },
  {
    key: "arts",
    label: "Arts & Crafts",
    emoji: "🎨",
    tint: "bg-[#F5D7E7]",
    ink: "text-[#7A2D5B]",
  },
  {
    key: "shows",
    label: "Shows & Movies",
    emoji: "🎭",
    tint: "bg-[#D8E4FB]",
    ink: "text-[#2E3F70]",
  },
  {
    key: "daytrips",
    label: "Day Trips",
    emoji: "🚗",
    tint: "bg-[#D5EFE7]",
    ink: "text-[#255049]",
  },
  {
    key: "seasonal",
    label: "Seasonal",
    emoji: "🎃",
    tint: "bg-[#FCE1C6]",
    ink: "text-[#7A3F14]",
  },
  {
    key: "other",
    label: "Other",
    emoji: "✨",
    tint: "bg-[#E8E1D3]",
    ink: "text-[#4F4639]",
  },
];

export const CATEGORY_BY_KEY = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<string, Category>;

export const COST_TIERS: {
  key: CostTier;
  label: string;
  shortLabel: string;
}[] = [
  { key: "free", label: "Free", shortLabel: "Free" },
  { key: "under10", label: "Under $10 / person", shortLabel: "< $10" },
  { key: "10to25", label: "$10 – $25 / person", shortLabel: "$10–25" },
  { key: "25to50", label: "$25 – $50 / person", shortLabel: "$25–50" },
  { key: "50plus", label: "$50+ / person", shortLabel: "$50+" },
];

export const COST_BY_KEY = Object.fromEntries(
  COST_TIERS.map((c) => [c.key, c]),
) as Record<string, (typeof COST_TIERS)[number]>;

export const TIMES: { key: TimeOfDay; label: string; emoji: string }[] = [
  { key: "morning", label: "Morning", emoji: "🌅" },
  { key: "afternoon", label: "Afternoon", emoji: "☀️" },
  { key: "evening", label: "Evening", emoji: "🌙" },
  { key: "allday", label: "All day", emoji: "🕐" },
];

export const TIME_BY_KEY = Object.fromEntries(
  TIMES.map((t) => [t.key, t]),
) as Record<string, (typeof TIMES)[number]>;
