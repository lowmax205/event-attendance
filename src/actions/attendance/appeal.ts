"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";
import { logAction } from "@/lib/security/audit-log";
import { headers } from "next/headers";
import { z } from "zod";

const appealSchema = z.object({
  attendanceId: z.string().min(1, "Attendance ID is required"),
  appealMessage: z
    .string()
    .min(10, "Appeal message must be at least 10 characters")
    .max(1000, "Appeal message must not exceed 1000 characters"),
});

/**
 * Allow students to appeal rejected attendance verifications
 * Transitions status from Rejected to Disputed for admin review
 * @param input - attendanceId and appealMessage
 */
export async function appealAttendance(input: unknown) {
  try {
    // Require Student role
    const user = await requireRole(["Student"]);

    // Validate input
    const { attendanceId, appealMessage } = appealSchema.parse(input);

    // Fetch the attendance record
    const attendance = await db.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        event: { select: { name: true } },
      },
    });

    if (!attendance) {
      return {
        success: false,
        error: "Attendance record not found",
      };
    }

    // Verify ownership
    if (attendance.userId !== user.userId) {
      return {
        success: false,
        error: "You can only appeal your own attendance records",
      };
    }

    // Verify status is Rejected
    if (attendance.verificationStatus !== "Rejected") {
      return {
        success: false,
        error: "Only rejected attendance can be appealed",
        details: [
          {
            field: "verificationStatus",
            message: `Current status is ${attendance.verificationStatus}. Only Rejected attendances can be appealed.`,
          },
        ],
      };
    }

    // Update status to Disputed
    const updatedAttendance = await db.attendance.update({
      where: { id: attendanceId },
      data: {
        verificationStatus: "Disputed",
        disputeNote: appealMessage,
      },
    });

    // Log security action
    const headersList = await headers();
    await logAction(
      "attendance.appealed",
      user.userId,
      "Attendance",
      attendanceId,
      {
        eventName: attendance.event.name,
        appealMessage: appealMessage.substring(0, 100), // Truncate for log
      },
      headersList.get("x-forwarded-for") ||
        headersList.get("x-real-ip") ||
        undefined,
      headersList.get("user-agent") || undefined
    );

    return {
      success: true,
      data: updatedAttendance,
      message:
        "Appeal submitted successfully. An administrator will review your request.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
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
      error: "Failed to submit appeal",
    };
  }
}
