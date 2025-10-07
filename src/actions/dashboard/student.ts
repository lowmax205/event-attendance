"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";

interface StudentDashboardParams {
  page?: number;
  limit?: number;
  status?: "Pending" | "Approved" | "Rejected" | "Disputed";
}

/**
 * Get student dashboard data
 * @param params - Pagination and filter parameters
 * @returns Student attendance history, upcoming events, and statistics
 */
export async function getStudentDashboard(params: StudentDashboardParams = {}) {
  try {
    // Require Student role (or higher)
    const user = await requireRole(["Student", "Moderator", "Administrator"]);

    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    // Build where clause for attendance history
    const where: {
      userId: string;
      verificationStatus?: "Pending" | "Approved" | "Rejected" | "Disputed";
    } = { userId: user.userId };

    if (status) {
      where.verificationStatus = status;
    }

    // Get attendance history count
    const totalItems = await db.attendance.count({ where });

    // Get paginated attendance history
    const attendanceHistory = await db.attendance.findMany({
      where,
      include: {
        event: {
          select: {
            name: true,
            startDateTime: true,
          },
        },
      },
      orderBy: {
        checkInSubmittedAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get upcoming events (Active events starting within next 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingEvents = await db.event.findMany({
      where: {
        status: "Active",
        startDateTime: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      select: {
        id: true,
        name: true,
        startDateTime: true,
        venueName: true,
        qrCodeUrl: true,
      },
      orderBy: {
        startDateTime: "asc",
      },
      take: 5,
    });

    // Get statistics
    const totalAttendanceCount = await db.attendance.count({
      where: { userId: user.userId },
    });

    const approvedCount = await db.attendance.count({
      where: { userId: user.userId, verificationStatus: "Approved" },
    });

    const pendingCount = await db.attendance.count({
      where: { userId: user.userId, verificationStatus: "Pending" },
    });

    const rejectedCount = await db.attendance.count({
      where: { userId: user.userId, verificationStatus: "Rejected" },
    });

    // Get total number of events to calculate attendance rate
    const totalEvents = await db.event.count({
      where: { status: { in: ["Active", "Completed"] } },
    });

    const attendanceRate =
      totalEvents > 0 ? (approvedCount / totalEvents) * 100 : 0;

    return {
      success: true,
      data: {
        attendanceHistory: attendanceHistory.map((attendance) => ({
          id: attendance.id,
          eventName: attendance.event.name,
          eventStartDateTime: attendance.event.startDateTime,
          checkInSubmittedAt: attendance.checkInSubmittedAt,
          checkOutSubmittedAt: attendance.checkOutSubmittedAt,
          verificationStatus: attendance.verificationStatus,
          disputeNote: attendance.disputeNote,
        })),
        upcomingEvents,
        stats: {
          totalAttendance: totalAttendanceCount,
          approvedCount,
          pendingCount,
          rejectedCount,
          attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        },
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
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
      error: "Failed to load student dashboard",
    };
  }
}
