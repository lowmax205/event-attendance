"use client";

import { useState } from "react";
import { EventForm } from "@/components/dashboard/event-form";
import { createEvent } from "@/actions/events/create";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QRCodeDisplay } from "@/components/dashboard/qr-code-display";
import { toast } from "sonner";

/**
 * Event creation page
 * Allows moderators to create new events
 */
export default function CreateEventPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<{
    id: string;
    name: string;
    qrCodeUrl: string;
    qrCodePayload: string;
  } | null>(null);

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
  }) => {
    setIsLoading(true);

    try {
      const result = await createEvent(data);

      if (!result.success || !result.data) {
        toast.error(result.error || "Failed to create event");
        return;
      }

      // Show success state with QR code
      setCreatedEvent({
        id: result.data.id,
        name: result.data.name,
        qrCodeUrl: result.data.qrCodeUrl || "",
        qrCodePayload: result.data.qrCodePayload,
      });

      toast.success("Event created successfully!");
    } catch (error) {
      console.error("Event creation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create event",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (createdEvent) {
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

        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Event created successfully! Your QR code has been generated and is
            ready to use.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>{createdEvent.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <QRCodeDisplay
              qrCodeUrl={createdEvent.qrCodeUrl}
              eventName={createdEvent.name}
              isModerator={true}
            />

            <div className="mt-6 flex gap-3">
              <Link href="/dashboard/moderator/events" className="flex-1">
                <Button variant="outline" className="w-full">
                  View All Events
                </Button>
              </Link>
              <Link
                href={`/dashboard/moderator/events/${createdEvent.id}/edit`}
                className="flex-1"
              >
                <Button className="w-full">Edit Event</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
        <h1 className="text-4xl font-bold mb-2">Create New Event</h1>
        <p className="text-lg text-muted-foreground">
          Fill in the event details to generate a QR code for attendance
          tracking
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            mode="create"
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
