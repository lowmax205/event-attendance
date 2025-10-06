"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";
import { verifyAttendanceSchema } from "@/lib/validations/attendance";
import { ZodError } from "zod";
import { headers } from "next/headers";

/**
 * Verify (approve/reject) student attendance submission
 * @param attendanceId - Attendance record ID
 * @param input - Verification data
 * @returns Updated attendance record
 */
export async function verifyAttendance(attendanceId: string, input: unknown) {
  try {
    // Require Moderator or Administrator role
    const user = await requireRole(["Moderator", "Administrator"]);

    // Validate input
    const validatedData = verifyAttendanceSchema.parse(input);

    // Get attendance record
    const attendance = await db.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        event: {
          select: {
            name: true,
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

    // Can only verify Pending or Disputed attendance
    if (
      attendance.verificationStatus !== "Pending" &&
      attendance.verificationStatus !== "Disputed"
    ) {
      return {
        success: false,
        error: "Attendance already verified",
        currentStatus: attendance.verificationStatus,
        verifiedBy: attendance.verifiedById,
        verifiedAt: attendance.verifiedAt,
      };
    }

    // Update attendance
    const updatedAttendance = await db.attendance.update({
      where: { id: attendanceId },
      data: {
        verificationStatus: validatedData.verificationStatus,
        verifiedById: user.userId,
        verifiedAt: new Date(),
        disputeNote: validatedData.disputeNote || null,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        event: {
          select: {
            name: true,
          },
        },
      },
    });

    // Log to SecurityLog
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      undefined;
    const userAgent = headersList.get("user-agent") || undefined;

    await db.securityLog.create({
      data: {
        userId: user.userId,
        action: "ATTENDANCE_VERIFIED",
        metadata: {
          attendanceId,
          previousStatus: attendance.verificationStatus,
          newStatus: validatedData.verificationStatus,
          studentId: attendance.userId,
          eventName: attendance.event.name,
          disputeNote: validatedData.disputeNote || null,
        },
        ipAddress,
        userAgent,
      },
    });

    return {
      success: true,
      data: updatedAttendance,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
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
