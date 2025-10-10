"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/server";

export type AttendanceForVerification = {
  id: string;
  studentName: string;
  studentNumber: string;
  studentEmail: string;
  department: string;
  yearLevel: number | null;
  section: string | null;
  eventName: string;
  eventVenue: string;
  eventStartDate: string;
  eventEndDate: string;
  checkInSubmittedAt: string | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkInDistance: number | null;
  checkInFrontPhoto: string | null;
  checkInBackPhoto: string | null;
  checkInSignature: string | null;
  checkOutSubmittedAt: string | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  checkOutDistance: number | null;
  checkOutFrontPhoto: string | null;
  checkOutBackPhoto: string | null;
  checkOutSignature: string | null;
  verificationStatus: "Pending" | "Approved" | "Rejected" | "Disputed";
  verifiedByName: string | null;
  verifiedAt: string | null;
  disputeNote: string | null;
};

type ErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "UNKNOWN";

export async function getAttendanceForVerification(
  attendanceId: string,
): Promise<
  | { success: true; data: AttendanceForVerification }
  | { success: false; error: ErrorCode }
> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "UNAUTHENTICATED" };
    }

    if (user.role !== "Moderator" && user.role !== "Administrator") {
      return { success: false, error: "FORBIDDEN" };
    }

    const attendance = await db.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            UserProfile: {
              select: {
                studentId: true,
                department: true,
                yearLevel: true,
                section: true,
              },
            },
          },
        },
        event: {
          select: {
            name: true,
            venueName: true,
            startDateTime: true,
            endDateTime: true,
            createdById: true,
          },
        },
        verifiedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!attendance) {
      return { success: false, error: "NOT_FOUND" };
    }

    if (
      user.role === "Moderator" &&
      attendance.event.createdById !== user.userId
    ) {
      return { success: false, error: "FORBIDDEN" };
    }

    return {
      success: true,
      data: {
        id: attendance.id,
        studentName: `${attendance.user.firstName} ${attendance.user.lastName}`,
        studentNumber: attendance.user.UserProfile?.studentId || "N/A",
        studentEmail: attendance.user.email,
        department: attendance.user.UserProfile?.department || "N/A",
        yearLevel: attendance.user.UserProfile?.yearLevel ?? null,
        section: attendance.user.UserProfile?.section ?? null,
        eventName: attendance.event.name,
        eventVenue: attendance.event.venueName,
        eventStartDate: attendance.event.startDateTime.toISOString(),
        eventEndDate: attendance.event.endDateTime.toISOString(),
        checkInSubmittedAt: attendance.checkInSubmittedAt
          ? attendance.checkInSubmittedAt.toISOString()
          : null,
        checkInLatitude: attendance.checkInLatitude,
        checkInLongitude: attendance.checkInLongitude,
        checkInDistance: attendance.checkInDistance,
        checkInFrontPhoto: attendance.checkInFrontPhoto,
        checkInBackPhoto: attendance.checkInBackPhoto,
        checkInSignature: attendance.checkInSignature,
        checkOutSubmittedAt: attendance.checkOutSubmittedAt
          ? attendance.checkOutSubmittedAt.toISOString()
          : null,
        checkOutLatitude: attendance.checkOutLatitude,
        checkOutLongitude: attendance.checkOutLongitude,
        checkOutDistance: attendance.checkOutDistance,
        checkOutFrontPhoto: attendance.checkOutFrontPhoto,
        checkOutBackPhoto: attendance.checkOutBackPhoto,
        checkOutSignature: attendance.checkOutSignature,
        verificationStatus:
          attendance.verificationStatus as AttendanceForVerification["verificationStatus"],
        verifiedByName: attendance.verifiedBy
          ? `${attendance.verifiedBy.firstName} ${attendance.verifiedBy.lastName}`
          : null,
        verifiedAt: attendance.verifiedAt
          ? attendance.verifiedAt.toISOString()
          : null,
        disputeNote: attendance.disputeNote,
      },
    };
  } catch (error) {
    console.error("getAttendanceForVerification error", error);
    return { success: false, error: "UNKNOWN" };
  }
}
