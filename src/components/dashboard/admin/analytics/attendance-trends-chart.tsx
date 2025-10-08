"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * T050: AttendanceTrendsChart Component
 * Phase 3.12 - UI Components - Analytics Dashboard
 * T057.1: Enhanced with drill-down navigation
 *
 * Displays attendance count over time using Recharts LineChart
 * Click on data points to view detailed attendance records for that date
 */

interface TrendData {
  date: string;
  count: number;
  originalDate?: string; // Store original date for filtering
}

interface AttendanceTrendsChartProps {
  data: TrendData[];
  isLoading?: boolean;
  dateRange?: { startDate?: string; endDate?: string };
}

export function AttendanceTrendsChart({
  data,
  isLoading,
}: AttendanceTrendsChartProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // Format date for display and store original for filtering
  const formattedData = data.map((item) => ({
    ...item,
    originalDate: item.date,
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Handle click on data point to drill down
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedDate = data.activePayload[0].payload.originalDate;
      const date = new Date(clickedDate);
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "APPROVED",
      });

      router.push(`/dashboard/admin/attendance?${params.toString()}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            aria-label="Attendance trends line chart"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "currentColor" }}
              label={{
                value: "Attendances",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Attendances"
              dot={{ fill: "hsl(var(--primary))" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
