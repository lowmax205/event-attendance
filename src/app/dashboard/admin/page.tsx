import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold">Administrator Dashboard</h1>
          <Badge variant="destructive" className="text-sm">
            Administrator
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          Full system control - manage users, events, and security.
        </p>
      </div>

      {/* System Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Registered accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Events</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Currently logged in</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Alerts</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline">
              View All Users
            </Button>
            <Button className="w-full" variant="outline">
              Assign Roles
            </Button>
            <Button className="w-full" variant="outline">
              Pending Profiles
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Oversight</CardTitle>
            <CardDescription>Monitor all system events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline">
              All Events
            </Button>
            <Button className="w-full" variant="outline">
              Event Analytics
            </Button>
            <Button className="w-full" variant="outline">
              Generate Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security & Audit</CardTitle>
            <CardDescription>System security and logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline">
              Security Logs
            </Button>
            <Button className="w-full" variant="outline">
              Active Sessions
            </Button>
            <Button className="w-full" variant="outline">
              Failed Login Attempts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No recent activity. System activity will be displayed here.
          </p>
        </CardContent>
      </Card>

      {/* Placeholder Notice */}
      <Card className="mt-8 bg-destructive/10">
        <CardHeader>
          <CardTitle>Administrator Features Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Full user account management (create, edit, delete, suspend)</p>
          <p>• Role assignment and permission control</p>
          <p>• System-wide event analytics and reporting</p>
          <p>• Security audit log viewer with filtering</p>
          <p>• Active session management and forced logout</p>
          <p>• Rate limit monitoring and adjustment</p>
          <p>• Database backup and maintenance tools</p>
          <p>• System configuration and settings</p>
        </CardContent>
      </Card>
    </div>
  );
}
