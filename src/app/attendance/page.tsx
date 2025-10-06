"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRScanner } from "@/components/attendance/qr-scanner";
import { useOnline } from "@/hooks/use-online";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, QrCode, Wifi, WifiOff } from "lucide-react";
import { validateQR } from "@/actions/attendance/validate-qr";

/**
 * QR Scanner landing page
 * Entry point for attendance check-in process
 */
export default function AttendancePage() {
  const router = useRouter();
  const { isOnline } = useOnline();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (payload: string) => {
    setIsValidating(true);
    setError(null);

    try {
      // Validate QR code with server
      const result = await validateQR(payload);

      if (!result.success || !result.data) {
        setError(result.error || "Invalid QR code");
        return;
      }

      // Check if validation passed
      if (!result.data.valid) {
        setError(
          result.data.validationErrors.join(". ") ||
            "QR code validation failed",
        );
        return;
      }

      // Redirect to attendance form for this event
      router.push(`/attendance/${result.data.eventId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to validate QR code",
      );
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <QrCode className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Event Check-In</h1>
          <p className="text-muted-foreground">
            Scan the event QR code to mark your attendance
          </p>
        </div>

        {/* Offline Warning Banner */}
        {!isOnline && (
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              Attendance check-in requires an active internet connection. Please
              connect to Wi-Fi or mobile data to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Online Status Indicator */}
        {isOnline && (
          <Alert>
            <Wifi className="h-4 w-4" />
            <AlertTitle>Connected</AlertTitle>
            <AlertDescription>
              Ready to scan. Click the button below to open your camera.
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>QR Code Validation Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Scan QR Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => setScannerOpen(true)}
            disabled={!isOnline || isValidating}
            className="w-full sm:w-auto"
          >
            <QrCode className="mr-2 h-5 w-5" />
            {isValidating ? "Validating..." : "Scan QR Code"}
          </Button>
        </div>

        {/* Instructions */}
        <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
          <h2 className="font-semibold text-lg">How to Check In</h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-semibold text-foreground">1.</span>
              <span>
                Click the &quot;Scan QR Code&quot; button above to open your
                camera
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-foreground">2.</span>
              <span>
                Point your camera at the event QR code displayed at the venue
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-foreground">3.</span>
              <span>
                Complete the attendance form by verifying your location, taking
                photos, and signing
              </span>
            </li>
          </ol>
        </div>

        {/* Requirements Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Requirements</AlertTitle>
          <AlertDescription className="space-y-1">
            <p>To complete check-in, you need:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Active internet connection</li>
              <li>Camera access permission</li>
              <li>Location/GPS permission</li>
              <li>Complete user profile</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleScan}
      />
    </div>
  );
}
