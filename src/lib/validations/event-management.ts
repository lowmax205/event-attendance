/**
 * Zod validation schemas for Event Management features
 * Phase 3.2 - T010
 */

import { z } from "zod";
import { EventStatus } from "@prisma/client";

/**
 * Event list query parameters (FR-027, FR-028)
 * Used by: GET /api/moderator/events
 */
export const eventListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(10).max(100).default(20),
  status: z.nativeEnum(EventStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().min(1).optional(),
  scope: z.enum(["mine", "all"]).default("mine"),
  sortBy: z
    .enum(["name", "startDateTime", "endDateTime", "status", "createdAt"])
    .default("startDateTime"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type EventListQuery = z.infer<typeof eventListQuerySchema>;

/**
 * Event creation request (FR-016, FR-015)
 * Used by: POST /api/events
 * Inherits from Phase 2 event creation, extends with management features
 */
export const eventCreateSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    startDateTime: z.string().datetime(),
    endDateTime: z.string().datetime(),
    venueName: z.string().min(1).max(200),
    venueAddress: z.string().max(500).optional(),
    venueLatitude: z.number().min(-90).max(90),
    venueLongitude: z.number().min(-180).max(180),
    checkInBufferMins: z.number().int().min(0).max(120).default(30),
    checkOutBufferMins: z.number().int().min(0).max(120).default(30),
  })
  .refine((data) => new Date(data.endDateTime) > new Date(data.startDateTime), {
    message: "End date must be after start date",
    path: ["endDateTime"],
  })
  .refine(
    (data) => {
      const checkInStart = new Date(
        new Date(data.startDateTime).getTime() -
          data.checkInBufferMins * 60 * 1000,
      );
      return checkInStart > new Date();
    },
    {
      message:
        "Event check-in start time (startDateTime - checkInBufferMins) must be in the future",
      path: ["startDateTime"],
    },
  );

export type EventCreate = z.infer<typeof eventCreateSchema>;

/**
 * Event update request (FR-017, FR-019)
 * Used by: PATCH /api/events/:eventId
 * All fields optional for partial updates
 */
export const eventUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    startDateTime: z.string().datetime().optional(),
    endDateTime: z.string().datetime().optional(),
    venueName: z.string().min(1).max(200).optional(),
    venueAddress: z.string().max(500).optional(),
    venueLatitude: z.number().min(-90).max(90).optional(),
    venueLongitude: z.number().min(-180).max(180).optional(),
    checkInBufferMins: z.number().int().min(0).max(120).optional(),
    checkOutBufferMins: z.number().int().min(0).max(120).optional(),
    status: z.nativeEnum(EventStatus).optional(),
  })
  .refine(
    (data) => {
      if (data.startDateTime && data.endDateTime) {
        return new Date(data.endDateTime) > new Date(data.startDateTime);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDateTime"],
    },
  );

export type EventUpdate = z.infer<typeof eventUpdateSchema>;
