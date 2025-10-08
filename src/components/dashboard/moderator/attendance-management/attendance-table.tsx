"use client";

import * as React from "react";
import { DataTable } from "@/components/dashboard/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, CheckCircle } from "lucide-react";
import { VerificationStatus } from "@prisma/client";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";

export interface AttendanceRow {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    UserProfile: {
      studentId: string;
      department: string;
    } | null;
  };
  event: {
    id: string;
    name: string;
  };
  checkInSubmittedAt: Date;
  verificationStatus: VerificationStatus;
  distanceMeters: number | null;
}

interface AttendanceTableProps {
  attendances: AttendanceRow[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  onPaginationChange: (pageIndex: number) => void;
  onViewDetails: (attendanceId: string) => void;
  onVerify: (attendanceId: string) => void;
  isLoading?: boolean;
}

const statusVariant: Record<
  VerificationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [VerificationStatus.Pending]: "secondary",
  [VerificationStatus.Approved]: "default",
  [VerificationStatus.Rejected]: "destructive",
  [VerificationStatus.Disputed]: "outline",
};

export function AttendanceTable({
  attendances,
  pagination,
  onPaginationChange,
  onViewDetails,
  onVerify,
  isLoading = false,
}: AttendanceTableProps) {
  const columns: ColumnDef<AttendanceRow>[] = [
    {
      accessorKey: "user",
      header: "Student",
      cell: ({ row }) => (
        <div className="min-w-[200px]">
          <div className="font-medium">
            {row.original.user.firstName} {row.original.user.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.user.UserProfile?.studentId || "N/A"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "event.name",
      header: "Event",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.original.event.name}</div>
      ),
    },
    {
      accessorKey: "checkInSubmittedAt",
      header: "Submission Time",
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          <div>
            {format(new Date(row.original.checkInSubmittedAt), "MMM d, yyyy")}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(row.original.checkInSubmittedAt), "h:mm a")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "verificationStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.verificationStatus]}>
          {row.original.verificationStatus}
        </Badge>
      ),
    },
    {
      accessorKey: "distanceMeters",
      header: "Distance",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.distanceMeters !== null &&
          row.original.distanceMeters !== undefined
            ? `${row.original.distanceMeters.toFixed(0)}m`
            : "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetails(row.original.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {row.original.verificationStatus === VerificationStatus.Pending && (
              <DropdownMenuItem onClick={() => onVerify(row.original.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={attendances}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      isLoading={isLoading}
    />
  );
}
