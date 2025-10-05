"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/hash";
import { createSession } from "@/lib/auth/session";
import { checkAuthRateLimit } from "@/lib/rate-limit";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import type { AuthResponse } from "@/lib/types/auth";

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
      include: { profile: true },
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

    // 5. Create session
    const { accessToken, refreshToken } = await createSession(user);

    // 6. Set cookies
    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // 7. Log security event
    await db.securityLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        metadata: {
          email: user.email,
        },
      },
    });

    // 8. Check if user has profile
    const hasProfile = !!user.profile;

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
