import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/events/upcoming
 * Fetches upcoming and ongoing events
 */
export async function GET() {
  try {
    const now = new Date();

    // Get events that are either:
    // 1. Starting in the future (upcoming)
    // 2. Currently ongoing (started but not ended)
    const events = await db.event.findMany({
      where: {
        status: "Active",
        OR: [
          // Upcoming: starts in the future
          {
            startDateTime: {
              gte: now,
            },
          },
          // Ongoing: started but hasn't ended yet
          {
            startDateTime: {
              lte: now,
            },
            endDateTime: {
              gte: now,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        startDateTime: true,
        endDateTime: true,
        venueName: true,
        venueAddress: true,
        status: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            UserProfile: {
              select: {
                department: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDateTime: "asc",
      },
      take: 50, // Increased limit to show more events
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Failed to fetch upcoming events:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch upcoming events",
      },
      { status: 500 },
    );
  }
}
