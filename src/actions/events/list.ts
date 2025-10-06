"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";

interface ListEventsFilters {
  status?: "Active" | "Completed" | "Cancelled";
  createdById?: string;
  page?: number;
  limit?: number;
}

/**
 * List events with optional filters and pagination
 * @param filters - Optional filters for status, creator, pagination
 * @returns Paginated list of events
 */
export async function listEvents(filters: ListEventsFilters = {}) {
  try {
    // Require authentication
    await requireAuth();

    const { status, createdById, page = 1, limit = 10 } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      status?: "Active" | "Completed" | "Cancelled";
      createdById?: string;
    } = {};

    if (status) {
      where.status = status;
    }

    if (createdById) {
      where.createdById = createdById;
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
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return {
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
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
