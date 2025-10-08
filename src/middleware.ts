import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

/**
 * Middleware for Next.js App Router
 * Handles authentication and authorization for protected routes
 * Runs on Edge Runtime for optimal performance
 */

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/events/create",
  "/events/manage",
  "/attendance",
];

// Routes accessible without profile completion
const profileExemptRoutes = [
  "/profile/create",
  "/auth/login",
  "/auth/register",
];

// Routes that require specific roles (T059)
const roleBasedRoutes: Record<
  string,
  Array<"Student" | "Moderator" | "Administrator">
> = {
  "/dashboard/student": ["Student", "Moderator", "Administrator"],
  "/dashboard/moderator": ["Moderator", "Administrator"],
  "/dashboard/admin": ["Administrator"],
  "/events/create": ["Moderator", "Administrator"],
  "/events/manage": ["Moderator", "Administrator"],
  // Analytics dashboard (admin only)
  "/dashboard/admin/analytics": ["Administrator"],
  // User management (admin only)
  "/dashboard/admin/users": ["Administrator"],
  // Event management by moderators
  "/dashboard/moderator/events": ["Moderator", "Administrator"],
  // Attendance management by moderators
  "/dashboard/moderator/attendance": ["Moderator", "Administrator"],
};

// Public routes that don't require authentication
const publicRoutes = ["/", "/events", "/roadmap"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Get access token from cookie
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    // Redirect to home page with error message
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "authentication_required");
    return NextResponse.redirect(url);
  }

  // Verify token
  const payload = await verifyToken(accessToken);

  if (!payload || payload.type !== "access") {
    // Token is invalid or expired
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "session_expired");
    return NextResponse.redirect(url);
  }

  // T058: Check account status
  if (payload.accountStatus === "SUSPENDED") {
    // Account is suspended - clear cookies and redirect
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "account_suspended");

    const response = NextResponse.redirect(url);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  // Check if user has completed their profile
  const isProfileExempt = profileExemptRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!payload.hasProfile && !isProfileExempt) {
    // User hasn't completed profile - redirect to profile creation
    const url = request.nextUrl.clone();
    url.pathname = "/profile/create";
    return NextResponse.redirect(url);
  }

  // If user has profile and tries to access profile creation, redirect to dashboard
  if (payload.hasProfile && pathname.startsWith("/profile/create")) {
    const url = request.nextUrl.clone();
    switch (payload.role) {
      case "Student":
        url.pathname = "/dashboard/student";
        break;
      case "Moderator":
        url.pathname = "/dashboard/moderator";
        break;
      case "Administrator":
        url.pathname = "/dashboard/admin";
        break;
      default:
        url.pathname = "/";
    }
    return NextResponse.redirect(url);
  }

  // Check role-based access for dashboard routes
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(payload.role)) {
        // User doesn't have permission - redirect to their appropriate dashboard
        const url = request.nextUrl.clone();

        // Redirect to role-specific dashboard
        switch (payload.role) {
          case "Student":
            url.pathname = "/dashboard/student";
            break;
          case "Moderator":
            url.pathname = "/dashboard/moderator";
            break;
          case "Administrator":
            url.pathname = "/dashboard/admin";
            break;
          default:
            url.pathname = "/";
        }

        url.searchParams.set("error", "insufficient_permissions");
        return NextResponse.redirect(url);
      }
      // Permission granted - allow access
      break;
    }
  }

  // Handle /dashboard root redirect based on role
  if (pathname === "/dashboard") {
    const url = request.nextUrl.clone();

    switch (payload.role) {
      case "Student":
        url.pathname = "/dashboard/student";
        break;
      case "Moderator":
        url.pathname = "/dashboard/moderator";
        break;
      case "Administrator":
        url.pathname = "/dashboard/admin";
        break;
      default:
        url.pathname = "/";
    }

    return NextResponse.redirect(url);
  }

  // Authentication and authorization successful
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
