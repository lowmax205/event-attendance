"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";

interface UnifiedDashboardParams {
  page?: number;
  limit?: number;
  status?: "Active" | "Completed" | "Cancelled";
  pendingPage?: number;
  pendingLimit?: number;
}

/**
 * Get unified dashboard data for Moderator and Administrator
 * Moderators see only their events, Admins see all events
 * @param params - Pagination and filter parameters
 * @returns Dashboard data tailored to user role
 */
export async function getModeratorDashboard(
  params: UnifiedDashboardParams = {},
) {
  try {
    // Require Moderator or Administrator role
    const user = await requireRole(["Moderator", "Administrator"]);

    const {
      page = 1,
      limit = 20,
      status,
      pendingPage = 1,
      pendingLimit: pendingLimitParam = 5,
    } = params;
    const pendingLimit = Math.max(pendingLimitParam, 1);
    const skip = (page - 1) * limit;

    const isModerator = user.role === "Moderator";
    const isAdmin = user.role === "Administrator";

    // Build where clause - Moderators see only their events, Admins see all
    const eventWhere: {
      createdById?: string;
      status?: "Active" | "Completed" | "Cancelled";
    } = {};

    if (isModerator) {
      eventWhere.createdById = user.userId;
    }

    if (status) {
      eventWhere.status = status;
    }

    // Get events count
    const totalItems = await db.event.count({ where: eventWhere });

    // Get paginated events with attendance counts
    const myEvents = await db.event.findMany({
      where: eventWhere,
      select: {
        id: true,
        name: true,
        startDateTime: true,
        endDateTime: true,
        status: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
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

    // Build attendance where clause for pending verifications
    const attendanceWhere: {
      verificationStatus: "Pending";
      event?: { createdById: string };
    } = {
      verificationStatus: "Pending",
    };

    // Moderators only see pending verifications for their events
    if (isModerator) {
      attendanceWhere.event = {
        createdById: user.userId,
      };
    }

    const pendingVerificationsCount = await db.attendance.count({
      where: attendanceWhere,
    });

    const pendingTotalPages =
      pendingVerificationsCount === 0
        ? 1
        : Math.ceil(pendingVerificationsCount / pendingLimit);
    const normalizedPendingPage = Math.min(
      Math.max(pendingPage, 1),
      pendingTotalPages,
    );
    const pendingSkip = (normalizedPendingPage - 1) * pendingLimit;

    // Get pending verifications
    const pendingVerifications = await db.attendance.findMany({
      where: attendanceWhere,
      include: {
        event: {
          select: {
            name: true,
            startDateTime: true,
            venueName: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            UserProfile: {
              select: {
                studentId: true,
                department: true,
                yearLevel: true,
                section: true,
                contactNumber: true,
              },
            },
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
        checkInSubmittedAt: "asc",
      },
      skip: pendingSkip,
      take: pendingLimit,
    });

    // Get statistics based on role
    const totalEvents = await db.event.count({
      where: isModerator ? { createdById: user.userId } : {},
    });

    const activeEvents = await db.event.count({
      where: isModerator
        ? { createdById: user.userId, status: "Active" }
        : { status: "Active" },
    });

    const totalAttendance = await db.attendance.count({
      where: isModerator
        ? {
            event: {
              createdById: user.userId,
            },
          }
        : {},
    });

    // Admin-only: Get system-wide statistics
    let systemStats = null;
    if (isAdmin) {
      const totalUsers = await db.user.count();
      const disputedAttendance = await db.attendance.count({
        where: { verificationStatus: "Disputed" },
      });

      systemStats = {
        totalUsers,
        disputedAttendance,
      };
    }

    // Format response
    const formattedEvents = myEvents.map((event) => ({
      id: event.id,
      name: event.name,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      status: event.status,
      attendanceCount: event._count.attendances,
      pendingCount: event.attendances.length,
      creatorName: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
    }));

    const formattedPending = pendingVerifications.map((attendance) => ({
      id: attendance.id,
      user: {
        firstName: attendance.user.firstName,
        lastName: attendance.user.lastName,
        email: attendance.user.email,
        UserProfile: attendance.user.UserProfile,
      },
      event: {
        name: attendance.event.name,
        startDateTime: attendance.event.startDateTime,
        venueName: attendance.event.venueName,
      },
      checkInSubmittedAt: attendance.checkInSubmittedAt,
      checkOutSubmittedAt: attendance.checkOutSubmittedAt,
      checkInDistance: attendance.checkInDistance,
      checkOutDistance: attendance.checkOutDistance,
      checkInFrontPhoto: attendance.checkInFrontPhoto,
      checkInBackPhoto: attendance.checkInBackPhoto,
      checkInSignature: attendance.checkInSignature,
      checkInLatitude: attendance.checkInLatitude,
      checkInLongitude: attendance.checkInLongitude,
      checkOutFrontPhoto: attendance.checkOutFrontPhoto,
      checkOutBackPhoto: attendance.checkOutBackPhoto,
      checkOutSignature: attendance.checkOutSignature,
      checkOutLatitude: attendance.checkOutLatitude,
      checkOutLongitude: attendance.checkOutLongitude,
      verificationStatus: attendance.verificationStatus,
      disputeNote: attendance.disputeNote,
      appealMessage: attendance.appealMessage,
      resolutionNotes: attendance.resolutionNotes,
      verifiedAt: attendance.verifiedAt,
      verifiedBy: attendance.verifiedBy,
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
        systemStats, // Only populated for Admins
        userRole: user.role,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
        pendingPagination: {
          page: normalizedPendingPage,
          limit: pendingLimit,
          totalItems: pendingVerificationsCount,
          totalPages: pendingTotalPages,
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
      error: "Failed to load dashboard",
    };
  }
}
