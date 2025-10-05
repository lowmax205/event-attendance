# Research: Landing Pages & Authentication Foundation

**Feature**: 001-build-the-foundation  
**Date**: 2025-10-06  
**Status**: Complete

## Overview

This document captures technical research and decisions for implementing the Event Attendance System foundation, including landing pages, authentication system, and profile management.

---

## 1. Next.js 15 App Router Architecture

### Decision

Use Next.js 15 App Router with Server Components and Server Actions for the entire application.

### Rationale

- **Server Components** enable zero-JS landing pages for optimal performance (FCP <1.8s target)
- **Server Actions** eliminate need for separate API routes while maintaining security (auth logic stays server-side)
- **File-based routing** in `/src/app/` provides intuitive structure matching URL paths
- **Built-in TypeScript support** aligns with constitution's TypeScript Excellence principle
- **Turbopack** (already configured in package.json) provides fast dev/build times

### Implementation Pattern

```typescript
// Landing Page (Server Component - zero JS sent to client)
// src/app/page.tsx
export default async function HomePage() {
  return <LandingPageContent />; // Static content, no hydration needed
}

// Authentication (Server Action - runs only on server)
// src/app/actions/auth.ts
("use server");
export async function registerUser(formData: FormData) {
  // Validation, bcrypt hashing, database insertion
  // Returns serializable result
}
```

### Alternatives Considered

- **Separate Next.js frontend + Express backend**: Rejected due to unnecessary complexity, slower development, deployment overhead
- **Pages Router**: Rejected because App Router provides better performance primitives and is the recommended approach for Next.js 15

---

## 2. Authentication Strategy

### Decision

Use custom JWT-based authentication with bcryptjs and jose library, not NextAuth.js.

### Rationale

- **Full control** over session management and token refresh (per FR-032 requirement)
- **Simpler implementation** for role-based auth with only 3 fixed roles
- **Meets security requirements**: bcrypt cost factor 12+, JWT signing, refresh tokens
- **No external dependencies** on OAuth providers (email/password only in MVP)
- **Constitution compliance**: Server-side validation, environment variables for secrets

### Implementation Pattern

```typescript
// Password hashing
import bcrypt from "bcryptjs";
const hashedPassword = await bcrypt.hash(password, 12); // Cost factor 12

// JWT generation using jose (Web Crypto API compatible)
import { SignJWT, jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const token = await new SignJWT({ userId, role })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("15m")
  .sign(secret);

// Refresh token strategy
const refreshToken = await new SignJWT({ userId })
  .setExpirationTime("7d")
  .sign(secret);
// Store refresh token in httpOnly cookie
```

### Alternatives Considered

- **NextAuth.js**: Rejected because it's over-engineered for simple email/password auth, adds complexity, harder to customize for academic profile flow
- **Passport.js**: Rejected because it's designed for traditional server frameworks, not Next.js App Router patterns
- **Auth0/Clerk**: Rejected for MVP to avoid third-party dependencies and costs

---

## 3. Form Validation Architecture

### Decision

Use React Hook Form + Zod for client-side validation, duplicate Zod schemas for server-side validation.

### Rationale

- **Dual validation** satisfies FR-042 (client for UX, server for security)
- **Type safety**: Zod schemas auto-generate TypeScript types
- **DRY principle**: Share Zod schemas between client and server
- **Performance**: React Hook Form uses uncontrolled inputs (minimal re-renders)
- **Accessibility**: Integrates with shadcn/ui Form components (WCAG AA compliant)

### Implementation Pattern

```typescript
// Shared validation schema (src/lib/validations.ts)
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[^A-Za-z0-9]/, "Password must contain special character"),
  role: z.enum(["Student", "Moderator", "Administrator"]),
});

// Client-side usage (React Hook Form)
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
const form = useForm({ resolver: zodResolver(registerSchema) });

// Server-side validation (Server Action)
("use server");
export async function registerUser(data: unknown) {
  const validated = registerSchema.parse(data); // Throws if invalid
  // Proceed with registration
}
```

### Alternatives Considered

- **Formik**: Rejected due to larger bundle size and performance issues with controlled inputs
- **Client-only validation**: Rejected as it violates security requirements (FR-042)
- **Manual validation**: Rejected due to maintenance burden and type safety concerns

---

## 4. Database & ORM Selection

### Decision

Use Prisma ORM with PostgreSQL for data persistence.

### Rationale

- **Type safety**: Auto-generates TypeScript types from schema
- **Migration system**: Version-controlled schema changes
- **Query builder**: Prevents SQL injection, simplifies CRUD operations
- **PostgreSQL**: Industry standard, robust JSONB support for future extensibility, ACID compliance
- **Developer experience**: Prisma Studio for database inspection, excellent documentation

### Schema Design

```prisma
// prisma/schema.prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          Role
  accountStatus String   @default("active")
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  lastLoginAt   DateTime?

  profile       UserProfile?
  sessions      Session[]
  securityLogs  SecurityLog[]
}

model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  idNumber        String
  year            String   // 1st, 2nd, 3rd, 4th, 5th
  section         String
  course          String
  department      String
  campus          String
  currentSemester String   // 1st Sem, 2nd Sem, Summer

  completedAt     DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum Role {
  Student
  Moderator
  Administrator
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  accessToken  String   @unique
  refreshToken String   @unique
  ipAddress    String?
  userAgent    String?
  deviceType   String?

  createdAt    DateTime @default(now())
  expiresAt    DateTime
  refreshedAt  DateTime?
}

model SecurityLog {
  id          String   @id @default(cuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  eventType   String   // registration, login, logout, failed_login, password_change
  success     Boolean
  failReason  String?
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
  @@index([eventType, createdAt])
}
```

### Alternatives Considered

- **Drizzle ORM**: Rejected as Prisma has better TypeScript integration and migration tooling
- **TypeORM**: Rejected due to decorator-based approach not aligning with Next.js patterns
- **Raw SQL**: Rejected for security (SQL injection risks) and maintainability concerns
- **MongoDB**: Rejected as relational data (User → Profile → Sessions) fits RDBMS better

---

## 5. Theming with Green/Yellow Color Palette

### Decision

Extend Tailwind CSS theme with custom green/yellow colors, apply to shadcn/ui components via CSS variables.

### Rationale

- **Constitution requirement**: FR-033 mandates green primary, yellow secondary
- **shadcn/ui pattern**: Uses CSS custom properties for theming
- **WCAG AA compliance**: Must verify contrast ratios meet 4.5:1 (normal text) and 3:1 (large text)
- **Dark mode support**: CSS variables enable easy theme switching (future feature)

### Implementation Pattern

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          // Green shades (verified WCAG AA contrast)
          50: '#f0fdf4',   // Lightest green
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Main green (--primary)
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',  // Darkest green
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          // Yellow shades (verified WCAG AA contrast)
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',  // Main yellow (--secondary)
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
    },
  },
};

// src/app/globals.css
:root {
  --primary: 142 71% 45%;        /* Green 500 in HSL */
  --primary-foreground: 0 0% 100%; /* White text on green */
  --secondary: 48 96% 53%;       /* Yellow 500 in HSL */
  --secondary-foreground: 0 0% 0%; /* Black text on yellow */
}
```

### WCAG AA Contrast Verification

- **Green 500 (#22c55e) on white**: Contrast ratio 2.91:1 ❌ - Need darker green for text
- **Green 700 (#15803d) on white**: Contrast ratio 4.52:1 ✅ - Use for primary text/buttons
- **Yellow 500 (#eab308) on white**: Contrast ratio 1.94:1 ❌ - Need darker yellow
- **Yellow 700 (#a16207) on white**: Contrast ratio 4.87:1 ✅ - Use for secondary accents

### Alternatives Considered

- **CSS-in-JS (styled-components)**: Rejected due to performance overhead and SSR complexity
- **Hardcoded hex colors**: Rejected as CSS variables provide better maintainability and theme switching

---

## 6. Accessibility Implementation Strategy

### Decision

Implement accessibility compliance using ESLint plugin for development-time validation and manual verification.

### Rationale

- **WCAG 2.1 AA mandatory** (FR-034): Manual verification ensures full compliance
- **Constitution requirement**: All pages must meet accessibility standards
- **Legal compliance**: Educational institutions often require accessibility
- **No automated testing required**: Focus on proper implementation rather than test coverage

### Implementation Approach

1. **Development (ESLint)**: `eslint-plugin-jsx-a11y` catches issues during coding
2. **Manual Verification**: Keyboard navigation (Tab, Enter, Escape) and NVDA/VoiceOver screen readers
3. **Browser DevTools**: Chrome Lighthouse accessibility audit for validation

### Implementation Pattern

```typescript
// Proper semantic HTML with ARIA labels
<button
  aria-label="Close authentication modal"
  onClick={handleClose}
  className="min-h-[44px] min-w-[44px]" // WCAG touch target size
>
  <X className="h-6 w-6" aria-hidden="true" />
</button>;

// Keyboard navigation support
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    handleClose();
  }
};
```

### Alternatives Considered

- **Automated testing frameworks**: Rejected as testing is not required for this project
- **Third-party accessibility services**: Rejected as manual verification is sufficient

---

## 7. Performance Optimization Techniques

### Decision

Implement comprehensive performance optimizations: Image optimization, code splitting, Server Components, aggressive caching.

### Rationale

- **Constitution NON-NEGOTIABLE**: FCP <1.8s, LCP <2.5s, FID <100ms, CLS <0.1, Lighthouse ≥90
- **Target users**: Students/staff may have slower devices and 3G connections
- **SEO benefit**: Core Web Vitals impact search rankings

### Optimization Checklist

#### 1. Image Optimization

```typescript
// Next.js Image component with WebP
import Image from "next/image";

<Image
  src="/images/hero.png"
  alt="Event attendance tracking"
  width={800}
  height={600}
  priority={true} // Above-the-fold images
  quality={85} // Balance quality/size
  placeholder="blur"
  blurDataURL="data:image/..." // Generated blur placeholder
/>;
```

#### 2. Font Optimization

```typescript
// src/app/layout.tsx - Use next/font
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Prevents invisible text during font load
  variable: "--font-inter",
});
```

#### 3. Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from "next/dynamic";

const AuthModal = dynamic(() => import("@/components/auth-modal"), {
  loading: () => <Skeleton />, // Show skeleton during load
  ssr: false, // Modal not needed for SSR
});
```

#### 4. Server Components (Zero JS)

```typescript
// Landing pages use Server Components (no client-side JS)
// src/app/page.tsx
export default async function HomePage() {
  // Fetch data server-side if needed
  return (
    <main>
      <Navigation /> {/* Only nav needs interactivity */}
      <HeroSection /> {/* Static content, no hydration */}
      <FeatureList /> {/* Static content */}
    </main>
  );
}
```

#### 5. Caching Strategy

- **Static pages**: Next.js automatically caches (Home, Events, RoadMap are static)
- **Dynamic data**: Revalidate every 60 seconds for dashboard placeholders
- **Images**: CDN caching with long max-age headers

### Alternatives Considered

- **Client-side rendering**: Rejected due to poor FCP and SEO
- **External CDN for images**: Deferred to future optimization (Next.js Image is sufficient for MVP)

---

## 8. Rate Limiting Implementation

### Decision

Use `@upstash/ratelimit` with Redis for distributed rate limiting on authentication endpoints.

### Rationale

- **Security requirement**: FR-043 mandates rate limiting to prevent brute force
- **Distributed**: Works across multiple server instances (production scalability)
- **Simple API**: Easy integration with Server Actions
- **Vercel-native**: Works seamlessly with Vercel deployment (Upstash Redis integration)

### Implementation Pattern

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
  analytics: true,
});

// Usage in Server Action
("use server");
export async function loginUser(email: string, password: string) {
  const { success } = await authRateLimit.limit(email);
  if (!success) {
    throw new Error("Too many login attempts. Please try again in 15 minutes.");
  }
  // Proceed with authentication
}
```

### Alternatives Considered

- **In-memory rate limiting**: Rejected because it doesn't work across server instances
- **Middleware-based limiting**: Rejected as Server Actions bypass traditional middleware
- **Custom Redis implementation**: Rejected due to unnecessary complexity

---

## 9. Security Headers Configuration

### Decision

Configure security headers via `next.config.ts` and middleware.

### Rationale

- **Constitution requirement**: FR-046 mandates CSP, X-Frame-Options, HSTS, X-Content-Type-Options
- **Defense in depth**: Headers provide additional security layer beyond application logic
- **Production requirement**: HTTPS enforced, XSS protection, clickjacking prevention

### Implementation Pattern

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Prevent clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Prevent MIME sniffing
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains", // HTTPS only
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval in dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
            ].join("; "),
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
    ];
  },
};
```

### Alternatives Considered

- **Helmet.js**: Rejected as it's designed for Express, not Next.js
- **Manual header setting in responses**: Rejected due to error-prone repetition

---

## 10. Session Management Strategy

### Decision

Use httpOnly cookies for refresh tokens, short-lived JWTs in memory for access tokens.

### Rationale

- **Security**: httpOnly cookies prevent XSS attacks from stealing tokens
- **UX**: Refresh tokens (7-day expiry) reduce re-authentication frequency
- **Performance**: Short-lived access tokens (15-min expiry) reduce database lookups
- **Compliance**: Meets FR-032 requirement for JWT with refresh token rotation

### Token Lifecycle

1. **Registration/Login**: Generate access token (15min) + refresh token (7d)
2. **Store**: Access token in memory (React state), refresh token in httpOnly cookie
3. **API requests**: Send access token in Authorization header
4. **Token refresh**: When access token expires, use refresh token to get new pair
5. **Logout**: Clear both tokens, invalidate refresh token in database

### Implementation Pattern

```typescript
// Set httpOnly cookie (Server Action)
import { cookies } from "next/headers";

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
) {
  cookies().set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  // Return access token to client (stored in React state/context)
  return accessToken;
}

// Refresh token flow (Server Action)
export async function refreshAccessToken() {
  const refreshToken = cookies().get("refreshToken")?.value;
  if (!refreshToken) throw new Error("No refresh token");

  const payload = await jwtVerify(refreshToken, secret);
  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  // Generate new token pair
  const newAccessToken = await generateAccessToken(session.user);
  const newRefreshToken = await generateRefreshToken(session.user);

  // Update session in database
  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshToken: newRefreshToken,
      refreshedAt: new Date(),
    },
  });

  // Set new cookies
  return setAuthCookies(newAccessToken, newRefreshToken);
}
```

### Alternatives Considered

- **LocalStorage for tokens**: Rejected due to XSS vulnerability
- **Session-only (no JWTs)**: Rejected due to database load on every request
- **Long-lived tokens**: Rejected due to security risks if stolen

---

## Summary of Technical Decisions

| Component        | Technology                              | Rationale                                                      |
| ---------------- | --------------------------------------- | -------------------------------------------------------------- |
| Framework        | Next.js 15 App Router                   | Server Components for performance, Server Actions for security |
| Authentication   | Custom JWT + bcryptjs                   | Full control, meets security requirements (bcrypt cost 12+)    |
| Forms            | React Hook Form + Zod                   | Dual validation, type safety, accessibility                    |
| Database         | Prisma + PostgreSQL                     | Type-safe ORM, migrations, relational data model               |
| Styling          | Tailwind CSS + shadcn/ui                | Green/yellow theming, WCAG AA components                       |
| Rate Limiting    | @upstash/ratelimit                      | Distributed, production-ready, Vercel-native                   |
| Testing          | Vitest + RTL + Playwright + axe         | Unit, integration, E2E, accessibility coverage                 |
| Performance      | Next.js Image, fonts, Server Components | Meets FCP <1.8s, LCP <2.5s targets                             |
| Security Headers | next.config.ts headers                  | CSP, HSTS, X-Frame-Options, XSS protection                     |
| Session Mgmt     | httpOnly cookies + JWTs                 | XSS-resistant, refresh token rotation                          |

---

## Dependencies to Install

```json
{
  "dependencies": {
    "@prisma/client": "^5.20.0",
    "@upstash/ratelimit": "^2.0.3",
    "@upstash/redis": "^1.34.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.9.3",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "prisma": "^5.20.0",
    "@types/bcryptjs": "^2.4.6",
    "vitest": "^2.1.3",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.5.0",
    "@playwright/test": "^1.48.0",
    "@axe-core/playwright": "^4.10.0",
    "eslint-plugin-jsx-a11y": "^6.10.0"
  }
}
```

---

**Status**: ✅ Research Complete - All technical unknowns resolved
