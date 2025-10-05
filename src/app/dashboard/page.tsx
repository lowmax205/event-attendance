import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StudentDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome! Manage your event attendance and view your history.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events you can attend</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events Attended</CardTitle>
            <CardDescription>Your attendance record</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Events</CardTitle>
            <CardDescription>Events you&apos;re registered for</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Browse and register for upcoming events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No upcoming events at the moment. Check back soon!
            </p>
            <Button asChild>
              <Link href="/events">Browse All Events</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>
              Your recent event check-ins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No attendance records yet. Attend events to see them here.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Notice */}
      <Card className="mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This dashboard is currently under development. Full event management,
            QR code check-in, and attendance history features will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
