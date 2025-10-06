import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { db } from "@/lib/db";

async function getUpcomingEvents() {
  const now = new Date();

  const events = await db.event.findMany({
    where: {
      status: "Active",
      OR: [
        // Upcoming: starts in the future
        {
          startDateTime: {
            gte: now,
          },
        },
        // Ongoing: started but hasn't ended yet
        {
          startDateTime: {
            lte: now,
          },
          endDateTime: {
            gte: now,
          },
        },
      ],
    },
    include: {
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
          UserProfile: {
            select: {
              department: true,
            },
          },
        },
      },
    },
    orderBy: {
      startDateTime: "asc",
    },
  });

  return events;
}

function isEventOngoing(startDateTime: Date, endDateTime: Date) {
  const now = new Date();
  return startDateTime <= now && endDateTime >= now;
}

export default async function EventsPage() {
  const events = await getUpcomingEvents();
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Events</h1>
        <p className="text-lg text-muted-foreground">
          Browse upcoming and ongoing events. Check in to events using QR codes.
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                No Events Available
              </h3>
              <p className="text-sm text-muted-foreground">
                There are currently no upcoming or ongoing events.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => {
            const ongoing = isEventOngoing(
              event.startDateTime,
              event.endDateTime,
            );

            return (
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{event.name}</CardTitle>
                    {ongoing && (
                      <Badge variant="default" className="bg-green-600">
                        Ongoing
                      </Badge>
                    )}
                  </div>
                  {event.description && (
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">{event.venueName}</p>
                      {event.venueAddress && (
                        <p className="text-muted-foreground text-xs">
                          {event.venueAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>
                      {format(
                        new Date(event.startDateTime),
                        "EEEE, MMMM d, yyyy",
                      )}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>
                      {format(new Date(event.startDateTime), "h:mm a")} -{" "}
                      {format(new Date(event.endDateTime), "h:mm a")}
                    </span>
                  </div>

                  {/* Creator & Department */}
                  <div className="flex items-center gap-2 text-sm pt-2 border-t">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {event.createdBy.firstName} {event.createdBy.lastName}
                      </p>
                      {event.createdBy.UserProfile?.department && (
                        <p className="text-xs text-muted-foreground">
                          {event.createdBy.UserProfile.department}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
