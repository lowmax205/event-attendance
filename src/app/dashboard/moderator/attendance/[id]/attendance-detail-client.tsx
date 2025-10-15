"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { verifyAttendance } from "@/actions/attendance/verify";
import { AttendanceForVerification } from "@/actions/attendance/get-for-verification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Check, X } from "lucide-react";

type AttendanceStatus = AttendanceForVerification["verificationStatus"];

interface AttendanceDetailClientProps {
  attendance: AttendanceForVerification;
}

export function AttendanceDetailClient({
  attendance,
}: AttendanceDetailClientProps) {
  const router = useRouter();
  const [disputeNote, setDisputeNote] = useState(attendance.disputeNote ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (decision: "Approved" | "Rejected") => {
    const trimmedNote = disputeNote.trim();

    if (decision === "Rejected") {
      if (!trimmedNote) {
        toast.error("Please provide a reason for rejection");
        return;
      }

      if (trimmedNote.length < 10) {
        toast.error("Rejection reason must be at least 10 characters");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const result = await verifyAttendance(attendance.id, {
        verificationStatus: decision,
        disputeNote: trimmedNote || undefined,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to verify attendance");
        return;
      }

      toast.success(`Attendance ${decision.toLowerCase()} successfully!`);
      router.push("/dashboard/moderator?expanded=true&pendingPage=1");
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

  const formatDateTime = (value: string | null, fallback = "N/A") => {
    if (!value) return fallback;
    return format(new Date(value), "MMM d, yyyy HH:mm:ss");
  };

  const formatDateTimeShort = (value: string, template: string) =>
    format(new Date(value), template);

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
                <p className="font-medium">
                  {attendance.yearLevel
                    ? `Year ${attendance.yearLevel}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Section</Label>
                <p className="font-medium">{attendance.section || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  {formatDateTimeShort(
                    attendance.eventStartDate,
                    "MMM d, yyyy HH:mm",
                  )}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">End Date</Label>
                <p className="font-medium">
                  {formatDateTimeShort(
                    attendance.eventEndDate,
                    "MMM d, yyyy HH:mm",
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check-In Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {attendance.checkInSubmittedAt ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      Check-In Time
                    </Label>
                    <p className="font-medium">
                      {formatDateTime(attendance.checkInSubmittedAt)}
                    </p>
                  </div>
                  {attendance.checkInDistance !== null && (
                    <div>
                      <Label className="text-muted-foreground">
                        Distance from Venue
                      </Label>
                      <p className="font-medium">
                        {attendance.checkInDistance.toFixed(2)} meters
                      </p>
                    </div>
                  )}
                </div>
                {attendance.checkInLatitude !== null &&
                  attendance.checkInLongitude !== null && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Latitude
                        </Label>
                        <p className="font-medium">
                          {attendance.checkInLatitude.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Longitude
                        </Label>
                        <p className="font-medium">
                          {attendance.checkInLongitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No check-in data available
              </p>
            )}
          </CardContent>
        </Card>

        {attendance.checkOutSubmittedAt && (
          <Card>
            <CardHeader>
              <CardTitle>Check-Out Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    Check-Out Time
                  </Label>
                  <p className="font-medium">
                    {formatDateTime(attendance.checkOutSubmittedAt)}
                  </p>
                </div>
                {attendance.checkOutDistance !== null && (
                  <div>
                    <Label className="text-muted-foreground">
                      Distance from Venue
                    </Label>
                    <p className="font-medium">
                      {attendance.checkOutDistance.toFixed(2)} meters
                    </p>
                  </div>
                )}
              </div>
              {attendance.checkOutLatitude !== null &&
                attendance.checkOutLongitude !== null && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Latitude</Label>
                      <p className="font-medium">
                        {attendance.checkOutLatitude.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Longitude</Label>
                      <p className="font-medium">
                        {attendance.checkOutLongitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {(attendance.verifiedByName || attendance.verifiedAt) && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {attendance.verifiedByName && (
                  <div>
                    <Label className="text-muted-foreground">Verified By</Label>
                    <p className="font-medium">{attendance.verifiedByName}</p>
                  </div>
                )}
                {attendance.verifiedAt && (
                  <div>
                    <Label className="text-muted-foreground">Verified At</Label>
                    <p className="font-medium">
                      {formatDateTime(attendance.verifiedAt)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Check-In Photos</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.checkInFrontPhoto || attendance.checkInBackPhoto ? (
              <div className="grid md:grid-cols-2 gap-4">
                {attendance.checkInFrontPhoto && (
                  <div>
                    <Label className="mb-2 block">Front Photo</Label>
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={attendance.checkInFrontPhoto}
                        alt="Check-in front photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                {attendance.checkInBackPhoto && (
                  <div>
                    <Label className="mb-2 block">Back Photo</Label>
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={attendance.checkInBackPhoto}
                        alt="Check-in back photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No check-in photos available
              </p>
            )}
          </CardContent>
        </Card>

        {(attendance.checkOutFrontPhoto || attendance.checkOutBackPhoto) && (
          <Card>
            <CardHeader>
              <CardTitle>Check-Out Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {attendance.checkOutFrontPhoto && (
                  <div>
                    <Label className="mb-2 block">Front Photo</Label>
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={attendance.checkOutFrontPhoto}
                        alt="Check-out front photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                {attendance.checkOutBackPhoto && (
                  <div>
                    <Label className="mb-2 block">Back Photo</Label>
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={attendance.checkOutBackPhoto}
                        alt="Check-out back photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Check-In Signature</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.checkInSignature ? (
              <div className="relative h-40 w-full overflow-hidden rounded-lg border bg-white">
                <Image
                  src={attendance.checkInSignature}
                  alt="Check-in signature"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No check-in signature available
              </p>
            )}
          </CardContent>
        </Card>

        {attendance.checkOutSignature && (
          <Card>
            <CardHeader>
              <CardTitle>Check-Out Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-40 w-full overflow-hidden rounded-lg border bg-white">
                <Image
                  src={attendance.checkOutSignature}
                  alt="Check-out signature"
                  fill
                  className="object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {attendance.verificationStatus === "Pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="disputeNote">
                  Rejection Reason (required when rejecting)
                </Label>
                <Textarea
                  id="disputeNote"
                  placeholder="Provide details if rejecting..."
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
              </div>
            </CardContent>
          </Card>
        )}

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
