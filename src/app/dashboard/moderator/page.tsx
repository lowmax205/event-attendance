import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ModeratorDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">Moderator Dashboard</h1>
            <Badge variant="secondary" className="text-sm">Moderator</Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Create and manage events, track attendance in real-time.
          </p>
        </div>
        <Button size="lg">Create Event</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Events</CardTitle>
            <CardDescription>Currently running</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Attendees</CardTitle>
            <CardDescription>Today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events Created</CardTitle>
            <CardDescription>By you</CardDescription>
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
            <CardTitle>Your Events</CardTitle>
            <CardDescription>
              Events you created and manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any events yet. Click the Create Event button
              to get started.
            </p>
            <Button>Create Your First Event</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-Time Attendance</CardTitle>
            <CardDescription>
              Live check-in tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No active events. Real-time attendance data will appear here when
              events are running.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Notice */}
      <Card className="mt-8 bg-secondary/10">
        <CardHeader>
          <CardTitle>Moderator Features Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Create and edit events with detailed information</p>
          <p>• Generate QR codes for quick check-ins</p>
          <p>• Manually mark student attendance</p>
          <p>• View real-time attendance dashboards</p>
          <p>• Export attendance reports (CSV/PDF)</p>
          <p>• Manage event capacity and waitlists</p>
        </CardContent>
      </Card>
    </div>
  );
}
