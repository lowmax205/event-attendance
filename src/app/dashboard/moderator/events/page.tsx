"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EventTable,
  type EventRow,
} from "@/components/dashboard/moderator/event-management/event-table";
import { EventFilters } from "@/components/dashboard/moderator/event-management/event-filters";
import { EventForm } from "@/components/dashboard/moderator/event-management/event-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { listEvents } from "@/actions/events/list";
import { deleteEvent } from "@/actions/events/delete";
import { Plus } from "lucide-react";
import { EventStatus } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EventManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [events, setEvents] = React.useState<EventRow[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 20,
    totalPages: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState<string | null>(null);

  const [filters, setFilters] = React.useState({
    status: searchParams.get("status") || undefined,
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined,
    sortBy: searchParams.get("sortBy") || "startDateTime",
    sortOrder: searchParams.get("sortOrder") || "desc",
  });

  // Use constant page size to avoid infinite loop
  const PAGE_SIZE = 20;

  const fetchEvents = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const page = parseInt(searchParams.get("page") || "1", 10);

      const result = await listEvents({
        page,
        limit: PAGE_SIZE,
        status: filters.status as EventStatus | undefined,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        sortBy: filters.sortBy as
          | "name"
          | "startDateTime"
          | "endDateTime"
          | "status"
          | "createdAt",
        sortOrder: filters.sortOrder as "asc" | "desc",
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch events");
      }

      setEvents(result.data.events as EventRow[]);
      setPagination({
        pageIndex: page - 1,
        pageSize: PAGE_SIZE,
        totalPages: result.data.pagination.totalPages,
        totalItems: result.data.pagination.total,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, toast]);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const updateUrlParams = (newFilters: typeof filters, page = 1) => {
    const params = new URLSearchParams();
    if (newFilters.status) params.set("status", newFilters.status);
    if (newFilters.startDate)
      params.set("startDate", newFilters.startDate.toISOString());
    if (newFilters.endDate)
      params.set("endDate", newFilters.endDate.toISOString());
    if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
    if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);
    if (page > 1) params.set("page", page.toString());
    router.push(`/dashboard/moderator/events?${params.toString()}`);
  };

  const handleFilterChange = (
    name: string,
    value: string | Date | undefined,
  ) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    updateUrlParams(filters, 1);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "startDateTime",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    updateUrlParams(clearedFilters, 1);
  };

  const handlePaginationChange = (pageIndex: number) => {
    updateUrlParams(filters, pageIndex + 1);
  };

  const handleEdit = (eventId: string) => {
    setSelectedEventId(eventId);
    setEditDialogOpen(true);
  };

  const handleDownloadQR = async () => {
    // TODO: Implement QR code download
    toast({
      title: "Download QR",
      description:
        "QR code download functionality will be implemented in a future update.",
    });
  };

  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      const result = await deleteEvent(eventToDelete);
      if (!result.success)
        throw new Error(result.error || "Failed to delete event");
      toast({
        title: "Event deleted",
        description: "Event has been deleted successfully",
      });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Event Management
          </h1>
          <p className="text-muted-foreground">Create and manage your events</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <EventFilters
        values={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      <EventTable
        events={events}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onEdit={handleEdit}
        onDownloadQR={handleDownloadQR}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <EventForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={() => {
          setCreateDialogOpen(false);
          fetchEvents();
        }}
      />

      {selectedEventId && (
        <EventForm
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          mode="edit"
          eventId={selectedEventId}
          onSuccess={() => {
            setEditDialogOpen(false);
            fetchEvents();
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              event and all associated attendance records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
