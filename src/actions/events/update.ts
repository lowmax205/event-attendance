"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";
import { updateEventSchema } from "@/lib/validations/event";
import { generateQRCode, generateQRPayload } from "@/lib/qr-generator";
import { uploadQRCode, deleteImage } from "@/lib/cloudinary";
import { ZodError } from "zod";

/**
 * Update an existing event
 * Regenerates QR code if venue coordinates change
 * @param eventId - Event ID to update
 * @param input - Partial event data to update
 * @returns Updated event
 */
export async function updateEvent(eventId: string, input: unknown) {
  try {
    // Require Moderator or Administrator role
    await requireRole(["Moderator", "Administrator"]);

    // Validate input
    const validatedData = updateEventSchema.parse(input);

    // Get existing event
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    // Cannot update completed event
    if (existingEvent.status === "Completed") {
      return {
        success: false,
        error: "Cannot update completed event",
      };
    }

    // Check if venue coordinates changed
    const venueChanged =
      (validatedData.venueLatitude !== undefined &&
        validatedData.venueLatitude !== existingEvent.venueLatitude) ||
      (validatedData.venueLongitude !== undefined &&
        validatedData.venueLongitude !== existingEvent.venueLongitude);

    let qrCodeUrl = existingEvent.qrCodeUrl;
    let qrCodePayload = existingEvent.qrCodePayload;

    // Regenerate QR code if venue changed
    if (venueChanged) {
      // Generate new QR payload
      qrCodePayload = generateQRPayload(eventId);

      // Generate QR code image
      const qrDataUrl = await generateQRCode(qrCodePayload);

      // Delete old QR code from Cloudinary if exists
      if (
        existingEvent.qrCodeUrl &&
        !existingEvent.qrCodeUrl.startsWith("data:")
      ) {
        try {
          // Extract public ID from Cloudinary URL
          const urlParts = existingEvent.qrCodeUrl.split("/");
          const publicIdWithExt = urlParts.slice(-3).join("/"); // folder/subfolder/filename.ext
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // Remove extension
          await deleteImage(publicId);
        } catch (error) {
          console.error("Failed to delete old QR code:", error);
          // Continue even if deletion fails
        }
      }

      // Upload new QR code to Cloudinary
      const cloudinaryFolder = `${process.env.CLOUDINARY_FOLDER}/events/${eventId}`;
      qrCodeUrl = await uploadQRCode(
        qrDataUrl,
        cloudinaryFolder,
        `qr_${Date.now()}`,
      );
    }

    // Update event
    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: {
        ...validatedData,
        ...(venueChanged && {
          qrCodeUrl,
          qrCodePayload,
        }),
      },
    });

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
      error: "Failed to update event",
    };
  }
}
