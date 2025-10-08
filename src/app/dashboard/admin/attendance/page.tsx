"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AttendanceTable,
  type AttendanceRow,
} from "@/components/dashboard/moderator/attendance-management/attendance-table";
import { AttendanceDetailDialog } from "@/components/dashboard/moderator/attendance-management/attendance-detail-dialog";
import { VerificationForm } from "@/components/dashboard/moderator/attendance-management/verification-form";
import {
  FilterPanel,
  type FilterConfig,
} from "@/components/dashboard/shared/filter-panel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { listAttendances } from "@/actions/moderator/attendance";
import { VerificationStatus } from "@prisma/client";
import { Filter, RefreshCw } from "lucide-react";

/**
 * Admin Attendance Management Page
 * Similar to moderator attendance page but shows ALL attendance records
 *
 * Features:
 * - Lists all attendance records system-wide (admin scope)
 * - Filters by event, status, date range, department, course
 * - View attendance details
 * - Verify/reject attendance submissions
 */

export default function AdminAttendanceManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fullAttendances, setFullAttendances] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 20,
    totalPages: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = React.useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = React.useState<
    string | null
  >(null);
  const [showFilters, setShowFilters] = React.useState(false);

  // Filter state from URL params (includes department and course for drill-down)
  const [filters, setFilters] = React.useState({
    status: searchParams.get("status") || undefined,
    eventId: searchParams.get("eventId") || undefined,
    department: searchParams.get("department") || undefined,
    course: searchParams.get("course") || undefined,
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined,
  });

  // Use constant page size to avoid infinite loop
  const PAGE_SIZE = 20;

  // Fetch attendances
  const fetchAttendances = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const page = parseInt(searchParams.get("page") || "1", 10);

      const result = await listAttendances({
        page,
        limit: PAGE_SIZE,
        status: filters.status as VerificationStatus | undefined,
        eventId: filters.eventId,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch attendances");
      }

      // Client-side filtering for department and course (if needed)
      let attendances = result.data.attendances;
      if (filters.department) {
        attendances = attendances.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any) => a.user?.UserProfile?.department === filters.department,
        );
      }
      if (filters.course) {
        attendances = attendances.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any) => a.user?.UserProfile?.course === filters.course,
        );
      }

      setFullAttendances(attendances);
      setPagination({
        pageIndex: page - 1,
        pageSize: PAGE_SIZE,
        totalPages: result.data.pagination.totalPages,
        totalItems: result.data.pagination.total,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch attendances",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, toast]);

  // Map full attendances to table rows
  const attendances = React.useMemo<AttendanceRow[]>(() => {
    return fullAttendances.map((att) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = att as any;
      return {
        id: a.id,
        user: {
          firstName: a.user.firstName,
          lastName: a.user.lastName,
          email: a.user.email,
          UserProfile: a.user.UserProfile
            ? {
                studentId: a.user.UserProfile.studentId,
                department: a.user.UserProfile.department,
              }
            : null,
        },
        event: {
          id: a.event.id,
          name: a.event.name,
        },
        checkInSubmittedAt: a.checkInSubmittedAt,
        verificationStatus: a.verificationStatus,
        distanceMeters: a.checkInDistance ?? a.distanceMeters ?? null,
      };
    });
  }, [fullAttendances]);

  // Get selected attendance for dialogs
  const selectedAttendance = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fullAttendances.find((a: any) => a.id === selectedAttendanceId);
  }, [fullAttendances, selectedAttendanceId]);

  // Initial fetch and refetch on filter/page changes
  React.useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  // Update URL params when filters change
  const updateUrlParams = React.useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams();

      if (newFilters.status) {
        params.set("status", newFilters.status);
      }

      if (newFilters.eventId) {
        params.set("eventId", newFilters.eventId);
      }

      if (newFilters.department) {
        params.set("department", newFilters.department);
      }

      if (newFilters.course) {
        params.set("course", newFilters.course);
      }

      if (newFilters.startDate) {
        params.set("startDate", newFilters.startDate.toISOString());
      }

      if (newFilters.endDate) {
        params.set("endDate", newFilters.endDate.toISOString());
      }

      params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [router],
  );

  // Filter handlers
  const handleFilterChange = React.useCallback(
    (name: string, value: string | Date | undefined) => {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const handleApplyFilters = React.useCallback(() => {
    updateUrlParams(filters);
  }, [filters, updateUrlParams]);

  const handleClearFilters = React.useCallback(() => {
    const clearedFilters = {
      status: undefined,
      eventId: undefined,
      department: undefined,
      course: undefined,
      startDate: undefined,
      endDate: undefined,
    };
    setFilters(clearedFilters);
    updateUrlParams(clearedFilters);
  }, [updateUrlParams]);

  // Pagination handler
  const handlePaginationChange = React.useCallback(
    (pageIndex: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", (pageIndex + 1).toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Action handlers
  const handleViewDetails = React.useCallback((attendanceId: string) => {
    setSelectedAttendanceId(attendanceId);
    setDetailDialogOpen(true);
  }, []);

  const handleVerify = React.useCallback((attendanceId: string) => {
    setSelectedAttendanceId(attendanceId);
    setVerifyDialogOpen(true);
  }, []);

  const handleVerifyFromDetails = React.useCallback(() => {
    setDetailDialogOpen(false);
    setVerifyDialogOpen(true);
  }, []);

  const handleVerifySuccess = React.useCallback(() => {
    setVerifyDialogOpen(false);
    setSelectedAttendanceId(null);
    fetchAttendances();
    toast({
      title: "Success",
      description: "Attendance verification updated successfully",
    });
  }, [fetchAttendances, toast]);

  // Filter configuration (includes department and course for drill-down)
  const filterConfig: FilterConfig[] = [
    {
      name: "status",
      type: "select",
      label: "Verification Status",
      placeholder: "All statuses",
      options: [
        { value: "PENDING", label: "Pending" },
        { value: "APPROVED", label: "Approved" },
        { value: "REJECTED", label: "Rejected" },
        { value: "DISPUTED", label: "Disputed" },
      ],
    },
    {
      name: "department",
      type: "search",
      label: "Department",
      placeholder: "Filter by department",
    },
    {
      name: "course",
      type: "search",
      label: "Course",
      placeholder: "Filter by course",
    },
    {
      name: "daterange",
      type: "daterange",
      label: "Submission Date Range",
      startName: "startDate",
      endName: "endDate",
      startLabel: "From",
      endLabel: "To",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Attendance Management (All Events)
        </h1>
        <p className="text-muted-foreground">
          View and verify all attendance submissions across the system
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAttendances}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageIndex * pagination.pageSize + 1}-
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            pagination.totalItems,
          )}{" "}
          of {pagination.totalItems} records
        </div>
      </div>

      {showFilters && (
        <FilterPanel
          filters={filterConfig}
          values={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
        />
      )}

      {/* Attendance Table */}
      <AttendanceTable
        attendances={attendances}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onViewDetails={handleViewDetails}
        onVerify={handleVerify}
        isLoading={isLoading}
      />

      {/* Detail Dialog */}
      {selectedAttendance && (
        <AttendanceDetailDialog
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          attendance={selectedAttendance as any}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          onVerify={handleVerifyFromDetails}
        />
      )}

      {/* Verification Form Dialog */}
      {selectedAttendanceId && (
        <VerificationForm
          attendanceId={selectedAttendanceId}
          open={verifyDialogOpen}
          onOpenChange={setVerifyDialogOpen}
          onSuccess={handleVerifySuccess}
        />
      )}
    </div>
  );
}
