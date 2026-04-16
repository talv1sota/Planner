"use client";

import { createContext, useContext } from "react";
import type { FamilyMember } from "@prisma/client";

type FamilyContextType = {
  members: FamilyMember[];
  memberById: Record<string, FamilyMember>;
  viewerId: string;
  familyId: string;
};

const FamilyCtx = createContext<FamilyContextType | null>(null);

export function FamilyProvider({
  children,
  members,
  viewerId,
  familyId,
}: {
  children: React.ReactNode;
  members: FamilyMember[];
  viewerId: string;
  familyId: string;
}) {
  const memberById = Object.fromEntries(members.map((m) => [m.id, m]));
  return (
    <FamilyCtx.Provider value={{ members, memberById, viewerId, familyId }}>
      {children}
    </FamilyCtx.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyCtx);
  if (!ctx) throw new Error("useFamily must be used within FamilyProvider");
  return ctx;
}
