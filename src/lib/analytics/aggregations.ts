/**
 * T031: Analytics Aggregation Functions
 * Phase 3.7 - Server Actions - Analytics
 * Provides data aggregation functions for the analytics dashboard
 */

import { db } from "@/lib/db";
import { VerificationStatus } from "@prisma/client";

/**
 * Get key metrics for the dashboard
 */
export async function getKeyMetrics(startDate: Date, endDate: Date) {
  // Total events (exclude soft-deleted)
  const totalEvents = await db.event.count({
    where: {
      deletedAt: null,
      startDateTime: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Total attendances in date range
  const totalAttendances = await db.attendance.count({
    where: {
      checkInSubmittedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Verified attendances (Approved + Rejected)
  const verifiedCount = await db.attendance.count({
    where: {
      checkInSubmittedAt: {
        gte: startDate,
        lte: endDate,
      },
      verificationStatus: {
        in: [VerificationStatus.Approved, VerificationStatus.Rejected],
      },
    },
  });

  // Pending attendances
  const pendingCount = await db.attendance.count({
    where: {
      checkInSubmittedAt: {
        gte: startDate,
        lte: endDate,
      },
      verificationStatus: VerificationStatus.Pending,
    },
  });

  // Calculate verification rate
  const verificationRate =
    totalAttendances > 0 ? (verifiedCount / totalAttendances) * 100 : 0;

  return {
    totalEvents,
    totalAttendances,
    verificationRate: Math.round(verificationRate * 100) / 100, // Round to 2 decimals
    pendingCount,
  };
}

/**
 * Get attendance trends grouped by date
 */
export async function getAttendanceTrends(startDate: Date, endDate: Date) {
  const attendances = await db.attendance.findMany({
    where: {
      checkInSubmittedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      checkInSubmittedAt: true,
    },
    orderBy: {
      checkInSubmittedAt: "asc",
    },
  });

  // Group by date
  const trendMap = new Map<string, number>();

  for (const attendance of attendances) {
    if (!attendance.checkInSubmittedAt) continue;

    const date = attendance.checkInSubmittedAt.toISOString().split("T")[0];
    trendMap.set(date, (trendMap.get(date) || 0) + 1);
  }

  // Convert to array format for charts
  return Array.from(trendMap.entries())
    .map(([date, count]) => ({
      date,
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get top events by attendance count
 */
export async function getTopEvents(limit = 10) {
  const events = await db.event.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          attendances: true,
        },
      },
    },
    orderBy: {
      attendances: {
        _count: "desc",
      },
    },
    take: limit,
  });

  return events.map((event) => ({
    id: event.id,
    name: event.name,
    attendanceCount: event._count.attendances,
    date: event.startDateTime,
  }));
}

/**
 * Get event status distribution
 */
export async function getEventStatusDistribution() {
  const distribution = await db.event.groupBy({
    by: ["status"],
    where: {
      deletedAt: null,
    },
    _count: {
      status: true,
    },
  });

  return distribution.map((item) => ({
    status: item.status,
    count: item._count.status,
  }));
}

/**
 * Get verification status distribution
 */
export async function getVerificationStatusDistribution(
  startDate: Date,
  endDate: Date,
) {
  const distribution = await db.attendance.groupBy({
    by: ["verificationStatus"],
    where: {
      checkInSubmittedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      verificationStatus: true,
    },
  });

  return distribution.map((item) => ({
    status: item.verificationStatus,
    count: item._count.verificationStatus,
  }));
}

/**
 * Get department breakdown (approved attendances)
 */
export async function getDepartmentBreakdown(startDate: Date, endDate: Date) {
  const attendances = await db.attendance.findMany({
    where: {
      checkInSubmittedAt: {
        gte: startDate,
        lte: endDate,
      },
      verificationStatus: VerificationStatus.Approved,
    },
    select: {
      user: {
        select: {
          UserProfile: {
            select: {
              department: true,
            },
          },
        },
      },
    },
  });

  // Group by department
  const departmentMap = new Map<string, number>();

  for (const attendance of attendances) {
    const dept = attendance.user.UserProfile?.department || "Unknown";
    departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
  }

  // Convert to array and sort by count
  return Array.from(departmentMap.entries())
    .map(([department, count]) => ({
      department,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get course breakdown (approved attendances)
 * Note: Using department since there's no course field in UserProfile
 */
export async function getCourseBreakdown(startDate: Date, endDate: Date) {
  // Since there's no course field in the schema, we'll use department
  // This can be updated when course field is added to UserProfile
  return getDepartmentBreakdown(startDate, endDate);
}
