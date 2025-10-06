"use client";

import { useState, useEffect } from "react";
import { listAttendanceByEvent } from "@/actions/attendance/list-by-event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Download, Filter } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

type AttendanceStatus = "Pending" | "Approved" | "Rejected" | "Disputed";

type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  eventName: string;
  checkInTime: Date;
  verificationStatus: AttendanceStatus;
  photoFrontUrl?: string | null;
};

/**
 * Attendance verification list page
 * Displays pending attendance records for moderator review
 */
export default function AttendanceVerificationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<
    AttendanceRecord[]
  >([]);
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "All">(
    "Pending",
  );

  useEffect(() => {
    async function fetchAttendances() {
      setIsLoading(true);
      try {
        // For now, we'll fetch from a dummy event ID
        // TODO: Add event selection dropdown
        const result = await listAttendanceByEvent("all", { limit: 100 });

        if (!result.success || !result.data) {
          toast.error(result.error || "Failed to load attendance records");
          return;
        }

        const records = result.data.attendances.map((item) => ({
          id: item.id,
          studentId: item.userId,
          studentName: `${item.user.firstName} ${item.user.lastName}`,
          studentNumber: item.user.UserProfile?.studentId || "N/A",
          eventName: "Event", // We'll need to fetch event name separately
          checkInTime: item.submittedAt,
          verificationStatus: item.verificationStatus as AttendanceStatus,
          photoFrontUrl: item.frontPhotoUrl,
        }));

        setAttendances(records);
      } catch (error) {
        console.error("Error fetching attendances:", error);
        toast.error("Failed to load attendance records");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttendances();
  }, []);

  useEffect(() => {
    if (statusFilter === "All") {
      setFilteredAttendances(attendances);
    } else {
      setFilteredAttendances(
        attendances.filter((a) => a.verificationStatus === statusFilter),
      );
    }
  }, [statusFilter, attendances]);

  const handleExportCSV = () => {
    if (filteredAttendances.length === 0) {
      toast.error("No records to export");
      return;
    }

    const headers = [
      "Student Number",
      "Student Name",
      "Event",
      "Check In Time",
      "Status",
    ];
    const csvData = filteredAttendances.map((record) => [
      record.studentNumber,
      record.studentName,
      record.eventName,
      format(record.checkInTime, "yyyy-MM-dd HH:mm:ss"),
      record.verificationStatus,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${statusFilter.toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants = {
      Pending: "secondary" as const,
      Approved: "default" as const,
      Rejected: "destructive" as const,
      Disputed: "outline" as const,
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const pendingCount = attendances.filter(
    (a) => a.verificationStatus === "Pending",
  ).length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Attendance Verification</h1>
        <p className="text-lg text-muted-foreground">
          Review and verify student attendance records
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>
              Attendance Records
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingCount} pending
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as AttendanceStatus | "All")
                }
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttendances.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">
                No {statusFilter !== "All" && statusFilter.toLowerCase()}{" "}
                attendance records found
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Check In Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendances.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.studentNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{record.eventName}</TableCell>
                      <TableCell>
                        {format(record.checkInTime, "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.verificationStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/dashboard/moderator/attendance/${record.id}`}
                        >
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
