import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Event Attendance System
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          A modern, secure platform for tracking event attendance in educational
          institutions. Simplify check-ins, manage events, and gain insights—all
          in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="min-h-11 min-w-44">
            <Link href="/auth">Get Started</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="min-h-11 min-w-44"
          >
            <Link href="/events">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-10">Key Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Check-In</CardTitle>
              <CardDescription>
                Students can check in to events with just a few clicks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Streamlined attendance process with QR code scanning and manual
                entry options for maximum flexibility.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Different permissions for students, moderators, and
                administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secure access control ensures each user sees only the features
                and data relevant to their role.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Real-Time Analytics</CardTitle>
              <CardDescription>
                Track attendance trends and generate reports instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View live attendance data, export reports, and make data-driven
                decisions for future events.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>
                Create and manage events with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Moderators can create events, set capacity limits, and manage
                attendee lists all from one dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security First</CardTitle>
              <CardDescription>
                Built with enterprise-grade security standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                JWT authentication, rate limiting, session management, and audit
                logging keep your data safe.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessible Design</CardTitle>
              <CardDescription>
                WCAG 2.1 AA compliant interface for all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keyboard navigation, screen reader support, and high contrast
                ratios ensure everyone can use the platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">
              Ready to Get Started?
            </CardTitle>
            <CardDescription className="text-base">
              Create an account and start managing events today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild className="min-h-11 min-w-44">
              <Link href="/auth">Sign Up Now</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
