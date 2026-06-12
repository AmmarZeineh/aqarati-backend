-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "OfficeStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'ADMIN', 'AGENT', 'VIEWER');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'VILLA', 'LAND', 'SHOP', 'OFFICE', 'WAREHOUSE', 'FARM', 'BUILDING', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyPurpose" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD', 'RENTED', 'UNAVAILABLE', 'NEEDS_CONFIRMATION');

-- CreateEnum
CREATE TYPE "FurnishingStatus" AS ENUM ('FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PhotoVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "PublicLinkType" AS ENUM ('PROPERTY', 'COLLECTION');

-- CreateEnum
CREATE TYPE "PublicLinkStatus" AS ENUM ('ACTIVE', 'DISABLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'UPLOAD_PHOTO', 'DELETE_PHOTO', 'CREATE_PUBLIC_LINK', 'DISABLE_PUBLIC_LINK', 'SHARE_WHATSAPP', 'VIEW_PUBLIC_LINK');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "city" TEXT,
    "country" TEXT,
    "address" TEXT,
    "status" "OfficeStatus" NOT NULL DEFAULT 'TRIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeMember" (
    "id" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'AGENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "code" TEXT,
    "title" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "purpose" "PropertyPurpose" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "country" TEXT,
    "city" TEXT,
    "area" TEXT,
    "neighborhood" TEXT,
    "publicLocationText" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "price" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isPriceNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "sizeSqm" DECIMAL(10,2),
    "landSizeSqm" DECIMAL(10,2),
    "rooms" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "buildingAgeYears" INTEGER,
    "furnishing" "FurnishingStatus" NOT NULL DEFAULT 'UNKNOWN',
    "hasElevator" BOOLEAN,
    "hasParking" BOOLEAN,
    "hasBalcony" BOOLEAN,
    "hasGarden" BOOLEAN,
    "hasPool" BOOLEAN,
    "hasHeating" BOOLEAN,
    "hasCooling" BOOLEAN,
    "descriptionPublic" TEXT,
    "notesInternal" TEXT,
    "availableFrom" TIMESTAMP(3),
    "lastConfirmedAt" TIMESTAMP(3),
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPrivateDetails" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "ownerName" TEXT,
    "ownerPhone" TEXT,
    "ownerWhatsapp" TEXT,
    "exactAddress" TEXT,
    "privateLocationNote" TEXT,
    "minimumAcceptablePrice" DECIMAL(14,2),
    "commissionNote" TEXT,
    "legalNote" TEXT,
    "internalWarning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyPrivateDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "storageKey" TEXT,
    "thumbnailStorageKey" TEXT,
    "label" TEXT,
    "roomType" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visibility" "PhotoVisibility" NOT NULL DEFAULT 'PUBLIC',
    "width" INTEGER,
    "height" INTEGER,
    "sizeBytes" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyCollection" (
    "id" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "clientName" TEXT,
    "clientPhone" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PropertyCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionItem" (
    "id" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicLink" (
    "id" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "type" "PublicLinkType" NOT NULL,
    "status" "PublicLinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "token" TEXT NOT NULL,
    "propertyId" UUID,
    "collectionId" UUID,
    "expiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "showPrice" BOOLEAN NOT NULL DEFAULT true,
    "showExactLocation" BOOLEAN NOT NULL DEFAULT false,
    "allowWhatsAppContact" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "PublicLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicLinkView" (
    "id" UUID NOT NULL,
    "publicLinkId" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicLinkView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "userId" UUID,
    "action" "ActivityAction" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Office_slug_key" ON "Office"("slug");

-- CreateIndex
CREATE INDEX "Office_status_idx" ON "Office"("status");

-- CreateIndex
CREATE INDEX "Office_country_city_idx" ON "Office"("country", "city");

-- CreateIndex
CREATE INDEX "Office_deletedAt_idx" ON "Office"("deletedAt");

-- CreateIndex
CREATE INDEX "OfficeMember_officeId_role_idx" ON "OfficeMember"("officeId", "role");

-- CreateIndex
CREATE INDEX "OfficeMember_userId_idx" ON "OfficeMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeMember_officeId_userId_key" ON "OfficeMember"("officeId", "userId");

-- CreateIndex
CREATE INDEX "Property_officeId_status_idx" ON "Property"("officeId", "status");

-- CreateIndex
CREATE INDEX "Property_officeId_type_idx" ON "Property"("officeId", "type");

-- CreateIndex
CREATE INDEX "Property_officeId_purpose_idx" ON "Property"("officeId", "purpose");

-- CreateIndex
CREATE INDEX "Property_officeId_city_area_idx" ON "Property"("officeId", "city", "area");

-- CreateIndex
CREATE INDEX "Property_officeId_price_idx" ON "Property"("officeId", "price");

-- CreateIndex
CREATE INDEX "Property_officeId_createdAt_idx" ON "Property"("officeId", "createdAt");

-- CreateIndex
CREATE INDEX "Property_officeId_deletedAt_idx" ON "Property"("officeId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Property_officeId_code_key" ON "Property"("officeId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyPrivateDetails_propertyId_key" ON "PropertyPrivateDetails"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyPrivateDetails_officeId_idx" ON "PropertyPrivateDetails"("officeId");

-- CreateIndex
CREATE INDEX "PropertyPhoto_officeId_idx" ON "PropertyPhoto"("officeId");

-- CreateIndex
CREATE INDEX "PropertyPhoto_propertyId_sortOrder_idx" ON "PropertyPhoto"("propertyId", "sortOrder");

-- CreateIndex
CREATE INDEX "PropertyPhoto_propertyId_visibility_idx" ON "PropertyPhoto"("propertyId", "visibility");

-- CreateIndex
CREATE INDEX "PropertyPhoto_deletedAt_idx" ON "PropertyPhoto"("deletedAt");

-- CreateIndex
CREATE INDEX "PropertyCollection_officeId_createdAt_idx" ON "PropertyCollection"("officeId", "createdAt");

-- CreateIndex
CREATE INDEX "PropertyCollection_officeId_deletedAt_idx" ON "PropertyCollection"("officeId", "deletedAt");

-- CreateIndex
CREATE INDEX "CollectionItem_officeId_idx" ON "CollectionItem"("officeId");

-- CreateIndex
CREATE INDEX "CollectionItem_collectionId_sortOrder_idx" ON "CollectionItem"("collectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "CollectionItem_propertyId_idx" ON "CollectionItem"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionItem_collectionId_propertyId_key" ON "CollectionItem"("collectionId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicLink_token_key" ON "PublicLink"("token");

-- CreateIndex
CREATE INDEX "PublicLink_officeId_type_idx" ON "PublicLink"("officeId", "type");

-- CreateIndex
CREATE INDEX "PublicLink_officeId_status_idx" ON "PublicLink"("officeId", "status");

-- CreateIndex
CREATE INDEX "PublicLink_propertyId_idx" ON "PublicLink"("propertyId");

-- CreateIndex
CREATE INDEX "PublicLink_collectionId_idx" ON "PublicLink"("collectionId");

-- CreateIndex
CREATE INDEX "PublicLink_expiresAt_idx" ON "PublicLink"("expiresAt");

-- CreateIndex
CREATE INDEX "PublicLinkView_publicLinkId_createdAt_idx" ON "PublicLinkView"("publicLinkId", "createdAt");

-- CreateIndex
CREATE INDEX "PublicLinkView_officeId_createdAt_idx" ON "PublicLinkView"("officeId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_officeId_createdAt_idx" ON "ActivityLog"("officeId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_officeId_action_idx" ON "ActivityLog"("officeId", "action");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- AddForeignKey
ALTER TABLE "OfficeMember" ADD CONSTRAINT "OfficeMember_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeMember" ADD CONSTRAINT "OfficeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPrivateDetails" ADD CONSTRAINT "PropertyPrivateDetails_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyCollection" ADD CONSTRAINT "PropertyCollection_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "PropertyCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicLink" ADD CONSTRAINT "PublicLink_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicLink" ADD CONSTRAINT "PublicLink_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicLink" ADD CONSTRAINT "PublicLink_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "PropertyCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicLinkView" ADD CONSTRAINT "PublicLinkView_publicLinkId_fkey" FOREIGN KEY ("publicLinkId") REFERENCES "PublicLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
