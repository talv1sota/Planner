import {
  Baby,
  Trees,
  Tent,
  ShoppingBasket,
  FerrisWheel,
  Landmark,
  UtensilsCrossed,
  Trophy,
  Palette,
  Drama,
  Car,
  Sparkles,
  PartyPopper,
  Users,
  ClipboardList,
  Star,
  Sunrise,
  Sun,
  Moon,
  Clock,
} from "lucide-react";
import type { Category, CostTier, TimeOfDay } from "./types";

export const CATEGORIES: Category[] = [
  {
    key: "playgrounds",
    label: "Playgrounds",
    icon: Baby,
    tint: "bg-[#FFE8D1]",
    ink: "text-[#8A4F1A]",
  },
  {
    key: "parks",
    label: "Parks & Hikes",
    icon: Trees,
    tint: "bg-[#DDEAD0]",
    ink: "text-[#3F5A2B]",
  },
  {
    key: "fairs",
    label: "Fairs & Festivals",
    icon: Tent,
    tint: "bg-[#FDD7D7]",
    ink: "text-[#8C2B2B]",
  },
  {
    key: "markets",
    label: "Markets",
    icon: ShoppingBasket,
    tint: "bg-[#F0E5C9]",
    ink: "text-[#6B5A23]",
  },
  {
    key: "themeparks",
    label: "Theme Parks",
    icon: FerrisWheel,
    tint: "bg-[#EACBE9]",
    ink: "text-[#5A2663]",
  },
  {
    key: "museums",
    label: "Museums",
    icon: Landmark,
    tint: "bg-[#E3DAF3]",
    ink: "text-[#4C3780]",
  },
  {
    key: "dining",
    label: "Dining",
    icon: UtensilsCrossed,
    tint: "bg-[#FDE8BE]",
    ink: "text-[#7A5310]",
  },
  {
    key: "sports",
    label: "Sports",
    icon: Trophy,
    tint: "bg-[#CFE5F5]",
    ink: "text-[#2D5878]",
  },
  {
    key: "arts",
    label: "Arts & Crafts",
    icon: Palette,
    tint: "bg-[#F5D7E7]",
    ink: "text-[#7A2D5B]",
  },
  {
    key: "shows",
    label: "Shows & Movies",
    icon: Drama,
    tint: "bg-[#D8E4FB]",
    ink: "text-[#2E3F70]",
  },
  {
    key: "daytrips",
    label: "Day Trips",
    icon: Car,
    tint: "bg-[#D5EFE7]",
    ink: "text-[#255049]",
  },
  {
    key: "seasonal",
    label: "Seasonal",
    icon: Sparkles,
    tint: "bg-[#FCE1C6]",
    ink: "text-[#7A3F14]",
  },
  {
    key: "holidays",
    label: "Holidays",
    icon: PartyPopper,
    tint: "bg-[#F2DCA0]",
    ink: "text-[#6E4E0C]",
  },
  {
    key: "clubs",
    label: "Clubs & Groups",
    icon: Users,
    tint: "bg-[#CFEDE3]",
    ink: "text-[#1F5C4C]",
  },
  {
    key: "errands",
    label: "Appointments & Errands",
    icon: ClipboardList,
    tint: "bg-[#E2E6EC]",
    ink: "text-[#40495A]",
  },
  {
    key: "other",
    label: "Other",
    icon: Star,
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
  { key: "under10", label: "Under €10 / person", shortLabel: "< €10" },
  { key: "10to25", label: "€10 – €25 / person", shortLabel: "€10–25" },
  { key: "25to50", label: "€25 – €50 / person", shortLabel: "€25–50" },
  { key: "50plus", label: "€50+ / person", shortLabel: "€50+" },
];

export const COST_BY_KEY = Object.fromEntries(
  COST_TIERS.map((c) => [c.key, c]),
) as Record<string, (typeof COST_TIERS)[number]>;

export const TIMES: {
  key: TimeOfDay;
  label: string;
  icon: import("lucide-react").LucideIcon;
}[] = [
  { key: "morning", label: "Morning", icon: Sunrise },
  { key: "afternoon", label: "Afternoon", icon: Sun },
  { key: "evening", label: "Evening", icon: Moon },
  { key: "allday", label: "All day", icon: Clock },
];

export const TIME_BY_KEY = Object.fromEntries(
  TIMES.map((t) => [t.key, t]),
) as Record<string, (typeof TIMES)[number]>;
