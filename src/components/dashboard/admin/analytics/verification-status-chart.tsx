"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * T053: VerificationStatusChart Component
 * Phase 3.12 - UI Components - Analytics Dashboard
 * T057.1: Enhanced with drill-down navigation
 *
 * Displays verification status distribution using Recharts PieChart
 * Color-coded to match status badges
 * Click on segments to view attendance records with that status
 */

interface VerificationStatusData {
  status: string;
  count: number;
}

interface VerificationStatusChartProps {
  data: VerificationStatusData[];
  isLoading?: boolean;
  dateRange?: { startDate?: string; endDate?: string };
}

// Match status badge colors from the application
const STATUS_COLORS = {
  PENDING: "hsl(var(--secondary))",
  APPROVED: "hsl(var(--primary))",
  REJECTED: "hsl(var(--destructive))",
  DISPUTED: "hsl(var(--muted))",
};

export function VerificationStatusChart({
  data,
  isLoading,
  dateRange,
}: VerificationStatusChartProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Calculate percentages for legend
  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0",
  }));

  // Handle click on pie segment to drill down by status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    if (data && data.status) {
      const params = new URLSearchParams({
        status: data.status,
      });

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
        <CardTitle>Verification Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart aria-label="Verification status pie chart">
            <Pie
              data={dataWithPercentage}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage}%`}
              outerRadius={80}
              fill="hsl(var(--primary))"
              dataKey="count"
              nameKey="status"
              onClick={handleClick}
              style={{ cursor: "pointer" }}
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] ||
                    "hsl(var(--primary))"
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: number, name: string, props: any) => [
                `${value} (${props.payload.percentage}%)`,
                name,
              ]}
            />
            <Legend
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value, entry: any) =>
                `${value}: ${entry.payload.count} (${entry.payload.percentage}%)`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
