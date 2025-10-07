
# Implementation Plan: Management System & Analytics

**Branch**: `003-complete-the-event` | **Date**: 2025-10-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-complete-the-event/spec.md`

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

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

This feature completes the Event Attendance System by adding comprehensive management capabilities and analytics. Building upon Phases 1 (authentication & landing pages) and 2 (QR attendance & basic dashboards), this phase delivers:

**Management System**:
- Admin user management (create, suspend, reset passwords, delete users, change roles)
- Event management for moderators/admins (create, edit, generate QR codes - moderators see only their own events)
- Attendance management with verification workflow (approve/reject with notes, handle disputes)

**Data Export & Analytics**:
- Export to CSV/Excel (.xlsx) with filtering capabilities
- Analytics dashboard with line charts (trends), bar charts (comparisons/rankings), pie charts (distributions)
- Metrics: total events/attendances, verification rates, department/course attendance breakdown

**Technical Approach**: Extend existing Next.js App Router pages, add new dashboard sections, implement data table components with shadcn/ui, integrate chart library, add server actions for CRUD operations, and extend Prisma schema for analytics aggregations.

## Technical Context
**Language/Version**: TypeScript 5.x with Next.js 15.5.4 (React 18.3.1), strict mode enabled  
**Primary Dependencies**: Next.js App Router, Prisma 6.16.3 (PostgreSQL), React Hook Form 7.64.0, Zod 4.1.11, shadcn/ui (Radix UI), jose 6.1.0 (JWT), bcryptjs 3.0.2, chart library (Recharts recommended for React/Next.js compatibility)  
**Storage**: PostgreSQL via Prisma ORM for user/event/attendance data; Cloudinary for photos/signatures  
**Testing**: Manual validation only (no automated tests required per project decision)  
**Target Platform**: Web (responsive desktop + mobile), Chrome/Firefox/Safari/Edge (latest 2 versions)  
**Project Type**: Web application (single Next.js project with app router)  
**Performance Goals**: Page load <2s on 3G, Lighthouse score ≥90, LCP <2.5s, FID <100ms, CLS <0.1  
**Constraints**: Export file size limit 10,000 records, analytics calculations must be cached/optimized, role-based access control enforced server-side  
**Scale/Scope**: ~30-40 new components/pages, extend 6 Prisma models, add 75 functional requirements across 5 management sections (user/event/attendance management, export, analytics)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality & TypeScript Excellence
- [x] TypeScript strict mode enabled (`tsconfig.json`)
- [x] ESLint + Prettier configured (enforced via Husky pre-commit)
- [x] No `any` types without justification (to be enforced during implementation)
- [x] Modular component structure (shadcn/ui patterns)

### II. User Experience First
- [x] Mobile-first for data tables (responsive design, touch-friendly controls)
- [x] Desktop-optimized dashboards (efficient screen use, keyboard shortcuts for bulk actions)
- [x] WCAG 2.1 AA compliance (inherited from Phase 1, semantic HTML, ARIA labels, keyboard navigation)
- [x] Immediate UI feedback (loading states for exports/analytics, error messages, success confirmations <100ms)
- [x] Intuitive navigation (max 3 clicks to any feature via dashboard nav)
- [x] Form validation on blur (React Hook Form + Zod for all management forms)

### III. Performance Standards
- [x] Page load <2s on 3G (Next.js SSR, code splitting by dashboard section)
- [x] LCP <2.5s (optimize chart rendering, lazy load heavy components)
- [x] FID <100ms (client-side caching for filter states, optimistic UI updates)
- [x] CLS <0.1 (skeleton loaders for data tables, fixed chart dimensions)
- [x] Bundle optimization (code split by route: /dashboard/admin/users, /dashboard/admin/analytics separate bundles)
- [x] Lighthouse audit ≥90 (manual validation after implementation via quickstart.md)

### IV. Security & Privacy
- [x] Role-based access control (server-side enforcement in middleware, moderator scope restrictions)
- [x] Session invalidation on role/status change (JWT token revocation)
- [x] Input validation (client + server, Zod schemas for all forms)
- [x] Audit logging (all user management, export, analytics access logged to SecurityLog)
- [x] Rate limiting (inherited from Phase 1, apply to export endpoints)
- [x] Security headers (CSP, X-Frame-Options, HSTS - inherited from Phase 1)

### V. Maintainability & Component Architecture
- [x] shadcn/ui for all new components (DataTable, Charts, ExportButton, FilterPanel)
- [x] Consistent folder structure (`src/components/dashboard/`, `src/components/admin/`, `src/components/analytics/`)
- [x] Single responsibility components (separate UserTable, EventTable, AttendanceTable)
- [x] Typed props with interfaces (TypeScript interfaces for all component props)
- [x] Composition over inheritance (compose DataTable with different column configs)

**Initial Gate**: ✅ PASS - All non-implementation gates satisfied  
**Post-Design Gate**: ✅ PASS - Data model validated, contracts defined, no violations introduced

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── app/
│   ├── dashboard/
│   │   ├── admin/
│   │   │   ├── users/          # FR-001 to FR-015: User Management
│   │   │   │   ├── page.tsx    # User list with filters/search
│   │   │   │   ├── [id]/       # Edit user modal/page
│   │   │   │   └── create/     # Create user form
│   │   │   ├── analytics/      # FR-049 to FR-066: Analytics Dashboard
│   │   │   │   ├── page.tsx    # Analytics dashboard with charts
│   │   │   │   └── components/ # Chart components
│   │   │   ├── events/         # FR-016 to FR-029: Event Management (Admin view)
│   │   │   │   └── page.tsx    # All events (admin can see all)
│   │   │   └── attendance/     # FR-030 to FR-042: Attendance Management (Admin view)
│   │   │       └── page.tsx    # All attendance records
│   │   ├── moderator/
│   │   │   ├── events/         # FR-016 to FR-029: Event Management (Moderator view)
│   │   │   │   ├── page.tsx    # Event list (own events only)
│   │   │   │   ├── create/     # Create event form
│   │   │   │   └── [id]/       # Edit event, download QR
│   │   │   └── attendance/     # FR-030 to FR-042: Attendance Management (Moderator view)
│   │   │       └── page.tsx    # Attendance records for own events
│   │   └── student/            # (Existing from Phase 2)
│   └── api/                    # (Existing API routes from Phase 1 & 2)
├── components/
│   ├── dashboard/
│   │   ├── admin/
│   │   │   ├── user-management/
│   │   │   │   ├── user-table.tsx         # DataTable for users
│   │   │   │   ├── user-filters.tsx       # Role/status filters
│   │   │   │   ├── user-edit-dialog.tsx   # Edit user modal
│   │   │   │   └── user-create-form.tsx   # Create user form
│   │   │   ├── analytics/
│   │   │   │   ├── attendance-trends-chart.tsx    # Line chart (FR-056)
│   │   │   │   ├── event-statistics-chart.tsx     # Bar chart (FR-057)
│   │   │   │   ├── user-participation-chart.tsx    # Bar chart (FR-058)
│   │   │   │   ├── verification-status-chart.tsx   # Pie chart (FR-059)
│   │   │   │   ├── department-breakdown-chart.tsx # Bar chart (FR-064)
│   │   │   │   ├── course-breakdown-chart.tsx     # Bar chart (FR-065)
│   │   │   │   ├── metrics-summary.tsx            # Key metrics cards (FR-054)
│   │   │   │   └── time-period-filter.tsx         # Filter component (FR-055)
│   │   │   └── shared/
│   │   │       ├── data-table.tsx         # Reusable table component
│   │   │       ├── export-button.tsx      # CSV/Excel export (FR-043 to FR-052)
│   │   │       └── filter-panel.tsx       # Reusable filter UI
│   │   └── moderator/
│   │       ├── event-management/
│   │       │   ├── event-table.tsx        # DataTable for events
│   │       │   ├── event-form.tsx         # Create/edit event
│   │       │   ├── qr-code-display.tsx    # QR download (FR-019)
│   │       │   └── event-filters.tsx      # Status/date filters
│   │       └── attendance-management/
│   │           ├── attendance-table.tsx   # DataTable for attendance
│   │           ├── attendance-detail-dialog.tsx # View photos/signature/GPS
│   │           ├── verification-form.tsx  # Approve/reject with notes
│   │           └── dispute-resolution-dialog.tsx # Resolve disputes (FR-040 to FR-041)
│   └── ui/                     # shadcn/ui primitives (existing)
├── actions/
│   ├── admin/
│   │   ├── users.ts            # CRUD user management actions
│   │   ├── analytics.ts        # Fetch analytics data
│   │   └── system-config.ts    # (Existing from Phase 2)
│   ├── moderator/
│   │   ├── events.ts           # CRUD event actions (scope-filtered)
│   │   └── attendance.ts       # Verify/reject attendance actions
│   └── export/
│       ├── export-csv.ts       # Generate CSV exports
│       └── export-excel.ts     # Generate Excel exports
├── lib/
│   ├── auth/                   # (Existing from Phase 1)
│   ├── db.ts                   # (Existing Prisma client)
│   ├── validations/
│   │   ├── user-management.ts  # Zod schemas for user forms
│   │   ├── event-management.ts # Zod schemas for event forms
│   │   └── attendance.ts       # Zod schemas for verification
│   ├── export/
│   │   ├── csv-generator.ts    # CSV formatting logic
│   │   └── xlsx-generator.ts   # Excel formatting logic
│   └── analytics/
│       ├── aggregations.ts     # Analytics calculation functions
│       └── chart-data.ts       # Transform data for charts
└── prisma/
    └── schema.prisma           # Extended models for analytics/audit
```

**Structure Decision**: Single Next.js project with App Router. All new management features are organized under `/dashboard/{role}/` paths with corresponding server actions in `/actions/`. Components follow shadcn/ui patterns with separation between admin, moderator, and shared components. Analytics logic isolated in `/lib/analytics/` for testability and reusability.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - ✅ Chart library selection (line/bar/pie charts for analytics dashboard)
   - ✅ Excel export library (.xlsx generation server-side)
   - ✅ CSV export approach (manual vs library)
   - ✅ Data table implementation (shadcn/ui + headless library)
   - ✅ Analytics aggregation strategy (Prisma vs separate analytics DB)
   - ✅ RBAC enforcement patterns (middleware vs server actions)
   - ✅ Prisma schema extensions (User, Event, Attendance models)

2. **Research findings consolidated** in `research.md`:
   - **Chart Library**: Recharts (native React, D3.js-based, responsive, TypeScript support)
   - **Excel Export**: xlsx (SheetJS) 0.20.x (industry standard, .xlsx support, Apache 2.0 license)
   - **CSV Export**: Manual RFC 4180-compliant generation (no external library)
   - **Data Tables**: TanStack Table (headless logic) + shadcn/ui Table (styled UI)
   - **Analytics**: Prisma aggregations + Redis caching (5min TTL) - no separate DB
   - **RBAC**: Middleware route protection + Server Action validation, moderator scope via Prisma where clauses
   - **Schema**: AccountStatus enum, User.accountStatus/suspendedBy/passwordResetBy/deletedBy, Event.createdById/editHistory/hasAttendances, Attendance.verifiedBy/disputeNotes/appealMessage/resolutionNotes, ExportRecord model

**Output**: ✅ research.md complete (all unknowns resolved)

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **✅ Data Model (`data-model.md`)**:
   - Extended User model: accountStatus (ACTIVE/SUSPENDED), suspendedBy/At, passwordResetBy/At, deletedBy/At, createdEvents, verifiedAttendances
   - Extended Event model: createdBy/createdById, editHistory (JSON), hasAttendances, deletedBy/deletedAt
   - Extended Attendance model: verifiedBy/verifiedById, verifiedAt, disputeNotes, appealMessage, resolutionNotes
   - New ExportRecord model: exportedBy, format (CSV/XLSX), filters (JSON), recordCount, status
   - Extended SecurityEventType enum: USER_ROLE_CHANGED, USER_STATUS_CHANGED, USER_CREATED, USER_PASSWORD_RESET, USER_DELETED, EVENT_CREATED, EVENT_EDITED, ATTENDANCE_VERIFIED, ATTENDANCE_REJECTED, ATTENDANCE_APPEALED, DISPUTE_RESOLVED, DATA_EXPORTED
   - State transitions documented (PENDING→APPROVED/REJECTED, REJECTED→DISPUTED)
   - Validation rules extracted (disputeNotes required on rejection, hasAttendances prevents deletion, moderator scope via createdById)

2. **✅ API Contracts (`/contracts/`)**:
   - `admin-users-list.json`: GET /api/admin/users (pagination, filtering, sorting)
   - `admin-users-update-role.json`: PATCH /api/admin/users/:userId/role (with self-change confirmation)
   - `admin-users-suspend.json`: PATCH /api/admin/users/:userId/status (suspend/reactivate)
   - `moderator-events-list.json`: GET /api/moderator/events (scope-filtered by createdById)
   - `moderator-attendance-verify.json`: PATCH /api/moderator/attendance/:id/verify (approve/reject with notes, moderator scope enforcement)
   - `export-attendance-xlsx.json`: POST /api/export/attendance/xlsx (filters, 10k record limit, audit trail)
   - `analytics-dashboard-data.json`: GET /api/admin/analytics/dashboard (charts + metrics, Redis caching)
   - Each contract includes: authentication, request/response schemas, error responses, test cases, implementation notes

3. **✅ Quickstart Validation (`quickstart.md`)**:
   - **Scenario 1**: User Management (admin creates/suspends/deletes users, changes roles with confirmation)
   - **Scenario 2**: Event Management (moderator creates/edits/deletes events, scope restrictions)
   - **Scenario 3**: Attendance Verification (approve/reject with notes, dispute resolution, moderator scope)
   - **Scenario 4**: Data Export (Excel/CSV export with filters, audit trail, record limit enforcement)
   - **Scenario 5**: Analytics Dashboard (charts, key metrics, date filtering, cache performance)
   - **Scenario 6**: RBAC & Security (role restrictions, security logs, session revocation)
   - Additional: Performance, Accessibility, Error Handling, Data Integrity validation steps

4. **✅ Agent Context Updated**:
   - Executed `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
   - Added to .github/copilot-instructions.md:
     * Languages: TypeScript 5.x with Next.js 15.5.4 (React 18.3.1), strict mode enabled
     * Frameworks: Recharts (charts), xlsx (Excel export), TanStack Table (data tables)
     * Databases: PostgreSQL via Prisma ORM, Redis for analytics caching
   - Recent Changes section updated with Phase 3 info

**Output**: ✅ data-model.md, 7 contract JSON files, quickstart.md (6 scenarios), .github/copilot-instructions.md updated

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. **Load** `.specify/templates/tasks-template.md` as base structure
2. **Generate contract test tasks** from `/contracts/` directory:
   - ✅ 7 contract files → 7 contract test tasks [P] (admin-users-list, admin-users-update-role, admin-users-suspend, moderator-events-list, moderator-attendance-verify, export-attendance-xlsx, analytics-dashboard-data)
   - Each test task validates: request/response schemas, authentication/authorization, error responses, test cases from contract JSON
   - Framework: Existing test setup (manual validation per project decision, no automated test framework configured)
3. **Generate model tasks** from `data-model.md`:
   - ✅ 6 model extension tasks [P] (User, Event, Attendance, ExportRecord, SecurityEventType enum, SystemConfig)
   - Each task: Create/update Prisma schema, generate migration, apply to dev DB, verify indexes created
4. **Generate integration test tasks** from `quickstart.md` scenarios:
   - ✅ 6 integration scenarios → 6 manual validation tasks (User Management, Event Management, Attendance Verification, Data Export, Analytics Dashboard, RBAC & Security)
   - Each scenario maps to quickstart.md steps with expected outcomes
5. **Generate implementation tasks** to satisfy functional requirements:
   - Group by feature area: User Management (FR-001 to FR-015), Event Management (FR-016 to FR-025), Attendance Management (FR-026 to FR-042), Data Export (FR-043 to FR-052), Analytics (FR-053 to FR-065)
   - Each task targets specific FR subset, creates components/actions/lib functions
   - Estimate: ~13-18 implementation tasks (3 user mgmt, 3 event mgmt, 3 attendance mgmt, 2 export, 3 analytics)

**Ordering Strategy**:
1. **Database First**: Prisma schema extension tasks (6 tasks, all [P] parallel)
2. **Server Actions**: Backend logic tasks (CRUD actions, export generators, analytics aggregations) - sequential within feature area, parallel across areas
3. **UI Components**: Frontend tasks (data tables, forms, charts, dashboards) - depends on server actions
4. **Integration Validation**: Manual quickstart scenarios after all implementation complete

**Dependency Groups**:
- **Group 1 [P]**: All 6 Prisma model tasks (independent, can run parallel)
- **Group 2**: Server action tasks (depends on Group 1, sequential within feature, parallel across features)
- **Group 3**: UI component tasks (depends on Group 2, sequential within feature, parallel across features)
- **Group 4**: Integration validation (depends on Groups 1-3 complete)

**Task Marking**:
- [P] = Parallel execution safe (no file conflicts, independent logic)
- (no mark) = Sequential execution required (shared files or dependency)

**Estimated Output**: 
- **Total tasks**: 67 tasks (revised from initial estimate of 28-32 tasks)
- **Rationale for increase**: Initial estimate grouped related tasks by feature area (e.g., "User Management UI" = 1 task). Actual breakdown provides atomic, individually executable tasks for finer-grained parallelization, progress tracking, and clearer dependencies. Atomic tasks enable better workload distribution and reduce integration conflicts.
- **Breakdown**: 8 Prisma schema tasks + 5 validation schemas + 19 server actions + 3 base UI components + 22 feature-specific UI components + 3 middleware/security tasks + 6 integration/polish tasks + 1 drill-down navigation task
- **Critical path**: Prisma migrations → Server actions → UI components → Validation
- **Parallel capacity**: Up to 6 tasks simultaneously in Phase 3.1 (schema), 3-5 tasks in Phases 3.2-3.12 (by feature area)

**File Structure for tasks.md**:
```
# Implementation Tasks: Management System & Analytics

## Summary
[Task count, critical path estimate, parallel execution groups]

## Tasks

### Group 1: Database Schema [P]
1. [P] Extend User model with account management fields
2. [P] Extend Event model with ownership and audit fields
...

### Group 2: Server Actions
7. Implement admin user management actions
8. Implement moderator event management actions
...

### Group 3: UI Components
20. Create admin user management dashboard
21. Create moderator event management dashboard
...

### Group 4: Integration Validation
28. Execute User Management validation scenario
29. Execute Event Management validation scenario
...
```

**IMPORTANT**: The /tasks command will execute this strategy to generate tasks.md. The /plan command STOPS HERE without creating tasks.md.

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - ✅ research.md created with all technology decisions
- [x] Phase 1: Design complete (/plan command) - ✅ data-model.md, 7 contracts, quickstart.md, copilot-instructions.md updated
- [x] Phase 2: Task planning complete (/plan command - describe approach only) - ✅ Strategy documented above (28-32 tasks estimated)
- [ ] Phase 3: Tasks generated (/tasks command) - PENDING (next command to execute)
- [ ] Phase 4: Implementation complete - PENDING (after /tasks)
- [ ] Phase 5: Validation passed - PENDING (after implementation)

**Gate Status**:
- [x] Initial Constitution Check: ✅ PASS (all 5 principles satisfied, no violations)
- [x] Post-Design Constitution Check: ✅ PASS (data model validated, no new violations introduced)
- [x] All NEEDS CLARIFICATION resolved: ✅ PASS (7 technology decisions documented in research.md)
- [x] Complexity deviations documented: ✅ N/A (no deviations, complexity table empty)

**Artifacts Created**:
- `specs/003-complete-the-event/plan.md` (this file) - 314 lines
- `specs/003-complete-the-event/research.md` - 350+ lines, 7 major technology decisions
- `specs/003-complete-the-event/data-model.md` - 570+ lines, extended Prisma schema with 4 models + enums
- `specs/003-complete-the-event/contracts/` - 7 API contract JSON files (admin-users-list, admin-users-update-role, admin-users-suspend, moderator-events-list, moderator-attendance-verify, export-attendance-xlsx, analytics-dashboard-data)
- `specs/003-complete-the-event/quickstart.md` - 580+ lines, 6 validation scenarios with step-by-step instructions
- `.github/copilot-instructions.md` - Updated with Phase 3 technologies (Recharts, xlsx, TanStack Table, Redis)

**Next Command**: Execute `/tasks` to generate `specs/003-complete-the-event/tasks.md` based on Phase 2 strategy above.

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
