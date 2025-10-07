"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";
import { createEventSchema } from "@/lib/validations/event";
import { generateQRCode, generateQRPayload } from "@/lib/qr-generator";
import { uploadQRCode } from "@/lib/cloudinary";
import { logAction } from "@/lib/security/audit-log";
import { ZodError } from "zod";
import { headers } from "next/headers";

/**
 * Create a new event with QR code generation
 * @returns Created event with QR code URL
 */
export async function createEvent(input: unknown) {
  try {
    // Require Moderator or Administrator role
    const user = await requireRole(["Moderator", "Administrator"]);

    // Validate input
    const validatedData = createEventSchema.parse(input);

    // Validate that the event end time is after start time
    if (
      new Date(validatedData.endDateTime) <=
      new Date(validatedData.startDateTime)
    ) {
      return {
        success: false,
        error: "Invalid event times",
        details: [
          {
            field: "endDateTime",
            message: "End time must be after start time.",
          },
        ],
      };
    }

    // Calculate attendance windows:
    // Check-IN: Opens at event START, closes START + checkInBufferMins
    // Check-OUT: Opens at END - checkOutBufferMins, closes at END
    const checkInWindowCloses = new Date(validatedData.startDateTime);
    checkInWindowCloses.setMinutes(
      checkInWindowCloses.getMinutes() +
        (validatedData.checkInBufferMins ?? 30),
    );

    const checkOutWindowOpens = new Date(validatedData.endDateTime);
    checkOutWindowOpens.setMinutes(
      checkOutWindowOpens.getMinutes() -
        (validatedData.checkOutBufferMins ?? 30),
    );

    // Validate that check-in window closes before check-out window opens
    // (there should be time between check-in closing and check-out opening)
    if (checkInWindowCloses >= checkOutWindowOpens) {
      return {
        success: false,
        error: "Invalid buffer configuration",
        details: [
          {
            field: "checkInBufferMins",
            message:
              "Event duration is too short for the buffer times. The check-in window must close before the check-out window opens.",
          },
        ],
      };
    }

    // Only validate that the event hasn't completely ended
    const now = new Date();
    const eventEnd = new Date(validatedData.endDateTime);
    if (eventEnd < now) {
      return {
        success: false,
        error: "Invalid event time",
        details: [
          {
            field: "endDateTime",
            message:
              "The event has already ended. Please set a future end time.",
          },
        ],
      };
    }

    // Create event in database first to get ID
    const event = await db.event.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        startDateTime: validatedData.startDateTime,
        endDateTime: validatedData.endDateTime,
        venueLatitude: validatedData.venueLatitude,
        venueLongitude: validatedData.venueLongitude,
        venueName: validatedData.venueName,
        venueAddress: validatedData.venueAddress || null,
        checkInBufferMins: validatedData.checkInBufferMins ?? 30,
        checkOutBufferMins: validatedData.checkOutBufferMins ?? 30,
        qrCodePayload: "", // Temporary, will update below
        status: "Active",
        createdById: user.userId,
      },
    });

    // Generate QR code payload with event ID
    const qrPayload = generateQRPayload(event.id);

    // Generate QR code image (data URL)
    const qrDataUrl = await generateQRCode(qrPayload);

    // Upload to Cloudinary
    const cloudinaryFolder = `${process.env.CLOUDINARY_FOLDER}/events/${event.id}`;
    const qrCodeUrl = await uploadQRCode(
      qrDataUrl,
      cloudinaryFolder,
      `qr_${Date.now()}`,
    );

    // Update event with QR code information
    const updatedEvent = await db.event.update({
      where: { id: event.id },
      data: {
        qrCodePayload: qrPayload,
        qrCodeUrl,
      },
    });

    // Log security action
    const headersList = await headers();
    await logAction(
      "event.created",
      user.userId,
      "Event",
      event.id,
      { eventName: validatedData.name, venueName: validatedData.venueName },
      headersList.get("x-forwarded-for") ||
        headersList.get("x-real-ip") ||
        undefined,
      headersList.get("user-agent") || undefined,
    );

    return {
      success: true,
      data: updatedEvent,
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
      error: "Failed to create event",
    };
  }
}
