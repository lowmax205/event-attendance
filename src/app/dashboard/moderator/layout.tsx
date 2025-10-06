import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  LogOut,
  Plus,
} from "lucide-react";

interface ModeratorDashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Moderator dashboard layout
 * Provides navigation tabs and user context
 */
export default async function ModeratorDashboardLayout({
  children,
}: ModeratorDashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/moderator");
  }

  if (user.role !== "Moderator" && user.role !== "Administrator") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="font-semibold text-lg">Moderator Dashboard</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard/moderator"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <LayoutDashboard className="inline-block h-4 w-4 mr-2" />
              Overview
            </Link>
            <Link
              href="/dashboard/moderator/events"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <Calendar className="inline-block h-4 w-4 mr-2" />
              Events
            </Link>
            <Link
              href="/dashboard/moderator/attendance"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <Users className="inline-block h-4 w-4 mr-2" />
              Attendance
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/moderator/events/create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <form action="/auth/logout" method="POST">
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Breadcrumbs (optional - can be added per page) */}

      {/* Main Content */}
      <main>{children}</main>

      {/* Mobile Navigation (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link href="/dashboard/moderator">
            <Button variant="ghost" className="w-full flex-col h-auto py-2">
              <LayoutDashboard className="h-5 w-5 mb-1" />
              <span className="text-xs">Dashboard</span>
            </Button>
          </Link>
          <Link href="/dashboard/moderator/events">
            <Button variant="ghost" className="w-full flex-col h-auto py-2">
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">Events</span>
            </Button>
          </Link>
          <Link href="/dashboard/moderator/attendance">
            <Button variant="ghost" className="w-full flex-col h-auto py-2">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs">Attendance</span>
            </Button>
          </Link>
          <Link href="/dashboard/moderator/events/create">
            <Button variant="ghost" className="w-full flex-col h-auto py-2">
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs">Create</span>
            </Button>
          </Link>
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-20" />
    </div>
  );
}
