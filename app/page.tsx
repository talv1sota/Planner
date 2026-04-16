import { getFamily, getItems } from "@/lib/queries";
import { getViewerId } from "@/lib/viewer";
import { PlannerApp } from "@/components/PlannerApp";
import { MemberPicker } from "@/components/MemberPicker";

export const dynamic = "force-dynamic";

export default async function Home() {
  const family = await getFamily();
  if (!family) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-6">
        <p className="font-display text-xl text-ink-soft">
          No family found. Run <code>npx prisma db seed</code> to set up.
        </p>
      </div>
    );
  }

  const viewerId = await getViewerId();
  const validMember =
    viewerId && family.members.some((m) => m.id === viewerId);

  if (!validMember) {
    return <MemberPicker members={family.members} familyId={family.id} />;
  }

  const items = await getItems(family.id);

  return (
    <PlannerApp
      initialItems={items}
      members={family.members}
      viewerId={viewerId!}
      familyId={family.id}
      familyName={family.name}
      inviteToken={family.inviteToken}
    />
  );
}
