"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/hash";
import { createSession } from "@/lib/auth/session";
import { checkAuthRateLimit } from "@/lib/rate-limit";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import type { AuthResponse } from "@/lib/types/auth";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "@/lib/auth/cookies";

/**
 * Login Server Action
 * Authenticates user with email and password
 * Includes rate limiting and session management
 */
export async function login(data: LoginInput): Promise<AuthResponse> {
  try {
    // 1. Validate input
    const validationResult = loginSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.issues[0].message,
      };
    }

    const { email, password } = validationResult.data;

    // 2. Rate limiting check
    const rateLimitResult = await checkAuthRateLimit(email);
    if (!rateLimitResult.success) {
      return {
        success: false,
        message: `Too many login attempts. Please try again after ${rateLimitResult.reset.toLocaleTimeString()}.`,
      };
    }

    // 3. Find user
    const user = await db.user.findUnique({
      where: { email },
      include: { UserProfile: true },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // 4. Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // 5. Check if user has profile
    const hasProfile = !!user.UserProfile;

    // 6. Check account status (T058)
    if (user.accountStatus === "SUSPENDED") {
      return {
        success: false,
        message: "Your account has been suspended. Please contact support.",
      };
    }

    if (user.deletedAt !== null) {
      return {
        success: false,
        message: "Account not found.",
      };
    }

    // 7. Create session
    const { accessToken, refreshToken } = await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
      hasProfile,
      accountStatus: user.accountStatus,
    });

    // 8. Set cookies
    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      ...getAccessTokenCookieOptions(),
    });

    cookieStore.set("refreshToken", refreshToken, {
      ...getRefreshTokenCookieOptions(),
    });

    // Log successful login
    await db.securityLog.create({
      data: {
        eventType: "LOGIN",
        userId: user.id,
        ipAddress: null,
        userAgent: null,
      },
    });

    return {
      success: true,
      message: "Login successful!",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasProfile,
      },
      requiresProfile: !hasProfile,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
