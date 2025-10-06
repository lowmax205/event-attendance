"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";

interface AdminDashboardParams {
  page?: number;
  limit?: number;
}

/**
 * Get administrator dashboard data
 * @param params - Pagination parameters
 * @returns System-wide statistics, recent activity, and alerts
 */
export async function getAdminDashboard(params: AdminDashboardParams = {}) {
  try {
    // Require Administrator role
    const user = await requireRole(["Administrator"]);

    const { page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    // Get system statistics
    const totalUsers = await db.user.count();
    const totalEvents = await db.event.count();
    const totalAttendance = await db.attendance.count();

    const activeEvents = await db.event.count({
      where: { status: "Active" },
    });

    const pendingVerifications = await db.attendance.count({
      where: { verificationStatus: "Pending" },
    });

    const disputedAttendance = await db.attendance.count({
      where: { verificationStatus: "Disputed" },
    });

    // Get recent activity from SecurityLog (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalActivityItems = await db.securityLog.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const recentActivity = await db.securityLog.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        User: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Generate alerts based on thresholds
    const alerts = [];

    // Alert: Many disputed attendance
    if (disputedAttendance > 10) {
      alerts.push({
        severity: "warning" as const,
        message: "High number of disputed attendance records",
        count: disputedAttendance,
      });
    }

    // Alert: Pending verifications backlog
    if (pendingVerifications > 50) {
      alerts.push({
        severity: "warning" as const,
        message: "Large backlog of pending verifications",
        count: pendingVerifications,
      });
    }

    // Alert: System activity (info)
    alerts.push({
      severity: "info" as const,
      message: "System operational",
      count: 1,
    });

    // Format recent activity
    const formattedActivity = recentActivity.map((log) => ({
      id: log.id,
      action: log.action,
      timestamp: log.createdAt,
      userId: log.userId,
      userEmail: log.User?.email || "Unknown",
      details:
        typeof log.metadata === "object" && log.metadata !== null
          ? JSON.stringify(log.metadata)
          : "No details",
    }));

    return {
      success: true,
      data: {
        systemStats: {
          totalUsers,
          totalEvents,
          totalAttendance,
          activeEvents,
          pendingVerifications,
          disputedAttendance,
        },
        recentActivity: formattedActivity,
        alerts,
        pagination: {
          page,
          limit,
          totalItems: totalActivityItems,
          totalPages: Math.ceil(totalActivityItems / limit),
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
      error: "Failed to load administrator dashboard",
    };
  }
}
