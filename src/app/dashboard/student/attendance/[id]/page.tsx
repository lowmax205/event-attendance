import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { appealAttendance } from "@/actions/attendance/appeal";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Attendance Details | Event Attendance",
  description: "View attendance details and request review",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function AttendanceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || user.role !== "Student") {
    redirect("/auth/login");
  }

  // Fetch attendance record with event details
  const attendance = await db.attendance.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          name: true,
          venueName: true,
          startDateTime: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
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

  if (!attendance) {
    redirect("/dashboard/student");
  }

  // Verify ownership
  if (attendance.userId !== user.userId) {
    redirect("/dashboard/student");
  }

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Disputed: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
          <CardDescription>
            Submitted on {new Date(attendance.submittedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Event Information</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Event Name
                </dt>
                <dd className="text-sm">{attendance.event.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Venue
                </dt>
                <dd className="text-sm">{attendance.event.venueName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Event Date
                </dt>
                <dd className="text-sm">
                  {new Date(attendance.event.startDateTime).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Distance from Venue
                </dt>
                <dd className="text-sm">
                  {attendance.distanceFromVenue.toFixed(1)} meters
                </dd>
              </div>
            </dl>
          </div>

          {/* Verification Status */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Verification Status</h3>
            <div className="flex items-center gap-4">
              <Badge
                className={
                  statusColors[attendance.verificationStatus] ||
                  "bg-gray-100 text-gray-800"
                }
              >
                {attendance.verificationStatus}
              </Badge>
              {attendance.verifiedBy && (
                <span className="text-sm text-muted-foreground">
                  Verified by {attendance.verifiedBy.firstName}{" "}
                  {attendance.verifiedBy.lastName}
                  {attendance.verifiedAt && (
                    <> on {new Date(attendance.verifiedAt).toLocaleString()}</>
                  )}
                </span>
              )}
            </div>
            {attendance.disputeNote && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Note from Moderator:</p>
                <p className="text-sm">{attendance.disputeNote}</p>
              </div>
            )}
          </div>

          {/* Photos */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Submitted Photos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Front Photo</p>
                <div className="relative aspect-square rounded-md overflow-hidden border">
                  <Image
                    src={attendance.frontPhotoUrl}
                    alt="Front photo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Back Photo</p>
                <div className="relative aspect-square rounded-md overflow-hidden border">
                  <Image
                    src={attendance.backPhotoUrl}
                    alt="Back photo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Digital Signature</h3>
            <div className="relative w-full max-w-md h-32 rounded-md overflow-hidden border bg-white">
              <Image
                src={attendance.signatureUrl}
                alt="Digital signature"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Appeal Form - Only show for Rejected status */}
          {attendance.verificationStatus === "Rejected" && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Request Review</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you believe your attendance was incorrectly rejected, you can
                request a review from an administrator. Please provide details
                about why you think this decision should be reconsidered.
              </p>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const appealMessage = formData.get("appealMessage") as string;
                  const result = await appealAttendance({
                    attendanceId: id,
                    appealMessage,
                  });

                  if (result.success) {
                    redirect("/dashboard/student");
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="appealMessage">Appeal Message</Label>
                    <Textarea
                      id="appealMessage"
                      name="appealMessage"
                      placeholder="Explain why you believe this attendance should be approved..."
                      required
                      minLength={10}
                      maxLength={1000}
                      rows={6}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 10 characters, maximum 1000 characters
                    </p>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto">
                    Submit Appeal
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Show message if already disputed */}
          {attendance.verificationStatus === "Disputed" && (
            <div className="border-t pt-6">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm font-medium text-orange-800">
                  Your appeal is under review by an administrator.
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  You will be notified once a decision has been made.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendanceDetailPage;
