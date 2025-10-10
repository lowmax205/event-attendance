"use client";

import { EventManagementView } from "@/components/dashboard/moderator/event-management/event-management-view";

export default function MyEventsPage() {
  return (
    <EventManagementView
      title="My Events"
      description="Manage the events you created, update details, and keep track of attendance."
      scope="mine"
      basePath="/dashboard/moderator/events"
      showCreateButton
      searchPlaceholder="Search your events or venues"
    />
  );
}
