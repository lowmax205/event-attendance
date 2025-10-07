import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { listEvents } from "@/actions/events/list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { QRCodeModal } from "@/components/events/qr-code-modal";

/**
 * Moderator events list page
 * Displays all events created by the moderator
 */
export default async function ModeratorEventsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/moderator/events");
  }

  if (user.role !== "Moderator" && user.role !== "Administrator") {
    redirect("/dashboard");
  }

  // Fetch events created by this moderator
  const result = await listEvents({
    createdById: user.userId,
    page: 1,
    limit: 50,
  });

  if (!result.success || !result.data) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Events
          </h2>
          <p className="text-sm text-muted-foreground">
            {result.error || "Failed to load events"}
          </p>
        </div>
      </div>
    );
  }

  const { events } = result.data;

  const statusColors = {
    Active: "default",
    Completed: "secondary",
    Cancelled: "destructive",
  } as const;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Events</h1>
          <p className="text-lg text-muted-foreground">
            Manage your events and track attendance
          </p>
        </div>
        <Link href="/dashboard/moderator/events/create">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any events yet.
            </p>
            <Link href="/dashboard/moderator/events/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Events ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>
                      {new Date(event.startDateTime).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>{event.venueName}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[event.status]}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/moderator/events/${event.id}/edit`}
                        >
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {event.qrCodeUrl && (
                          <QRCodeModal
                            eventId={event.id}
                            eventName={event.name}
                            qrCodeUrl={event.qrCodeUrl}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
