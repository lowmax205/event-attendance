/*
  Warnings:

  - You are about to drop the column `action` on the `SecurityLog` table. All the data in the column will be lost.
  - The `accountStatus` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('CSV', 'XLSX');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('REGISTRATION', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_CHANGE', 'USER_ROLE_CHANGED', 'USER_STATUS_CHANGED', 'USER_CREATED', 'USER_PASSWORD_RESET', 'USER_DELETED', 'EVENT_CREATED', 'EVENT_EDITED', 'EVENT_DELETED', 'ATTENDANCE_VERIFIED', 'ATTENDANCE_REJECTED', 'ATTENDANCE_APPEALED', 'DISPUTE_RESOLVED', 'DATA_EXPORTED', 'ANALYTICS_ACCESSED');

-- DropIndex
DROP INDEX "public"."SecurityLog_action_createdAt_idx";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "appealMessage" TEXT,
ADD COLUMN     "resolutionNotes" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "editHistory" JSONB,
ADD COLUMN     "hasAttendances" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SecurityLog" DROP COLUMN "action",
ADD COLUMN     "eventType" "SecurityEventType" NOT NULL DEFAULT 'LOGIN',
ADD COLUMN     "success" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "passwordResetAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetById" TEXT,
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedById" TEXT,
DROP COLUMN "accountStatus",
ADD COLUMN     "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "ExportRecord" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exportedById" TEXT NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "filters" JSONB NOT NULL,
    "recordCount" INTEGER NOT NULL,
    "status" "ExportStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "fileSize" INTEGER,
    "downloadUrl" TEXT,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ExportRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExportRecord_exportedById_createdAt_idx" ON "ExportRecord"("exportedById", "createdAt");

-- CreateIndex
CREATE INDEX "ExportRecord_createdAt_idx" ON "ExportRecord"("createdAt");

-- CreateIndex
CREATE INDEX "ExportRecord_status_idx" ON "ExportRecord"("status");

-- CreateIndex
CREATE INDEX "Attendance_verifiedById_verifiedAt_idx" ON "Attendance"("verifiedById", "verifiedAt");

-- CreateIndex
CREATE INDEX "Attendance_checkInSubmittedAt_idx" ON "Attendance"("checkInSubmittedAt");

-- CreateIndex
CREATE INDEX "Event_status_startDateTime_idx" ON "Event"("status", "startDateTime");

-- CreateIndex
CREATE INDEX "Event_deletedAt_idx" ON "Event"("deletedAt");

-- CreateIndex
CREATE INDEX "SecurityLog_eventType_createdAt_idx" ON "SecurityLog"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_accountStatus_idx" ON "User"("accountStatus");

-- CreateIndex
CREATE INDEX "User_suspendedById_idx" ON "User"("suspendedById");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_suspendedById_fkey" FOREIGN KEY ("suspendedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_passwordResetById_fkey" FOREIGN KEY ("passwordResetById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportRecord" ADD CONSTRAINT "ExportRecord_exportedById_fkey" FOREIGN KEY ("exportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
