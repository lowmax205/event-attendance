"use client";

import { useGeolocation } from "@/hooks/use-geolocation";
import { calculateDistance } from "@/lib/geolocation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface LocationVerifierProps {
  venueLat: number;
  venueLon: number;
  venueName: string;
  onVerified: (latitude: number, longitude: number, distance: number) => void;
}

/**
 * Location verifier component
 * Verifies user is within 100m of venue
 */
export function LocationVerifier({
  venueLat,
  venueLon,
  venueName,
  onVerified,
}: LocationVerifierProps) {
  const { coords, error, loading, requestPermission } = useGeolocation();

  // Calculate distance when coordinates are available
  const distance = coords
    ? calculateDistance(coords.latitude, coords.longitude, venueLat, venueLon)
    : null;

  const isWithinRange = distance !== null && distance <= 100;

  // Auto-verify when within range
  useEffect(() => {
    if (isWithinRange && coords && distance !== null) {
      onVerified(coords.latitude, coords.longitude, distance);
    }
  }, [isWithinRange, coords, distance, onVerified]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Verification
        </CardTitle>
        <CardDescription>Verify you are at {venueName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Getting your location...
            </span>
          </div>
        )}

        {/* Success state - within range */}
        {isWithinRange && distance !== null && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              ✓ You are {distance.toFixed(1)}m from the venue (within 100m
              range)
            </AlertDescription>
          </Alert>
        )}

        {/* Error state - outside range */}
        {distance !== null && distance > 100 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              You are {distance.toFixed(1)}m from the venue. Please move closer
              (max 100m).
            </AlertDescription>
          </Alert>
        )}

        {/* Location details */}
        {coords && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Location:</span>
              <span className="font-mono">
                {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accuracy:</span>
              <span>±{coords.accuracy.toFixed(0)}m</span>
            </div>
            {distance !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Distance to Venue:
                </span>
                <span
                  className={
                    distance <= 100
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {distance.toFixed(1)}m
                </span>
              </div>
            )}
          </div>
        )}

        {/* Request permission button */}
        {!coords && !loading && (
          <Button onClick={requestPermission} className="w-full" size="lg">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location
          </Button>
        )}

        {/* Retry button on error */}
        {error && (
          <Button
            onClick={requestPermission}
            variant="outline"
            className="w-full"
          >
            Try Again
          </Button>
        )}

        {/* Accessibility hint */}
        <p className="text-xs text-muted-foreground text-center">
          GPS accuracy may vary. Ensure location services are enabled.
        </p>
      </CardContent>
    </Card>
  );
}
