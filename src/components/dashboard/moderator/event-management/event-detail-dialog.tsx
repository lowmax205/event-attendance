"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventById } from "@/actions/events/get-by-id";
import { useToast } from "@/hooks/use-toast";
import { EventStatus } from "@prisma/client";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const statusVariant: Record<
  EventStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Active: "default",
  Completed: "secondary",
  Cancelled: "destructive",
};

interface EventDetailDialogProps {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EventDetailState = {
  id: string;
  name: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  venueName: string;
  venueAddress: string | null;
  venueLatitude: number;
  venueLongitude: number;
  checkInBufferMins: number;
  checkOutBufferMins: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  qrCodeUrl: string | null;
  _count: {
    attendances: number;
  };
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
  };
};

export function EventDetailDialog({
  eventId,
  open,
  onOpenChange,
}: EventDetailDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [event, setEvent] = React.useState<EventDetailState | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchEventDetails(id: string) {
      setIsLoading(true);
      try {
        const result = await getEventById(id);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to load event details");
        }

        if (!isMounted) return;

        const data = result.data;
        setEvent({
          id: data.id,
          name: data.name,
          description: data.description ?? null,
          startDateTime: data.startDateTime.toString(),
          endDateTime: data.endDateTime.toString(),
          venueName: data.venueName,
          venueAddress: data.venueAddress ?? null,
          venueLatitude: data.venueLatitude,
          venueLongitude: data.venueLongitude,
          checkInBufferMins: data.checkInBufferMins,
          checkOutBufferMins: data.checkOutBufferMins,
          status: data.status,
          createdAt: data.createdAt.toString(),
          updatedAt: data.updatedAt.toString(),
          qrCodeUrl: data.qrCodeUrl ?? null,
          _count: data._count,
          createdBy: {
            id: data.createdBy.id,
            firstName: data.createdBy.firstName,
            lastName: data.createdBy.lastName,
            email: data.createdBy.email,
            role: data.createdBy.role,
          },
        });
      } catch (error) {
        console.error("Failed to load event details", error);
        toast({
          title: "Unable to load event",
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong while loading the event.",
          variant: "destructive",
        });
        if (isMounted) {
          setEvent(null);
          onOpenChange(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (open && eventId) {
      void fetchEventDetails(eventId);
    }

    if (!open) {
      setEvent(null);
    }

    return () => {
      isMounted = false;
    };
  }, [eventId, open, onOpenChange, toast]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!event) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    return (
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl font-semibold">
                {event.name}
              </DialogTitle>
              <Badge variant={statusVariant[event.status] ?? "outline"}>
                {event.status}
              </Badge>
            </div>
            <DialogDescription>
              Overview of this event, including schedule, venue, and attendance
              summary.
            </DialogDescription>
          </div>

          {event.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <p className="text-sm leading-6 text-foreground/90 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Schedule
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Starts</p>
                  <p className="font-medium">
                    {format(startDate, "MMMM d, yyyy • h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ends</p>
                  <p className="font-medium">
                    {format(endDate, "MMMM d, yyyy • h:mm a")}
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Check-in buffer
                    </p>
                    <p className="font-medium">
                      {event.checkInBufferMins} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Check-out buffer
                    </p>
                    <p className="font-medium">
                      {event.checkOutBufferMins} minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Venue
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{event.venueName}</p>
                  {event.venueAddress && (
                    <p className="text-xs text-muted-foreground">
                      {event.venueAddress}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Coordinates
                  </p>
                  <p className="font-medium">
                    {event.venueLatitude.toFixed(6)},{" "}
                    {event.venueLongitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Attendance Snapshot
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total submissions</span>
                <span className="font-semibold">
                  {event._count.attendances}
                </span>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Created By
              </h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {[event.createdBy.firstName, event.createdBy.lastName]
                    .filter(Boolean)
                    .join(" ") || event.createdBy.email}
                </p>
                <p className="text-muted-foreground text-xs">
                  {event.createdBy.email}
                </p>
                <p className="text-muted-foreground text-xs">
                  Role: {event.createdBy.role}
                </p>
                <Separator />
                <p className="text-muted-foreground text-xs">
                  Created {format(new Date(event.createdAt), "PPP p")}
                </p>
                <p className="text-muted-foreground text-xs">
                  Updated {format(new Date(event.updatedAt), "PPP p")}
                </p>
              </div>
            </div>
          </div>

          {event.qrCodeUrl && (
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                QR Code
              </h3>
              <p className="text-xs text-muted-foreground">
                Moderators can download or regenerate the QR from the event
                actions menu.
              </p>
              <div className="mt-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.qrCodeUrl}
                  alt={`QR code for ${event.name}`}
                  className="h-40 w-40 rounded border"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Event details
          </DialogTitle>
          <DialogDescription>
            Detailed information for the selected event.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
