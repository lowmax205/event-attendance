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

    // Validate buffer window doesn't extend into the past (FR-035.1)
    const checkInTime = new Date(validatedData.startDateTime);
    checkInTime.setMinutes(
      checkInTime.getMinutes() - (validatedData.checkInBufferMins ?? 30)
    );

    if (checkInTime < new Date()) {
      return {
        success: false,
        error: "Invalid buffer window",
        details: [
          {
            field: "checkInBufferMins",
            message:
              "Check-in buffer extends into the past. The start time minus buffer must be in the future.",
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
      `qr_${Date.now()}`
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
      headersList.get("user-agent") || undefined
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
