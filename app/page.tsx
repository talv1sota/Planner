import { redirect } from "next/navigation";
import { getFamily, getItems, getDiscoveredAddedIds } from "@/lib/queries";
import { getViewerId } from "@/lib/viewer";
import { PlannerApp } from "@/components/PlannerApp";
import { MemberPicker } from "@/components/MemberPicker";

export const dynamic = "force-dynamic";

export default async function Home() {
  const family = await getFamily();
  if (!family) {
    redirect("/join");
  }

  const viewerId = await getViewerId();
  const validMember =
    viewerId && family.members.some((m) => m.id === viewerId);

  if (!validMember) {
    // Only show the picker for members of THIS family — never expose members to outsiders
    return <MemberPicker members={family.members} familyId={family.id} />;
  }

  const [items, addedDiscoverIds] = await Promise.all([
    getItems(family.id),
    getDiscoveredAddedIds(family.id),
  ]);

  return (
    <PlannerApp
      initialItems={items}
      members={family.members}
      viewerId={viewerId!}
      familyId={family.id}
      inviteToken={family.inviteToken}
      addedDiscoverIds={addedDiscoverIds}
    />
  );
}
