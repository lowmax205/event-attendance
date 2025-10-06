"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/server";
import { submitAttendanceSchema } from "@/lib/validations/attendance";
import { calculateDistance } from "@/lib/geolocation";
import { uploadPhoto, uploadSignature } from "@/lib/cloudinary";
import { ZodError } from "zod";
import { headers } from "next/headers";

/**
 * Submit attendance record with location verification and image uploads
 * @param input - Attendance submission data
 * @returns Created attendance record
 */
export async function submitAttendance(input: unknown) {
  try {
    // Require Student role (or higher)
    const user = await requireRole(["Student", "Moderator", "Administrator"]);

    // Validate input
    const validatedData = submitAttendanceSchema.parse(input);

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

    // Get event details
    const event = await db.event.findUnique({
      where: { id: validatedData.eventId },
      select: {
        id: true,
        name: true,
        startDateTime: true,
        endDateTime: true,
        venueLatitude: true,
        venueLongitude: true,
        checkInBufferMins: true,
        checkOutBufferMins: true,
        status: true,
      },
    });

    if (!event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    // Check if event is Active
    if (event.status !== "Active") {
      return {
        success: false,
        error: `Event is ${event.status}`,
      };
    }

    // Check if within check-in window
    const opensAt = new Date(
      event.startDateTime.getTime() - event.checkInBufferMins * 60 * 1000,
    );
    const closesAt = new Date(
      event.endDateTime.getTime() + event.checkOutBufferMins * 60 * 1000,
    );
    const now = new Date();

    if (now < opensAt) {
      return {
        success: false,
        error: "Check-in window not open",
        message: `Check-in opens at ${opensAt.toISOString()}`,
      };
    }

    if (now > closesAt) {
      return {
        success: false,
        error: "Check-in window closed",
        message: `Check-in closed at ${closesAt.toISOString()}`,
      };
    }

    // Check for duplicate check-in
    const existingAttendance = await db.attendance.findUnique({
      where: {
        eventId_userId: {
          eventId: validatedData.eventId,
          userId: user.userId,
        },
      },
    });

    if (existingAttendance) {
      return {
        success: false,
        error: "You have already checked in to this event",
        previousCheckIn: existingAttendance.submittedAt.toISOString(),
      };
    }

    // Calculate distance from venue
    const distance = calculateDistance(
      validatedData.latitude,
      validatedData.longitude,
      event.venueLatitude,
      event.venueLongitude,
    );

    // Verify location within 100m
    if (distance > 100) {
      return {
        success: false,
        error: "Validation failed",
        details: [
          {
            field: "distanceFromVenue",
            message: `Location verification failed: Not within 100m of venue (distance: ${distance.toFixed(1)}m)`,
          },
        ],
      };
    }

    // Create attendance record first to get ID
    const attendance = await db.attendance.create({
      data: {
        eventId: validatedData.eventId,
        userId: user.userId,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        distanceFromVenue: distance,
        frontPhotoUrl: "", // Temporary, will update below
        backPhotoUrl: "", // Temporary, will update below
        signatureUrl: "", // Temporary, will update below
        verificationStatus: "Pending",
      },
    });

    // Upload images to Cloudinary
    const cloudinaryFolder = `${process.env.CLOUDINARY_FOLDER}/attendance/${event.id}/${user.userId}`;
    const timestamp = Date.now();

    try {
      const [frontPhotoUrl, backPhotoUrl, signatureUrl] = await Promise.all([
        uploadPhoto(
          validatedData.frontPhotoBase64,
          `${cloudinaryFolder}/front_${timestamp}_${attendance.id}`,
        ),
        uploadPhoto(
          validatedData.backPhotoBase64,
          `${cloudinaryFolder}/back_${timestamp}_${attendance.id}`,
        ),
        uploadSignature(
          validatedData.signatureBase64,
          `${cloudinaryFolder}/signature_${timestamp}_${attendance.id}`,
        ),
      ]);

      // Update attendance with image URLs
      const updatedAttendance = await db.attendance.update({
        where: { id: attendance.id },
        data: {
          frontPhotoUrl,
          backPhotoUrl,
          signatureUrl,
        },
        include: {
          event: {
            select: {
              name: true,
              startDateTime: true,
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
          action: "ATTENDANCE_SUBMITTED",
          metadata: {
            attendanceId: attendance.id,
            eventId: event.id,
            eventName: event.name,
            distanceFromVenue: distance,
          },
          ipAddress,
          userAgent,
        },
      });

      return {
        success: true,
        data: updatedAttendance,
      };
    } catch {
      // Clean up attendance record if upload fails
      await db.attendance.delete({
        where: { id: attendance.id },
      });

      throw new Error("Failed to upload photos to Cloudinary");
    }
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
      error: "Failed to submit attendance",
    };
  }
}
