"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";

/**
 * Check if user has already checked in to an event
 * @param eventId - Event ID to check
 * @param userId - Optional user ID (defaults to current user)
 * @returns Existing attendance record or null
 */
export async function checkDuplicateAttendance(
  eventId: string,
  userId?: string,
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Use provided userId or current user
    const targetUserId = userId || user.userId;

    // Query attendance
    const attendance = await db.attendance.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: targetUserId,
        },
      },
      select: {
        id: true,
        submittedAt: true,
        verificationStatus: true,
        frontPhotoUrl: true,
        backPhotoUrl: true,
        signatureUrl: true,
        distanceFromVenue: true,
      },
    });

    return {
      success: true,
      data: attendance,
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
      error: "Failed to check duplicate attendance",
    };
  }
}
