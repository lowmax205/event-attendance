"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";
import { parseQRPayload } from "@/lib/qr-generator";
import { ZodError } from "zod";
import { z } from "zod";

const validateQRSchema = z.object({
  qrPayload: z
    .string()
    .regex(/^attendance:[a-z0-9]+:[0-9]+$/, "Invalid QR code format"),
});

/**
 * Validate QR code and return event details
 * @param input - QR payload to validate
 * @returns Validation result with event details
 */
export async function validateQR(input: unknown) {
  try {
    // Require Student role (or higher)
    const user = await requireRole(["Student", "Moderator", "Administrator"]);

    // Validate input
    const { qrPayload } = validateQRSchema.parse(input);

    // Parse QR payload
    const parsed = parseQRPayload(qrPayload);
    if (!parsed) {
      return {
        success: false,
        error: "Invalid QR code format",
        expected: "attendance:{eventId}:{timestamp}",
      };
    }

    const { eventId } = parsed;

    // Get event details
    const event = await db.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        description: true,
        startDateTime: true,
        endDateTime: true,
        venueName: true,
        venueAddress: true,
        checkInBufferMins: true,
        checkOutBufferMins: true,
        status: true,
        qrCodePayload: true,
      },
    });

    if (!event) {
      return {
        success: false,
        error: "Event not found for QR code",
      };
    }

    // Check if user's profile is complete
    const userProfile = await db.userProfile.findUnique({
      where: { userId: user.userId },
    });

    if (!userProfile) {
      return {
        success: false,
        error:
          "Profile incomplete: Please complete your profile before checking in",
      };
    }

    // Check if user already checked in
    const existingAttendance = await db.attendance.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.userId,
        },
      },
      select: {
        submittedAt: true,
        verificationStatus: true,
      },
    });

    // Calculate check-in window
    const opensAt = new Date(
      event.startDateTime.getTime() - event.checkInBufferMins * 60 * 1000,
    );
    const closesAt = new Date(
      event.endDateTime.getTime() + event.checkOutBufferMins * 60 * 1000,
    );
    const now = new Date();
    const isOpen = now >= opensAt && now <= closesAt;

    // Build validation errors
    const validationErrors: string[] = [];
    let valid = true;

    if (event.status === "Cancelled") {
      validationErrors.push("Event has been cancelled");
      valid = false;
    } else if (event.status === "Completed") {
      validationErrors.push("Event has been completed");
      valid = false;
    }

    if (!isOpen) {
      if (now < opensAt) {
        validationErrors.push(`Check-in opens at ${opensAt.toISOString()}`);
      } else {
        validationErrors.push(
          `Check-in window closed at ${closesAt.toISOString()}`,
        );
      }
      valid = false;
    }

    if (existingAttendance) {
      validationErrors.push("You have already checked in to this event");
      valid = false;
    }

    // Verify QR payload matches current event payload
    if (event.qrCodePayload !== qrPayload) {
      validationErrors.push(
        "This QR code has been regenerated. Please scan the latest QR code.",
      );
      valid = false;
    }

    return {
      success: true,
      data: {
        valid,
        eventId,
        event: {
          id: event.id,
          name: event.name,
          description: event.description,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          venueName: event.venueName,
          venueAddress: event.venueAddress,
          checkInBufferMins: event.checkInBufferMins,
          checkOutBufferMins: event.checkOutBufferMins,
          status: event.status,
        },
        checkInWindow: {
          opensAt,
          closesAt,
          isOpen,
        },
        userStatus: {
          hasCheckedIn: !!existingAttendance,
          previousCheckIn: existingAttendance || null,
        },
        validationErrors,
      },
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
      error: "Failed to validate QR code",
    };
  }
}
