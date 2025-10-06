"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool, RotateCcw } from "lucide-react";

interface SignatureCanvasComponentProps {
  onSignature: (base64Image: string) => void;
  value?: string | null;
}

/**
 * Signature canvas component
 * Allows user to draw signature and exports as transparent PNG
 */
export function SignatureCanvasComponent({
  onSignature,
  value,
}: SignatureCanvasComponentProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setIsEmpty(false);
      // Export as transparent PNG
      const dataUrl = sigCanvas.current.toDataURL("image/png");
      onSignature(dataUrl);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" aria-hidden="true" />
          Digital Signature
        </CardTitle>
        <CardDescription>
          Sign in the box below using your finger or mouse
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Signature canvas */}
        <div
          className="relative rounded-lg border-2 border-dashed border-muted-foreground/25 bg-white dark:bg-slate-950"
          role="region"
          aria-label="Signature drawing area"
        >
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: "w-full h-48 touch-none",
              style: { touchAction: "none" },
              "aria-label": "Draw your signature here",
              role: "img",
            }}
            backgroundColor="transparent"
            penColor="currentColor"
            minWidth={1}
            maxWidth={3}
            onEnd={handleEnd}
          />

          {/* Empty state hint */}
          {isEmpty && !value && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <p className="text-sm text-muted-foreground">Sign here</p>
            </div>
          )}

          {/* Existing signature preview */}
          {value && isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Your previously captured signature"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isEmpty && !value}
            aria-label="Clear signature and start over"
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Clear
          </Button>

          <p
            className="text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {isEmpty && !value
              ? "Draw your signature above"
              : "Signature captured"}
          </p>
        </div>

        {/* Accessibility and keyboard navigation hints */}
        <div className="text-xs text-muted-foreground space-y-1" role="note">
          <p>\u2022 Use a stylus or your finger on touch devices</p>
          <p>\u2022 Sign clearly within the box</p>
          <p>\u2022 Click &quot;Clear&quot; to start over</p>
        </div>
      </CardContent>
    </Card>
  );
}
