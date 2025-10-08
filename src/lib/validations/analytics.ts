/**
 * Zod validation schemas for Analytics Dashboard features (FR-049 to FR-061)
 * Phase 3.2 - T013
 */

import { z } from "zod";

/**
 * Analytics query parameters (FR-053, FR-055)
 * Used by: GET /api/analytics/dashboard
 */
export const analyticsQuerySchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    refresh: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional()
      .default(false),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffDays =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 365;
    },
    {
      message: "Date range cannot exceed 365 days",
      path: ["endDate"],
    },
  );

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

/**
 * Chart drill-down query (FR-058)
 * Used by: GET /api/analytics/chart/:chartType/details
 */
export const chartDrillDownSchema = z.object({
  chartType: z.enum([
    "attendance-trends",
    "top-events",
    "verification-status",
    "department-breakdown",
    "course-breakdown",
  ]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  filter: z
    .object({
      eventId: z.string().cuid().optional(),
      status: z.string().optional(),
      department: z.string().optional(),
      course: z.string().optional(),
    })
    .optional(),
});

export type ChartDrillDown = z.infer<typeof chartDrillDownSchema>;
