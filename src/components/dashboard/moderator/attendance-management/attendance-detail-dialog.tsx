"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { VerificationStatus } from "@prisma/client";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

interface AttendanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: {
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
      } | null;
    };
    event: {
      name: string;
      startDateTime: Date;
      venueName: string;
    };
    checkInSubmittedAt: Date;
    checkInPhotoFrontUrl: string | null;
    checkInPhotoBackUrl: string | null;
    signatureUrl: string | null;
    checkInLatitude: number | null;
    checkInLongitude: number | null;
    distanceMeters: number | null;
    verificationStatus: VerificationStatus;
    disputeNotes: string | null;
    appealMessage: string | null;
    resolutionNotes: string | null;
    verifiedAt: Date | null;
    verifiedBy: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
  onVerify?: () => void;
}

const statusVariant: Record<
  VerificationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [VerificationStatus.Pending]: "secondary",
  [VerificationStatus.Approved]: "default",
  [VerificationStatus.Rejected]: "destructive",
  [VerificationStatus.Disputed]: "outline",
};

export function AttendanceDetailDialog({
  open,
  onOpenChange,
  attendance,
  onVerify,
}: AttendanceDetailDialogProps) {
  if (!attendance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
          <DialogDescription>
            Complete information for this attendance submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">
                  {attendance.user.firstName} {attendance.user.lastName}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Student ID:</span>
                <p className="font-medium">
                  {attendance.user.UserProfile?.studentId || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{attendance.user.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>
                <p className="font-medium">
                  {attendance.user.UserProfile?.department || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Event Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Event:</span>
                <p className="font-medium">{attendance.event.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Venue:</span>
                <p className="font-medium">{attendance.event.venueName}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Event Date:</span>
                <p className="font-medium">
                  {format(
                    new Date(attendance.event.startDateTime),
                    "MMMM d, yyyy 'at' h:mm a",
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Submission Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">
              Submission Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Submitted At:</span>
                <p className="font-medium">
                  {format(
                    new Date(attendance.checkInSubmittedAt),
                    "MMMM d, yyyy 'at' h:mm a",
                  )}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="mt-1">
                  <Badge variant={statusVariant[attendance.verificationStatus]}>
                    {attendance.verificationStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Distance from Venue:
                </span>
                <p className="font-medium">
                  {attendance.distanceMeters !== null
                    ? `${attendance.distanceMeters.toFixed(0)} meters`
                    : "N/A"}
                </p>
              </div>
              {attendance.checkInLatitude && attendance.checkInLongitude && (
                <div>
                  <span className="text-muted-foreground">
                    GPS Coordinates:
                  </span>
                  <p className="font-medium text-xs">
                    {attendance.checkInLatitude.toFixed(6)},{" "}
                    {attendance.checkInLongitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Photos and Signature */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Photos & Signature</h3>
            <div className="grid grid-cols-3 gap-4">
              {attendance.checkInPhotoFrontUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Front Photo
                  </p>
                  <div className="relative h-40 border rounded overflow-hidden">
                    <Image
                      src={attendance.checkInPhotoFrontUrl}
                      alt="Front photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              {attendance.checkInPhotoBackUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Back Photo
                  </p>
                  <div className="relative h-40 border rounded overflow-hidden">
                    <Image
                      src={attendance.checkInPhotoBackUrl}
                      alt="Back photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              {attendance.signatureUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Signature
                  </p>
                  <div className="relative h-40 border rounded overflow-hidden bg-white">
                    <Image
                      src={attendance.signatureUrl}
                      alt="Signature"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Details */}
          {(attendance.disputeNotes ||
            attendance.appealMessage ||
            attendance.resolutionNotes) && (
            <div>
              <h3 className="font-semibold text-lg mb-3">
                Verification Details
              </h3>
              <div className="space-y-3">
                {attendance.disputeNotes && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Dispute Notes:
                    </span>
                    <p className="text-sm mt-1 p-3 bg-destructive/10 rounded">
                      {attendance.disputeNotes}
                    </p>
                  </div>
                )}
                {attendance.appealMessage && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Appeal Message:
                    </span>
                    <p className="text-sm mt-1 p-3 bg-secondary rounded">
                      {attendance.appealMessage}
                    </p>
                  </div>
                )}
                {attendance.resolutionNotes && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Resolution Notes:
                    </span>
                    <p className="text-sm mt-1 p-3 bg-muted rounded">
                      {attendance.resolutionNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {attendance.verifiedBy && attendance.verifiedAt && (
            <div className="text-sm text-muted-foreground">
              Verified by {attendance.verifiedBy.firstName}{" "}
              {attendance.verifiedBy.lastName} on{" "}
              {format(
                new Date(attendance.verifiedAt),
                "MMMM d, yyyy 'at' h:mm a",
              )}
            </div>
          )}

          {/* Actions */}
          {attendance.verificationStatus === VerificationStatus.Pending &&
            onVerify && (
              <div className="flex justify-end pt-4">
                <Button onClick={onVerify}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Attendance
                </Button>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
