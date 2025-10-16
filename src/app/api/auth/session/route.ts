import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";

/**
 * GET /api/auth/session
 * Returns current user session if valid token exists
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Verify JWT token
    const payload = await verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 },
      );
    }

    // Fetch user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: { UserProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user session
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasProfile: !!user.UserProfile,
        profilePictureUrl: user.UserProfile?.profilePictureUrl ?? null,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 },
    );
  }
}
