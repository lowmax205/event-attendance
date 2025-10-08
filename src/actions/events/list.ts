"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import {
  eventListQuerySchema,
  type EventListQuery,
} from "@/lib/validations/event-management";
import { Prisma } from "@prisma/client";

/**
 * T020: List events with moderator scope filtering and enhanced pagination
 * Phase 3.4 - Extended from Phase 2
 * @param query - Query parameters (pagination, filters, sorting)
 * @returns Paginated list of events
 */
export async function listEvents(query: Partial<EventListQuery> = {}) {
  try {
    // Require authentication (MODERATOR or ADMIN)
    const user = await requireAuth();

    // Validate and parse query parameters
    const validatedQuery = eventListQuerySchema.parse(query);

    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    // Build where clause
    const where: Prisma.EventWhereInput = {
      deletedAt: null, // Exclude soft-deleted events (FR-020)
    };

    // Moderator scope: only see own events (FR-026)
    if (user.role === "Moderator") {
      where.createdById = user.userId;
    }
    // Admin can see all events (no filter)

    if (validatedQuery.status) {
      where.status = validatedQuery.status;
    }

    // Date range filtering (FR-024, FR-028)
    if (validatedQuery.startDate || validatedQuery.endDate) {
      where.startDateTime = {};
      if (validatedQuery.startDate) {
        where.startDateTime.gte = new Date(validatedQuery.startDate);
      }
      if (validatedQuery.endDate) {
        where.startDateTime.lte = new Date(validatedQuery.endDate);
      }
    }

    // Get total count
    const total = await db.event.count({ where });

    // Get events with creator information
    const events = await db.event.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: {
        [validatedQuery.sortBy]: validatedQuery.sortOrder,
      },
      skip,
      take: validatedQuery.limit,
    });

    return {
      success: true,
      data: {
        events,
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total,
          totalPages: Math.ceil(total / validatedQuery.limit),
        },
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to list events",
    };
  }
}
