"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * T051: TopEventsChart Component
 * Phase 3.12 - UI Components - Analytics Dashboard
 * T057.1: Enhanced with drill-down navigation
 *
 * Displays top 10 events by attendance count using Recharts BarChart
 * Click on bars to view attendance records for that event
 */

interface TopEventData {
  eventName: string;
  attendanceCount: number;
  eventId?: string;
}

interface TopEventsChartProps {
  data: TopEventData[];
  isLoading?: boolean;
  dateRange?: { startDate?: string; endDate?: string };
}

export function TopEventsChart({
  data,
  isLoading,
  dateRange,
}: TopEventsChartProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Events by Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // Sort and take top 10
  const sortedData = [...data]
    .sort((a, b) => b.attendanceCount - a.attendanceCount)
    .slice(0, 10);

  // Handle click on bar to drill down
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedEvent = data.activePayload[0].payload;
      const params = new URLSearchParams({
        status: "APPROVED",
      });

      // Add event ID if available
      if (clickedEvent.eventId) {
        params.set("eventId", clickedEvent.eventId);
      }

      // Add date range from analytics filter
      if (dateRange?.startDate) {
        params.set("startDate", dateRange.startDate);
      }
      if (dateRange?.endDate) {
        params.set("endDate", dateRange.endDate);
      }

      router.push(`/dashboard/admin/attendance?${params.toString()}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Events by Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sortedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            aria-label="Top events bar chart"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="eventName"
              angle={-45}
              textAnchor="end"
              height={80}
              className="text-xs"
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "currentColor" }}
              label={{
                value: "Attendance Count",
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
            <Bar
              dataKey="attendanceCount"
              fill="hsl(var(--primary))"
              name="Attendances"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
