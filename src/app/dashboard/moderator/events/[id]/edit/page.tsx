"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { EventForm } from "@/components/dashboard/event-form";
import { getEventById } from "@/actions/events/get-by-id";
import { updateEvent } from "@/actions/events/update";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Event edit page
 * Allows moderators to update event details
 */
export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [event, setEvent] = useState<{
    name: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    venueName: string;
    venueAddress?: string | null;
    venueLatitude: number;
    venueLongitude: number;
    checkInBufferMins: number;
    checkOutBufferMins: number;
    status: "Active" | "Completed" | "Cancelled";
  } | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      setIsFetching(true);
      try {
        const result = await getEventById(eventId);

        if (!result.success || !result.data) {
          toast.error(result.error || "Failed to load event");
          router.push("/dashboard/moderator/events");
          return;
        }

        setEvent({
          name: result.data.name,
          description: result.data.description || undefined,
          startDateTime: result.data.startDateTime.toISOString(),
          endDateTime: result.data.endDateTime.toISOString(),
          venueName: result.data.venueName,
          venueAddress: result.data.venueAddress,
          venueLatitude: result.data.venueLatitude,
          venueLongitude: result.data.venueLongitude,
          checkInBufferMins: result.data.checkInBufferMins,
          checkOutBufferMins: result.data.checkOutBufferMins,
          status: result.data.status,
        });
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event");
        router.push("/dashboard/moderator/events");
      } finally {
        setIsFetching(false);
      }
    }

    fetchEvent();
  }, [eventId, router]);

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    venueName: string;
    venueAddress?: string | null;
    venueLatitude: number;
    venueLongitude: number;
    checkInBufferMins: number;
    checkOutBufferMins: number;
    status?: "Active" | "Completed" | "Cancelled";
  }) => {
    setIsLoading(true);

    try {
      const result = await updateEvent(eventId, data);

      if (!result.success) {
        toast.error(result.error || "Failed to update event");
        return;
      }

      toast.success("Event updated successfully!");
      router.push("/dashboard/moderator/events");
    } catch (error) {
      console.error("Event update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update event",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/moderator/events">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Event</h1>
        <p className="text-lg text-muted-foreground">
          Update event details and settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            mode="edit"
            defaultValues={event}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
