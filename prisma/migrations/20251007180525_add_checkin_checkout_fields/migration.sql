/*
  Warnings:

  - You are about to drop the column `backPhotoUrl` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `distanceFromVenue` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `frontPhotoUrl` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `signatureUrl` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `Attendance` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Attendance_userId_submittedAt_idx";

-- Step 1: Add new columns (nullable)
ALTER TABLE "Attendance" 
ADD COLUMN "checkInBackPhoto" TEXT,
ADD COLUMN "checkInDistance" DOUBLE PRECISION,
ADD COLUMN "checkInFrontPhoto" TEXT,
ADD COLUMN "checkInIpAddress" TEXT,
ADD COLUMN "checkInLatitude" DOUBLE PRECISION,
ADD COLUMN "checkInLongitude" DOUBLE PRECISION,
ADD COLUMN "checkInSignature" TEXT,
ADD COLUMN "checkInSubmittedAt" TIMESTAMP(3),
ADD COLUMN "checkInUserAgent" TEXT,
ADD COLUMN "checkOutBackPhoto" TEXT,
ADD COLUMN "checkOutDistance" DOUBLE PRECISION,
ADD COLUMN "checkOutFrontPhoto" TEXT,
ADD COLUMN "checkOutIpAddress" TEXT,
ADD COLUMN "checkOutLatitude" DOUBLE PRECISION,
ADD COLUMN "checkOutLongitude" DOUBLE PRECISION,
ADD COLUMN "checkOutSignature" TEXT,
ADD COLUMN "checkOutSubmittedAt" TIMESTAMP(3),
ADD COLUMN "checkOutUserAgent" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Migrate existing data to check-in fields
UPDATE "Attendance" SET
  "checkInSubmittedAt" = "submittedAt",
  "checkInLatitude" = "latitude",
  "checkInLongitude" = "longitude",
  "checkInDistance" = "distanceFromVenue",
  "checkInFrontPhoto" = "frontPhotoUrl",
  "checkInBackPhoto" = "backPhotoUrl",
  "checkInSignature" = "signatureUrl",
  "checkInIpAddress" = "ipAddress",
  "checkInUserAgent" = "userAgent",
  "createdAt" = "submittedAt";

-- Step 3: Drop old columns
ALTER TABLE "Attendance" 
DROP COLUMN "backPhotoUrl",
DROP COLUMN "distanceFromVenue",
DROP COLUMN "frontPhotoUrl",
DROP COLUMN "ipAddress",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "signatureUrl",
DROP COLUMN "submittedAt",
DROP COLUMN "userAgent";

-- CreateIndex
CREATE INDEX "Attendance_userId_checkInSubmittedAt_idx" ON "Attendance"("userId", "checkInSubmittedAt");
