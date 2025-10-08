"use client";

import * as React from "react";
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
 * T052: EventStatusChart Component
 * Phase 3.12 - UI Components - Analytics Dashboard
 *
 * Displays event status distribution using Recharts PieChart
 */

interface StatusData {
  status: string;
  count: number;
}

interface EventStatusChartProps {
  data: StatusData[];
  isLoading?: boolean;
}

const COLORS = {
  Active: "hsl(var(--chart-1))",
  Completed: "hsl(var(--chart-2))",
  Cancelled: "hsl(var(--chart-3))",
  UPCOMING: "hsl(var(--chart-1))",
  ONGOING: "hsl(var(--chart-2))",
  COMPLETED: "hsl(var(--chart-3))",
  CANCELLED: "hsl(var(--chart-4))",
};

export function EventStatusChart({ data, isLoading }: EventStatusChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Status Distribution</CardTitle>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart aria-label="Event status pie chart">
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
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[entry.status as keyof typeof COLORS] ||
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
