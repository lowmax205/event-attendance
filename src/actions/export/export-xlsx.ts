"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";
import {
  exportFiltersSchema,
  MAX_EXPORT_RECORDS,
} from "@/lib/validations/export";
import { generateAttendanceXLSX } from "@/lib/export/xlsx-generator";
import { uploadPhoto } from "@/lib/cloudinary";
import { Prisma } from "@prisma/client";
import { z } from "zod";

/**
 * T030: Export attendance data as Excel (XLSX)
 * Phase 3.6 - Server Actions - Data Export
 */
export async function exportAttendanceXLSX(filters: {
  eventIds?: string[];
  startDate?: string;
  endDate?: string;
  status?: string;
  studentName?: string;
}) {
  try {
    const user = await requireRole(["Administrator", "Moderator"]);

    // Validate filters
    const validatedFilters = exportFiltersSchema.parse(filters);

    // Build where clause
    const where: Prisma.AttendanceWhereInput = {};

    // Moderator scope: only export attendances for events they created
    if (user.role === "Moderator") {
      where.event = {
        createdById: user.userId,
      };
    }

    // Apply filters
    if (validatedFilters.eventIds && validatedFilters.eventIds.length > 0) {
      where.eventId = { in: validatedFilters.eventIds };
    }

    if (validatedFilters.startDate || validatedFilters.endDate) {
      where.checkInSubmittedAt = {};
      if (validatedFilters.startDate) {
        where.checkInSubmittedAt.gte = new Date(validatedFilters.startDate);
      }
      if (validatedFilters.endDate) {
        where.checkInSubmittedAt.lte = new Date(validatedFilters.endDate);
      }
    }

    if (validatedFilters.status) {
      where.verificationStatus = validatedFilters.status as
        | "Pending"
        | "Approved"
        | "Rejected"
        | "Disputed";
    }

    if (validatedFilters.studentName) {
      where.user = {
        OR: [
          {
            firstName: {
              contains: validatedFilters.studentName,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: validatedFilters.studentName,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    // Count records first
    const recordCount = await db.attendance.count({ where });

    // Validate record count (FR-046: max 10,000 records)
    if (recordCount > MAX_EXPORT_RECORDS) {
      return {
        success: false,
        error: `Export exceeds maximum record limit (${MAX_EXPORT_RECORDS.toLocaleString()} records). Please refine your filters. Current match: ${recordCount.toLocaleString()} records.`,
      };
    }

    // Fetch records with all necessary joins
    const attendances = await db.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            UserProfile: {
              select: {
                studentId: true,
                department: true,
                yearLevel: true,
                section: true,
              },
            },
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            startDateTime: true,
            venueName: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { event: { startDateTime: "desc" } },
        { checkInSubmittedAt: "desc" },
      ],
    });

    // Generate XLSX
    const xlsxBuffer = generateAttendanceXLSX(attendances);
    const fileSize = xlsxBuffer.length;

    // Upload to Cloudinary
    const timestamp = Date.now();
    const filename = `attendance-export-${timestamp}.xlsx`;

    // Convert buffer to base64 data URL
    const base64Data = xlsxBuffer.toString("base64");
    const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;

    const downloadUrl = await uploadPhoto(dataUrl, "exports/" + filename);

    // Generate expiration (24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create ExportRecord
    const exportRecord = await db.exportRecord.create({
      data: {
        exportedById: user.userId,
        format: "XLSX",
        filters: validatedFilters as Prisma.InputJsonValue,
        recordCount,
        status: "COMPLETED",
        fileSize,
        downloadUrl,
        expiresAt,
      },
    });

    // Log to SecurityLog
    await db.securityLog.create({
      data: {
        userId: user.userId,
        eventType: "DATA_EXPORTED",
        ipAddress: "::1",
        userAgent: "Server Action",
        success: true,
        metadata: {
          exportId: exportRecord.id,
          format: "XLSX",
          recordCount,
          filters: validatedFilters,
          fileSize,
        },
      },
    });

    return {
      success: true,
      data: {
        exportId: exportRecord.id,
        downloadUrl,
        expiresAt,
        recordCount,
        fileSize,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to export attendance data",
    };
  }
}
