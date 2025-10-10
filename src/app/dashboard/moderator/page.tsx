import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getModeratorDashboard } from "@/actions/dashboard/moderator";
import { ModeratorDashboard } from "@/components/dashboard/moderator-dashboard";

/**
 * Moderator dashboard page
 * Displays events, pending verifications, and stats
 */
export default async function ModeratorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; expanded?: string }>;
}) {
  // Check authentication and role
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/moderator");
  }

  if (user.role !== "Moderator" && user.role !== "Administrator") {
    redirect("/dashboard");
  }

  // Get search params
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const isExpanded = params.expanded === "true";
  const limit = isExpanded ? 10 : 5;

  // Fetch dashboard data
  const result = await getModeratorDashboard({
    page,
    limit,
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

  const {
    myEvents,
    pendingVerifications,
    stats,
    systemStats,
    userRole,
    pagination,
  } = result.data;

  // Type assertion: we know userRole is Moderator or Administrator because we checked above
  const dashboardRole = userRole as "Moderator" | "Administrator";

  // Determine dashboard title based on role
  const dashboardTitle =
    dashboardRole === "Administrator"
      ? "Admin Dashboard"
      : "Moderator Dashboard";
  const dashboardDescription =
    dashboardRole === "Administrator"
      ? "System overview and event management across all moderators."
      : "Manage events and verify attendance submissions.";

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{dashboardTitle}</h1>
        <p className="text-lg text-muted-foreground">{dashboardDescription}</p>
      </div>

      <ModeratorDashboard
        userRole={dashboardRole}
        stats={{
          totalEvents: stats.totalEvents,
          activeEvents: stats.activeEvents,
          pendingVerifications: stats.pendingVerifications,
          totalAttendances: stats.totalAttendance,
        }}
        systemStats={
          systemStats
            ? {
                totalUsers: systemStats.totalUsers,
                disputedAttendance: systemStats.disputedAttendance,
              }
            : undefined
        }
        myEvents={myEvents.map((event) => ({
          id: event.id,
          name: event.name,
          startDateTime: new Date(event.startDateTime),
          status: event.status,
          attendanceCount: event.attendanceCount,
          creatorName: event.creatorName,
        }))}
        pendingVerifications={pendingVerifications.map((item) => ({
          id: item.id,
          user: {
            firstName: item.user.firstName,
            lastName: item.user.lastName,
            email: item.user.email,
            UserProfile: item.user.UserProfile,
          },
          event: {
            name: item.event.name,
            startDateTime: new Date(item.event.startDateTime),
            venueName: item.event.venueName,
          },
          checkInSubmittedAt: item.checkInSubmittedAt
            ? new Date(item.checkInSubmittedAt)
            : null,
          checkOutSubmittedAt: item.checkOutSubmittedAt
            ? new Date(item.checkOutSubmittedAt)
            : null,
          checkInFrontPhoto: item.checkInFrontPhoto,
          checkInBackPhoto: item.checkInBackPhoto,
          checkInSignature: item.checkInSignature,
          checkInLatitude: item.checkInLatitude,
          checkInLongitude: item.checkInLongitude,
          checkInDistance: item.checkInDistance,
          checkOutDistance: item.checkOutDistance,
          checkOutFrontPhoto: item.checkOutFrontPhoto,
          checkOutBackPhoto: item.checkOutBackPhoto,
          checkOutSignature: item.checkOutSignature,
          checkOutLatitude: item.checkOutLatitude,
          checkOutLongitude: item.checkOutLongitude,
          verificationStatus: item.verificationStatus,
          disputeNote: item.disputeNote,
          appealMessage: item.appealMessage,
          resolutionNotes: item.resolutionNotes,
          verifiedAt: item.verifiedAt ? new Date(item.verifiedAt) : null,
          verifiedBy: item.verifiedBy,
        }))}
        totalItems={pagination.totalItems}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        isExpanded={isExpanded}
      />
    </div>
  );
}
