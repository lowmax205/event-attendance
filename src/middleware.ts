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
];

// Routes that require specific roles
const roleBasedRoutes: Record<string, Array<"Student" | "Moderator" | "Administrator">> = {
  "/dashboard/moderator": ["Moderator", "Administrator"],
  "/dashboard/admin": ["Administrator"],
  "/events/create": ["Moderator", "Administrator"],
  "/events/manage": ["Moderator", "Administrator"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public") ||
    pathname === "/" ||
    pathname === "/events" ||
    pathname === "/roadmap"
  ) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some((route) =>
    pathname.startsWith(route)
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

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(payload.role)) {
        // User doesn't have permission for this route
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard"; // Redirect to their own dashboard
        url.searchParams.set("error", "insufficient_permissions");
        return NextResponse.redirect(url);
      }
    }
  }

  // Check if user has profile (required for some routes)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/events/")) {
    // This would require a database call, which is not ideal in middleware
    // Instead, we'll handle this check in the page component
    // and redirect from there if needed
  }

  // Authentication successful
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
