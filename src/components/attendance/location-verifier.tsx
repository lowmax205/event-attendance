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
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Helper function to convert meters to pixels at max zoom
function metersToPixelsAtMaxZoom(meters: number, latitude: number) {
  return meters / 0.075 / Math.cos((latitude * Math.PI) / 180);
}

interface LocationVerifierProps {
  venueLat: number;
  venueLon: number;
  venueName: string;
  onVerified: (latitude: number, longitude: number, distance: number) => void;
}

export function LocationVerifier({
  venueLat,
  venueLon,
  venueName,
  onVerified,
}: LocationVerifierProps) {
  const { coords, error, loading, requestPermission } = useGeolocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const venueMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Calculate distance when coordinates are available
  const distance = coords
    ? calculateDistance(coords.latitude, coords.longitude, venueLat, venueLon)
    : null;

  const isWithinRange = distance !== null && distance <= 100;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [venueLon, venueLat],
      zoom: 16,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add venue marker (red)
    venueMarker.current = new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat([venueLon, venueLat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <strong>${venueName}</strong>
            <p class="text-sm text-gray-600">Event Venue</p>
          </div>`,
        ),
      )
      .addTo(map.current);

    // Draw 100m radius circle around venue
    map.current.on("load", () => {
      if (!map.current) return;

      // Add circle source and layer
      map.current.addSource("venue-radius", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [venueLon, venueLat],
          },
        },
      });

      // Add circle layer (100m radius)
      map.current.addLayer({
        id: "venue-circle",
        type: "circle",
        source: "venue-radius",
        paint: {
          "circle-radius": {
            stops: [
              [0, 0],
              [20, metersToPixelsAtMaxZoom(100, venueLat)],
            ],
            base: 2,
          },
          "circle-color": "#22c55e",
          "circle-opacity": 0.1,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#22c55e",
          "circle-stroke-opacity": 0.8,
        },
      });

      setMapInitialized(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [venueLat, venueLon, venueName]);

  // Update user marker when coordinates change
  useEffect(() => {
    if (!map.current || !coords || !mapInitialized) return;

    // Remove old user marker if exists
    if (userMarker.current) {
      userMarker.current.remove();
    }

    // Add new user marker (blue)
    userMarker.current = new mapboxgl.Marker({ color: "#3b82f6" })
      .setLngLat([coords.longitude, coords.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <strong>Your Location</strong>
            <p class="text-sm text-gray-600">
              ${distance !== null ? `${distance.toFixed(1)}m from venue` : ""}
            </p>
          </div>`,
        ),
      )
      .addTo(map.current);

    // Fit map to show both markers
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([venueLon, venueLat]);
    bounds.extend([coords.longitude, coords.latitude]);

    map.current.fitBounds(bounds, {
      padding: 80,
      maxZoom: 17,
      duration: 1000,
    });
  }, [coords, venueLat, venueLon, distance, mapInitialized]);

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

        {/* Map Visualization */}
        {coords && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Location Map</h3>
            <div
              ref={mapContainer}
              className="w-full h-[350px] rounded-lg border overflow-hidden"
            />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Your Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Event Venue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-green-500" />
                <span>100m Radius</span>
              </div>
            </div>
          </div>
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
