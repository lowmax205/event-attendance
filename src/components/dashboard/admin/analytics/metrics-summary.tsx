"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

/**
 * T049: MetricsSummary Component
 * Phase 3.12 - UI Components - Analytics Dashboard
 *
 * Displays 4 key metric cards:
 * - Total Events
 * - Total Attendances
 * - Verification Rate
 * - Pending Count
 */

interface KeyMetrics {
  totalEvents: number;
  totalAttendances: number;
  verificationRate: number;
  pendingCount: number;
}

interface MetricsSummaryProps {
  metrics: KeyMetrics;
  isLoading?: boolean;
}

export function MetricsSummary({ metrics, isLoading }: MetricsSummaryProps) {
  const metricCards = [
    {
      title: "Total Events",
      value: metrics.totalEvents,
      icon: Calendar,
      description: "Events created",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Attendances",
      value: metrics.totalAttendances,
      icon: CheckCircle2,
      description: "Attendance submissions",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Verification Rate",
      value: `${metrics.verificationRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: "Approved attendances",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Pending Verifications",
      value: metrics.pendingCount,
      icon: AlertCircle,
      description: "Awaiting review",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted mb-1" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
