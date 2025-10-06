"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { QRScanner } from "./qr-scanner";
import { LocationVerifier } from "./location-verifier";
import { CameraCapture } from "./camera-capture";
import { SignatureCanvasComponent } from "./signature-canvas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateQR } from "@/actions/attendance/validate-qr";
import { submitAttendance } from "@/actions/attendance/submit";
import { z } from "zod";

// Form validation schema
const attendanceFormSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  eventName: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  frontPhoto: z.string().min(1, "Front photo is required"),
  backPhoto: z.string().min(1, "Back photo is required"),
  signature: z.string().min(1, "Signature is required"),
});

type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

const STEPS = [
  { id: 1, name: "Scan QR Code", description: "Scan the event QR code" },
  { id: 2, name: "Verify Location", description: "Confirm your location" },
  { id: 3, name: "Front Photo", description: "Take your front photo" },
  { id: 4, name: "Back Photo", description: "Take your back photo" },
  { id: 5, name: "Signature", description: "Sign digitally" },
  { id: 6, name: "Review & Submit", description: "Review and submit" },
];

export function AttendanceForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(true);
  const [frontCameraOpen, setFrontCameraOpen] = useState(false);
  const [backCameraOpen, setBackCameraOpen] = useState(false);
  const [eventData, setEventData] = useState<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      eventId: "",
      eventName: "",
      latitude: 0,
      longitude: 0,
      frontPhoto: "",
      backPhoto: "",
      signature: "",
    },
  });

  // Handle QR code scan
  const handleQRScanned = async (qrData: string) => {
    try {
      const result = await validateQR({ qrPayload: qrData });

      if (!result.success || !result.data) {
        toast.error(result.error || "Invalid QR code");
        return;
      }

      // Check if validation passed
      if (!result.data.valid) {
        toast.error(
          result.data.validationErrors.join(", ") || "Validation failed",
        );
        return;
      }

      // Store event data
      setEventData({
        id: result.data.event.id,
        name: result.data.event.name,
        latitude: result.data.event.venueLatitude,
        longitude: result.data.event.venueLongitude,
      });

      // Update form
      form.setValue("eventId", result.data.event.id);
      form.setValue("eventName", result.data.event.name);

      // Close scanner and move to next step
      setQrScannerOpen(false);
      setCurrentStep(2);
      toast.success(`Event: ${result.data.event.name}`);
    } catch (error) {
      console.error("QR validation error:", error);
      toast.error("Failed to validate QR code");
    }
  };

  // Handle location verification
  const handleLocationVerified = (
    lat: number,
    lng: number,
    distance: number,
  ) => {
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
    setCurrentStep(3);
    toast.success(`Location verified (${distance.toFixed(0)}m from venue)`);
  };

  // Handle photo capture
  const handleFrontPhoto = (photo: string) => {
    form.setValue("frontPhoto", photo);
    setFrontCameraOpen(false);
    setCurrentStep(4);
  };

  const handleBackPhoto = (photo: string) => {
    form.setValue("backPhoto", photo);
    setBackCameraOpen(false);
    setCurrentStep(5);
  };

  // Handle signature
  const handleSignature = (signature: string) => {
    form.setValue("signature", signature);
  };

  // Handle form submission
  const onSubmit = async (data: AttendanceFormData) => {
    setIsSubmitting(true);

    try {
      const result = await submitAttendance({
        eventId: data.eventId,
        latitude: data.latitude,
        longitude: data.longitude,
        frontPhoto: data.frontPhoto,
        backPhoto: data.backPhoto,
        signature: data.signature,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to submit attendance");
        return;
      }

      toast.success("Attendance submitted successfully!");
      router.push(`/attendance/${data.eventId}/success`);
    } catch (error) {
      console.error("Attendance submission error:", error);
      toast.error("Failed to submit attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation helpers
  const goToNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 2) {
      // Can't go back before location verification
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* QR Scanner Modal */}
      <QRScanner
        open={qrScannerOpen}
        onOpenChange={setQrScannerOpen}
        onScan={handleQRScanned}
      />

      {/* Progress Header */}
      {eventData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{eventData.name}</CardTitle>
                <CardDescription>
                  Step {currentStep} of {STEPS.length}:{" "}
                  {STEPS[currentStep - 1].name}
                </CardDescription>
              </div>
              <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 2: Location Verification */}
        {currentStep === 2 && eventData && (
          <LocationVerifier
            venueLat={eventData.latitude}
            venueLon={eventData.longitude}
            venueName={eventData.name}
            onVerified={handleLocationVerified}
          />
        )}

        {/* Step 3: Front Photo */}
        {currentStep === 3 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Front Photo</CardTitle>
                <CardDescription>
                  Take a clear photo facing the camera
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setFrontCameraOpen(true)}
                  className="w-full"
                >
                  Open Camera
                </Button>
              </CardContent>
            </Card>
            <CameraCapture
              open={frontCameraOpen}
              onOpenChange={setFrontCameraOpen}
              onCapture={handleFrontPhoto}
              title="Front Photo"
              description="Face the camera and take a clear photo"
              facingMode="user"
            />
          </>
        )}

        {/* Step 4: Back Photo */}
        {currentStep === 4 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Back Photo</CardTitle>
                <CardDescription>
                  Take a photo with your back facing the camera
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setBackCameraOpen(true)}
                  className="w-full"
                >
                  Open Camera
                </Button>
              </CardContent>
            </Card>
            <CameraCapture
              open={backCameraOpen}
              onOpenChange={setBackCameraOpen}
              onCapture={handleBackPhoto}
              title="Back Photo"
              description="Turn your back to the camera and take a photo"
              facingMode="environment"
            />
          </>
        )}

        {/* Step 5: Signature */}
        {currentStep === 5 && (
          <SignatureCanvasComponent
            onSignature={handleSignature}
            value={form.watch("signature")}
          />
        )}

        {/* Step 6: Review & Submit */}
        {currentStep === 6 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Submission</CardTitle>
              <CardDescription>
                Please review all information before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Info */}
              <div>
                <h3 className="font-semibold mb-2">Event</h3>
                <p className="text-sm text-muted-foreground">
                  {eventData?.name}
                </p>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Location Verified
                </h3>
                <p className="text-sm text-muted-foreground">
                  Within 100m of event venue
                </p>
              </div>

              {/* Photos */}
              <div>
                <h3 className="font-semibold mb-2">Photos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.watch("frontPhoto")}
                    alt="Front photo"
                    className="rounded-lg border h-40 w-full object-cover"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.watch("backPhoto")}
                    alt="Back photo"
                    className="rounded-lg border h-40 w-full object-cover"
                  />
                </div>
              </div>

              {/* Signature */}
              <div>
                <h3 className="font-semibold mb-2">Signature</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.watch("signature")}
                  alt="Signature"
                  className="rounded-lg border h-32 w-full object-contain bg-white dark:bg-slate-950"
                />
              </div>

              {/* Submission Info */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your attendance will be pending verification by a moderator.
                  You will be notified once it is verified.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep > 1 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 2 || isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < 6 ? (
            <Button
              onClick={goToNextStep}
              disabled={
                (currentStep === 3 && !form.watch("frontPhoto")) ||
                (currentStep === 4 && !form.watch("backPhoto")) ||
                (currentStep === 5 && !form.watch("signature"))
              }
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submit Attendance
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
