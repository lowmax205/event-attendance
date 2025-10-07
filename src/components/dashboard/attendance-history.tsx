"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

interface AttendanceRecord {
  id: string;
  eventName: string;
  checkInSubmittedAt: Date | null;
  checkOutSubmittedAt: Date | null;
  verificationStatus: "Pending" | "Approved" | "Rejected" | "Disputed";
}

interface AttendanceHistoryProps {
  attendances: AttendanceRecord[];
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

const statusVariants = {
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
  Disputed: "warning",
} as const;

export function AttendanceHistory({
  attendances,
  currentPage,
  totalPages,
  onPageChange,
}: AttendanceHistoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      if (onPageChange) {
        onPageChange(page);
      } else {
        // Client-side navigation fallback
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`?${params.toString()}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No attendance records found.
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((attendance) => (
                <TableRow key={attendance.id}>
                  <TableCell className="font-medium">
                    {attendance.eventName}
                  </TableCell>
                  <TableCell>
                    {attendance.checkInSubmittedAt
                      ? format(new Date(attendance.checkInSubmittedAt), "PPp")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {attendance.checkOutSubmittedAt
                      ? format(new Date(attendance.checkOutSubmittedAt), "PPp")
                      : "Not checked out"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariants[attendance.verificationStatus]}
                    >
                      {attendance.verificationStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
