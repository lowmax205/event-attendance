"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import {
  attendanceUserListQuerySchema,
  type AttendanceUserListQuery,
} from "@/lib/validations/attendance-verification";
import { Prisma, VerificationStatus } from "@prisma/client";
import { z } from "zod";

export async function listMyAttendances(
  query: Partial<AttendanceUserListQuery> = {},
) {
  try {
    const user = await requireAuth();
    const validatedQuery = attendanceUserListQuerySchema.parse(query);
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    const baseFilters: Prisma.AttendanceWhereInput[] = [
      { userId: user.userId },
    ];

    if (validatedQuery.startDate || validatedQuery.endDate) {
      const dateFilter: Prisma.AttendanceWhereInput = {};
      const range: Prisma.DateTimeFilter = {};

      if (validatedQuery.startDate) {
        range.gte = new Date(validatedQuery.startDate);
      }

      if (validatedQuery.endDate) {
        range.lte = new Date(validatedQuery.endDate);
      }

      dateFilter.checkInSubmittedAt = range;
      baseFilters.push(dateFilter);
    }

    if (validatedQuery.search) {
      const searchTerm = validatedQuery.search.trim();
      baseFilters.push({
        event: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      });
    }

    const listFilters = [...baseFilters];

    if (validatedQuery.status) {
      listFilters.push({ verificationStatus: validatedQuery.status });
    }

    const listWhere: Prisma.AttendanceWhereInput = {
      AND: listFilters,
    };

    const total = await db.attendance.count({ where: listWhere });

    const statusWhere = (status: VerificationStatus) =>
      baseFilters.length > 0
        ? { AND: [...baseFilters, { verificationStatus: status }] }
        : { verificationStatus: status };

    const pendingCountPromise =
      !validatedQuery.status ||
      validatedQuery.status === VerificationStatus.Pending
        ? db.attendance.count({
            where: statusWhere(VerificationStatus.Pending),
          })
        : Promise.resolve(0);

    const approvedCountPromise =
      !validatedQuery.status ||
      validatedQuery.status === VerificationStatus.Approved
        ? db.attendance.count({
            where: statusWhere(VerificationStatus.Approved),
          })
        : Promise.resolve(0);

    const rejectedCountPromise =
      !validatedQuery.status ||
      validatedQuery.status === VerificationStatus.Rejected
        ? db.attendance.count({
            where: statusWhere(VerificationStatus.Rejected),
          })
        : Promise.resolve(0);

    const disputedCountPromise =
      !validatedQuery.status ||
      validatedQuery.status === VerificationStatus.Disputed
        ? db.attendance.count({
            where: statusWhere(VerificationStatus.Disputed),
          })
        : Promise.resolve(0);

    const [totalPending, totalApproved, totalRejected, totalDisputed] =
      await Promise.all([
        pendingCountPromise,
        approvedCountPromise,
        rejectedCountPromise,
        disputedCountPromise,
      ]);

    let orderBy: Prisma.AttendanceOrderByWithRelationInput;
    if (validatedQuery.sortBy === "eventName") {
      orderBy = {
        event: {
          name: validatedQuery.sortOrder,
        },
      };
    } else {
      orderBy = {
        [validatedQuery.sortBy]: validatedQuery.sortOrder,
      } as Prisma.AttendanceOrderByWithRelationInput;
    }

    const attendances = await db.attendance.findMany({
      where: listWhere,
      include: {
        event: {
          select: {
            id: true,
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
      orderBy,
      skip,
      take: validatedQuery.limit,
    });

    return {
      success: true,
      data: {
        attendances,
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total,
          totalPages: Math.ceil(total / validatedQuery.limit),
        },
        summary: {
          totalPending,
          totalApproved,
          totalRejected,
          totalDisputed,
        },
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
      error: "Failed to list attendance records",
    };
  }
}
