"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EventDetailDialog } from "@/components/dashboard/moderator/event-management/event-detail-dialog";
import { AttendanceDetailDialog } from "@/components/dashboard/moderator/attendance-management/attendance-detail-dialog";
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ModeratorStats {
  totalEvents: number;
  activeEvents: number;
  pendingVerifications: number;
  totalAttendances: number;
}

interface SystemStats {
  totalUsers: number;
  disputedAttendance: number;
}

interface Event {
  id: string;
  name: string;
  startDateTime: Date;
  status: "Draft" | "Active" | "Completed" | "Cancelled";
  attendanceCount: number;
  creatorName?: string; // For admin view
}

interface PendingVerification {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    UserProfile: {
      studentId: string;
      department: string;
      yearLevel: number;
      section: string | null;
      contactNumber: string | null;
    } | null;
  };
  event: {
    name: string;
    startDateTime: Date;
    venueName: string;
  };
  checkInSubmittedAt: Date | null;
  checkOutSubmittedAt: Date | null;
  checkInFrontPhoto: string | null;
  checkInBackPhoto: string | null;
  checkInSignature: string | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkInDistance: number | null;
  checkOutDistance: number | null;
  checkOutFrontPhoto: string | null;
  checkOutBackPhoto: string | null;
  checkOutSignature: string | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  verificationStatus: "Pending" | "Approved" | "Rejected" | "Disputed";
  disputeNote: string | null;
  appealMessage: string | null;
  resolutionNotes: string | null;
  verifiedAt: Date | null;
  verifiedBy: {
    firstName: string;
    lastName: string;
  } | null;
}

interface ModeratorDashboardProps {
  userRole: "Moderator" | "Administrator";
  stats: ModeratorStats;
  systemStats?: SystemStats; // Only for admins
  myEvents: Event[];
  pendingVerifications: PendingVerification[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  isExpanded?: boolean;
}

const statusColors = {
  Draft: "bg-gray-500",
  Active: "bg-green-500",
  Completed: "bg-blue-500",
  Cancelled: "bg-red-500",
} as const;

export function ModeratorDashboard({
  userRole,
  stats,
  systemStats,
  myEvents,
  pendingVerifications,
  totalItems,
  currentPage,
  totalPages,
  isExpanded = false,
}: ModeratorDashboardProps) {
  const router = useRouter();
  const [selectedVerification, setSelectedVerification] =
    useState<PendingVerification | null>(null);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [viewEventId, setViewEventId] = useState<string | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [showAll, setShowAll] = useState(isExpanded);

  const handleViewAllToggle = () => {
    setShowAll(!showAll);
    // Reload page with appropriate limit
    const params = new URLSearchParams(window.location.search);
    params.set("expanded", (!showAll).toString());
    params.set("page", "1"); // Reset to first page when toggling
    window.location.href = `?${params.toString()}`;
  };

  const handleViewEvent = (eventId: string) => {
    setViewEventId(eventId);
    setIsEventDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Events you created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Verifications
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingVerifications}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Attendances
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttendances}</div>
            <p className="text-xs text-muted-foreground">
              Across all your events
            </p>
          </CardContent>
        </Card>

        {/* Admin-only stats */}
        {systemStats && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Disputed Records
                </CardTitle>
                <Clock className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStats.disputedAttendance}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* My Events Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Events</CardTitle>
          <div className="flex items-center gap-2">
            {totalItems > 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllToggle}
                className="flex items-center gap-2"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    View All
                  </>
                )}
              </Button>
            )}
            <Button asChild>
              <Link href="/dashboard/moderator/events/create">
                Create Event
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendances</TableHead>
                  {userRole === "Administrator" && (
                    <TableHead>Created By</TableHead>
                  )}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myEvents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={userRole === "Administrator" ? 6 : 5}
                      className="h-24 text-center"
                    >
                      No events found. Create your first event!
                    </TableCell>
                  </TableRow>
                ) : (
                  myEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {event.name}
                      </TableCell>
                      <TableCell>
                        {new Date(event.startDateTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[event.status]}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.attendanceCount}</TableCell>
                      {userRole === "Administrator" && (
                        <TableCell>{event.creatorName || "N/A"}</TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleViewEvent(event.id)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {showAll && totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          const params = new URLSearchParams(
                            window.location.search,
                          );
                          params.set("page", (currentPage - 1).toString());
                          window.location.href = `?${params.toString()}`;
                        }
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              const params = new URLSearchParams(
                                window.location.search,
                              );
                              params.set("page", page.toString());
                              window.location.href = `?${params.toString()}`;
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          const params = new URLSearchParams(
                            window.location.search,
                          );
                          params.set("page", (currentPage + 1).toString());
                          window.location.href = `?${params.toString()}`;
                        }
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Verifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Verifications</CardTitle>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/attendance">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingVerifications.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No pending verifications
              </p>
            ) : (
              pendingVerifications.slice(0, 5).map((verification) => (
                <div
                  key={verification.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {verification.user.firstName} {verification.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {verification.event.name}
                    </p>
                    {verification.checkInSubmittedAt && (
                      <p className="text-xs text-muted-foreground">
                        Check-In:{" "}
                        {new Date(
                          verification.checkInSubmittedAt,
                        ).toLocaleString()}
                      </p>
                    )}
                    {verification.checkOutSubmittedAt && (
                      <p className="text-xs text-muted-foreground">
                        Check-Out:{" "}
                        {new Date(
                          verification.checkOutSubmittedAt,
                        ).toLocaleString()}
                      </p>
                    )}
                    {verification.checkInDistance !== null && (
                      <p className="text-xs text-muted-foreground">
                        Check-In Distance:{" "}
                        {verification.checkInDistance.toFixed(1)}m
                      </p>
                    )}
                    {verification.checkOutDistance !== null && (
                      <p className="text-xs text-muted-foreground">
                        Check-Out Distance:{" "}
                        {verification.checkOutDistance.toFixed(1)}m
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVerification(verification);
                        setIsAttendanceDialogOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <EventDetailDialog
        eventId={viewEventId}
        open={isEventDialogOpen}
        onOpenChange={(open) => {
          setIsEventDialogOpen(open);
          if (!open) {
            setViewEventId(null);
          }
        }}
      />

      <AttendanceDetailDialog
        open={isAttendanceDialogOpen}
        onOpenChange={(open) => {
          setIsAttendanceDialogOpen(open);
          if (!open) {
            setSelectedVerification(null);
          }
        }}
        attendance={
          selectedVerification
            ? {
                ...selectedVerification,
                checkInSubmittedAt:
                  selectedVerification.checkInSubmittedAt || new Date(),
                verificationStatus: selectedVerification.verificationStatus as
                  | "Pending"
                  | "Approved"
                  | "Rejected"
                  | "Disputed",
              }
            : null
        }
        onVerify={
          selectedVerification
            ? () => {
                router.push(
                  `/dashboard/moderator/attendance/${selectedVerification.id}`,
                );
              }
            : undefined
        }
      />
    </div>
  );
}
