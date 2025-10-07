"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  QrCode,
  LogOut,
  User,
  Calendar,
  LayoutDashboard,
  ChevronDown,
  Home,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthModalTrigger } from "@/components/auth/auth-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";

interface Event {
  id: string;
  name: string;
  startDateTime: Date;
  venueName: string;
  status: string;
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on profile or dashboard pages
  const isOnProfilePage =
    pathname === "/profile" || pathname === "/profile/create";
  const isOnDashboardPage = pathname?.startsWith("/dashboard") || false;

  // Fetch upcoming/ongoing events when user is authenticated
  useEffect(() => {
    async function fetchUpcomingEvents() {
      if (!user) return;

      try {
        const response = await fetch("/api/events/upcoming");
        if (response.ok) {
          const data = await response.json();
          setUpcomingEvents(data.events || []);
        }
      } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
      }
    }

    fetchUpcomingEvents();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push("/");
  };

  const getDashboardRoute = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case "Student":
        return "/dashboard/student";
      case "Moderator":
        return "/dashboard/moderator";
      case "Administrator":
        return "/dashboard/admin";
      default:
        return "/dashboard";
    }
  };

  // Public navigation for non-authenticated users
  const publicNavLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/roadmap", label: "RoadMap" },
  ];

  if (isLoading) {
    return (
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-primary" />
              <span className="font-bold text-lg">Event Attendance</span>
            </Link>
            <div className="animate-pulse h-8 w-20 bg-muted rounded" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={user ? getDashboardRoute() : "/"}
            className="flex items-center space-x-2"
          >
            <div className="h-8 w-8 rounded bg-primary" />
            <span className="font-bold text-lg">Event Attendance</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              // Authenticated Navigation
              <>
                <Link
                  href="/"
                  className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link
                  href="/roadmap"
                  className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  <Map className="h-4 w-4" />
                  Roadmap
                </Link>

                {/* Events Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Events
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[300px]">
                    {upcomingEvents.length > 0 ? (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Upcoming & Ongoing Events
                        </div>
                        {upcomingEvents.slice(0, 5).map((event) => (
                          <DropdownMenuItem key={event.id} asChild>
                            <Link
                              href={`/events/${event.id}`}
                              className="flex flex-col items-start py-2"
                            >
                              <span className="font-medium">{event.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(event.startDateTime), "PPp")} •{" "}
                                {event.venueName}
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href="/events"
                            className="w-full text-center font-medium"
                          >
                            View All Events
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                          No upcoming events
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/events" className="w-full text-center">
                            Browse All Events
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-sm">{user.firstName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Role: <span className="font-medium">{user.role}</span>
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {!isOnProfilePage && (
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {!isOnDashboardPage && (
                      <DropdownMenuItem asChild>
                        <Link
                          href={getDashboardRoute()}
                          className="cursor-pointer"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Public Navigation
              <>
                {publicNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <ThemeToggle />
                <AuthModalTrigger />
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {user ? (
                  // Authenticated Mobile Navigation
                  <>
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Role: <span className="font-medium">{user.role}</span>
                      </p>
                    </div>

                    {/* Dashboard Link */}
                    {!isOnDashboardPage && (
                      <Link
                        href={getDashboardRoute()}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-lg font-medium text-foreground/80 hover:text-foreground transition-colors min-h-[44px]"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Link>
                    )}

                    {/* Profile Link */}
                    {!isOnProfilePage && (
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-lg font-medium text-foreground/80 hover:text-foreground transition-colors min-h-[44px]"
                      >
                        <User className="h-5 w-5" />
                        Profile
                      </Link>
                    )}

                    {/* Home Link */}
                    <Link
                      href="/"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-foreground/80 hover:text-foreground transition-colors min-h-[44px]"
                    >
                      <Home className="h-5 w-5" />
                      Home
                    </Link>

                    {/* Roadmap Link */}
                    <Link
                      href="/roadmap"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-foreground/80 hover:text-foreground transition-colors min-h-[44px]"
                    >
                      <Map className="h-5 w-5" />
                      Roadmap
                    </Link>

                    {/* Scan QR Link */}
                    <Link
                      href="/attendance"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-foreground/80 hover:text-foreground transition-colors min-h-[44px]"
                    >
                      <QrCode className="h-5 w-5" />
                      Scan QR
                    </Link>

                    {/* Events Section */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-lg font-medium text-foreground/80 min-h-[44px]">
                        <Calendar className="h-5 w-5" />
                        Events
                      </div>
                      {upcomingEvents.length > 0 ? (
                        <div className="ml-8 space-y-2">
                          {upcomingEvents.slice(0, 3).map((event) => (
                            <Link
                              key={event.id}
                              href={`/events/${event.id}`}
                              onClick={() => setIsOpen(false)}
                              className="block py-2 text-sm text-foreground/70 hover:text-foreground"
                            >
                              <div className="font-medium">{event.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(event.startDateTime), "PP")}
                              </div>
                            </Link>
                          ))}
                          <Link
                            href="/events"
                            onClick={() => setIsOpen(false)}
                            className="block py-2 text-sm font-medium text-primary"
                          >
                            View All Events →
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href="/events"
                          onClick={() => setIsOpen(false)}
                          className="ml-8 block py-2 text-sm text-muted-foreground"
                        >
                          No upcoming events
                        </Link>
                      )}
                    </div>

                    <div className="pt-4 border-t flex items-center gap-2">
                      <ThemeToggle />
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  // Public Mobile Navigation
                  <>
                    {publicNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors min-h-[44px] flex items-center"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <div onClick={() => setIsOpen(false)}>
                        <AuthModalTrigger />
                      </div>
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
