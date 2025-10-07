"use client";

import { useState } from "react";

interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  coords: GeolocationCoords | null;
  error: string | null;
  loading: boolean;
  requestPermission: () => Promise<void>;
}

/**
 * Custom hook for accessing device geolocation
 * @returns Current GPS coordinates, error state, loading state, and permission request function
 */
export function useGeolocation(): UseGeolocationReturn {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = "Failed to get location";

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access in your browser settings.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. Please ensure GPS is enabled.";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = err.message || "Unknown location error";
        }

        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true, // Prefer GPS, but allow Wi-Fi positioning as fallback on mobile devices
        timeout: 10000, // 10 second timeout
        maximumAge: 0, // Don't use cached position
      },
    );
  };

  return {
    coords,
    error,
    loading,
    requestPermission,
  };
}

/**
 * Custom hook to detect if user is on a mobile device
 * @returns Boolean indicating if device is mobile
 */
export function useIsMobile(): boolean {
  if (typeof window === "undefined") return false;

  const windowWithOpera = window as Window & { opera?: string };
  const userAgent =
    navigator.userAgent || navigator.vendor || windowWithOpera.opera || "";

  // Check for mobile devices
  const isMobileDevice =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase(),
    );

  // Also check screen size as backup
  const isSmallScreen = window.innerWidth <= 768;

  return isMobileDevice || isSmallScreen;
}
