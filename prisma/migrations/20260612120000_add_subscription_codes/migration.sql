-- CreateEnum
CREATE TYPE "SubscriptionCodeStatus" AS ENUM ('ACTIVE', 'REDEEMED', 'DISABLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SubscriptionCode" (
    "id" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "codePreview" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "status" "SubscriptionCodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" UUID,
    "redeemedById" UUID,
    "redeemedOfficeId" UUID,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeSubscription" (
    "id" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "codeId" UUID NOT NULL,
    "redeemedById" UUID,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfficeSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionCode_codeHash_key" ON "SubscriptionCode"("codeHash");

-- CreateIndex
CREATE INDEX "SubscriptionCode_status_idx" ON "SubscriptionCode"("status");

-- CreateIndex
CREATE INDEX "SubscriptionCode_expiresAt_idx" ON "SubscriptionCode"("expiresAt");

-- CreateIndex
CREATE INDEX "SubscriptionCode_redeemedOfficeId_idx" ON "SubscriptionCode"("redeemedOfficeId");

-- CreateIndex
CREATE INDEX "SubscriptionCode_createdById_idx" ON "SubscriptionCode"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeSubscription_codeId_key" ON "OfficeSubscription"("codeId");

-- CreateIndex
CREATE INDEX "OfficeSubscription_officeId_expiresAt_idx" ON "OfficeSubscription"("officeId", "expiresAt");

-- CreateIndex
CREATE INDEX "OfficeSubscription_expiresAt_idx" ON "OfficeSubscription"("expiresAt");

-- CreateIndex
CREATE INDEX "OfficeSubscription_redeemedById_idx" ON "OfficeSubscription"("redeemedById");

-- AddForeignKey
ALTER TABLE "SubscriptionCode" ADD CONSTRAINT "SubscriptionCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionCode" ADD CONSTRAINT "SubscriptionCode_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionCode" ADD CONSTRAINT "SubscriptionCode_redeemedOfficeId_fkey" FOREIGN KEY ("redeemedOfficeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeSubscription" ADD CONSTRAINT "OfficeSubscription_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeSubscription" ADD CONSTRAINT "OfficeSubscription_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "SubscriptionCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeSubscription" ADD CONSTRAINT "OfficeSubscription_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
