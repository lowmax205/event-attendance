# Implementation Plan: Landing Pages & Authentication Foundation

**Branch**: `001-build-the-foundation` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `D:\Shared Folder\VS Code Project\Coding 2025\School\event-attendance\specs\001-build-the-foundation\spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"

2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type

3. Fill the Constitution Check section based on the content of the constitution document.

4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check

5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"

6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).

7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check

8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)

9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 9. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Build the foundation for the Event Attendance System MVP, including three responsive landing pages (Home, Events, RoadMap) with green/yellow branding and a complete role-based authentication system. Users can register with email/password selecting a role (Student/Moderator/Administrator), complete an academic profile with 7 required fields, and be redirected to role-specific dashboard placeholders. The system prioritizes WCAG 2.1 AA accessibility, sub-2-second page loads on 3G, and comprehensive security (bcrypt password hashing, JWT sessions with 1-hour access tokens and 30-day refresh tokens, rate limiting of 5 attempts per hour per email, single active session per user, input sanitization). No email verification required for MVP; password reset deferred to future features.

## Technical Context

**Language/Version**: TypeScript 5+ with Next.js 15.5.4, React 18.3.1

**Technical Approach**: Next.js 15 full-stack application using Server Components for landing pages, Server Actions for authentication, React Hook Form with Zod validation for forms, shadcn/ui components with green/yellow theming, and Prisma ORM with PostgreSQL for data persistence.

**Primary Dependencies**: Next.js (full-stack framework), Tailwind CSS 4, shadcn/ui, React Hook Form, Zod, Prisma, bcryptjs, jose (JWT), Sonner (notifications)

**Storage**: PostgreSQL database via Prisma ORM (development: local Docker, production: managed service)

**Testing**: None (testing not required for this project)

**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions), mobile-first responsive (320px-2560px)

**Project Type**: Single Next.js application (unified frontend + backend via App Router and Server Actions)

**Performance Goals**: FCP <1.8s on 3G, LCP <2.5s, FID <100ms, CLS <0.1, Lighthouse score ≥90

**Constraints**: WCAG 2.1 AA compliance, 44×44px touch targets, dual validation (client + server), bcrypt cost ≥12, no API secrets in client code, single active session per user, 5 failed login attempts per hour per email, access token 1hr/refresh token 30 days

**Scale/Scope**: Initial MVP for educational institutions, 3 user roles, 3 landing pages, 1 auth modal, 1 profile form, 3 dashboard placeholders

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Code Quality & TypeScript Excellence ✅ PASS

- [x] TypeScript strict mode enabled in tsconfig.json
- [x] ESLint 9+ configured (already in package.json)
- [x] Prettier configured for auto-formatting
- [x] All components will have explicit TypeScript interfaces
- [x] JSDoc comments SHOULD have JSDoc (recommended for maintainability)
- [x] No `any` types without documented justification
- [x] Single responsibility: Separate components for nav, modal, forms, pages
- [x] Testing not required (removed from project scope)

### II. User Experience First ✅ PASS

- [x] Mobile-first design: Landing pages and auth modal optimized for 320px+
- [x] Touch targets ≥44×44px for all interactive elements (per FR-035)
- [x] WCAG 2.1 AA compliance mandatory (per FR-034, FR-036-040)
- [x] Semantic HTML with proper ARIA labels
- [x] Keyboard navigation and screen reader support (per FR-037-038, FR-040)
- [x] Immediate UI feedback: Form validation on blur (per FR-011-015)
- [x] Consistent navigation: Max 3 clicks to any feature (landing → login → profile → dashboard)
- [x] Clear error messages without security leaks (per FR-016)

### III. Performance Standards (NON-NEGOTIABLE) ✅ PASS

- [x] Target: FCP <1.8s on 3G (per FR-006)
- [x] LCP <2.5s, FID <100ms, CLS <0.1 (Core Web Vitals)
- [x] Lighthouse score ≥90 (per FR-041)
- [x] Next.js Server Components for initial page loads (SSR)
- [x] Optimized images: WebP with responsive sizes, lazy loading
- [x] Code splitting by route (Next.js automatic)
- [x] Green/yellow theme CSS variables (no heavy CSS-in-JS overhead)

### IV. Security & Privacy ✅ PASS

- [x] bcrypt password hashing with cost factor ≥12 (per FR-031)
- [x] JWT with access token (1 hour) and refresh token (30 days) (per FR-032, Clarification)
- [x] Single active session per user enforced (per FR-032a, Clarification)
- [x] Dual input validation: Client (React Hook Form + Zod) + Server (Zod schemas) (per FR-042)
- [x] Environment variables for secrets (DATABASE_URL, JWT_SECRET)
- [x] HTTPS required in production (per FR-044) (infrastructure/deployment concern, verify in production checklist)
- [x] CORS allowlist specific origins (per FR-045)
- [x] Rate limiting: 5 failed login attempts per hour per email address (per FR-043, Clarification)
- [x] Security headers: CSP, X-Frame-Options, HSTS (per FR-046)
- [x] Input sanitization to prevent XSS (per FR-047)
- [x] Security audit logging (per FR-048)

### V. Maintainability & Component Architecture ✅ PASS

- [x] shadcn/ui for all UI components (Dialog, Input, Button, Select, etc.)
- [x] Folder structure: `/src/app/` (pages), `/src/components/` (React), `/src/lib/` (utils), `/src/hooks/` (custom hooks)
- [x] Component composition: AuthModal > LoginForm/RegisterForm, ProfileForm standalone
- [x] Explicit prop interfaces with TypeScript
- [x] Reusable components: Navigation, AuthModal, FormField wrappers
- [x] Single responsibility: Each page/component has one purpose

## Project Structure

### Documentation (this feature)

```
specs/001-build-the-foundation/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── spec.md              # Feature specification (input)
└── contracts/           # Phase 1 output (/plan command)
    ├── auth-register.json
    ├── auth-login.json
    ├── auth-logout.json
    ├── profile-create.json
    └── profile-update.json
```

### Source Code (repository root)

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (existing)
│   ├── page.tsx                 # Home page (landing)
│   ├── globals.css              # Global styles (existing, update theme)
│   ├── events/
│   │   └── page.tsx             # Events landing page
│   ├── roadmap/
│   │   └── page.tsx             # RoadMap landing page
│   ├── profile/
│   │   └── complete/
│   │       └── page.tsx         # Profile completion page
│   ├── dashboard/
│   │   ├── student/
│   │   │   └── page.tsx         # Student dashboard placeholder
│   │   ├── moderator/
│   │   │   └── page.tsx         # Moderator dashboard placeholder
│   │   └── admin/
│   │       └── page.tsx         # Admin dashboard placeholder
│   └── api/
│       └── auth/
│           └── [...nextauth]/   # Auth API routes (optional NextAuth.js)
│           # OR use Server Actions directly in app/ routes
│
├── components/
│   ├── ui/                      # shadcn/ui components (existing + new)
│   │   ├── button.tsx           # (existing)
│   │   ├── dialog.tsx           # (existing)
│   │   ├── input.tsx            # (existing)
│   │   ├── select.tsx           # (existing)
│   │   ├── badge.tsx            # (existing)
│   │   ├── form.tsx             # NEW: shadcn form primitives
│   │   └── label.tsx            # NEW: shadcn label
│   ├── navigation.tsx           # NEW: Persistent nav bar
│   ├── auth-modal.tsx           # NEW: Authentication modal
│   ├── login-form.tsx           # NEW: Login form component
│   ├── register-form.tsx        # NEW: Registration form component
│   └── profile-form.tsx         # NEW: Profile completion form
│
├── lib/
│   ├── utils.ts                 # (existing) Tailwind merge utilities
│   ├── db.ts                    # NEW: Prisma client singleton
│   ├── auth.ts                  # NEW: Auth utilities (JWT, bcrypt)
│   ├── validations.ts           # NEW: Zod schemas for forms
│   └── session.ts               # NEW: Session management utilities
│
├── hooks/
│   ├── use-mobile.ts            # (existing)
│   └── use-auth.ts              # NEW: Custom auth hook
│
└── types/
    ├── auth.ts                  # NEW: Auth type definitions
    └── profile.ts               # NEW: Profile type definitions

prisma/
├── schema.prisma                # NEW: Database schema
└── migrations/                  # NEW: Auto-generated migrations

public/
├── images/                      # NEW: Optimized images for landing pages
│   └── logo.svg                # NEW: Green/yellow logo
└── favicon.ico                  # (existing, may update)
```

**Structure Decision**: Single Next.js application using App Router. This unified structure is ideal because:

- Next.js 15 Server Components handle SSR for landing pages (performance)
- Server Actions eliminate need for separate API routes (simplicity)
- Co-location of frontend and backend code reduces context switching
- Prisma ORM abstracts database layer for clean separation
- `/src/app/` contains all pages using file-based routing
- `/src/components/` separates reusable UI (shadcn/ui pattern)
- `/src/lib/` centralizes business logic and utilities
- Authentication logic stays server-side via Server Actions (security)

```

### I. Code Quality & TypeScript Excellence ✅ PASSspecs/[###-feature]/

├── plan.md              # This file (/plan command output)

- [x] TypeScript strict mode enabled in tsconfig.json├── research.md          # Phase 0 output (/plan command)

- [x] ESLint 9+ configured (already in package.json)├── data-model.md        # Phase 1 output (/plan command)

- [x] Prettier configured for auto-formatting├── quickstart.md        # Phase 1 output (/plan command)

- [x] All components will have explicit TypeScript interfaces├── contracts/           # Phase 1 output (/plan command)

- [x] JSDoc comments required for public functions/components└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)

- [x] No `any` types without documented justification```

- [x] Single responsibility: Separate components for nav, modal, forms, pages

- [x] Testing not required (removed from project scope)### Source Code (repository root)

<!--

### II. User Experience First ✅ PASS  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout

  for this feature. Delete unused options and expand the chosen structure with

- [x] Mobile-first design: Landing pages and auth modal optimized for 320px+  real paths (e.g., apps/admin, packages/something). The delivered plan must

- [x] Touch targets ≥44×44px for all interactive elements (per FR-035)  not include Option labels.

- [x] WCAG 2.1 AA compliance mandatory (per FR-034, FR-036-040)-->

- [x] Semantic HTML with proper ARIA labels```

- [x] Keyboard navigation and screen reader support (per FR-037-038, FR-040)# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)

- [x] Immediate UI feedback: Form validation on blur (per FR-011-015)src/

- [x] Consistent navigation: Max 3 clicks to any feature (landing → login → profile → dashboard)├── models/

- [x] Clear error messages without security leaks (per FR-016)├── services/

├── cli/

### III. Performance Standards (NON-NEGOTIABLE) ✅ PASS└── lib/



- [x] Target: FCP <1.8s on 3G (per FR-006)tests/

- [x] LCP <2.5s, FID <100ms, CLS <0.1 (Core Web Vitals)├── contract/

- [x] Lighthouse score ≥90 (per FR-041)├── integration/

- [x] Next.js Server Components for initial page loads (SSR)└── unit/

- [x] Optimized images: WebP with responsive sizes, lazy loading

- [x] Code splitting by route (Next.js automatic)# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)

- [x] Green/yellow theme CSS variables (no heavy CSS-in-JS overhead)backend/

├── src/

### IV. Security & Privacy ✅ PASS│   ├── models/

│   ├── services/

- [x] bcrypt password hashing with cost factor ≥12 (per FR-031)│   └── api/

- [x] JWT with access token (1 hour) and refresh token (30 days) (per FR-032, Clarification)└── tests/

- [x] Single active session per user enforced (per FR-032a, Clarification)

- [x] Dual input validation: Client (React Hook Form + Zod) + Server (Zod schemas) (per FR-042)frontend/

- [x] Environment variables for secrets (DATABASE_URL, JWT_SECRET)├── src/

- [x] HTTPS required in production (per FR-044)│   ├── components/

- [x] CORS allowlist specific origins (per FR-045)│   ├── pages/

- [x] Rate limiting: 5 failed login attempts per hour per email address (per FR-043, Clarification)│   └── services/

- [x] Security headers: CSP, X-Frame-Options, HSTS (per FR-046)└── tests/

- [x] Input sanitization to prevent XSS (per FR-047)

- [x] Security audit logging (per FR-048)# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)

api/

### V. Maintainability & Component Architecture ✅ PASS└── [same as backend above]



- [x] shadcn/ui for all UI components (Dialog, Input, Button, Select, etc.)ios/ or android/

- [x] Folder structure: `/src/app/` (pages), `/src/components/` (React), `/src/lib/` (utils), `/src/hooks/` (custom hooks)└── [platform-specific structure: feature modules, UI flows, platform tests]

- [x] Component composition: AuthModal > LoginForm/RegisterForm, ProfileForm standalone```

- [x] Explicit prop interfaces with TypeScript

- [x] Reusable components: Navigation, AuthModal, FormField wrappers**Structure Decision**: [Document the selected structure and reference the real

- [x] Single responsibility: Each page/component has one purposedirectories captured above]



## Project Structure## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

### Documentation (this feature)   - For each NEEDS CLARIFICATION → research task

   - For each dependency → best practices task

```   - For each integration → patterns task

specs/001-build-the-foundation/

├── plan.md              # This file (/plan command output)2. **Generate and dispatch research agents**:

├── research.md          # Phase 0 output (/plan command)   ```

├── data-model.md        # Phase 1 output (/plan command)   For each unknown in Technical Context:

├── quickstart.md        # Phase 1 output (/plan command)     Task: "Research {unknown} for {feature context}"

├── spec.md              # Feature specification (input)   For each technology choice:

└── contracts/           # Phase 1 output (/plan command)     Task: "Find best practices for {tech} in {domain}"

    ├── auth-register.json   ```

    ├── auth-login.json

    ├── auth-logout.json3. **Consolidate findings** in `research.md` using format:

    ├── profile-create.json   - Decision: [what was chosen]

    └── profile-update.json   - Rationale: [why chosen]

```   - Alternatives considered: [what else evaluated]



### Source Code (repository root)**Output**: research.md with all NEEDS CLARIFICATION resolved



```## Phase 1: Design & Contracts

src/*Prerequisites: research.md complete*

├── app/                          # Next.js App Router

│   ├── layout.tsx               # Root layout (existing)1. **Extract entities from feature spec** → `data-model.md`:

│   ├── page.tsx                 # Home page (landing)   - Entity name, fields, relationships

│   ├── globals.css              # Global styles (existing, update theme)   - Validation rules from requirements

│   ├── events/   - State transitions if applicable

│   │   └── page.tsx             # Events landing page

│   ├── roadmap/2. **Generate API contracts** from functional requirements:

│   │   └── page.tsx             # RoadMap landing page   - For each user action → endpoint

│   ├── profile/   - Use standard REST/GraphQL patterns

│   │   └── complete/   - Output OpenAPI/GraphQL schema to `/contracts/`

│   │       └── page.tsx         # Profile completion page

│   ├── dashboard/3. **Generate contract tests** from contracts:

│   │   ├── student/   - One test file per endpoint

│   │   │   └── page.tsx         # Student dashboard placeholder   - Assert request/response schemas

│   │   ├── moderator/   - Tests must fail (no implementation yet)

│   │   │   └── page.tsx         # Moderator dashboard placeholder

│   │   └── admin/4. **Extract test scenarios** from user stories:

│   │       └── page.tsx         # Admin dashboard placeholder   - Each story → integration test scenario

│   └── api/   - Quickstart test = story validation steps

│       └── auth/

│           └── [...nextauth]/   # Auth API routes (optional NextAuth.js)5. **Update agent file incrementally** (O(1) operation):

│           # OR use Server Actions directly in app/ routes   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`

│     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.

├── components/   - If exists: Add only NEW tech from current plan

│   ├── ui/                      # shadcn/ui components (existing + new)   - Preserve manual additions between markers

│   │   ├── button.tsx           # (existing)   - Update recent changes (keep last 3)

│   │   ├── dialog.tsx           # (existing)   - Keep under 150 lines for token efficiency

│   │   ├── input.tsx            # (existing)   - Output to repository root

│   │   ├── select.tsx           # (existing)

│   │   ├── badge.tsx            # (existing)**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

│   │   ├── form.tsx             # NEW: shadcn form primitives

│   │   └── label.tsx            # NEW: shadcn label## Phase 2: Task Planning Approach

│   ├── navigation.tsx           # NEW: Persistent nav bar*This section describes what the /tasks command will do - DO NOT execute during /plan*

│   ├── auth-modal.tsx           # NEW: Authentication modal

│   ├── login-form.tsx           # NEW: Login form component**Task Generation Strategy**:

│   ├── register-form.tsx        # NEW: Registration form component- Load `.specify/templates/tasks-template.md` as base

│   └── profile-form.tsx         # NEW: Profile completion form- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)

│- Each contract → contract test task [P]

├── lib/- Each entity → model creation task [P]

│   ├── utils.ts                 # (existing) Tailwind merge utilities- Each user story → integration test task

│   ├── db.ts                    # NEW: Prisma client singleton- Implementation tasks to make tests pass

│   ├── auth.ts                  # NEW: Auth utilities (JWT, bcrypt)

│   ├── validations.ts           # NEW: Zod schemas for forms**Ordering Strategy**:

│   └── session.ts               # NEW: Session management utilities- TDD order: Tests before implementation

│- Dependency order: Models before services before UI

├── hooks/- Mark [P] for parallel execution (independent files)

│   ├── use-mobile.ts            # (existing)

│   └── use-auth.ts              # NEW: Custom auth hook**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

│

└── types/**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

    ├── auth.ts                  # NEW: Auth type definitions

    └── profile.ts               # NEW: Profile type definitions## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

prisma/

├── schema.prisma                # NEW: Database schema**Phase 3**: Task execution (/tasks command creates tasks.md)

└── migrations/                  # NEW: Auto-generated migrations**Phase 4**: Implementation (execute tasks.md following constitutional principles)

**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

public/

├── images/                      # NEW: Optimized images for landing pages## Complexity Tracking

│   └── logo.svg                # NEW: Green/yellow logo*Fill ONLY if Constitution Check has violations that must be justified*

└── favicon.ico                  # (existing, may update)

```| Violation | Why Needed | Simpler Alternative Rejected Because |

|-----------|------------|-------------------------------------|

**Structure Decision**: Single Next.js application using App Router. This unified structure is ideal because:| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |

| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

- Next.js 15 Server Components handle SSR for landing pages (performance)

- Server Actions eliminate need for separate API routes (simplicity)

- Co-location of frontend and backend code reduces context switching## Progress Tracking

- Prisma ORM abstracts database layer for clean separation*This checklist is updated during execution flow*

- `/src/app/` contains all pages using file-based routing

- `/src/components/` separates reusable UI (shadcn/ui pattern)**Phase Status**:

- `/src/lib/` centralizes business logic and utilities- [ ] Phase 0: Research complete (/plan command)

- Authentication logic stays server-side via Server Actions (security)- [ ] Phase 1: Design complete (/plan command)

- [ ] Phase 2: Task planning complete (/plan command - describe approach only)

## Phase 0: Outline & Research- [ ] Phase 3: Tasks generated (/tasks command)

- [ ] Phase 4: Implementation complete

✅ **COMPLETE** - See `research.md`- [ ] Phase 5: Validation passed



### Research Areas Covered**Gate Status**:

- [ ] Initial Constitution Check: PASS

1. **Next.js 15 App Router Architecture**- [ ] Post-Design Constitution Check: PASS

- [ ] All NEEDS CLARIFICATION resolved

   - Decision: Server Components + Server Actions for entire application- [ ] Complexity deviations documented

   - Rationale: Zero-JS landing pages, server-side auth logic security

---

2. **Authentication Strategy***Based on Constitution v2.1.1 - See `/memory/constitution.md`*


   - Decision: Custom JWT + bcryptjs (not NextAuth.js)
   - Rationale: Full control, simple role-based auth, meets security requirements
   - Tokens: 1 hour access, 30 days refresh (from Clarification)
   - Sessions: Single active session per user (from Clarification)

3. **Form Validation Architecture**

   - Decision: React Hook Form + Zod (shared client/server schemas)
   - Rationale: Type safety, dual validation, performance

4. **Database & ORM Selection**

   - Decision: Prisma + PostgreSQL
   - Rationale: Type generation, migrations, ACID compliance

5. **Theming with Green/Yellow Colors**

   - Decision: Tailwind CSS custom colors with CSS variables
   - Verified: WCAG AA contrast ratios (Green 700, Yellow 700 for text)

6. **Accessibility Implementation Strategy**

   - Tools: ESLint plugin for development, manual verification
   - Coverage: Keyboard navigation, screen reader testing, Chrome Lighthouse
   - No automated testing frameworks (per project decision)

7. **Performance Optimization Techniques**

   - Image optimization, font optimization, code splitting, Server Components, caching

8. **Rate Limiting Implementation**

   - Decision: @upstash/ratelimit with Redis
   - Configuration: 5 attempts per hour per email address (from Clarification)

9. **Security Headers Configuration**

   - Configured via next.config.ts: CSP, X-Frame-Options, HSTS, etc.

10. **Session Management Strategy**
    - httpOnly cookies for refresh tokens, in-memory access tokens
    - Token lifecycle: 1 hour access, 30 days refresh (from Clarification)
    - Single active session: New login invalidates previous sessions (from Clarification)
    - No email verification for MVP (from Clarification)
    - Password reset deferred to future feature (from Clarification)

**Output**: research.md with all technical decisions documented

---

## Phase 1: Design & Contracts

✅ **COMPLETE** - See `data-model.md`, `contracts/`, `quickstart.md`

### 1. Data Model (`data-model.md`)

**Entities Extracted from Spec**:

- **User**: Authentication data (email, passwordHash, role, accountStatus) - removed email verification status per Clarification
- **UserProfile**: Academic details (idNumber, year, section, course, department, campus, currentSemester)
- **Session**: Active sessions (accessToken 1hr, refreshToken 30 days, metadata) - single session per user enforced per Clarification
- **Role**: Enum (Student, Moderator, Administrator)
- **SecurityLog**: Audit trail (eventType, success, failReason, timestamps)

**Relationships**:

- User 1:1 UserProfile (optional until completion)
- User 1:1 Session (single active session per user)
- User 1:N SecurityLog (audit trail)

**Validation Rules**: All Zod schemas defined for email, password, profile fields

**State Machine**: Complete authentication flow documented (anonymous → registered → profile complete → role-specific dashboard)

### 2. API Contracts (`contracts/`)

**Endpoints Created**:

1. `auth-register.json` - POST /api/auth/register

   - Input: email, password, confirmPassword, role
   - Output: 201 + user + accessToken + refreshToken cookie
   - No email verification (instant activation per Clarification)

2. `auth-login.json` - POST /api/auth/login

   - Input: email, password
   - Output: 200 + user + accessToken + redirectTo + refreshToken cookie
   - Business logic: Redirect to profile completion or dashboard based on profileComplete
   - Invalidates all previous sessions (per Clarification)
   - Rate limiting: 5 attempts/hour per email (per Clarification)

3. `auth-logout.json` - POST /api/auth/logout

   - Input: Authorization header (Bearer token)
   - Output: 200 + clears cookie + deletes session

4. `profile-create.json` - POST /api/profile/create

   - Input: 7 academic fields (idNumber, year, section, course, department, campus, currentSemester)
   - Output: 201 + profile + redirectTo

5. `profile-update.json` - PATCH /api/profile/update
   - Status: NOT IMPLEMENTED (future feature, placeholder contract)

### 3. Manual Testing Guide (`quickstart.md`)

**10 Manual Verification Scenarios** (for development reference only):

1. Landing Page Navigation (responsive, performance)
2. User Registration Flow (validation, side effects, instant activation)
3. Profile Completion Flow (pre-population, redirection)
4. Login Flow (existing user, profile check, session invalidation)
5. Rate Limiting (5 attempts/hour enforcement)
6. Accessibility Compliance (WCAG 2.1 AA, keyboard, screen reader)
7. Performance Validation (Lighthouse, Core Web Vitals)
8. Security Validation (hashing, JWT, cookies, headers, XSS, CORS)
9. Role-Based Dashboard Access (3 roles, cross-role prevention)
10. Logout and Session Invalidation

**Note**: These scenarios are for manual verification during development only, not automated tests.

### 4. Agent Context File

**Status**: ⏭️ SKIPPED for /plan command

- Agent context file update will be executed during /tasks command
- Uses `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
- Incremental update: adds only NEW tech from this plan

**Output**:

- ✅ data-model.md (entities, relationships, Prisma schema, Zod validations)
- ✅ contracts/ directory with 5 JSON contract files
- ✅ quickstart.md (manual verification guide)
- ⏭️ Agent context file (deferred to /tasks command)

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

The /tasks command will load `.specify/templates/tasks-template.md` and generate approximately 35-40 numbered tasks organized by the following approach:

### Task Categories

1. **Setup Tasks (T001-T005)**

   - Initialize Prisma with PostgreSQL
   - Install dependencies (Prisma, bcryptjs, jose, React Hook Form, Zod, @upstash/ratelimit)
   - Configure environment variables template
   - Setup database schema and run migrations
   - Configure Husky pre-commit hooks for ESLint/Prettier

2. **Theming & Base Components (T006-T010)**

   - Update `globals.css` with green/yellow CSS variables and Tailwind config
   - Install missing shadcn/ui components (Form, Label if not present)
   - Create Navigation component (persistent header with responsive menu)
   - Create reusable FormField wrapper component
   - Update layout.tsx with Navigation and theming

3. **Landing Pages (T011-T014)** - [P] Parallel (different files)

   - T011 [P]: Create Home page (`src/app/page.tsx`)
   - T012 [P]: Create Events page (`src/app/events/page.tsx`)
   - T013 [P]: Create RoadMap page (`src/app/roadmap/page.tsx`)
   - T014 [P]: Optimize images for landing pages (WebP, responsive sizes)

4. **Authentication Logic (T015-T022)** - Sequential (shared utilities)

   - T015: Create Zod validation schemas (`src/lib/validations.ts`)
   - T016: Create Prisma client singleton (`src/lib/db.ts`)
   - T017: Create auth utilities (`src/lib/auth.ts` - bcrypt, JWT functions)
   - T018: Create session management utilities (`src/lib/session.ts` - single session enforcement)
   - T019: Create rate limiting setup (`src/lib/rate-limit.ts` - 5 attempts/hour per email)
   - T020 [P]: Create auth TypeScript types (`src/types/auth.ts`)
   - T021 [P]: Create profile TypeScript types (`src/types/profile.ts`)
   - T022: Create useAuth custom hook (`src/hooks/use-auth.ts`)

5. **Authentication UI Components (T023-T025)** - Sequential (dependencies)

   - T023: Create LoginForm component (`src/components/login-form.tsx`)
   - T024: Create RegisterForm component (`src/components/register-form.tsx`)
   - T025: Create AuthModal component wrapping Login/Register (`src/components/auth-modal.tsx`)

6. **Authentication Server Actions (T026-T029)** - [P] Parallel endpoints

   - T026 [P]: POST /api/auth/register Server Action (instant activation, no email)
   - T027 [P]: POST /api/auth/login Server Action (invalidate old sessions, rate limiting)
   - T028 [P]: POST /api/auth/logout Server Action
   - T029 [P]: POST /api/auth/refresh Server Action (token refresh with 1hr/30day expiry)

7. **Profile Completion (T030-T032)**

   - T030: Create ProfileForm component (`src/components/profile-form.tsx`)
   - T031: Create profile completion page (`src/app/profile/complete/page.tsx`)
   - T032: POST /api/profile/create Server Action

8. **Dashboard Placeholders (T033-T035)** - [P] Parallel pages

   - T033 [P]: Create student dashboard placeholder (`src/app/dashboard/student/page.tsx`)
   - T034 [P]: Create moderator dashboard placeholder (`src/app/dashboard/moderator/page.tsx`)
   - T035 [P]: Create admin dashboard placeholder (`src/app/dashboard/admin/page.tsx`)

9. **Middleware & Security (T036-T038)**

   - T036: Create auth middleware for protected routes (`src/middleware.ts`)
   - T037: Configure security headers in `next.config.ts`
   - T038: Add CORS configuration

10. **Polish & Validation (T039-T042)**
    - T039: Fix ESLint warnings
    - T040: Verify TypeScript strict mode compliance
    - T041: Optimize bundle size (check build output)
    - T042: Update README.md with setup instructions

**Ordering Strategy**:

- Setup (T001-T005) MUST complete before all other tasks
- Theming (T006-T010) blocks UI components
- Auth utilities (T015-T022) blocks Server Actions (T026-T029)
- UI components (T023-T025) blocks page integration
- Server Actions (T026-T029) must be complete before profile components
- Profile completion (T030-T032) blocks dashboard access
- Dashboards (T033-T035) and Security (T036-T038) can overlap

**Parallel Execution ([P] markers)**:

- Landing pages (T011-T014): Can be built simultaneously (different files)
- Auth types (T020-T021): Independent type definitions
- Server Actions (T026-T029): Different endpoints
- Dashboard placeholders (T033-T035): Different pages

**Estimated Total**: 42 tasks (5 setup + 5 theming + 32 implementation)

**Estimated Timeline**: 2-3 weeks for full implementation (no testing overhead)

**IMPORTANT**: The /tasks command will create `tasks.md` with the complete numbered task list following this structure. The /plan command does NOT create tasks.md.

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (manual verification via quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

**No violations** - All constitutional requirements are met:

- ✅ TypeScript strict mode, ESLint, Prettier
- ✅ WCAG 2.1 AA accessibility
- ✅ Performance targets <2s load, Core Web Vitals
- ✅ Security (bcrypt, JWT with 1hr/30day tokens, rate limiting 5/hour, single session, headers, sanitization)
- ✅ shadcn/ui components, consistent folder structure
- ✅ No testing required (project decision)

---

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning approach described (/plan command) ✅
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved (none were present) ✅
- [x] Complexity deviations documented (none exist) ✅
- [x] Clarifications session completed (5 questions answered) ✅

**Artifacts Generated**:

- [x] `research.md` (10 technical decisions documented)
- [x] `data-model.md` (5 entities, relationships, Prisma schema, Zod validations)
- [x] `contracts/auth-register.json` (endpoint specification)
- [x] `contracts/auth-login.json` (endpoint specification)
- [x] `contracts/auth-logout.json` (endpoint specification)
- [x] `contracts/profile-create.json` (endpoint specification)
- [x] `contracts/profile-update.json` (placeholder, not MVP)
- [x] `quickstart.md` (manual verification guide)
- [x] `plan.md` (this file)

**Clarifications Integrated**:

- [x] No email verification required (instant registration)
- [x] Rate limiting: 5 attempts per hour per email address
- [x] Token lifetimes: Access 1 hour, Refresh 30 days
- [x] Password reset out of scope for MVP
- [x] Single active session per user (new login invalidates old sessions)

**Ready for Next Phase**: ✅ YES - Execute `/tasks` command to generate tasks.md

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
```
