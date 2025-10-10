# Event Attendance System – Copilot Guide

## Stack & Tooling

- Next.js 15 App Router with React Server Components, TypeScript strict mode, and path alias `@/*`.
- Styling uses Tailwind CSS 4 with shadcn/ui primitives; `cn` helper in `src/lib/utils.ts` merges classes.
- Data layer is Prisma (PostgreSQL) via the singleton in `src/lib/db.ts`; migrations live in `prisma/migrations/` and seeding uses `npm run db:seed`.
- Auth/session logic is JWT-based (`src/lib/auth/jwt.ts`) with server helpers (`src/lib/auth/server.ts`); middleware in `src/middleware.ts` enforces auth, role gating, and profile completion.
- Linting/formatting via `npm run lint`; no automated tests—manual guidance is in `TESTING-GUIDE.md`.

## Architecture & Conventions

- App Router pages live under `src/app`; most routes are server components. When working with route params, remember Next.js 15 passes `searchParams` as a `Promise` (see `src/app/dashboard/student/page.tsx`).
- Mutations happen through server actions under `src/actions/**`. They generally:
  1. Call `requireAuth` / `requireRole`.
  2. Validate input with Zod schemas from `src/lib/validations/**`.
  3. Use Prisma via the `db` singleton.
  4. Return `{ success, data?, error? }`.
- Prefer updating existing server actions instead of creating API routes. If an API route is necessary, follow the pattern in `src/app/api/auth/session/route.ts` (minimal logic, defer to shared libs).
- Error handling: throw `redirect()` or `notFound()` from server components; client components should surface friendly errors and may use `DashboardErrorBoundary` (`src/components/error-boundary.tsx`).
- Role-specific dashboards route through `src/app/dashboard/page.tsx`; ensure new dashboard pages respect middleware redirects and use `requireRole` checks.

## Domain Rules & Data Model

- Roles: `Student`, `Moderator`, `Administrator`. Account status gating lives in middleware and Prisma `User.accountStatus` enum.
- Core tables: `User`, `UserProfile`, `Event`, `Attendance`, `ExportRecord`, `SystemConfig`, `SecurityLog` (`prisma/schema.prisma`). Respect unique constraints like `Attendance`'s `(eventId,userId)` pair and soft-delete fields (`deletedAt`, `deletedById`).
- Attendance workflow tracks check-in/out photos, GPS, signatures, and verification state (`verificationStatus`). Moderators/admins verify; disputes use `disputeNote`, `appealMessage`, `resolutionNotes`.
- Analytics helpers in `src/lib/analytics/aggregations.ts` provide aggregated metrics—reuse them instead of re-querying.
- Rate limiting uses Upstash (`src/lib/rate-limit.ts`); reuse `checkAuthRateLimit`/`checkQRValidationRateLimit` when touching auth or QR flows.

## UI Patterns

- Reuse shadcn/ui components from `src/components/ui/**`. Dashboard tables/charts build on shared components in `src/components/dashboard/shared/**` and should remain accessible (aria roles already wired in `data-table.tsx`).
- The layout (`src/app/layout.tsx`) wraps pages with `ThemeProvider`, `AuthProvider`, nav, footer, and `Toaster` (`sonner`). Keep new pages within this structure and avoid duplicating providers.
- For forms, combine React Hook Form with Zod resolvers (`@hookform/resolvers/zod`). Validation messages should map to the schema strings defined in `src/lib/validations`.
- Follow WCAG AA: maintain keyboard access (e.g., table headers use keyboard sorting). When adding interactive elements, include focus styles and aria labels consistent with existing components.

## External Integrations

- Cloudinary upload helpers live in `src/lib/cloudinary.ts` (`uploadPhoto`, `uploadSignature`, `uploadQRCode`). Call these instead of duplicating upload logic.
- QR utilities (`src/lib/qr-generator.ts`) standardize payload format `attendance:{eventId}:{timestamp}`; always use `generateQRPayload`/`parseQRPayload`.
- Geolocation helpers and distance math sit in `src/lib/geolocation.ts`; use them for location-based features to stay consistent.
- Redis credentials (`UPSTASH_REDIS_*`) are required for rate limiting. Cloudinary and JWT secrets must be set in `.env`; reference `.env.example` for the full list.

## Workflow Expectations

- No automated tests—do not add Jest/Playwright/etc. Validate changes manually and, when helpful, update `TESTING-GUIDE.md` scenarios.
- Keep existing docs in `specs/**` aligned with new behavior. For the ongoing “Modernize and Unify Dashboards” effort (`specs/004-modernize-and-unify`), update plan/tasks if scope shifts.
- Favor incremental, well-scoped commits. If adding migrations, document the reason in the migration name and run `npm run db:migrate` locally before shipping.
- Log only meaningful errors (see existing `console.error` usage) and avoid leaking sensitive data.
- Default to ASCII in source files unless extending existing Unicode content.

## Gotchas

- Middleware matcher excludes `/public`, but admin dashboard path is `/dashboard/admin` while middleware map still references `/dashboard/admin` and `/dashboard/administrator`. Align new routes with middleware keys.
- Server actions run on the server only—do not import client-only utilities (e.g., browser APIs) into them.
- Remember that many pages expect `searchParams` as async data; await before usage to avoid React warnings.
- The Prisma client logs queries in dev; watch the console for N+1 issues when adjusting Prisma includes.
- Rate-limit helpers delete redis keys directly—handle failures gracefully and avoid tight loops that could flood Redis.

Stick to these patterns and reuse shared utilities to keep new contributions aligned with the rest of the codebase.
