"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventById } from "@/actions/events/get-by-id";
import { regenerateQRCode } from "@/actions/events/generate-qr";
import { useToast } from "@/hooks/use-toast";
import { EventStatus } from "@prisma/client";
import { format } from "date-fns";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Printer,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const statusVariant: Record<
  EventStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Active: "default",
  Completed: "secondary",
  Cancelled: "destructive",
};

interface EventDetailDialogProps {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EventDetailState = {
  id: string;
  name: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  venueName: string;
  venueAddress: string | null;
  venueLatitude: number;
  venueLongitude: number;
  checkInBufferMins: number;
  checkOutBufferMins: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  qrCodeUrl: string | null;
  qrCodePayload: string | null;
  _count: {
    attendances: number;
  };
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
  };
};

export function EventDetailDialog({
  eventId,
  open,
  onOpenChange,
}: EventDetailDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [event, setEvent] = React.useState<EventDetailState | null>(null);
  const [isRegenerating, startRegeneration] = React.useTransition();
  const [copied, setCopied] = React.useState(false);
  const copyResetRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (copyResetRef.current) {
        clearTimeout(copyResetRef.current);
      }
    };
  }, []);

  const shareUrl = React.useMemo(() => {
    if (!event) {
      return "";
    }

    if (event.qrCodePayload) {
      return event.qrCodePayload;
    }

    const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "";

    if (envBaseUrl) {
      return `${envBaseUrl}/attendance/${event.id}`;
    }

    if (typeof window !== "undefined") {
      return `${window.location.origin}/attendance/${event.id}`;
    }

    return `/attendance/${event.id}`;
  }, [event]);

  const handleOpenShareUrl = React.useCallback(() => {
    if (!shareUrl) {
      toast({
        title: "No URL available",
        description: "Generate a QR code before opening the attendance form.",
      });
      return;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [shareUrl, toast]);

  const handleCopyShareUrl = React.useCallback(async () => {
    if (!shareUrl) {
      toast({
        title: "No URL available",
        description: "Generate a QR code before copying the link.",
      });
      return;
    }

    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      if (copyResetRef.current) {
        clearTimeout(copyResetRef.current);
      }

      copyResetRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);

      toast({
        title: "Link copied",
        description: "Attendance link copied to clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy attendance link", error);
      setCopied(false);
      toast({
        title: "Copy failed",
        description:
          error instanceof Error ? error.message : "Clipboard access denied.",
        variant: "destructive",
      });
    }
  }, [shareUrl, toast, copyResetRef]);

  const handlePrintQrCode = React.useCallback(() => {
    if (!event?.qrCodeUrl) {
      toast({
        title: "QR code unavailable",
        description: "Generate or refresh the QR code before printing.",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer");

    if (!printWindow) {
      toast({
        title: "Print blocked",
        description: "Allow pop-ups to print the QR code.",
        variant: "destructive",
      });
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>QR Code for ${event.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; margin: 0; padding: 24px; }
            img { max-width: 100%; height: auto; }
            h1 { font-size: 18px; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <h1>${event.name} Attendance</h1>
          <img src="${event.qrCodeUrl}" alt="QR code for ${event.name}" />
          <p style="margin-top:12px;font-size:12px;color:#555;">${shareUrl}</p>
          <script>window.onload = () => { window.focus(); window.print(); };</script>
        </body>
      </html>`);

    printWindow.document.close();
  }, [event, shareUrl, toast]);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchEventDetails(id: string) {
      setIsLoading(true);
      try {
        const result = await getEventById(id);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to load event details");
        }

        if (!isMounted) return;

        const data = result.data;
        setEvent({
          id: data.id,
          name: data.name,
          description: data.description ?? null,
          startDateTime: data.startDateTime.toString(),
          endDateTime: data.endDateTime.toString(),
          venueName: data.venueName,
          venueAddress: data.venueAddress ?? null,
          venueLatitude: data.venueLatitude,
          venueLongitude: data.venueLongitude,
          checkInBufferMins: data.checkInBufferMins,
          checkOutBufferMins: data.checkOutBufferMins,
          status: data.status,
          createdAt: data.createdAt.toString(),
          updatedAt: data.updatedAt.toString(),
          qrCodeUrl: data.qrCodeUrl ?? null,
          qrCodePayload: data.qrCodePayload ?? null,
          _count: data._count,
          createdBy: {
            id: data.createdBy.id,
            firstName: data.createdBy.firstName,
            lastName: data.createdBy.lastName,
            email: data.createdBy.email,
            role: data.createdBy.role,
          },
        });
      } catch (error) {
        console.error("Failed to load event details", error);
        toast({
          title: "Unable to load event",
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong while loading the event.",
          variant: "destructive",
        });
        if (isMounted) {
          setEvent(null);
          onOpenChange(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (open && eventId) {
      void fetchEventDetails(eventId);
    }

    if (!open) {
      setEvent(null);
    }

    return () => {
      isMounted = false;
    };
  }, [eventId, open, onOpenChange, toast]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!event) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    return (
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl font-semibold">
                {event.name}
              </DialogTitle>
              <Badge variant={statusVariant[event.status] ?? "outline"}>
                {event.status}
              </Badge>
            </div>
            <DialogDescription>
              Overview of this event, including schedule, venue, and attendance
              summary.
            </DialogDescription>
          </div>

          {event.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <p className="text-sm leading-6 text-foreground/90 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Schedule
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Starts</p>
                  <p className="font-medium">
                    {format(startDate, "MMMM d, yyyy • h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ends</p>
                  <p className="font-medium">
                    {format(endDate, "MMMM d, yyyy • h:mm a")}
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Check-in buffer
                    </p>
                    <p className="font-medium">
                      {event.checkInBufferMins} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Check-out buffer
                    </p>
                    <p className="font-medium">
                      {event.checkOutBufferMins} minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Venue
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{event.venueName}</p>
                  {event.venueAddress && (
                    <p className="text-xs text-muted-foreground">
                      {event.venueAddress}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Coordinates
                  </p>
                  <p className="font-medium">
                    {event.venueLatitude.toFixed(6)},{" "}
                    {event.venueLongitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Attendance Snapshot
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total submissions</span>
                <span className="font-semibold">
                  {event._count.attendances}
                </span>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Created By
              </h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {[event.createdBy.firstName, event.createdBy.lastName]
                    .filter(Boolean)
                    .join(" ") || event.createdBy.email}
                </p>
                <p className="text-muted-foreground text-xs">
                  {event.createdBy.email}
                </p>
                <p className="text-muted-foreground text-xs">
                  Role: {event.createdBy.role}
                </p>
                <Separator />
                <p className="text-muted-foreground text-xs">
                  Created {format(new Date(event.createdAt), "PPP p")}
                </p>
                <p className="text-muted-foreground text-xs">
                  Updated {format(new Date(event.updatedAt), "PPP p")}
                </p>
              </div>
            </div>
          </div>

          {event.qrCodeUrl && (
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                QR Code
              </h3>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <p>
                  Regenerating creates a brand-new QR code and invalidates any
                  previously shared copies.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!event) {
                      return;
                    }

                    const confirmed = window.confirm(
                      "Resetting the QR code will immediately invalidate the existing one. Continue?",
                    );

                    if (!confirmed) {
                      return;
                    }

                    startRegeneration(async () => {
                      const result = await regenerateQRCode(event.id);

                      if (!result.success || !result.data) {
                        toast({
                          title: "Failed to regenerate",
                          description:
                            result.error ||
                            "Something went wrong while regenerating the QR code.",
                          variant: "destructive",
                        });
                        return;
                      }

                      setEvent((previous) =>
                        previous
                          ? {
                              ...previous,
                              qrCodeUrl: result.data.qrCodeUrl ?? null,
                              qrCodePayload: result.data.qrCodePayload ?? null,
                              updatedAt: result.data.regeneratedAt.toString(),
                            }
                          : previous,
                      );

                      toast({
                        title: "QR code regenerated",
                        description:
                          "Share the newly generated QR code with attendees.",
                      });
                    });
                  }}
                  disabled={
                    isRegenerating || (event?.status ?? "Active") !== "Active"
                  }
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Regenerating…
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-3.5 w-3.5" />
                      Reset QR Code
                    </>
                  )}
                </Button>
              </div>
              {event.status !== "Active" && (
                <p className="mt-1 text-xs text-destructive">
                  QR regeneration is only available while the event is active.
                </p>
              )}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Attendance Link
                  </p>
                  {copied && (
                    <span className="text-xs text-emerald-600">Copied!</span>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code
                    className="w-full truncate rounded border bg-muted px-3 py-2 text-xs"
                    title={shareUrl || "Attendance link unavailable"}
                  >
                    {shareUrl || "Attendance link unavailable"}
                  </code>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenShareUrl}
                      disabled={!shareUrl}
                      aria-label="Open attendance form in a new tab"
                    >
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      Open
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyShareUrl}
                      disabled={!shareUrl}
                      aria-label="Copy attendance link to clipboard"
                    >
                      {copied ? (
                        <Check className="mr-1.5 h-4 w-4" />
                      ) : (
                        <Copy className="mr-1.5 h-4 w-4" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePrintQrCode}
                      disabled={!event.qrCodeUrl}
                      aria-label="Print QR code"
                    >
                      <Printer className="mr-1.5 h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.qrCodeUrl}
                  alt={`QR code for ${event.name}`}
                  className="h-40 w-40 rounded border"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Event details
          </DialogTitle>
          <DialogDescription>
            Detailed information for the selected event.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
