import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/server";
import { AttendanceFormWrapper } from "@/components/attendance/attendance-form-wrapper";

interface AttendanceFormPageProps {
  params: Promise<{ eventId: string }>;
}

/**
 * Attendance form page for a specific event
 * Pre-fetches event details and renders attendance form
 */
export default async function AttendanceFormPage({
  params,
}: AttendanceFormPageProps) {
  const { eventId } = await params;

  // Get user session
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?redirect=/attendance/" + eventId);
  }

  // Fetch event details
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
      venueLatitude: true,
      venueLongitude: true,
      checkInBufferMins: true,
      checkOutBufferMins: true,
      status: true,
      qrCodePayload: true,
    },
  });

  if (!event) {
    notFound();
  }

  // Check if user profile is complete
  const userProfile = await db.userProfile.findUnique({
    where: { userId: user.userId },
  });

  if (!userProfile) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Profile Incomplete
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            You need to complete your profile before checking in to events.
          </p>
          <a
            href="/profile/create"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Complete Profile
          </a>
        </div>
      </div>
    );
  }

  // Check if already checked in
  const existingAttendance = await db.attendance.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: user.userId,
      },
    },
    select: {
      id: true,
      submittedAt: true,
      verificationStatus: true,
    },
  });

  if (existingAttendance) {
    redirect(`/attendance/${eventId}/success`);
  }

  // Calculate check-in window
  const opensAt = new Date(
    event.startDateTime.getTime() - event.checkInBufferMins * 60 * 1000,
  );
  const closesAt = new Date(
    event.endDateTime.getTime() + event.checkOutBufferMins * 60 * 1000,
  );
  const now = new Date();
  const isOpen = now >= opensAt && now <= closesAt;

  // Check if event is accessible
  if (event.status === "Cancelled") {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Event Cancelled
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            This event has been cancelled and is no longer accepting attendance.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    const message =
      now < opensAt
        ? `Check-in opens at ${opensAt.toLocaleString()}`
        : `Check-in closed at ${closesAt.toLocaleString()}`;

    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-warning bg-warning/10 p-6">
          <h2 className="text-lg font-semibold mb-2">Check-In Not Available</h2>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Render attendance form
  return (
    <AttendanceFormWrapper
      event={{
        id: event.id,
        name: event.name,
        description: event.description || "",
        startDateTime: event.startDateTime.toISOString(),
        endDateTime: event.endDateTime.toISOString(),
        venueName: event.venueName,
        venueAddress: event.venueAddress || "",
        venueLatitude: event.venueLatitude,
        venueLongitude: event.venueLongitude,
      }}
    />
  );
}
