import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getModeratorDashboard } from "@/actions/dashboard/moderator";
import { ModeratorDashboard } from "@/components/dashboard/moderator-dashboard";

/**
 * Moderator dashboard page
 * Displays events, pending verifications, and stats
 */
export default async function ModeratorDashboardPage() {
  // Check authentication and role
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/moderator");
  }

  if (user.role !== "Moderator" && user.role !== "Administrator") {
    redirect("/dashboard");
  }

  // Fetch dashboard data
  const result = await getModeratorDashboard({
    page: 1,
    limit: 10,
  });

  if (!result.success || !result.data) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            {result.error || "Failed to load dashboard data"}
          </p>
        </div>
      </div>
    );
  }

  const { myEvents, pendingVerifications, stats } = result.data;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Moderator Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Manage events and verify attendance submissions.
        </p>
      </div>

      <ModeratorDashboard
        stats={{
          totalEvents: stats.totalEvents,
          activeEvents: stats.activeEvents,
          pendingVerifications: stats.pendingVerifications,
          totalAttendances: stats.totalAttendance,
        }}
        myEvents={myEvents.map((event) => ({
          id: event.id,
          name: event.name,
          startDateTime: new Date(event.startDateTime),
          status: event.status,
          attendanceCount: event.attendanceCount,
        }))}
        pendingVerifications={pendingVerifications.map((item) => ({
          id: item.id,
          studentName: item.studentName,
          eventName: item.eventName,
          checkInSubmittedAt: item.checkInSubmittedAt
            ? new Date(item.checkInSubmittedAt)
            : null,
          checkOutSubmittedAt: item.checkOutSubmittedAt
            ? new Date(item.checkOutSubmittedAt)
            : null,
          checkInFrontPhoto: item.checkInFrontPhoto,
          checkInBackPhoto: item.checkInBackPhoto,
          checkInSignature: item.checkInSignature,
          checkOutFrontPhoto: item.checkOutFrontPhoto,
          checkOutBackPhoto: item.checkOutBackPhoto,
          checkOutSignature: item.checkOutSignature,
          checkInDistance: item.checkInDistance,
          checkOutDistance: item.checkOutDistance,
        }))}
      />
    </div>
  );
}
