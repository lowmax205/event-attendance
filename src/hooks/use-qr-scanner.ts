"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface UseQRScannerReturn {
  startScanning: () => Promise<void>;
  stopScanning: () => Promise<void>;
  isScanning: boolean;
  error: string | null;
}

/**
 * Custom hook for QR code scanning using html5-qrcode library
 * @param onScan - Callback function when QR code is successfully scanned
 * @returns Scanner control functions and state
 */
export function useQRScanner(
  onScan: (payload: string) => void,
): UseQRScannerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementIdRef = useRef<string>(
    `qr-reader-${Math.random().toString(36).substring(2, 9)}`,
  );

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current
          .stop()
          .catch((err) =>
            console.error("Failed to stop scanner on unmount:", err),
          );
      }
    };
  }, [isScanning]);

  const startScanning = async (): Promise<void> => {
    try {
      setError(null);

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementIdRef.current);
      }

      await scannerRef.current.start(
        { facingMode: "environment" }, // Use rear camera on mobile
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // QR scanning box
        },
        (decodedText) => {
          // Success callback
          onScan(decodedText);
        },
        () => {
          // Error callback (ignore, happens when no QR detected in frame)
          // We only show critical errors to user
        },
      );

      setIsScanning(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start QR scanner";
      setError(errorMessage);
      setIsScanning(false);
      console.error("QR Scanner error:", err);
    }
  };

  const stopScanning = async (): Promise<void> => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to stop QR scanner";
      setError(errorMessage);
      console.error("Failed to stop scanner:", err);
    }
  };

  return {
    startScanning,
    stopScanning,
    isScanning,
    error,
  };
}
