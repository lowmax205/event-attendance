"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Printer, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  eventName: string;
  isModerator?: boolean;
  onRegenerate?: () => Promise<void>;
}

export function QRCodeDisplay({
  qrCodeUrl,
  eventName,
  isModerator = false,
  onRegenerate,
}: QRCodeDisplayProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${eventName.replace(/\s+/g, "_")}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded",
      description: "QR code has been downloaded successfully.",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${eventName}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: system-ui, -apple-system, sans-serif;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center;
              }
              img {
                max-width: 400px;
                height: auto;
              }
              @media print {
                @page {
                  margin: 2cm;
                }
              }
            </style>
          </head>
          <body>
            <h1>${eventName}</h1>
            <img src="${qrCodeUrl}" alt="QR Code for ${eventName}" />
            <p style="margin-top: 20px; text-align: center; color: #666;">
              Scan this QR code to check in to the event
            </p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }

    toast({
      title: "Print Dialog Opened",
      description: "QR code is ready to print.",
    });
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) return;

    setIsRegenerating(true);
    try {
      await onRegenerate();
      toast({
        title: "QR Code Regenerated",
        description: "A new QR code has been generated for this event.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to regenerate QR code",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event QR Code</CardTitle>
        <CardDescription>
          Students can scan this code to check in to the event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center rounded-lg border bg-white p-6">
          <Image
            src={qrCodeUrl}
            alt={`QR Code for ${eventName}`}
            width={300}
            height={300}
            className="rounded-lg"
            priority
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>

          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>

          {isModerator && onRegenerate && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Regenerate QR Code?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will invalidate the current QR code and generate a new
                    one. Students with the old QR code will no longer be able to
                    check in. This action is logged for security purposes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? "Regenerating..." : "Regenerate"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
