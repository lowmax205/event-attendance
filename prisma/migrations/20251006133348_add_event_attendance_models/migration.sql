-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('Active', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'Disputed');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "createdEvents" TEXT[],
ADD COLUMN "attendances" TEXT[],
ADD COLUMN "verifiedAttendances" TEXT[];

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "venueLatitude" DOUBLE PRECISION NOT NULL,
    "venueLongitude" DOUBLE PRECISION NOT NULL,
    "venueName" TEXT NOT NULL,
    "venueAddress" TEXT,
    "checkInBufferMins" INTEGER NOT NULL DEFAULT 30,
    "checkOutBufferMins" INTEGER NOT NULL DEFAULT 30,
    "qrCodeUrl" TEXT,
    "qrCodePayload" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'Active',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distanceFromVenue" DOUBLE PRECISION NOT NULL,
    "frontPhotoUrl" TEXT NOT NULL,
    "backPhotoUrl" TEXT NOT NULL,
    "signatureUrl" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'Pending',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "disputeNote" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_qrCodePayload_key" ON "Event"("qrCodePayload");

-- CreateIndex
CREATE INDEX "Event_startDateTime_endDateTime_idx" ON "Event"("startDateTime", "endDateTime");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_eventId_userId_key" ON "Attendance"("eventId", "userId");

-- CreateIndex
CREATE INDEX "Attendance_userId_submittedAt_idx" ON "Attendance"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "Attendance_eventId_verificationStatus_idx" ON "Attendance"("eventId", "verificationStatus");

-- CreateIndex
CREATE INDEX "Attendance_verificationStatus_idx" ON "Attendance"("verificationStatus");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
