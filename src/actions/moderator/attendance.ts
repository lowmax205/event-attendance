"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";
import {
  attendanceListQuerySchema,
  attendanceVerifySchema,
  disputeResolutionSchema,
  type AttendanceListQuery,
} from "@/lib/validations/attendance-verification";
import { Prisma, VerificationStatus } from "@prisma/client";
import { z } from "zod";

/**
 * T024: List attendances for moderator/admin with scope filtering
 * Phase 3.5 - Server Actions - Attendance Verification
 */
export async function listAttendances(
  query: Partial<AttendanceListQuery> = {},
) {
  try {
    const user = await requireRole(["Moderator", "Administrator"]);
    const validatedQuery = attendanceListQuerySchema.parse(query);
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    const where: Prisma.AttendanceWhereInput = {};

    if (user.role === "Moderator") {
      where.event = {
        createdById: user.userId,
      };
    }

    if (validatedQuery.status) {
      where.verificationStatus = validatedQuery.status;
    }

    if (validatedQuery.eventId) {
      where.eventId = validatedQuery.eventId;
    }

    if (validatedQuery.startDate || validatedQuery.endDate) {
      where.checkInSubmittedAt = {};
      if (validatedQuery.startDate) {
        where.checkInSubmittedAt.gte = new Date(validatedQuery.startDate);
      }
      if (validatedQuery.endDate) {
        where.checkInSubmittedAt.lte = new Date(validatedQuery.endDate);
      }
    }

    const total = await db.attendance.count({ where });

    const attendances = await db.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            UserProfile: {
              select: {
                studentId: true,
                department: true,
                yearLevel: true,
              },
            },
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            startDateTime: true,
            endDateTime: true,
            venueName: true,
            status: true,
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        [validatedQuery.sortBy]: validatedQuery.sortOrder,
      },
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
      error: "Failed to list attendances",
    };
  }
}

/**
 * T025: Verify attendance (approve/reject) with scope check
 * Phase 3.5 - Server Actions - Attendance Verification
 */
export async function verifyAttendance(
  attendanceId: string,
  data: {
    status: VerificationStatus;
    disputeNotes?: string;
    resolutionNotes?: string;
  },
) {
  try {
    const user = await requireRole(["Moderator", "Administrator"]);
    const validatedData = attendanceVerifySchema.parse(data);
    const attendanceIdSchema = z.string().cuid("Invalid attendance ID");
    attendanceIdSchema.parse(attendanceId);

    const attendance = await db.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!attendance) {
      return {
        success: false,
        error: "Attendance record not found",
      };
    }

    if (
      user.role === "Moderator" &&
      attendance.event.createdById !== user.userId
    ) {
      return {
        success: false,
        error:
          "Forbidden: You can only verify attendances for events you created",
      };
    }

    const updatedAttendance = await db.attendance.update({
      where: { id: attendanceId },
      data: {
        verificationStatus: validatedData.status,
        verifiedById: user.userId,
        verifiedAt: new Date(),
        ...(validatedData.disputeNotes && {
          disputeNote: validatedData.disputeNotes,
        }),
        ...(validatedData.resolutionNotes && {
          resolutionNotes: validatedData.resolutionNotes,
        }),
      },
    });

    const eventType =
      validatedData.status === VerificationStatus.Approved
        ? "ATTENDANCE_VERIFIED"
        : "ATTENDANCE_REJECTED";

    await db.securityLog.create({
      data: {
        userId: user.userId,
        eventType,
        ipAddress: "::1",
        userAgent: "Server Action",
        success: true,
        metadata: {
          attendanceId: attendance.id,
          studentId: attendance.user.id,
          studentName: `${attendance.user.firstName} ${attendance.user.lastName}`,
          eventId: attendance.event.id,
          eventName: attendance.event.name,
          decision: validatedData.status,
          hasDisputeNotes: !!validatedData.disputeNotes,
        },
      },
    });

    return {
      success: true,
      message: `Attendance ${validatedData.status.toLowerCase()} successfully`,
      data: updatedAttendance,
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
      error: "Failed to verify attendance",
    };
  }
}

/**
 * T027: Resolve dispute (final decision on appealed attendance)
 * Phase 3.5 - Server Actions - Attendance Verification
 */
export async function resolveDispute(
  attendanceId: string,
  data: {
    status: VerificationStatus;
    resolutionNotes: string;
  },
) {
  try {
    const user = await requireRole(["Moderator", "Administrator"]);
    const validatedData = disputeResolutionSchema.parse(data);
    const attendanceIdSchema = z.string().cuid("Invalid attendance ID");
    attendanceIdSchema.parse(attendanceId);

    const attendance = await db.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!attendance) {
      return {
        success: false,
        error: "Attendance record not found",
      };
    }

    if (attendance.verificationStatus !== VerificationStatus.Disputed) {
      return {
        success: false,
        error: "Can only resolve attendances in DISPUTED status",
      };
    }

    if (
      user.role === "Moderator" &&
      attendance.event.createdById !== user.userId
    ) {
      return {
        success: false,
        error:
          "Forbidden: You can only resolve disputes for events you created",
      };
    }

    const resolvedAttendance = await db.attendance.update({
      where: { id: attendanceId },
      data: {
        verificationStatus: validatedData.status,
        resolutionNotes: validatedData.resolutionNotes,
        verifiedById: user.userId,
        verifiedAt: new Date(),
      },
    });

    await db.securityLog.create({
      data: {
        userId: user.userId,
        eventType: "DISPUTE_RESOLVED",
        ipAddress: "::1",
        userAgent: "Server Action",
        success: true,
        metadata: {
          attendanceId: attendance.id,
          studentId: attendance.user.id,
          studentName: `${attendance.user.firstName} ${attendance.user.lastName}`,
          eventId: attendance.event.id,
          eventName: attendance.event.name,
          resolution: validatedData.status,
          hasResolutionNotes: !!validatedData.resolutionNotes,
        },
      },
    });

    return {
      success: true,
      message: `Dispute resolved: ${validatedData.status}`,
      data: resolvedAttendance,
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
      error: "Failed to resolve dispute",
    };
  }
}
