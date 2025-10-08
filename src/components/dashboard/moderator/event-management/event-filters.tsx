"use client";

import * as React from "react";
import {
  FilterPanel,
  FilterConfig,
} from "@/components/dashboard/shared/filter-panel";
import { EventStatus } from "@prisma/client";

interface EventFiltersProps {
  values: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: string;
  };
  onFilterChange: (name: string, value: string | Date | undefined) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const statusOptions = [
  { value: EventStatus.Active, label: "Active" },
  { value: EventStatus.Completed, label: "Completed" },
  { value: EventStatus.Cancelled, label: "Cancelled" },
];

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "startDateTime", label: "Start Date" },
  { value: "endDateTime", label: "End Date" },
  { value: "status", label: "Status" },
  { value: "createdAt", label: "Created Date" },
];

const sortOrderOptions = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

export function EventFilters({
  values,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  isLoading = false,
}: EventFiltersProps) {
  const filterConfig: FilterConfig[] = [
    {
      name: "status",
      type: "select",
      label: "Status",
      options: statusOptions,
      placeholder: "All Statuses",
    },
    {
      name: "dateRange",
      type: "daterange",
      label: "Date Range",
      startName: "startDate",
      endName: "endDate",
      startLabel: "Start Date",
      endLabel: "End Date",
    },
    {
      name: "sortBy",
      type: "select",
      label: "Sort By",
      options: sortOptions,
      placeholder: "Sort by...",
    },
    {
      name: "sortOrder",
      type: "select",
      label: "Sort Order",
      options: sortOrderOptions,
      placeholder: "Order",
    },
  ];

  return (
    <FilterPanel
      filters={filterConfig}
      values={values}
      onFilterChange={onFilterChange}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
      isLoading={isLoading}
    />
  );
}
