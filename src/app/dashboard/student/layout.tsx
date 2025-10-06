import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, QrCode, User, LogOut, Calendar } from "lucide-react";

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Student dashboard layout
 * Provides navigation and user context
 */
export default async function StudentDashboardLayout({
  children,
}: StudentDashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/student");
  }

  if (user.role !== "Student") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="font-semibold text-lg">Student Dashboard</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard/student"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <LayoutDashboard className="inline-block h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/attendance"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <QrCode className="inline-block h-4 w-4 mr-2" />
              Scan QR
            </Link>
            <Link
              href="/events"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <Calendar className="inline-block h-4 w-4 mr-2" />
              Events
            </Link>
          </nav>

          <div className="flex items-center gap-4">
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

      {/* Main Content */}
      <main>{children}</main>

      {/* Mobile Navigation (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <div className="grid grid-cols-3 gap-1 p-2">
          <Link href="/dashboard/student">
            <Button variant="ghost" className="w-full flex-col h-auto py-2">
              <LayoutDashboard className="h-5 w-5 mb-1" />
              <span className="text-xs">Dashboard</span>
            </Button>
          </Link>
          <Link href="/attendance">
            <Button variant="ghost" className="w-full flex-col h-auto py-2">
              <QrCode className="h-5 w-5 mb-1" />
              <span className="text-xs">Scan QR</span>
            </Button>
          </Link>
          <Link href="/events">
            <Button variant="ghost" className="w-full flex-col h-auto py-2">
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">Events</span>
            </Button>
          </Link>
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-20" />
    </div>
  );
}
