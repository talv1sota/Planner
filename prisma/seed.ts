import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const plus = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return iso(d);
};

async function main() {
  // Clear existing data (idempotent re-seed)
  await db.interest.deleteMany();
  await db.item.deleteMany();
  await db.familyMember.deleteMany();
  await db.family.deleteMany();

  const family = await db.family.create({
    data: { name: "Our Family" },
  });

  const members = await Promise.all(
    [
      { name: "Mom", initial: "M", color: "#F4A7B9", isOrganizer: true },
      { name: "Dad", initial: "D", color: "#8FB8E8", isOrganizer: true },
      { name: "Ava", initial: "A", color: "#F6C784", isOrganizer: false },
      { name: "Leo", initial: "L", color: "#9CCFA1", isOrganizer: false },
      { name: "Gram", initial: "G", color: "#C9A7E8", isOrganizer: false },
    ].map((m) =>
      db.familyMember.create({
        data: { ...m, familyId: family.id },
      }),
    ),
  );

  const byName: Record<string, string> = {};
  for (const m of members) byName[m.name.toLowerCase()] = m.id;
  const id = (label: string) => byName[label];

  const items: {
    title: string;
    category: string;
    kind: string;
    date?: string;
    endDate?: string;
    timeOfDay: string;
    cost: string;
    pricePerPerson?: number;
    location?: string;
    notes?: string;
    addedBy: string;
    interested: string[];
  }[] = [
    {
      title: "Sunset Playground at Willow Park",
      category: "playgrounds",
      kind: "evergreen",
      timeOfDay: "morning,afternoon",
      cost: "free",
      location: "Willow Park, 4th Ave",
      notes: "Shaded structure, good for ages 3–9. Bring scooters.",
      addedBy: "mom",
      interested: ["mom", "ava", "leo"],
    },
    {
      title: "County Spring Fair",
      category: "fairs",
      kind: "dated",
      date: plus(6),
      endDate: plus(8),
      timeOfDay: "afternoon,evening",
      cost: "10to25",
      pricePerPerson: 18,
      location: "Fairgrounds, Hwy 9",
      notes: "Rides, livestock, fireworks Saturday at 9pm.",
      addedBy: "dad",
      interested: ["dad", "ava", "leo", "gram"],
    },
    {
      title: "Natural History Museum",
      category: "museums",
      kind: "evergreen",
      timeOfDay: "afternoon",
      cost: "under10",
      pricePerPerson: 8,
      location: "Downtown",
      notes: "Free first Sunday of the month.",
      addedBy: "mom",
      interested: ["mom", "ava", "gram"],
    },
    {
      title: "Blueberry picking at Old Mill Farm",
      category: "daytrips",
      kind: "dated",
      date: plus(13),
      timeOfDay: "morning",
      cost: "under10",
      pricePerPerson: 7,
      location: "Old Mill Farm (45 min drive)",
      addedBy: "gram",
      interested: ["mom", "gram", "leo"],
    },
    {
      title: "Family movie night at the drive-in",
      category: "shows",
      kind: "dated",
      date: plus(2),
      timeOfDay: "evening",
      cost: "10to25",
      pricePerPerson: 12,
      location: "Starlight Drive-In",
      notes: "Double feature, gates at 7:30.",
      addedBy: "dad",
      interested: ["dad", "mom", "ava", "leo"],
    },
    {
      title: "Paint Your Own Pottery",
      category: "arts",
      kind: "evergreen",
      timeOfDay: "afternoon",
      cost: "25to50",
      pricePerPerson: 32,
      location: "Mudroom Studio",
      addedBy: "mom",
      interested: ["mom", "ava"],
    },
    {
      title: "Farmers Market & Brunch",
      category: "dining",
      kind: "evergreen",
      timeOfDay: "morning",
      cost: "under10",
      pricePerPerson: 9,
      location: "Town Square (Sat only)",
      addedBy: "mom",
      interested: ["mom", "dad", "gram"],
    },
    {
      title: "Botanical Gardens Lantern Walk",
      category: "seasonal",
      kind: "dated",
      date: plus(18),
      endDate: plus(40),
      timeOfDay: "evening",
      cost: "10to25",
      pricePerPerson: 15,
      location: "Botanical Gardens",
      notes: "Sweater weather. Ticketed timed entry.",
      addedBy: "gram",
      interested: ["gram", "mom", "leo"],
    },
    {
      title: "Little League home opener",
      category: "sports",
      kind: "dated",
      date: plus(4),
      timeOfDay: "afternoon",
      cost: "free",
      location: "Riverside Field",
      addedBy: "dad",
      interested: ["dad", "ava"],
    },
    {
      title: "Lakeside trail loop",
      category: "parks",
      kind: "evergreen",
      timeOfDay: "morning,afternoon",
      cost: "free",
      location: "Cedar Lake",
      notes: "2.4 mile flat loop, stroller-friendly.",
      addedBy: "dad",
      interested: ["dad", "mom", "ava", "leo"],
    },
    {
      title: "Symphony Family Concert",
      category: "shows",
      kind: "dated",
      date: plus(23),
      timeOfDay: "afternoon",
      cost: "25to50",
      pricePerPerson: 28,
      location: "Civic Hall",
      notes: "Instrument petting zoo in lobby pre-show.",
      addedBy: "gram",
      interested: ["gram", "ava"],
    },
    {
      title: "Pizza & board game night",
      category: "dining",
      kind: "evergreen",
      timeOfDay: "evening",
      cost: "10to25",
      pricePerPerson: 14,
      location: "Home",
      addedBy: "ava",
      interested: ["mom", "dad", "ava", "leo"],
    },
    {
      title: "Pumpkin patch & hayride",
      category: "seasonal",
      kind: "evergreen",
      timeOfDay: "morning,afternoon",
      cost: "under10",
      pricePerPerson: 6,
      location: "Harvest Hollow Farm",
      addedBy: "mom",
      interested: ["mom", "dad", "ava", "leo", "gram"],
    },
    {
      title: "Aquarium",
      category: "museums",
      kind: "evergreen",
      timeOfDay: "allday",
      cost: "25to50",
      pricePerPerson: 34,
      location: "Harbor Aquarium",
      addedBy: "leo",
      interested: ["ava", "leo", "mom"],
    },
    {
      title: "State park overnight camp",
      category: "daytrips",
      kind: "dated",
      date: plus(35),
      endDate: plus(36),
      timeOfDay: "allday",
      cost: "50plus",
      pricePerPerson: 55,
      location: "Pine Ridge State Park",
      notes: "Reserve site in advance. Bring s'mores fixings.",
      addedBy: "dad",
      interested: ["dad", "mom", "ava", "leo"],
    },
    {
      title: "Ice cream walk",
      category: "dining",
      kind: "evergreen",
      timeOfDay: "evening",
      cost: "under10",
      pricePerPerson: 6,
      location: "Main St",
      addedBy: "leo",
      interested: ["ava", "leo", "dad", "gram"],
    },
    {
      title: "Library Saturday storytime",
      category: "arts",
      kind: "evergreen",
      timeOfDay: "morning",
      cost: "free",
      location: "Central Library",
      addedBy: "mom",
      interested: ["mom", "leo"],
    },
    {
      title: "Beach day",
      category: "parks",
      kind: "dated",
      date: plus(10),
      timeOfDay: "allday",
      cost: "free",
      location: "Crescent Beach",
      addedBy: "mom",
      interested: ["mom", "dad", "ava", "leo"],
    },
    {
      title: "Six Flags summer trip",
      category: "themeparks",
      kind: "dated",
      date: plus(28),
      timeOfDay: "allday",
      cost: "50plus",
      pricePerPerson: 85,
      location: "Six Flags",
      notes: "Season pass saves $$ if we go more than twice.",
      addedBy: "ava",
      interested: ["ava", "leo", "dad"],
    },
    {
      title: "Local amusement park afternoon",
      category: "themeparks",
      kind: "evergreen",
      timeOfDay: "afternoon,evening",
      cost: "25to50",
      pricePerPerson: 38,
      location: "Adventureland",
      notes: "Wristbands cheaper after 5pm.",
      addedBy: "dad",
      interested: ["dad", "ava", "leo", "mom"],
    },
  ];

  for (const raw of items) {
    const item = await db.item.create({
      data: {
        familyId: family.id,
        title: raw.title,
        category: raw.category,
        kind: raw.kind,
        date: raw.date,
        endDate: raw.endDate,
        timeOfDay: raw.timeOfDay,
        cost: raw.cost,
        pricePerPerson: raw.pricePerPerson,
        location: raw.location,
        notes: raw.notes,
        addedById: id(raw.addedBy),
      },
    });

    await db.interest.createMany({
      data: raw.interested.map((name) => ({
        itemId: item.id,
        memberId: id(name),
      })),
    });
  }

  const count = await db.item.count();
  console.log(`Seeded ${members.length} members and ${count} items for "${family.name}" (invite: ${family.inviteToken})`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
