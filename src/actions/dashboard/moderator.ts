"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";

interface ModeratorDashboardParams {
  page?: number;
  limit?: number;
  status?: "Active" | "Completed" | "Cancelled";
}

/**
 * Get moderator dashboard data
 * @param params - Pagination and filter parameters
 * @returns Moderator events, pending verifications, and statistics
 */
export async function getModeratorDashboard(
  params: ModeratorDashboardParams = {},
) {
  try {
    // Require Moderator role (or Administrator)
    const user = await requireRole(["Moderator", "Administrator"]);

    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    // Build where clause for my events
    const where: {
      createdById: string;
      status?: "Active" | "Completed" | "Cancelled";
    } = { createdById: user.userId };

    if (status) {
      where.status = status;
    }

    // Get my events count
    const totalItems = await db.event.count({ where });

    // Get paginated my events with attendance counts
    const myEvents = await db.event.findMany({
      where,
      select: {
        id: true,
        name: true,
        startDateTime: true,
        endDateTime: true,
        status: true,
        _count: {
          select: {
            attendances: true,
          },
        },
        attendances: {
          where: {
            verificationStatus: "Pending",
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        startDateTime: "desc",
      },
      skip,
      take: limit,
    });

    // Get pending verifications across ALL events (not just moderator's own)
    const pendingVerifications = await db.attendance.findMany({
      where: {
        verificationStatus: "Pending",
      },
      include: {
        event: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        checkInSubmittedAt: "asc",
      },
      take: 10, // Show top 10 pending
    });

    // Get statistics
    const totalEvents = await db.event.count({
      where: { createdById: user.userId },
    });

    const activeEvents = await db.event.count({
      where: { createdById: user.userId, status: "Active" },
    });

    const totalAttendance = await db.attendance.count({
      where: {
        event: {
          createdById: user.userId,
        },
      },
    });

    const pendingVerificationsCount = await db.attendance.count({
      where: {
        verificationStatus: "Pending",
      },
    });

    // Format response
    const formattedEvents = myEvents.map((event) => ({
      id: event.id,
      name: event.name,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      status: event.status,
      attendanceCount: event._count.attendances,
      pendingCount: event.attendances.length,
    }));

    const formattedPending = pendingVerifications.map((attendance) => ({
      id: attendance.id,
      eventName: attendance.event.name,
      studentName: `${attendance.user.firstName} ${attendance.user.lastName}`,
      studentEmail: attendance.user.email,
      checkInSubmittedAt: attendance.checkInSubmittedAt,
      checkOutSubmittedAt: attendance.checkOutSubmittedAt,
      checkInDistance: attendance.checkInDistance,
      checkOutDistance: attendance.checkOutDistance,
      checkInFrontPhoto: attendance.checkInFrontPhoto,
      checkInBackPhoto: attendance.checkInBackPhoto,
      checkInSignature: attendance.checkInSignature,
      checkOutFrontPhoto: attendance.checkOutFrontPhoto,
      checkOutBackPhoto: attendance.checkOutBackPhoto,
      checkOutSignature: attendance.checkOutSignature,
    }));

    return {
      success: true,
      data: {
        myEvents: formattedEvents,
        pendingVerifications: formattedPending,
        stats: {
          totalEvents,
          activeEvents,
          totalAttendance,
          pendingVerifications: pendingVerificationsCount,
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
      error: "Failed to load moderator dashboard",
    };
  }
}
