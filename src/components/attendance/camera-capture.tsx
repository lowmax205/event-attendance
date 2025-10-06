"use client";

import { useCamera } from "@/hooks/use-camera";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, RotateCcw, Check, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (base64Image: string) => void;
  title: string;
  description: string;
  facingMode?: "user" | "environment";
}

/**
 * Camera capture dialog component
 * Captures photos and returns base64 image
 */
export function CameraCapture({
  open,
  onOpenChange,
  onCapture,
  title,
  description,
  facingMode = "environment",
}: CameraCaptureProps) {
  const { stream, error, requestPermission, capture, stopCamera } =
    useCamera(facingMode);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Setup video stream when component mounts or stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleOpenChange = async (newOpen: boolean) => {
    if (newOpen) {
      setCapturedImage(null);
      await requestPermission();
    } else {
      stopCamera();
      setCapturedImage(null);
    }
    onOpenChange(newOpen);
  };

  const handleCapture = async () => {
    const image = await capture();
    if (image) {
      setCapturedImage(image);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera permission error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Video preview or captured image */}
          <div className="relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 overflow-hidden">
            {capturedImage ? (
              // Show captured image
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : stream ? (
              // Show live camera feed
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              // Placeholder
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Camera className="h-16 w-16 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Camera not active
                </p>
              </div>
            )}
          </div>

          {/* Accessibility hints */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Ensure good lighting for clear photos</p>
            <p>• Hold the camera steady</p>
            <p>• Make sure the subject fills the frame</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>

          {!capturedImage && stream && (
            <Button onClick={handleCapture}>
              <Camera className="mr-2 h-4 w-4" />
              Capture Photo
            </Button>
          )}

          {capturedImage && (
            <>
              <Button variant="outline" onClick={handleRetake}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button onClick={handleConfirm}>
                <Check className="mr-2 h-4 w-4" />
                Use This Photo
              </Button>
            </>
          )}

          {!stream && !error && (
            <Button onClick={requestPermission}>
              <Camera className="mr-2 h-4 w-4" />
              Enable Camera
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
