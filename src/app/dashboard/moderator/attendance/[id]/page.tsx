"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { verifyAttendance } from "@/actions/attendance/verify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { format } from "date-fns";
import { db } from "@/lib/db";

type AttendanceStatus = "Pending" | "Approved" | "Rejected" | "Disputed";

type AttendanceDetail = {
  id: string;
  studentName: string;
  studentNumber: string;
  studentEmail: string;
  department: string;
  yearLevel: number;
  section: string | null;
  eventName: string;
  eventVenue: string;
  eventStartDate: Date;
  eventEndDate: Date;
  submittedAt: Date;
  latitude: number;
  longitude: number;
  distanceFromVenue: number;
  frontPhotoUrl: string;
  backPhotoUrl: string;
  signatureUrl: string;
  verificationStatus: AttendanceStatus;
  verifiedByName?: string;
  verifiedAt?: Date;
  disputeNote?: string | null;
};

/**
 * Individual attendance detail page
 * Allows moderators to review photos/signature and approve/reject attendance
 */
export default function AttendanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attendanceId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceDetail | null>(null);
  const [disputeNote, setDisputeNote] = useState("");

  useEffect(() => {
    async function fetchAttendance() {
      setIsLoading(true);
      try {
        // We need to create a get attendance by ID action
        // For now, we'll simulate it by querying directly
        const record = await db.attendance.findUnique({
          where: { id: attendanceId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                UserProfile: {
                  select: {
                    studentId: true,
                    department: true,
                    yearLevel: true,
                    section: true,
                  },
                },
              },
            },
            event: {
              select: {
                name: true,
                venueName: true,
                startDateTime: true,
                endDateTime: true,
              },
            },
            verifiedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        if (!record) {
          toast.error("Attendance record not found");
          router.push("/dashboard/moderator/attendance");
          return;
        }

        setAttendance({
          id: record.id,
          studentName: `${record.user.firstName} ${record.user.lastName}`,
          studentNumber: record.user.UserProfile?.studentId || "N/A",
          studentEmail: record.user.email,
          department: record.user.UserProfile?.department || "N/A",
          yearLevel: record.user.UserProfile?.yearLevel || 0,
          section: record.user.UserProfile?.section ?? null,
          eventName: record.event.name,
          eventVenue: record.event.venueName,
          eventStartDate: record.event.startDateTime,
          eventEndDate: record.event.endDateTime,
          submittedAt: record.submittedAt,
          latitude: record.latitude,
          longitude: record.longitude,
          distanceFromVenue: record.distanceFromVenue,
          frontPhotoUrl: record.frontPhotoUrl,
          backPhotoUrl: record.backPhotoUrl,
          signatureUrl: record.signatureUrl,
          verificationStatus: record.verificationStatus as AttendanceStatus,
          verifiedByName: record.verifiedBy
            ? `${record.verifiedBy.firstName} ${record.verifiedBy.lastName}`
            : undefined,
          verifiedAt: record.verifiedAt || undefined,
          disputeNote: record.disputeNote,
        });

        if (record.disputeNote) {
          setDisputeNote(record.disputeNote);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        toast.error("Failed to load attendance record");
        router.push("/dashboard/moderator/attendance");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttendance();
  }, [attendanceId, router]);

  const handleVerify = async (
    decision: "Approved" | "Rejected" | "Disputed",
  ) => {
    if (!attendance) return;

    if (decision === "Rejected" && !disputeNote.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (decision === "Disputed" && !disputeNote.trim()) {
      toast.error("Please provide details for the dispute");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyAttendance(attendance.id, {
        verificationStatus: decision,
        disputeNote: disputeNote.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to verify attendance");
        return;
      }

      toast.success(`Attendance ${decision.toLowerCase()} successfully!`);
      router.push("/dashboard/moderator/attendance");
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to verify attendance",
      );
    } finally {
      setIsSubmitting(false);
    }
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

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!attendance) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/moderator/attendance">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Attendance List
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Attendance Details</h1>
            <p className="text-lg text-muted-foreground">
              Review and verify attendance submission
            </p>
          </div>
          {getStatusBadge(attendance.verificationStatus)}
        </div>
      </div>

      <div className="space-y-6">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{attendance.studentName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Student Number</Label>
                <p className="font-medium">{attendance.studentNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{attendance.studentEmail}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Department</Label>
                <p className="font-medium">{attendance.department}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Year Level</Label>
                <p className="font-medium">{attendance.yearLevel}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Section</Label>
                <p className="font-medium">{attendance.section || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label className="text-muted-foreground">Event Name</Label>
              <p className="font-medium">{attendance.eventName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Venue</Label>
              <p className="font-medium">{attendance.eventVenue}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Start Date</Label>
                <p className="font-medium">
                  {format(attendance.eventStartDate, "MMM d, yyyy HH:mm")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">End Date</Label>
                <p className="font-medium">
                  {format(attendance.eventEndDate, "MMM d, yyyy HH:mm")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Details */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Submitted At</Label>
                <p className="font-medium">
                  {format(attendance.submittedAt, "MMM d, yyyy HH:mm:ss")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Distance from Venue
                </Label>
                <p className="font-medium">
                  {attendance.distanceFromVenue.toFixed(2)} meters
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Latitude</Label>
                <p className="font-medium">{attendance.latitude.toFixed(6)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Longitude</Label>
                <p className="font-medium">{attendance.longitude.toFixed(6)}</p>
              </div>
            </div>
            {attendance.verifiedByName && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Verified By</Label>
                  <p className="font-medium">{attendance.verifiedByName}</p>
                </div>
                {attendance.verifiedAt && (
                  <div>
                    <Label className="text-muted-foreground">Verified At</Label>
                    <p className="font-medium">
                      {format(attendance.verifiedAt, "MMM d, yyyy HH:mm:ss")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Submitted Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Front Photo</Label>
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={attendance.frontPhotoUrl}
                    alt="Front photo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Back Photo</Label>
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={attendance.backPhotoUrl}
                    alt="Back photo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader>
            <CardTitle>Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-40 w-full overflow-hidden rounded-lg border bg-white">
              <Image
                src={attendance.signatureUrl}
                alt="Signature"
                fill
                className="object-contain"
              />
            </div>
          </CardContent>
        </Card>

        {/* Verification Actions */}
        {attendance.verificationStatus === "Pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="disputeNote">
                  Dispute Note / Rejection Reason (Optional)
                </Label>
                <Textarea
                  id="disputeNote"
                  placeholder="Provide details if rejecting or disputing..."
                  value={disputeNote}
                  onChange={(e) => setDisputeNote(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleVerify("Approved")}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={() => handleVerify("Rejected")}
                  disabled={isSubmitting}
                  variant="destructive"
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerify("Disputed")}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Dispute
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dispute Note Display (if already verified) */}
        {attendance.disputeNote &&
          attendance.verificationStatus !== "Pending" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {attendance.verificationStatus === "Rejected"
                    ? "Rejection Reason"
                    : "Dispute Note"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {attendance.disputeNote}
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
