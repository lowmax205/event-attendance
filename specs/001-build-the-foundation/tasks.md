# Tasks: Landing Pages & Authentication Foundation

**Input**: Design documents from `/specs/001-build-the-foundation/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow Summary

```
1. Setup phase (T001-T005): Project infrastructure, dependencies, database
2. Theming & Base Components (T006-T010): Design system, navigation
3. Landing Pages (T011-T014): Home, Events, RoadMap pages
4. Authentication Logic (T015-T022): Utilities, types, hooks
5. Authentication UI (T023-T025): Forms and modal components
6. Authentication Server Actions (T026-T029): API endpoints
7. Profile Completion (T030-T032): Profile form and page
8. Dashboard Placeholders (T033-T035): Role-specific dashboards
9. Middleware & Security (T036-T038): Auth protection, headers
10. Polish & Validation (T039-T042): Final cleanup and documentation
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- No testing required for this project

## Path Conventions

All paths relative to repository root `D:\Shared Folder\VS Code Project\Coding 2025\School\event-attendance\`

---

## Phase 3.1: Setup & Infrastructure

- [ ] **T001** Initialize Prisma with PostgreSQL

  - Create `prisma/schema.prisma` with User, UserProfile, Session, SecurityLog models
  - Configure `provider = "postgresql"` and `url = env("DATABASE_URL")`
  - Define enums: Role (Student, Moderator, Administrator), EventType (registration, login, logout, failed_login)
  - Set up indexes on User.email, Session.userId, Session.refreshToken
  - **Dependencies**: None (first task)
  - **Blocks**: T002, T004

- [ ] **T002** Install and configure project dependencies

  - Run `npm install prisma @prisma/client bcryptjs jose @upstash/ratelimit @upstash/redis react-hook-form zod @hookform/resolvers sonner`
  - Run `npm install -D @types/bcryptjs`
  - Update `package.json` scripts: add `"db:push": "prisma db push"`, `"db:migrate": "prisma migrate dev"`, `"db:studio": "prisma studio"`
  - **Dependencies**: T001
  - **Blocks**: All subsequent tasks

- [ ] **T003** Configure environment variables

  - Create `.env.example` with template variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_ACCESS_EXPIRY="1h"`, `JWT_REFRESH_EXPIRY="30d"`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - Add `.env` to `.gitignore` (verify)
  - Document required format in README.md: PostgreSQL connection string example, JWT secret generation command (`openssl rand -base64 32`), time string format ("1h" for 1 hour, "30d" for 30 days)
  - **Dependencies**: T002
  - **Blocks**: T004, T016, T019

- [ ] **T004** Run database migrations

  - Execute `npx prisma migrate dev --name init` to create initial migration
  - Verify migration creates tables: User, UserProfile, Session, SecurityLog
  - Test connection with `npx prisma studio`
  - **Dependencies**: T001, T003
  - **Blocks**: T016, T026-T029, T032

- [ ] **T005** Configure Husky pre-commit hooks
  - Run `npx husky-init`
  - Update `.husky/pre-commit` to run `npm run lint` and `npx prettier --check .`
  - Test hook: Make a commit with intentional formatting issue (e.g., add extra spaces), verify commit is rejected with error message, fix formatting, verify commit succeeds
  - **Dependencies**: T002
  - **Blocks**: None (polish task)

---

## Phase 3.2: Theming & Base Components

- [ ] **T006** Update globals.css with green/yellow theme

  - File: `src/app/globals.css`
  - Add CSS custom properties: `--primary: 142 71% 45%` (green-700), `--secondary: 42 78% 35%` (yellow-700)
  - Define color variants: primary-foreground, secondary-foreground, muted, accent, destructive
  - Verify WCAG AA contrast ratios: green-700 on white = 4.52:1, yellow-700 on white = 4.87:1
  - **Dependencies**: T002
  - **Blocks**: T007, T011-T014, T023-T025

- [ ] **T007** Install missing shadcn/ui components

  - Run `npx shadcn-ui@latest add form label`
  - Verify components created in `src/components/ui/form.tsx` and `src/components/ui/label.tsx`
  - Test imports in a temporary file to ensure no errors
  - **Dependencies**: T002, T006
  - **Blocks**: T008, T023-T025, T030

- [ ] **T008** Create Navigation component

  - File: `src/components/navigation.tsx`
  - Implement persistent header with logo, nav links (Home, Events, RoadMap)
  - Add conditional rendering using `useAuth()` hook: "Login" button when logged out, "Logout" + user email when logged in
  - Create placeholder for login button initially; will be replaced with `<AuthModalTrigger />` after T025
  - Make responsive: mobile hamburger menu (320px+), desktop horizontal nav (768px+)
  - Use shadcn/ui Button and Sheet components
  - Ensure 44×44px minimum touch targets (WCAG 2.1 AA)
  - **Dependencies**: T007
  - **Blocks**: T010
  - **Note**: Will be updated in T025 to use AuthModalTrigger component

- [ ] **T009** [P] Create reusable FormField wrapper component

  - File: `src/components/form-field-wrapper.tsx`
  - Wrap shadcn/ui Form components with consistent error display and ARIA labels
  - Accept props: `name`, `label`, `description`, `required`, `children`
  - Display validation errors from React Hook Form below field
  - Ensure screen reader compatibility with `aria-describedby` and `aria-invalid`
  - **Dependencies**: T007
  - **Blocks**: T023-T025, T030

- [ ] **T010** Update layout.tsx with Navigation and theme
  - File: `src/app/layout.tsx`
  - Import and render `<Navigation />` component above `{children}`
  - Add Sonner `<Toaster />` component for notifications
  - Verify green/yellow theme variables are applied via globals.css import
  - Test responsive layout: Use Chrome DevTools device emulation at 320px (mobile), 768px (tablet), 1920px (desktop) viewports, verify navigation adapts correctly
  - **Dependencies**: T006, T008
  - **Blocks**: T011-T014

---

## Phase 3.3: Landing Pages

**Note**: These tasks can run in parallel (different page files)

- [ ] **T011** [P] Create Home page

  - File: `src/app/page.tsx`
  - Implement as Next.js Server Component (zero client JS)
  - Content: Hero section with value proposition, feature highlights (3 cards), call-to-action buttons ("Get Started", "Learn More")
  - Use green/yellow accents per design system
  - Optimize images: WebP format, responsive srcset, lazy loading
  - Ensure FCP <1.8s on 3G: Test using Chrome DevTools Network throttling (Fast 3G preset: 1.6Mbps down, 750Kbps up, 40ms RTT), minimize inline styles, use CSS variables
  - **Dependencies**: T010
  - **Blocks**: None

- [ ] **T012** [P] Create Events page

  - File: `src/app/events/page.tsx`
  - Implement as Next.js Server Component
  - Content: Explanation of event attendance tracking from each role's perspective (Student, Moderator, Administrator)
  - Use cards or sections for each role with icons
  - Include screenshots or illustrations (create placeholder SVGs if needed)
  - **Dependencies**: T010
  - **Blocks**: None

- [ ] **T013** [P] Create RoadMap page

  - File: `src/app/roadmap/page.tsx`
  - Implement as Next.js Server Component
  - Content: Timeline or phases of planned features (use dummy future features for now)
  - Visual: Horizontal timeline or vertical list with checkmarks for completed/upcoming
  - Make responsive: stacked on mobile, horizontal on desktop
  - **Dependencies**: T010
  - **Blocks**: None

- [ ] **T014** [P] Optimize images for landing pages
  - Create or download logo in SVG format: `public/images/logo.svg` (green/yellow colors)
  - Source placeholder images: Use stock photos from Unsplash/Pexels OR AI-generated placeholders (MidJourney/DALL-E/Stable Diffusion) for Home, Events, RoadMap pages
  - Convert to WebP format using tools like Squoosh or cwebp
  - Use Next.js `<Image>` component with width, height, alt props
  - Generate responsive sizes: 320w, 640w, 1024w, 1920w
  - **Dependencies**: T011-T013
  - **Blocks**: None

---

## Phase 3.4: Authentication Logic

**Note**: T020-T021 can run in parallel (different type files)

- [ ] **T015** Create Zod validation schemas

  - File: `src/lib/validations.ts`
  - Export `registerSchema`: email (email format, max 254), password (min 8, regex for uppercase + number + special char), confirmPassword (refine match), role (enum)
  - Export `loginSchema`: email, password
  - Export `profileSchema`: idNumber (string, min 1), year (enum: 1st-5th), section (string), course (string), department (string), campus (string), currentSemester (enum: 1st Sem, 2nd Sem, Summer)
  - Import `z` from `zod` and type all exports
  - **Dependencies**: T002
  - **Blocks**: T023-T025, T026-T029, T030, T032

- [ ] **T016** Create Prisma client singleton

  - File: `src/lib/db.ts`
  - Export singleton PrismaClient instance with best practices (avoid hot reload issues in dev)
  - Pattern: check `globalThis.prisma`, create if missing, reuse in dev
  - Add type: `const prisma: PrismaClient`
  - **Dependencies**: T002, T004
  - **Blocks**: T026-T029, T032

- [ ] **T017** Create auth utilities (bcrypt, JWT)

  - File: `src/lib/auth.ts`
  - Export `hashPassword(password: string): Promise<string>` using bcrypt with cost factor 12
  - Export `verifyPassword(password: string, hash: string): Promise<boolean>` using bcrypt.compare
  - Export `generateAccessToken(userId: string, role: string): Promise<string>` using jose SignJWT, expiry 1 hour
  - Export `generateRefreshToken(userId: string): Promise<string>` using jose SignJWT, expiry 30 days
  - Export `verifyToken(token: string): Promise<{ userId: string, role?: string }>` using jose jwtVerify
  - Use `process.env.JWT_SECRET` encoded with `new TextEncoder().encode()`
  - **Dependencies**: T002, T003
  - **Blocks**: T026-T029

- [ ] **T018** Create session management utilities

  - File: `src/lib/session.ts`
  - Export `createSession(userId: string, ipAddress: string, userAgent: string): Promise<Session>` - creates Session record, invalidates old sessions (single session constraint)
  - Export `getSessionByRefreshToken(refreshToken: string): Promise<Session | null>` - finds active session
  - Export `deleteSession(sessionId: string): Promise<void>` - removes session record
  - Export `refreshAccessToken(refreshToken: string): Promise<{ accessToken: string, newRefreshToken: string } | null>` - rotates tokens
  - Import PrismaClient from `src/lib/db.ts`
  - **Dependencies**: T016, T017
  - **Blocks**: T026-T029

- [ ] **T019** Create rate limiting setup

  - File: `src/lib/rate-limit.ts`
  - Export `loginRateLimiter` using @upstash/ratelimit with sliding window: 5 requests per hour per identifier (email address)
  - Export `registerRateLimiter` with same config
  - Use Upstash Redis from env vars: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - Export helper `checkRateLimit(limiter, identifier): Promise<{ success: boolean, remaining: number }>`
  - **Dependencies**: T002, T003
  - **Blocks**: T026, T027

- [ ] **T020** [P] Create auth TypeScript types

  - File: `src/types/auth.ts`
  - Export `RegisterInput` type: email, password, confirmPassword, role
  - Export `LoginInput` type: email, password
  - Export `AuthResponse` type: success, message, user, accessToken
  - Export `User` type: id, email, role, profileComplete
  - **Dependencies**: T002
  - **Blocks**: T022, T023-T025, T026-T029

- [ ] **T021** [P] Create profile TypeScript types

  - File: `src/types/profile.ts`
  - Export `ProfileInput` type: idNumber, year, section, course, department, campus, currentSemester
  - Export `Profile` type: all ProfileInput fields + id, userId, completedAt
  - **Dependencies**: T002
  - **Blocks**: T022, T030, T032

- [ ] **T022** Create useAuth custom hook
  - File: `src/hooks/use-auth.ts`
  - Create client-side hook with state: `user`, `accessToken`, `loading`
  - Export `useAuth()` returning: user, accessToken, login(), logout(), isAuthenticated
  - Store access token in memory (not localStorage) for XSS protection
  - Implement `login(email, password)` calling server action, storing token
  - Implement `logout()` calling server action, clearing state
  - Use React Context or Zustand if needed for global state
  - **Dependencies**: T002, T020, T021
  - **Blocks**: T008, T023-T025

---

## Phase 3.5: Authentication UI Components

**Note**: Sequential because they share similar patterns and may import each other

- [ ] **T023** Create LoginForm component

  - File: `src/components/login-form.tsx`
  - Use React Hook Form + Zod resolver with `loginSchema`
  - Fields: email (type="email"), password (type="password")
  - Validation: Display inline errors on blur
  - Submit: Call login server action (to be created in T027)
  - Loading state: Disable form during submission, show spinner
  - Error handling: Display server errors with Sonner toast
  - Accessibility: Proper labels, ARIA attributes, focus management
  - **Dependencies**: T007, T009, T015, T020
  - **Blocks**: T025

- [ ] **T024** Create RegisterForm component

  - File: `src/components/register-form.tsx`
  - Use React Hook Form + Zod resolver with `registerSchema`
  - Fields: email, password, confirmPassword, role (Select dropdown)
  - Password strength indicator: Real-time visual feedback (red/yellow/green)
  - Validation: Email format, password rules, match confirmation
  - Submit: Call register server action (to be created in T026)
  - Success: Redirect to `/profile/complete` with access token
  - **Dependencies**: T007, T009, T015, T020
  - **Blocks**: T025

- [ ] **T025** Create AuthModal component
  - File: `src/components/auth-modal.tsx`
  - Use shadcn/ui Dialog component
  - State: Toggle between "Login" and "Register" tabs without closing modal
  - Content: Render `<LoginForm />` or `<RegisterForm />` based on active tab
  - Keyboard: Trap focus within modal, close on Escape key
  - Accessibility: Announce modal purpose to screen readers, return focus to trigger button on close
  - Trigger: Export `<AuthModalTrigger />` button component for Navigation
  - **Dependencies**: T007, T023, T024
  - **Blocks**: None
  - **Note**: After completion, update Navigation component (T008) to import and use `<AuthModalTrigger />` instead of placeholder button

---

## Phase 3.6: Authentication Server Actions

**Note**: T026-T029 can run in parallel (different Server Action files/functions)

- [ ] **T026** [P] Implement POST /api/auth/register Server Action

  - File: `src/app/actions/auth-register.ts`
  - Directive: `"use server"` at top
  - Export async function `registerUser(data: RegisterInput): Promise<AuthResponse>`
  - Steps:
    1. Validate with `registerSchema.parse(data)`
    2. Check rate limit with `registerRateLimiter` (5/hour per email)
    3. Check email uniqueness: `prisma.user.findUnique({ where: { email } })`
    4. Hash password with `hashPassword()`
    5. Create user: `prisma.user.create({ data: { email, passwordHash, role, accountStatus: 'active' } })`
    6. Generate tokens: `generateAccessToken()`, `generateRefreshToken()`
    7. Create session: `createSession(userId, ip, userAgent)` - invalidates old sessions per single-session constraint
    8. Set httpOnly cookie with refresh token
    9. Log event: `prisma.securityLog.create({ eventType: 'registration', success: true })`
    10. Return: `{ success: true, user: { id, email, role, profileComplete: false }, accessToken }`
  - Error handling: Return `{ success: false, error: message }` for all errors (generic messages for security)
  - **Dependencies**: T015, T016, T017, T018, T019
  - **Blocks**: T024

- [ ] **T027** [P] Implement POST /api/auth/login Server Action

  - File: `src/app/actions/auth-login.ts`
  - Directive: `"use server"`
  - Export async function `loginUser(data: LoginInput): Promise<AuthResponse & { redirectTo: string }>`
  - Steps:
    1. Validate with `loginSchema.parse(data)`
    2. Check rate limit with `loginRateLimiter` (5/hour per email)
    3. Find user: `prisma.user.findUnique({ where: { email }, include: { userProfile: true } })`
    4. Verify password with `verifyPassword()`
    5. If invalid: Log failed attempt `prisma.securityLog.create({ eventType: 'failed_login' })`, return generic error
    6. Generate tokens
    7. Create session (invalidates old sessions - single session constraint)
    8. Update lastLoginAt: `prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } })`
    9. Log success: `prisma.securityLog.create({ eventType: 'login', success: true })`
    10. Determine redirect: `/profile/complete` if !userProfile, else `/dashboard/${role.toLowerCase()}`
    11. Return: `{ success: true, user, accessToken, redirectTo }`
  - **Dependencies**: T015, T016, T017, T018, T019
  - **Blocks**: T023

- [ ] **T028** [P] Implement POST /api/auth/logout Server Action

  - File: `src/app/actions/auth-logout.ts`
  - Directive: `"use server"`
  - Export async function `logoutUser(refreshToken: string): Promise<{ success: boolean }>`
  - Steps:
    1. Find session by refreshToken
    2. If found: Delete session `deleteSession(sessionId)`, clear httpOnly cookie
    3. Log event: `prisma.securityLog.create({ eventType: 'logout', success: true })`
    4. Return: `{ success: true }`
  - Handle missing/invalid token gracefully (still return success for security)
  - **Dependencies**: T016, T018
  - **Blocks**: T022 (useAuth hook uses this)

- [ ] **T029** [P] Implement POST /api/auth/refresh Server Action
  - File: `src/app/actions/auth-refresh.ts`
  - Directive: `"use server"`
  - Export async function `refreshToken(oldRefreshToken: string): Promise<{ accessToken: string, refreshToken: string } | null>`
  - Steps:
    1. Validate old refresh token with `verifyToken()`
    2. Call `refreshAccessToken()` which generates new tokens and rotates refresh token
    3. Update session record with new refreshToken
    4. Set new httpOnly cookie
    5. Return new accessToken to client
  - **Dependencies**: T017, T018
  - **Blocks**: T022 (useAuth may use for automatic token refresh)

---

## Phase 3.7: Profile Completion

- [ ] **T030** Create ProfileForm component

  - File: `src/components/profile-form.tsx`
  - Use React Hook Form + Zod resolver with `profileSchema`
  - Fields: idNumber (Input), year (Select dropdown), section (Input), course (Input), department (Input), campus (Input), currentSemester (Select dropdown)
  - Pre-populate: email (read-only), role (read-only) from user context
  - Validation: All fields required
  - Submit: Call profile create server action (T032)
  - Success: Redirect to role-specific dashboard using redirectTo from response
  - **Dependencies**: T007, T009, T015, T021
  - **Blocks**: T031

- [ ] **T031** Create profile completion page

  - File: `src/app/profile/complete/page.tsx`
  - Implement as Next.js client page (needs form interactivity)
  - Layout: Centered card with heading "Complete Your Profile"
  - Render `<ProfileForm />` component
  - Auth check: Redirect to home if not logged in (use middleware or client check)
  - Show user's email and role at top (fetched from session/token)
  - **Dependencies**: T030
  - **Blocks**: None

- [ ] **T032** [P] Implement POST /api/profile/create Server Action
  - File: `src/app/actions/profile-create.ts`
  - Directive: `"use server"`
  - Export async function `createProfile(data: ProfileInput, userId: string): Promise<{ success: boolean, profile?: Profile, redirectTo?: string }>`
  - Steps:
    1. Validate with `profileSchema.parse(data)`
    2. Check user authentication (extract userId from session/token)
    3. Check if profile already exists: `prisma.userProfile.findUnique({ where: { userId } })`
    4. If exists: Return error "Profile already completed"
    5. Create profile: `prisma.userProfile.create({ data: { userId, ...data, completedAt: new Date() } })`
    6. Get user role to determine redirect
    7. Return: `{ success: true, profile, redirectTo: /dashboard/${role.toLowerCase()} }`
  - **Dependencies**: T015, T016, T021
  - **Blocks**: T030

---

## Phase 3.8: Dashboard Placeholders

**Note**: T033-T035 can run in parallel (different page files)

- [ ] **T033** [P] Create student dashboard placeholder

  - File: `src/app/dashboard/student/page.tsx`
  - Implement as Next.js Server Component
  - Content: Heading "Student Dashboard", placeholder text "Coming soon: View your attendance, upcoming events, and academic progress"
  - Show welcome message with user's name/email
  - Auth protection: Will be enforced by middleware (T036)
  - **Dependencies**: T010
  - **Blocks**: None

- [ ] **T034** [P] Create moderator dashboard placeholder

  - File: `src/app/dashboard/moderator/page.tsx`
  - Implement as Next.js Server Component
  - Content: Heading "Moderator Dashboard", placeholder text "Coming soon: Manage events, verify attendance, generate reports"
  - Show user's role badge
  - **Dependencies**: T010
  - **Blocks**: None

- [ ] **T035** [P] Create admin dashboard placeholder
  - File: `src/app/dashboard/admin/page.tsx`
  - Implement as Next.js Server Component
  - Content: Heading "Administrator Dashboard", placeholder text "Coming soon: User management, system analytics, configuration"
  - Show admin-specific navigation items (placeholders)
  - **Dependencies**: T010
  - **Blocks**: None

---

## Phase 3.9: Middleware & Security

- [ ] **T036** Create auth middleware for protected routes

  - File: `src/middleware.ts`
  - Export Next.js middleware function
  - Protect routes: `/dashboard/*`, `/profile/complete`
  - Steps:
    1. Extract refreshToken from cookies
    2. Verify token with `verifyToken()` and extract userId/role from JWT payload
    3. If invalid/missing: Redirect to `/` (home page) with `?login=true` query param (trigger auth modal)
    4. If valid but accessing `/dashboard/*`: Check user's profile completion status and role
    5. Enforce role-based access: `/dashboard/student` only for Student role, etc.
    6. If profile incomplete: Redirect to `/profile/complete`
    7. If authenticated accessing landing pages: Allow (don't force redirect to dashboard)
  - Config: Export `config = { matcher: ['/dashboard/:path*', '/profile/complete'] }`
  - **Dependencies**: T017, T018, T033-T035, T031
  - **Blocks**: None (final protection layer)

- [ ] **T037** Configure security headers in next.config.ts

  - File: `next.config.ts`
  - Add `async headers()` function returning array of header rules
  - Set security headers for all routes:
    - `Content-Security-Policy`: Restrict script sources, prevent inline scripts (reference Next.js CSP documentation for script-src and style-src directives compatible with Next.js)
    - `X-Frame-Options: DENY`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS)
  - **Dependencies**: None (config file)
  - **Blocks**: None

- [ ] **T038** Add CORS configuration
  - File: `src/middleware.ts` (update existing)
  - Add CORS headers in middleware for API routes
  - Allowlist specific origins from env var `ALLOWED_ORIGINS` (default: empty in dev, strict in prod)
  - Set headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`
  - Only allow credentials (cookies) for allowlisted origins
  - **Dependencies**: T036
  - **Blocks**: None

---

## Phase 3.10: Polish & Validation

**Note**: T039 and T040 can run in parallel if working on different files

- [ ] **T039** [P] Fix ESLint warnings

  - Run `npm run lint` to identify all warnings
  - Fix issues: unused variables, missing dependencies in useEffect, any type usage
  - Ensure no `any` types without JSDoc justification
  - Verify dual validation: Check all forms have both client-side (React Hook Form + Zod) and server-side (Zod in Server Actions) validation
  - Run `npm run lint` again to verify zero warnings
  - **Dependencies**: All previous tasks complete
  - **Blocks**: None

- [ ] **T040** [P] Verify TypeScript strict mode compliance

  - Check `tsconfig.json` has `"strict": true`
  - Run `npx tsc --noEmit` to check for type errors
  - Fix any type errors or unsafe type assertions
  - Ensure all function parameters and return types are explicitly typed
  - **Dependencies**: All previous tasks complete
  - **Blocks**: None

- [ ] **T041** Optimize bundle size

  - Run `npm run build` and check output size
  - Analyze bundle: Use `@next/bundle-analyzer` if needed
  - Ensure no duplicate dependencies
  - Verify tree shaking is working (unused exports removed)
  - Check First Load JS for landing pages is <100KB
  - **Dependencies**: All previous tasks complete
  - **Blocks**: None

- [ ] **T042** Update README.md with setup instructions
  - File: `README.md`
  - Add sections:
    - Prerequisites: Node.js 18+, PostgreSQL, Upstash Redis account
    - Environment Setup: Copy `.env.example` to `.env`, fill in values
    - Database Setup: `npm run db:migrate`
    - Development: `npm run dev`
    - Build: `npm run build`
    - Project Structure: Brief overview of folders
    - Tech Stack: List main dependencies
  - Add link to `specs/001-build-the-foundation/quickstart.md` for manual testing scenarios
  - **Dependencies**: None (documentation)
  - **Blocks**: None

---

## Dependencies Graph

```
Setup Phase:
T001 → T002 → T003 → T004 → (rest of project)
         ↓
       T005 (parallel polish)

Theming Phase:
T002 → T006 → T007 → T008 → T010
                ↓
              T009 (parallel)

Landing Pages (parallel after T010):
T010 → T011, T012, T013 → T014

Auth Logic:
T002,T003 → T015, T016, T017, T019 → T020, T021 (parallel types)
T016,T017 → T018
T002,T020,T021 → T022

Auth UI (sequential):
T007,T009,T015,T020 → T023 → T025
T007,T009,T015,T020 → T024 → T025
T007,T023,T024 → T025 (creates AuthModalTrigger) → update T008 Navigation with AuthModalTrigger

Auth Server Actions (parallel):
T015,T016,T017,T018,T019 → T026, T027
T016,T018 → T028
T017,T018 → T029

Profile:
T007,T009,T015,T021 → T030 → T031
T015,T016,T021 → T032 → T030

Dashboards (parallel):
T010 → T033, T034, T035

Security:
T017,T018,T033-T035,T031 → T036 → T038
(none) → T037

Polish (mostly parallel):
All tasks → T039, T040 (parallel)
All tasks → T041
(none) → T042
```

---

## Parallel Execution Examples

### Wave 1: Setup (Sequential - foundational)

```
T001 → T002 → T003 → T004
```

### Wave 2: Theming Setup

```
Parallel after T007:
- T009 (FormField wrapper)
```

### Wave 3: Landing Pages (Parallel)

```
Parallel after T010:
- T011 (Home page)
- T012 (Events page)
- T013 (RoadMap page)
Then: T014 (optimize images for all three)
```

### Wave 4: Type Definitions (Parallel)

```
Parallel after T015,T002:
- T020 (auth types)
- T021 (profile types)
```

### Wave 5: Auth Server Actions (Parallel)

```
Parallel after T015,T016,T017,T018,T019:
- T026 (register action)
- T027 (login action)
- T028 (logout action)
- T029 (refresh action)
```

### Wave 6: Dashboards (Parallel)

```
Parallel after T010:
- T033 (student dashboard)
- T034 (moderator dashboard)
- T035 (admin dashboard)
```

### Wave 7: Final Polish (Parallel)

```
Parallel after all implementation:
- T039 (fix ESLint)
- T040 (verify TypeScript)
```

---

## Validation Checklist

- [x] All 4 contract files have corresponding Server Action implementations (T026-T029 for auth-\*, T032 for profile-create)
- [x] All 5 entities from data-model.md have Prisma schema (T001)
- [x] No automated tests (per project requirement - testing not required)
- [x] Parallel tasks [P] are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Setup tasks come before all others
- [x] Core logic (models, utilities) before UI components
- [x] Server Actions before they're consumed by forms
- [x] All tasks are specific enough for LLM execution

---

## Notes

- **No Testing Required**: This project does not include automated tests per constitution decision
- **Manual Verification**: Use `specs/001-build-the-foundation/quickstart.md` for manual testing scenarios
- **Single Session Constraint**: T018 and T026/T027 enforce single active session per user (new login invalidates old sessions)
- **Rate Limiting**: T019, T026, T027 enforce 5 attempts per hour per email address
- **Token Lifetimes**: Access token = 1 hour, Refresh token = 30 days (from clarifications)
- **No Email Verification**: Registration is instant (T026), no email service integration needed
- **Password Reset**: Out of scope for MVP (deferred to future features)
- **Accessibility**: All tasks involving UI components must ensure WCAG 2.1 AA compliance
- **Performance**: Landing pages must achieve FCP <1.8s, LCP <2.5s, Lighthouse ≥90
- **Commit Strategy**: Commit after each completed task for incremental progress tracking

### Terminology Standards

- **Authentication Modal**: Use "AuthModal" for component names in code, "authentication modal" in user-facing documentation and comments
- **Session Entity vs Concept**: Use "Session" (capitalized) for the database entity/model, "user session" or "active session" for the conceptual logged-in state
- **Modern Form**: Refers to shadcn/ui Form components with Tailwind CSS styling, green/yellow accent colors, real-time validation, accessible labels, and responsive design
- **Responsive Design**: Mobile-first approach supporting 320px (mobile), 768px (tablet), 1920px (desktop), up to 2560px (ultra-wide monitors)
- **Mobile-First**: CSS uses `min-width` media queries (not `max-width`), base styles target mobile devices, enhancements added for larger screens

### Additional Validation

- **Dual Validation**: All forms MUST validate on both client-side (React Hook Form + Zod) AND server-side (Zod in Server Actions) - verify in T039
- **Mobile-First CSS**: Verify in code review that CSS uses `min-width` media queries, not `max-width` (mobile styles first, desktop enhancements added)
- **SecurityLog Coverage**: Authentication events logging (FR-048) verified in quickstart.md scenario 8

---

## Estimated Timeline

**Total Tasks**: 42  
**Parallel Opportunities**: 15 tasks can run in parallel (T009, T011-T014, T020-T021, T026-T029, T032-T035, T039-T040)  
**Sequential Critical Path**: ~27 tasks  
**Estimated Completion**: 2-3 weeks (based on 2-3 tasks per day average)

**Phases Breakdown**:

- Phase 3.1 Setup: 1-2 days (T001-T005)
- Phase 3.2 Theming: 1 day (T006-T010)
- Phase 3.3 Landing Pages: 1-2 days (T011-T014 parallel)
- Phase 3.4 Auth Logic: 2-3 days (T015-T022)
- Phase 3.5 Auth UI: 2 days (T023-T025)
- Phase 3.6 Server Actions: 1-2 days (T026-T029 parallel)
- Phase 3.7 Profile: 1-2 days (T030-T032)
- Phase 3.8 Dashboards: 1 day (T033-T035 parallel)
- Phase 3.9 Security: 1 day (T036-T038)
- Phase 3.10 Polish: 1-2 days (T039-T042 mostly parallel)

---

_Generated from specs/001-build-the-foundation/plan.md, data-model.md, contracts/, research.md_  
_No automated testing per project constitution - manual verification via quickstart.md_
