"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttendanceHistory } from "./attendance-history";
import { QrCode, Calendar, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

interface StudentStats {
  totalAttendances: number;
  approvedAttendances: number;
  pendingAttendances: number;
  upcomingEvents: number;
}

interface UpcomingEvent {
  id: string;
  name: string;
  startDateTime: Date;
  venueName: string;
}

interface AttendanceRecord {
  id: string;
  eventName: string;
  submittedAt: Date;
  verificationStatus: "Pending" | "Approved" | "Rejected" | "Disputed";
}

interface StudentDashboardProps {
  stats: StudentStats;
  attendanceHistory: AttendanceRecord[];
  upcomingEvents: UpcomingEvent[];
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function StudentDashboard({
  stats,
  attendanceHistory,
  upcomingEvents,
  currentPage,
  totalPages,
}: StudentDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Attendances
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttendances}</div>
            <p className="text-xs text-muted-foreground">All time check-ins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.approvedAttendances}
            </div>
            <p className="text-xs text-muted-foreground">
              Verified attendances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAttendances}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events you can attend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startDateTime).toLocaleDateString()} at{" "}
                      {event.venueName}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceHistory
            attendances={attendanceHistory}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>

      {/* Floating QR Scanner Button */}
      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg" asChild>
          <Link href="/attendance">
            <QrCode className="h-6 w-6" />
            <span className="sr-only">Scan QR Code</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
