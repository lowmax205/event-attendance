"use client";

import { useQRScanner } from "@/hooks/use-qr-scanner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Camera } from "lucide-react";

interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (payload: string) => void;
}

/**
 * QR Scanner modal component
 * Uses html5-qrcode library via custom hook
 */
export function QRScanner({ open, onOpenChange, onScan }: QRScannerProps) {
  const { startScanning, stopScanning, isScanning, error } = useQRScanner(
    (payload) => {
      onScan(payload);
      stopScanning();
      onOpenChange(false);
    },
  );

  const handleOpenChange = async (newOpen: boolean) => {
    if (newOpen) {
      // Request camera permission and start scanning
      await startScanning();
    } else {
      // Stop scanning when closing
      await stopScanning();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="qr-scanner-description"
      >
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription id="qr-scanner-description">
            Point your camera at the event QR code to check in
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera permission error */}
          {error && (
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* QR Scanner container */}
          <div
            className="relative rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-4"
            role="region"
            aria-label="QR code scanner viewport"
          >
            {!isScanning && !error && (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Camera
                  className="h-16 w-16 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  Click &quot;Start Scanner&quot; to begin
                </p>
              </div>
            )}

            {/* html5-qrcode will inject video element here */}
            <div id="qr-reader" className="w-full" aria-live="polite" />
          </div>

          {/* Scanner controls */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              aria-label="Cancel QR code scanning"
            >
              Cancel
            </Button>
            {!isScanning && !error && (
              <Button
                onClick={startScanning}
                aria-label="Start QR code scanner"
              >
                Start Scanner
              </Button>
            )}
            {isScanning && (
              <Button
                variant="secondary"
                onClick={stopScanning}
                aria-label="Stop QR code scanner"
              >
                Stop Scanner
              </Button>
            )}
          </div>

          {/* Accessibility hint */}
          <p
            className="text-xs text-muted-foreground text-center"
            role="status"
          >
            Ensure good lighting and hold the QR code steady
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
