"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapLocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export function MapLocationPicker({
  onLocationSelect,
  // Surigao Coordinates as default
  initialLatitude = 9.7571312,
  initialLongitude = 125.5137674,
}: MapLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const [locationMode, setLocationMode] = useState<"current" | "picker">(
    "picker",
  );
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLongitude, initialLatitude],
      zoom: 15,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Initialize marker
    marker.current = new mapboxgl.Marker({
      draggable: locationMode === "picker",
      color: "#2563eb",
    })
      .setLngLat([initialLongitude, initialLatitude])
      .addTo(map.current);

    // Handle marker drag end
    marker.current.on("dragend", () => {
      if (marker.current) {
        const lngLat = marker.current.getLngLat();
        setSelectedCoords({ lat: lngLat.lat, lng: lngLat.lng });
      }
    });

    // Handle map click for picker mode
    map.current.on("click", (e) => {
      if (locationMode === "picker" && marker.current && map.current) {
        marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        setSelectedCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [initialLatitude, initialLongitude, locationMode]);

  // Update marker draggability when mode changes
  useEffect(() => {
    if (marker.current) {
      marker.current.setDraggable(locationMode === "picker");
    }
  }, [locationMode]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (map.current && marker.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 17,
            essential: true,
          });

          marker.current.setLngLat([longitude, latitude]);
          setSelectedCoords({ lat: latitude, lng: longitude });
          onLocationSelect(latitude, longitude);

          toast.success("Current location detected");
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to get your location", {
          description:
            "Please enable location services or check your browser permissions.",
        });
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  };

  const handleVerifyLocation = () => {
    if (selectedCoords) {
      onLocationSelect(selectedCoords.lat, selectedCoords.lng);
      toast.success("Location verified and coordinates updated");
    } else {
      toast.error("Please select a location on the map");
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-3">
        <Select
          value={locationMode}
          onValueChange={(value: "current" | "picker") =>
            setLocationMode(value)
          }
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Current Location
              </div>
            </SelectItem>
            <SelectItem value="picker">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Map Picker
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {locationMode === "current" ? (
          <Button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="min-w-[100px]"
          >
            {isLocating ? "Locating..." : "Locate"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleVerifyLocation}
            disabled={!selectedCoords}
            className="min-w-[100px]"
          >
            Verify
          </Button>
        )}
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-[400px] rounded-lg border overflow-hidden"
      />

      {/* Instructions */}
      <p className="text-sm text-muted-foreground">
        {locationMode === "current" ? (
          <>Click &quot;Locate&quot; to use your current location</>
        ) : (
          <>
            Click on the map or drag the marker to select a location, then click
            &quot;Verify&quot;
          </>
        )}
      </p>
    </div>
  );
}
