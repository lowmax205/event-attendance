"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnline } from "@/hooks/use-online";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink, QrCode, Wifi, WifiOff } from "lucide-react";

/**
 * QR Scanner landing page
 * Entry point for attendance check-in process
 */
export default function AttendancePage() {
  const router = useRouter();
  const { isOnline } = useOnline();
  const [eventCode, setEventCode] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  const handleManualNavigation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCode = eventCode.trim();

    if (!trimmedCode) {
      setManualError("Enter the event access code printed below the QR.");
      return;
    }

    setManualError(null);
    router.push(`/attendance/${encodeURIComponent(trimmedCode)}`);
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
              Use your device&apos;s built-in camera or Google Lens to scan the
              event QR code. The QR link will open automatically in your
              browser.
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
          <h2 className="font-semibold text-lg">How to Check In</h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-semibold text-foreground">1.</span>
              <span>
                Open your phone&apos;s camera app or Google Lens. Make sure the
                QR scanning feature is enabled.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-foreground">2.</span>
              <span>
                Point it at the event QR code displayed at the venue and follow
                the link that appears on-screen.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-foreground">3.</span>
              <span>
                Complete the check-in steps (location verification, photos, and
                signature) using the page that opens.
              </span>
            </li>
          </ol>
        </div>

        {/* Manual Entry */}
        <div className="rounded-lg border bg-background p-6 space-y-4">
          <h2 className="font-semibold text-lg">Need to enter it manually?</h2>
          <p className="text-sm text-muted-foreground">
            If your camera can&apos;t open the QR link, type the event access
            code printed under the QR and continue from here.
          </p>
          <form onSubmit={handleManualNavigation} className="space-y-3">
            <div className="space-y-2">
              <Input
                value={eventCode}
                onChange={(event) => setEventCode(event.target.value)}
                placeholder="e.g. evt_123abc"
                aria-label="Event access code"
                aria-invalid={manualError ? true : undefined}
              />
              {manualError && (
                <p className="text-sm text-destructive">{manualError}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="flex-1 sm:flex-none">
                Go to Event
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/events")}
                className="flex-1 sm:flex-none"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Browse Events
              </Button>
            </div>
          </form>
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
    </div>
  );
}
