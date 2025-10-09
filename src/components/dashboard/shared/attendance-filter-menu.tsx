"use client";

import * as React from "react";
import { format } from "date-fns";
import { VerificationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type AttendanceFilterValues = {
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  course?: string;
};

interface AttendanceFilterMenuProps {
  values: AttendanceFilterValues;
  onApplyFilters: (values: AttendanceFilterValues) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  activeFilterCount?: number;
  showDepartmentFilters?: boolean;
}

const STATUS_ALL = "__all_statuses";
const SORT_DEFAULT = "checkInSubmittedAt";
const SORT_ORDER_DEFAULT = "desc";

const statusOptions = [
  { value: VerificationStatus.Pending, label: "Pending" },
  { value: VerificationStatus.Approved, label: "Approved" },
  { value: VerificationStatus.Rejected, label: "Rejected" },
  { value: VerificationStatus.Disputed, label: "Disputed" },
];

const sortOptions = [
  { value: "checkInSubmittedAt", label: "Newest" },
  { value: "verifiedAt", label: "Verified Date" },
  { value: "verificationStatus", label: "Status" },
  { value: "createdAt", label: "Created Date" },
];

const sortOrderOptions = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

export function AttendanceFilterMenu({
  values,
  onApplyFilters,
  onClearFilters,
  isLoading = false,
  activeFilterCount = 0,
  showDepartmentFilters = false,
}: AttendanceFilterMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AttendanceFilterValues>(values);

  React.useEffect(() => {
    if (!open) {
      setDraft(values);
    }
  }, [values, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraft(values);
    }
  };

  const handleApply = () => {
    onApplyFilters(draft);
    setOpen(false);
  };

  const handleClear = () => {
    onClearFilters();
    setOpen(false);
  };

  const statusValue = draft.status ?? STATUS_ALL;
  const sortValue = draft.sortBy ?? SORT_DEFAULT;
  const sortOrderValue = draft.sortOrder ?? SORT_ORDER_DEFAULT;

  const startDate = draft.startDate ? new Date(draft.startDate) : undefined;
  const endDate = draft.endDate ? new Date(draft.endDate) : undefined;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          aria-label="Toggle attendance filters"
          disabled={isLoading && !open}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 rounded-full px-2 py-0 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="attendance-status">Status</Label>
              <Select
                value={statusValue}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    status: value === STATUS_ALL ? undefined : value,
                  }))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="attendance-status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={STATUS_ALL}>All statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance-sort">Sort By</Label>
              <Select
                value={sortValue}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    sortBy: value,
                  }))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="attendance-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance-sort-order">Sort Order</Label>
              <Select
                value={sortOrderValue}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    sortOrder: value,
                  }))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="attendance-sort-order">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOrderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Submission Date</Label>
              <div className="grid grid-cols-1 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) =>
                        setDraft((prev) => ({
                          ...prev,
                          startDate: date ? date.toISOString() : undefined,
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) =>
                        setDraft((prev) => ({
                          ...prev,
                          endDate: date ? date.toISOString() : undefined,
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {showDepartmentFilters && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="attendance-department">Department</Label>
                  <Input
                    id="attendance-department"
                    placeholder="e.g. Computer Science"
                    value={draft.department ?? ""}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        department: event.target.value || undefined,
                      }))
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance-course">Course</Label>
                  <Input
                    id="attendance-course"
                    placeholder="e.g. BSCS"
                    value={draft.course ?? ""}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        course: event.target.value || undefined,
                      }))
                    }
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isLoading}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              disabled={isLoading}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
