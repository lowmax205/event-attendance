"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";

interface ExportFilters {
  eventId?: string;
  status?: "Pending" | "Approved" | "Rejected" | "Disputed";
  startDate?: Date;
  endDate?: Date;
}

/**
 * Export attendance records as CSV
 * @param filters - Optional filters for event, status, date range
 * @returns CSV content with attendance data
 */
export async function exportAttendance(filters: ExportFilters = {}) {
  try {
    // Require Moderator or Administrator role
    await requireRole(["Moderator", "Administrator"]);

    const { eventId, status, startDate, endDate } = filters;

    // Build where clause
    const where: {
      eventId?: string;
      verificationStatus?: "Pending" | "Approved" | "Rejected" | "Disputed";
      checkInSubmittedAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (status) {
      where.verificationStatus = status;
    }

    if (startDate || endDate) {
      where.checkInSubmittedAt = {};
      if (startDate) {
        where.checkInSubmittedAt.gte = startDate;
      }
      if (endDate) {
        where.checkInSubmittedAt.lte = endDate;
      }
    }

    // Fetch attendance records with related data
    const attendances = await db.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            UserProfile: {
              select: {
                studentId: true,
              },
            },
          },
        },
        event: {
          select: {
            name: true,
            startDateTime: true,
          },
        },
        verifiedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        checkInSubmittedAt: "desc",
      },
    });

    // CSV Headers
    const headers = [
      "Student Name",
      "Student ID",
      "Event Name",
      "Event Date",
      "Check-In Time",
      "Check-Out Time",
      "Verification Status",
      "Verified By",
      "Check-In Distance (m)",
      "Check-Out Distance (m)",
    ];

    // CSV Rows
    const rows = attendances.map((attendance) => {
      const studentName = `${attendance.user.firstName} ${attendance.user.lastName}`;
      const studentId = attendance.user.UserProfile?.studentId || "N/A";
      const eventName = attendance.event.name;
      const eventDate = attendance.event.startDateTime
        .toISOString()
        .split("T")[0];
      const checkInTime = attendance.checkInSubmittedAt
        ? attendance.checkInSubmittedAt.toISOString()
        : "N/A";
      const checkOutTime = attendance.checkOutSubmittedAt
        ? attendance.checkOutSubmittedAt.toISOString()
        : "Not checked out";
      const verificationStatus = attendance.verificationStatus;
      const verifiedBy = attendance.verifiedBy
        ? `${attendance.verifiedBy.firstName} ${attendance.verifiedBy.lastName}`
        : "N/A";
      const checkInDistance = attendance.checkInDistance
        ? attendance.checkInDistance.toFixed(1)
        : "N/A";
      const checkOutDistance = attendance.checkOutDistance
        ? attendance.checkOutDistance.toFixed(1)
        : "N/A";

      return [
        studentName,
        studentId,
        eventName,
        eventDate,
        checkInTime,
        checkOutTime,
        verificationStatus,
        verifiedBy,
        checkInDistance,
        checkOutDistance,
      ];
    });

    // Build CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape cells containing commas or quotes
            if (
              typeof cell === "string" &&
              (cell.includes(",") || cell.includes('"'))
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(","),
      ),
    ].join("\n");

    return {
      success: true,
      data: {
        csv: csvContent,
        filename: `attendance_export_${new Date().toISOString().split("T")[0]}.csv`,
        recordCount: attendances.length,
      },
    };
  } catch (error) {
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
