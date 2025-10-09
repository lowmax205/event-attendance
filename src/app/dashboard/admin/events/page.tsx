"use client";

import { EventManagementView } from "@/components/dashboard/moderator/event-management/event-management-view";

export default function AdminAllEventsPage() {
  return (
    <EventManagementView
      title="All Events"
      description="Review every event across the institution, monitor engagement, and support moderators where needed."
      scope="all"
      basePath="/dashboard/admin/events"
      showCreateButton
      searchPlaceholder="Search events by name, venue, or creator"
    />
  );
}
