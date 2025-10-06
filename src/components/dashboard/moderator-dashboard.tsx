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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Users, CheckCircle, Clock, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface ModeratorStats {
  totalEvents: number;
  activeEvents: number;
  pendingVerifications: number;
  totalAttendances: number;
}

interface Event {
  id: string;
  name: string;
  startDateTime: Date;
  status: "Draft" | "Active" | "Completed" | "Cancelled";
  attendanceCount: number;
}

interface PendingVerification {
  id: string;
  studentName: string;
  eventName: string;
  submittedAt: Date;
  frontPhotoUrl: string;
  backPhotoUrl: string;
  signatureUrl: string;
  distanceFromVenue: number;
}

interface ModeratorDashboardProps {
  stats: ModeratorStats;
  myEvents: Event[];
  pendingVerifications: PendingVerification[];
}

const statusColors = {
  Draft: "bg-gray-500",
  Active: "bg-green-500",
  Completed: "bg-blue-500",
  Cancelled: "bg-red-500",
} as const;

export function ModeratorDashboard({
  stats,
  myEvents,
  pendingVerifications,
}: ModeratorDashboardProps) {
  const [selectedVerification, setSelectedVerification] =
    useState<PendingVerification | null>(null);

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
      </div>

      {/* My Events Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Events</CardTitle>
          <Button asChild>
            <Link href="/dashboard/moderator/events/create">Create Event</Link>
          </Button>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No events found. Create your first event!
                    </TableCell>
                  </TableRow>
                ) : (
                  myEvents.slice(0, 5).map((event) => (
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
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/moderator/events/${event.id}/edit`}
                          >
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {myEvents.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/moderator/events">View All Events</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Verifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Verifications</CardTitle>
          <Button variant="outline" asChild>
            <Link href="/dashboard/moderator/attendance">View All</Link>
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
                    <p className="font-medium">{verification.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {verification.eventName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted:{" "}
                      {new Date(verification.submittedAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Distance: {verification.distanceFromVenue.toFixed(1)}m
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVerification(verification)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Attendance Preview</DialogTitle>
                        </DialogHeader>
                        {selectedVerification && (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="mb-2 text-sm font-medium">
                                  Front Photo
                                </p>
                                <Image
                                  src={selectedVerification.frontPhotoUrl}
                                  alt="Front photo"
                                  width={300}
                                  height={300}
                                  className="rounded-lg border"
                                />
                              </div>
                              <div>
                                <p className="mb-2 text-sm font-medium">
                                  Back Photo
                                </p>
                                <Image
                                  src={selectedVerification.backPhotoUrl}
                                  alt="Back photo"
                                  width={300}
                                  height={300}
                                  className="rounded-lg border"
                                />
                              </div>
                            </div>
                            <div>
                              <p className="mb-2 text-sm font-medium">
                                Signature
                              </p>
                              <Image
                                src={selectedVerification.signatureUrl}
                                alt="Signature"
                                width={400}
                                height={150}
                                className="rounded-lg border bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" asChild>
                      <Link
                        href={`/dashboard/moderator/attendance/${verification.id}`}
                      >
                        Verify
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
