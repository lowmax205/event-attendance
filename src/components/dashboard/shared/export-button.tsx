"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportAttendanceCSV } from "@/actions/export/export-csv";
import { exportAttendanceXLSX } from "@/actions/export/export-xlsx";

export type ExportFormat = "CSV" | "XLSX";

interface ExportButtonProps {
  filters: {
    eventIds?: string[];
    startDate?: string;
    endDate?: string;
    status?: string;
    studentName?: string;
  };
  onExportStart?: () => void;
  onExportComplete?: (downloadUrl: string, format: ExportFormat) => void;
  onExportError?: (error: string) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportButton({
  filters,
  onExportStart,
  onExportComplete,
  onExportError,
  variant = "outline",
  size = "default",
  className,
}: ExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportingFormat, setExportingFormat] = React.useState<
    ExportFormat | null
  >(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      setExportingFormat(format);
      onExportStart?.();

      const exportAction =
        format === "CSV" ? exportAttendanceCSV : exportAttendanceXLSX;

      const result = await exportAction(filters);

      if (!result.success) {
        throw new Error(result.error || "Export failed");
      }

      // Show success toast
      toast({
        title: "Export successful",
        description: `${format} file is ready for download.`,
        variant: "default",
      });

      // Trigger download
      if (result.data?.downloadUrl) {
        window.open(result.data.downloadUrl, "_blank");
        onExportComplete?.(result.data.downloadUrl, format);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to export data";

      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive",
      });

      onExportError?.(errorMessage);
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isExporting}
          aria-label="Export data"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting{exportingFormat ? ` ${exportingFormat}` : ""}...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("CSV")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>CSV File</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("XLSX")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Excel File (.xlsx)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
