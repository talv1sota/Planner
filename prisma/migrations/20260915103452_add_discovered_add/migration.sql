-- CreateTable
CREATE TABLE "DiscoveredAdd" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "discoveredId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoveredAdd_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveredAdd_itemId_key" ON "DiscoveredAdd"("itemId");

-- CreateIndex
CREATE INDEX "DiscoveredAdd_familyId_idx" ON "DiscoveredAdd"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveredAdd_familyId_discoveredId_key" ON "DiscoveredAdd"("familyId", "discoveredId");

-- AddForeignKey
ALTER TABLE "DiscoveredAdd" ADD CONSTRAINT "DiscoveredAdd_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveredAdd" ADD CONSTRAINT "DiscoveredAdd_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
