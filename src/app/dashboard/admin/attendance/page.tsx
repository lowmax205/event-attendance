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
  AttendanceFilterMenu,
  type AttendanceFilterValues,
} from "@/components/dashboard/shared/attendance-filter-menu";
import { DashboardSearchInput } from "@/components/dashboard/shared/dashboard-search-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { listAttendances } from "@/actions/moderator/attendance";
import { VerificationStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, ShieldAlert, Info } from "lucide-react";

/**
 * Admin Attendance Management mirrors the user management layout, providing
 * global oversight of every attendance submission in the platform.
 */

type AttendanceSummary = {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalDisputed: number;
};

type PageFilterValues = AttendanceFilterValues & {
  search?: string;
  myEventsOnly?: boolean;
};

const DEFAULT_FILTERS: PageFilterValues = {
  status: undefined,
  sortBy: "checkInSubmittedAt",
  sortOrder: "desc",
  startDate: undefined,
  endDate: undefined,
  department: undefined,
  course: undefined,
  search: undefined,
  myEventsOnly: false,
};

const EMPTY_SUMMARY: AttendanceSummary = {
  totalPending: 0,
  totalApproved: 0,
  totalRejected: 0,
  totalDisputed: 0,
};

export default function AdminAttendanceManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const isModerator = user?.role === "Moderator";
  const isAdministrator = user?.role === "Administrator";
  const canInitiateVerification = isAdministrator || isModerator;

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
  const [summary, setSummary] =
    React.useState<AttendanceSummary>(EMPTY_SUMMARY);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);

  const PAGE_SIZE = 20;
  const searchParamsString = searchParams.toString();

  const appliedFilters = React.useMemo<PageFilterValues>(() => {
    const params = new URLSearchParams(searchParamsString);
    return {
      status: params.get("status") || undefined,
      sortBy: params.get("sortBy") || DEFAULT_FILTERS.sortBy,
      sortOrder: params.get("sortOrder") || DEFAULT_FILTERS.sortOrder,
      startDate: params.get("startDate") || undefined,
      endDate: params.get("endDate") || undefined,
      department: params.get("department") || undefined,
      course: params.get("course") || undefined,
      search: params.get("search") || undefined,
      myEventsOnly: params.get("myEventsOnly") === "true",
    } satisfies PageFilterValues;
  }, [searchParamsString]);

  const [searchDraft, setSearchDraft] = React.useState<string | undefined>(
    appliedFilters.search,
  );

  React.useEffect(() => {
    setSearchDraft(appliedFilters.search);
  }, [appliedFilters.search]);

  const currentPage = React.useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    const pageValue = parseInt(params.get("page") || "1", 10);
    return Number.isNaN(pageValue) || pageValue < 1 ? 1 : pageValue;
  }, [searchParamsString]);

  const buildQueryString = React.useCallback(
    (filters: PageFilterValues, page: number) => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.department) params.set("department", filters.department);
      if (filters.course) params.set("course", filters.course);
      if (filters.search) params.set("search", filters.search);
      if (filters.myEventsOnly) params.set("myEventsOnly", "true");
      if (filters.sortBy && filters.sortBy !== DEFAULT_FILTERS.sortBy)
        params.set("sortBy", filters.sortBy);
      if (filters.sortOrder && filters.sortOrder !== DEFAULT_FILTERS.sortOrder)
        params.set("sortOrder", filters.sortOrder);
      if (page > 1) params.set("page", page.toString());
      return params.toString();
    },
    [],
  );

  const fetchAttendances = React.useCallback(async () => {
    try {
      setIsLoading(true);

      const result = await listAttendances({
        page: currentPage,
        limit: PAGE_SIZE,
        status: appliedFilters.status as VerificationStatus | undefined,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        department: appliedFilters.department,
        course: appliedFilters.course,
        search: appliedFilters.search,
        myEventsOnly: appliedFilters.myEventsOnly,
        sortBy: (appliedFilters.sortBy ?? DEFAULT_FILTERS.sortBy) as
          | "checkInSubmittedAt"
          | "verifiedAt"
          | "verificationStatus"
          | "createdAt",
        sortOrder: (appliedFilters.sortOrder ?? DEFAULT_FILTERS.sortOrder) as
          | "asc"
          | "desc",
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch attendances");
      }

      setFullAttendances(result.data.attendances);
      setPagination({
        pageIndex: currentPage - 1,
        pageSize: PAGE_SIZE,
        totalPages: result.data.pagination.totalPages,
        totalItems: result.data.pagination.total,
      });
      setSummary(result.data.summary ?? EMPTY_SUMMARY);
      setLastSyncedAt(new Date());
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
  }, [
    appliedFilters.course,
    appliedFilters.department,
    appliedFilters.endDate,
    appliedFilters.search,
    appliedFilters.myEventsOnly,
    appliedFilters.sortBy,
    appliedFilters.sortOrder,
    appliedFilters.startDate,
    appliedFilters.status,
    currentPage,
    toast,
  ]);

  const canModerateAttendance = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (attendance: any | null | undefined) => {
      if (!attendance || !user) {
        return false;
      }

      if (isAdministrator) {
        return true;
      }

      if (isModerator) {
        const creatorId = attendance.event?.createdBy?.id;
        return creatorId === user.userId;
      }

      return false;
    },
    [isAdministrator, isModerator, user],
  );

  const fetchKey = React.useMemo(
    () =>
      [
        appliedFilters.status ?? "",
        appliedFilters.startDate ?? "",
        appliedFilters.endDate ?? "",
        appliedFilters.department ?? "",
        appliedFilters.course ?? "",
        appliedFilters.search ?? "",
        appliedFilters.myEventsOnly ?? "",
        appliedFilters.sortBy ?? DEFAULT_FILTERS.sortBy,
        appliedFilters.sortOrder ?? DEFAULT_FILTERS.sortOrder,
        currentPage,
      ].join("|"),
    [
      appliedFilters.course,
      appliedFilters.department,
      appliedFilters.endDate,
      appliedFilters.search,
      appliedFilters.myEventsOnly,
      appliedFilters.sortBy,
      appliedFilters.sortOrder,
      appliedFilters.startDate,
      appliedFilters.status,
      currentPage,
    ],
  );

  const lastFetchKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;
    void fetchAttendances();
  }, [fetchAttendances, fetchKey]);

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
                yearLevel: a.user.UserProfile.yearLevel,
                section: a.user.UserProfile.section,
                contactNumber: a.user.UserProfile.contactNumber,
              }
            : null,
        },
        event: {
          id: a.event.id,
          name: a.event.name,
        },
        checkInSubmittedAt: a.checkInSubmittedAt,
        verificationStatus: a.verificationStatus,
        checkInDistance: a.checkInDistance ?? a.distanceMeters ?? null,
        canVerify: canModerateAttendance(a),
      };
    });
  }, [fullAttendances, canModerateAttendance]);

  // Get selected attendance for dialogs
  const selectedAttendance = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fullAttendances.find((a: any) => a.id === selectedAttendanceId);
  }, [fullAttendances, selectedAttendanceId]);

  const canVerifySelectedAttendance = React.useMemo(
    () => canModerateAttendance(selectedAttendance),
    [canModerateAttendance, selectedAttendance],
  );

  const updateUrlParams = React.useCallback(
    (newFilters: PageFilterValues, page = 1) => {
      const nextQuery = buildQueryString(newFilters, page);
      const currentQuery = buildQueryString(appliedFilters, currentPage);
      if (nextQuery === currentQuery) {
        return;
      }

      const targetPath = nextQuery
        ? `/dashboard/admin/attendance?${nextQuery}`
        : `/dashboard/admin/attendance`;
      router.push(targetPath);
    },
    [appliedFilters, buildQueryString, currentPage, router],
  );

  const handleSearchChange = (value: string | undefined) => {
    setSearchDraft(value);
  };

  const handleSearchSubmit = () => {
    const normalizedSearch =
      searchDraft && searchDraft.trim().length > 0 ? searchDraft : undefined;

    if ((appliedFilters.search ?? undefined) === normalizedSearch) {
      return;
    }

    updateUrlParams(
      {
        ...appliedFilters,
        search: normalizedSearch,
      },
      1,
    );
  };

  const handleSearchClear = () => {
    setSearchDraft(undefined);
    if (appliedFilters.search) {
      updateUrlParams(
        {
          ...appliedFilters,
          search: undefined,
        },
        1,
      );
    }
  };

  const handleApplyFilters = (newFilters: AttendanceFilterValues) => {
    const normalizedFilters: PageFilterValues = {
      ...appliedFilters,
      status: newFilters.status,
      startDate: newFilters.startDate,
      endDate: newFilters.endDate,
      sortBy: newFilters.sortBy ?? DEFAULT_FILTERS.sortBy,
      sortOrder: newFilters.sortOrder ?? DEFAULT_FILTERS.sortOrder,
      department: newFilters.department,
      course: newFilters.course,
    };
    updateUrlParams(normalizedFilters, 1);
  };

  const handleClearFilters = () => {
    updateUrlParams(DEFAULT_FILTERS, 1);
  };

  const handlePaginationChange = (pageIndex: number) => {
    updateUrlParams(appliedFilters, pageIndex + 1);
  };

  const handleRefresh = () => {
    void fetchAttendances();
  };

  const handleMyEventsToggle = (checked: boolean) => {
    updateUrlParams(
      {
        ...appliedFilters,
        myEventsOnly: checked,
      },
      1,
    );
  };

  const appliedFilterCount = React.useMemo(() => {
    let count = 0;
    if (appliedFilters.status) count += 1;
    if (appliedFilters.search) count += 1;
    if (appliedFilters.startDate) count += 1;
    if (appliedFilters.endDate) count += 1;
    if (appliedFilters.department) count += 1;
    if (appliedFilters.course) count += 1;
    if (appliedFilters.myEventsOnly) count += 1;
    if (
      appliedFilters.sortBy &&
      appliedFilters.sortBy !== DEFAULT_FILTERS.sortBy
    )
      count += 1;
    if (
      appliedFilters.sortOrder &&
      appliedFilters.sortOrder !== DEFAULT_FILTERS.sortOrder
    )
      count += 1;
    return count;
  }, [appliedFilters]);

  const filterMenuValues: AttendanceFilterValues = {
    status: appliedFilters.status,
    startDate: appliedFilters.startDate,
    endDate: appliedFilters.endDate,
    sortBy: appliedFilters.sortBy,
    sortOrder: appliedFilters.sortOrder,
    department: appliedFilters.department,
    course: appliedFilters.course,
  };

  // Action handlers
  const handleViewDetails = React.useCallback((attendanceId: string) => {
    setSelectedAttendanceId(attendanceId);
    setDetailDialogOpen(true);
  }, []);

  const handleVerify = React.useCallback(
    (attendanceId: string) => {
      const targetAttendance = fullAttendances.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (attendance: any) => attendance.id === attendanceId,
      );

      if (!canModerateAttendance(targetAttendance)) {
        toast({
          title: "Action not allowed",
          description:
            "You can only verify attendances for events you created.",
          variant: "destructive",
        });
        return;
      }

      setSelectedAttendanceId(attendanceId);
      setVerifyDialogOpen(true);
    },
    [canModerateAttendance, fullAttendances, toast],
  );

  const handleVerifyFromDetails = React.useCallback(() => {
    if (!selectedAttendance || !canModerateAttendance(selectedAttendance)) {
      toast({
        title: "Action not allowed",
        description: "You can only verify attendances for events you created.",
        variant: "destructive",
      });
      return;
    }
    setDetailDialogOpen(false);
    setVerifyDialogOpen(true);
  }, [canModerateAttendance, selectedAttendance, toast]);

  const handleVerifySuccess = React.useCallback(() => {
    setVerifyDialogOpen(false);
    setSelectedAttendanceId(null);
    void fetchAttendances();
    toast({
      title: "Success",
      description: "Attendance verification updated successfully",
    });
  }, [fetchAttendances, toast]);

  const detailCountLabel = React.useMemo(() => {
    if (pagination.totalItems === 0) {
      return "No attendance records found";
    }
    const firstItem = pagination.pageIndex * pagination.pageSize + 1;
    const lastItem = Math.min(
      (pagination.pageIndex + 1) * pagination.pageSize,
      pagination.totalItems,
    );
    return `Showing ${firstItem}-${lastItem} of ${pagination.totalItems} records`;
  }, [pagination.pageIndex, pagination.pageSize, pagination.totalItems]);

  return (
    <div className="container mx-auto space-y-8 py-8">
      {isModerator && (
        <Alert className="border-border/60">
          <ShieldAlert className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <AlertTitle>Limited access</AlertTitle>
          <AlertDescription>
            Moderators can review all attendance submissions here. You may
            verify records for events you created; other records still require
            an administrator.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              All Attendance Records
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor submissions from every event and triage anything that
              needs administrator attention.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{detailCountLabel}</span>
            {lastSyncedAt && (
              <>
                <span>•</span>
                <span>
                  Synced{" "}
                  {formatDistanceToNow(lastSyncedAt, { addSuffix: true })}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <DashboardSearchInput
              value={searchDraft}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              onClear={handleSearchClear}
              disabled={isLoading}
              placeholder="Search by student, event, or department"
              ariaLabel="Search all attendance records"
            />
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2">
                  <input
                    type="checkbox"
                    id="myEventsOnly"
                    checked={appliedFilters.myEventsOnly ?? false}
                    onChange={(e) => handleMyEventsToggle(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Label
                    htmlFor="myEventsOnly"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                  >
                    My Events Only
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-sm">
                          This checkbox is to show only the attendance where the
                          students attended events that you created.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                </div>
              </TooltipProvider>
              <AttendanceFilterMenu
                values={filterMenuValues}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                isLoading={isLoading}
                activeFilterCount={appliedFilterCount}
                showDepartmentFilters
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{pagination.totalItems}</p>
            <p className="text-xs text-muted-foreground">
              Across every event in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.totalPending}</p>
            <p className="text-xs text-muted-foreground">
              Awaiting moderator or administrator verification
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.totalApproved}</p>
            <p className="text-xs text-muted-foreground">
              Confirmed attendances across all events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Attention Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {summary.totalRejected + summary.totalDisputed}
            </p>
            <p className="text-xs text-muted-foreground">
              Rejected or disputed submissions
            </p>
          </CardContent>
        </Card>
      </div>

      <AttendanceTable
        attendances={attendances}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onVerify={canInitiateVerification ? handleVerify : undefined}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
      />

      {selectedAttendance && (
        <AttendanceDetailDialog
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          attendance={selectedAttendance as any}
          open={detailDialogOpen}
          onOpenChange={(open) => {
            setDetailDialogOpen(open);
            if (!open) {
              setSelectedAttendanceId(null);
            }
          }}
          onVerify={
            canVerifySelectedAttendance ? handleVerifyFromDetails : undefined
          }
        />
      )}

      {canVerifySelectedAttendance && selectedAttendanceId && (
        <VerificationForm
          open={verifyDialogOpen}
          onOpenChange={(open) => {
            setVerifyDialogOpen(open);
            if (!open) {
              setSelectedAttendanceId(null);
            }
          }}
          attendanceId={selectedAttendanceId}
          onSuccess={handleVerifySuccess}
        />
      )}
    </div>
  );
}
