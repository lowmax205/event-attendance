import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RoadMapPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold mb-4">Development Roadmap</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Our vision for the future of event attendance tracking. Here&apos;s what
        we&apos;re building next.
      </p>

      {/* Timeline */}
      <div className="space-y-8">
        {/* Phase 1 - Launched */}
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="default">Launched</Badge>
              <span className="text-sm text-muted-foreground">Q1 2025</span>
            </div>
            <CardTitle>Phase 1: Core Authentication & Authorization</CardTitle>
            <CardDescription>
              Secure user management and role-based access control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>User registration and login with JWT authentication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>
                  Three-tier role system (Student, Moderator, Administrator)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Session management with secure httpOnly cookies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Rate limiting to prevent brute force attacks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Security audit logging for compliance</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Phase 2 - In Progress */}
        <Card className="border-secondary">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">In Progress</Badge>
              <span className="text-sm text-muted-foreground">Q2 2025</span>
            </div>
            <CardTitle>Phase 2: Event Management & Attendance</CardTitle>
            <CardDescription>
              Complete event lifecycle from creation to reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">◐</span>
                <span>
                  Event creation with rich details and capacity limits
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">◐</span>
                <span>QR code generation for quick check-ins</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">◐</span>
                <span>Student event registration and waitlist management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">◐</span>
                <span>Multiple check-in methods (QR, code, manual)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">◐</span>
                <span>Real-time attendance tracking dashboard</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Phase 3 - Planned */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">Planned</Badge>
              <span className="text-sm text-muted-foreground">Q3 2025</span>
            </div>
            <CardTitle>Phase 3: Analytics & Reporting</CardTitle>
            <CardDescription>
              Data-driven insights for event optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1">○</span>
                <span>
                  Advanced analytics dashboards with charts and visualizations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">○</span>
                <span>
                  Attendance trend analysis across events and time periods
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">○</span>
                <span>CSV and PDF report exports for record-keeping</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">○</span>
                <span>Student engagement metrics and attendance history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">○</span>
                <span>Email notifications for event updates and reminders</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Phase 4 - Future */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">Future</Badge>
              <span className="text-sm text-muted-foreground">Q4 2025+</span>
            </div>
            <CardTitle>Phase 4: Advanced Features</CardTitle>
            <CardDescription>
              Expanding capabilities and integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1">○</span>
                <span>Mobile app for iOS and Android</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">○</span>
                <span>Calendar integration (Google Calendar, Outlook)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">○</span>
                <span>Automated attendance certificates and badges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">○</span>
                <span>Integration with student information systems (SIS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">○</span>
                <span>Multi-language support for global institutions</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Contributing Section */}
      <Card className="mt-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle>Want to Contribute?</CardTitle>
          <CardDescription>
            This is an open-source project and we welcome contributions!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Check out our GitHub repository to report issues, suggest features,
            or submit pull requests. Whether you&apos;re fixing bugs, improving
            documentation, or adding new features, we appreciate your help in
            making this project better.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
