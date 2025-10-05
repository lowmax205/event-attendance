import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold mb-4">Event Tracking</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Learn how our event attendance system works and what features are
        available to each role.
      </p>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">How It Works</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Event Creation</CardTitle>
              <CardDescription>
                Moderators and administrators create events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Events can be created with details such as name, description,
                date, time, location, and capacity. Each event gets a unique QR
                code for quick check-ins.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Student Registration</CardTitle>
              <CardDescription>
                Students discover and register for events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Students browse available events and register in advance. They
                receive confirmation and can add events to their calendar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Check-In Process</CardTitle>
              <CardDescription>
                Multiple ways to mark attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Students can check in by scanning the event QR code or entering
                a unique event code. Moderators can also manually mark
                attendance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Real-Time Tracking</CardTitle>
              <CardDescription>
                Monitor attendance as it happens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Moderators and administrators can see who has checked in, view
                capacity status, and receive alerts when events reach capacity.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Role Capabilities */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Role Capabilities</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Student</CardTitle>
              <CardDescription>Basic event participation</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Browse upcoming events</li>
                <li>• Register for events</li>
                <li>• Check in to events</li>
                <li>• View personal attendance history</li>
                <li>• Update profile information</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-secondary/50">
            <CardHeader>
              <CardTitle>Moderator</CardTitle>
              <CardDescription>Event management powers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• All student capabilities</li>
                <li>• Create and edit events</li>
                <li>• Manually mark attendance</li>
                <li>• View event analytics</li>
                <li>• Export attendance reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle>Administrator</CardTitle>
              <CardDescription>Full system control</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• All moderator capabilities</li>
                <li>• Manage user accounts</li>
                <li>• Assign roles and permissions</li>
                <li>• View system-wide analytics</li>
                <li>• Access security audit logs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
