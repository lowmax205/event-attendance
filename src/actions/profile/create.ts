"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";

interface ProfileResponse {
  success: boolean;
  message: string;
}

/**
 * Create Profile Server Action
 * Creates a user profile after registration
 * Requires authenticated user (checks access token)
 */
export async function createProfile(data: ProfileInput): Promise<ProfileResponse> {
  try {
    // 1. Validate input
    const validationResult = profileSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.issues[0].message,
      };
    }

    const { studentId, department, yearLevel, section, contactNumber } =
      validationResult.data;

    // 2. Get authenticated user from cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return {
        success: false,
        message: "You must be logged in to create a profile.",
      };
    }

    const payload = await verifyToken(accessToken);
    if (!payload || payload.type !== "access") {
      return {
        success: false,
        message: "Invalid authentication. Please log in again.",
      };
    }

    // 3. Check if user already has a profile
    const existingProfile = await db.userProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (existingProfile) {
      return {
        success: false,
        message: "You already have a profile. Use the edit feature to update it.",
      };
    }

    // 4. Check if student ID is already taken
    const duplicateStudentId = await db.userProfile.findUnique({
      where: { studentId },
    });

    if (duplicateStudentId) {
      return {
        success: false,
        message: "This Student ID is already registered to another account.",
      };
    }

    // 5. Create profile
    await db.userProfile.create({
      data: {
        userId: payload.userId,
        studentId,
        department,
        yearLevel,
        section: section || null,
        contactNumber: contactNumber || null,
      },
    });

    // 6. Log security event
    await db.securityLog.create({
      data: {
        userId: payload.userId,
        action: "PROFILE_CREATED",
        metadata: {
          studentId,
          department,
        },
      },
    });

    return {
      success: true,
      message: "Profile created successfully!",
    };
  } catch (error) {
    console.error("Profile creation error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
