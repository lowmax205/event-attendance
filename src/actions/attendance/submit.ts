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
 * Handles both check-in and check-out submissions
 * @param input - Attendance submission data (including attendanceType)
 * @returns Created or updated attendance record
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

    // Calculate attendance windows
    const checkInOpens = event.startDateTime;
    const checkInCloses = new Date(
      event.startDateTime.getTime() + event.checkInBufferMins * 60 * 1000,
    );
    const checkOutOpens = new Date(
      event.endDateTime.getTime() - event.checkOutBufferMins * 60 * 1000,
    );
    const checkOutCloses = event.endDateTime;
    const now = new Date();

    // Validate window based on attendance type
    if (validatedData.attendanceType === "check-in") {
      if (now < checkInOpens) {
        return {
          success: false,
          error: "Check-in window not open",
          message: `Check-in opens at ${checkInOpens.toISOString()}`,
        };
      }
      if (now > checkInCloses) {
        return {
          success: false,
          error: "Check-in window closed",
          message: `Check-in closed at ${checkInCloses.toISOString()}`,
        };
      }
    } else {
      // check-out
      if (now < checkOutOpens) {
        return {
          success: false,
          error: "Check-out window not open",
          message: `Check-out opens at ${checkOutOpens.toISOString()}`,
        };
      }
      if (now > checkOutCloses) {
        return {
          success: false,
          error: "Check-out window closed",
          message: `Check-out closed at ${checkOutCloses.toISOString()}`,
        };
      }
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

    // Check for existing attendance record
    const existingAttendance = await db.attendance.findUnique({
      where: {
        eventId_userId: {
          eventId: validatedData.eventId,
          userId: user.userId,
        },
      },
    });

    // Upload images to Cloudinary
    const cloudinaryFolder = `${process.env.CLOUDINARY_FOLDER}/attendance/${event.id}/${user.userId}`;
    const timestamp = Date.now();
    const recordId = existingAttendance?.id || "new";

    const [frontPhotoUrl, backPhotoUrl, signatureUrl] = await Promise.all([
      uploadPhoto(
        validatedData.frontPhotoBase64,
        `${cloudinaryFolder}/${validatedData.attendanceType}_front_${timestamp}_${recordId}`,
      ),
      uploadPhoto(
        validatedData.backPhotoBase64,
        `${cloudinaryFolder}/${validatedData.attendanceType}_back_${timestamp}_${recordId}`,
      ),
      uploadSignature(
        validatedData.signatureBase64,
        `${cloudinaryFolder}/${validatedData.attendanceType}_signature_${timestamp}_${recordId}`,
      ),
    ]);

    // Get IP and User Agent
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      undefined;
    const userAgent = headersList.get("user-agent") || undefined;

    let updatedAttendance;

    if (validatedData.attendanceType === "check-in") {
      // Check-in: Create new record or update if exists (shouldn't happen)
      if (existingAttendance) {
        // Update existing with check-in data
        updatedAttendance = await db.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            checkInSubmittedAt: now,
            checkInLatitude: validatedData.latitude,
            checkInLongitude: validatedData.longitude,
            checkInDistance: distance,
            checkInFrontPhoto: frontPhotoUrl,
            checkInBackPhoto: backPhotoUrl,
            checkInSignature: signatureUrl,
            checkInIpAddress: ipAddress,
            checkInUserAgent: userAgent,
          },
          include: {
            event: {
              select: {
                name: true,
                startDateTime: true,
                endDateTime: true,
              },
            },
          },
        });
      } else {
        // Create new attendance record
        updatedAttendance = await db.attendance.create({
          data: {
            eventId: validatedData.eventId,
            userId: user.userId,
            checkInSubmittedAt: now,
            checkInLatitude: validatedData.latitude,
            checkInLongitude: validatedData.longitude,
            checkInDistance: distance,
            checkInFrontPhoto: frontPhotoUrl,
            checkInBackPhoto: backPhotoUrl,
            checkInSignature: signatureUrl,
            checkInIpAddress: ipAddress,
            checkInUserAgent: userAgent,
            verificationStatus: "Pending",
          },
          include: {
            event: {
              select: {
                name: true,
                startDateTime: true,
                endDateTime: true,
              },
            },
          },
        });
      }

      // Log check-in
      await db.securityLog.create({
        data: {
          userId: user.userId,
          eventType: "REGISTRATION",
          metadata: {
            attendanceId: updatedAttendance.id,
            eventId: event.id,
            eventName: event.name,
            distanceFromVenue: distance,
          },
          ipAddress,
          userAgent,
        },
      });
    } else {
      // Check-out: Must have existing record with check-in
      if (!existingAttendance) {
        return {
          success: false,
          error: "Check-in required",
          message: "You must check in before you can check out",
        };
      }

      if (!existingAttendance.checkInSubmittedAt) {
        return {
          success: false,
          error: "Check-in required",
          message: "You must check in before you can check out",
        };
      }

      // Update with check-out data
      updatedAttendance = await db.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkOutSubmittedAt: now,
          checkOutLatitude: validatedData.latitude,
          checkOutLongitude: validatedData.longitude,
          checkOutDistance: distance,
          checkOutFrontPhoto: frontPhotoUrl,
          checkOutBackPhoto: backPhotoUrl,
          checkOutSignature: signatureUrl,
          checkOutIpAddress: ipAddress,
          checkOutUserAgent: userAgent,
        },
        include: {
          event: {
            select: {
              name: true,
              startDateTime: true,
              endDateTime: true,
            },
          },
        },
      });

      // Log check-out
      await db.securityLog.create({
        data: {
          userId: user.userId,
          eventType: "REGISTRATION",
          metadata: {
            attendanceId: updatedAttendance.id,
            eventId: event.id,
            eventName: event.name,
            distanceFromVenue: distance,
          },
          ipAddress,
          userAgent,
        },
      });
    }

    return {
      success: true,
      data: updatedAttendance,
      attendanceType: validatedData.attendanceType,
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
      error: "Failed to submit attendance",
    };
  }
}
