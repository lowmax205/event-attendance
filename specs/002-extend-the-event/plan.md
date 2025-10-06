
# Implementation Plan: QR-Based Attendance and Role-Based Dashboards

**Branch**: `002-extend-the-event` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-extend-the-event/spec.md`

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

This feature extends the Event Attendance System with core attendance functionality built on Phase 1's authentication foundation. It implements a streamlined 3-click QR-based attendance process (location verification → photo capture → digital signature) and role-based dashboards for Students, Moderators, and Admins. The attendance system uses Cloudinary for image storage, browser Geolocation API for venue verification (100m radius), HTML5 Canvas API for signatures, and enforces real-time connectivity with profile completeness validation. Moderators gain full event management capabilities including QR generation, attendance verification, and data export, while students access their attendance history and quick QR scanning.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15.5.4 (React 18.3.1), strict mode enabled  
**Primary Dependencies**: Next.js App Router, Prisma 6.16.3 (PostgreSQL), React Hook Form 7.64.0, Zod 4.1.11, shadcn/ui (Radix UI), Cloudinary SDK, jose 6.1.0 (JWT), bcryptjs 3.0.2  
**Storage**: PostgreSQL (via Prisma ORM) for attendance/event data; Cloudinary for photos/signatures  
**Testing**: None (per project constitution)  
**Target Platform**: Modern web browsers (Chrome/Safari/Firefox) with camera, GPS, and HTML5 Canvas support; responsive mobile-first design  
**Project Type**: Web application (Next.js full-stack monolith)  
**Performance Goals**: <2s page load on 3G, LCP <2.5s, FID <100ms, CLS <0.1; QR scan-to-form <500ms  
**Constraints**: Real-time connectivity required (no offline mode), 100m GPS accuracy, WCAG 2.1 AA accessibility, Cloudinary image optimization  
**Scale/Scope**: ~10k students, ~500 events/year, ~50k attendance records/year; 12 new pages, 8 new components, 15 new API routes, 2 new Prisma models


## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Code Quality & TypeScript Excellence**:
- [x] TypeScript strict mode enabled in tsconfig.json
- [x] ESLint 9+ with Next.js config already configured
- [x] Prettier for auto-formatting (added to devDependencies if missing)
- [x] No `any` types permitted; all new code strictly typed with Zod schemas for runtime validation

**II. User Experience First**:
- [x] Mobile-first design mandatory for QR scanner and attendance form (touch targets ≥44×44px)
- [x] Desktop-optimized for moderator/admin dashboards with keyboard shortcuts
- [x] WCAG 2.1 AA compliance: semantic HTML, ARIA labels, keyboard navigation for QR scanner modal
- [x] Immediate feedback (<100ms): loading states during photo upload, location verification spinners, real-time form validation

**III. Performance Standards**:
- [x] Target: QR scanner page FCP <1.8s, attendance form LCP <2.5s
- [x] Image optimization: Cloudinary auto-format (WebP/AVIF), lazy load dashboards attendance history
- [x] Code splitting: Separate bundles for student/moderator/admin dashboards (Next.js dynamic imports)
- [x] Manual Lighthouse audit required for attendance flow (target score ≥90)

**IV. Security & Privacy**:
- [x] Cloudinary credentials in environment variables only (NEXT_PUBLIC_ prefix for client-safe keys)
- [x] JWT authentication via existing jose library for dashboard access control
- [x] Input validation: Zod schemas on server actions for event creation, attendance submission
- [x] Rate limiting on QR validation endpoint (prevent brute force QR guessing)
- [x] CORS policies restrictive (Next.js middleware configured)
- [x] GPS coordinates stored securely; photos/signatures with attendance-specific Cloudinary folders

**V. Maintainability & Component Architecture**:
- [x] shadcn/ui for all UI components (QR scanner modal, signature canvas wrapper, camera capture dialog)
- [x] File organization: `/src/app/attendance/`, `/src/app/dashboard/[role]/`, `/src/components/attendance/`, `/src/components/dashboard/`
- [x] Reusable components: `<QRScanner>`, `<CameraCapture>`, `<SignatureCanvas>`, `<AttendanceForm>`, `<LocationVerifier>`
- [x] Server actions in `/src/actions/attendance/` and `/src/actions/events/`

**Technology Stack Compliance**:
- [x] Next.js 15.5.4 with App Router
- [x] React Hook Form + Zod for attendance form validation
- [x] shadcn/ui components for modals, dialogs, forms
- [x] Tailwind CSS 4 for styling
- [x] Prisma ORM for Event and Attendance models
- [x] Cloudinary SDK (add to dependencies)
- [x] Browser APIs: Geolocation API, MediaDevices API (camera), Canvas API (signature)

**Gate Status**: ✅ PASS - No constitutional violations; all principles satisfied




## Project Structure

### Documentation (this feature)

```text
specs/002-extend-the-event/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── event-create.json
│   ├── event-update.json
│   ├── event-qr-generate.json
│   ├── attendance-submit.json
│   ├── attendance-verify.json
│   ├── qr-validate.json
│   └── dashboard-data.json
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── attendance/
│   │   ├── page.tsx                 # QR scanner landing page
│   │   ├── [eventId]/
│   │   │   ├── page.tsx            # Attendance form for specific event
│   │   │   └── success/page.tsx    # Confirmation page
│   ├── dashboard/
│   │   ├── page.tsx                 # Role-based redirect handler
│   │   ├── student/
│   │   │   ├── page.tsx            # Student dashboard (history + QR access)
│   │   │   └── layout.tsx
│   │   ├── moderator/
│   │   │   ├── page.tsx            # Moderator dashboard overview
│   │   │   ├── events/
│   │   │   │   ├── page.tsx        # Event list with create/edit
│   │   │   │   ├── create/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── attendance/
│   │   │   │   ├── page.tsx        # Attendance verification & search
│   │   │   │   └── [id]/page.tsx   # Individual attendance detail
│   │   │   └── layout.tsx
│   │   └── admin/
│   │       ├── page.tsx            # Admin dashboard with system controls
│   │       ├── users/page.tsx      # User role management
│   │       └── layout.tsx
│   └── api/
│       └── webhooks/
│           └── cloudinary/route.ts  # Handle upload confirmations
├── components/
│   ├── attendance/
│   │   ├── qr-scanner.tsx          # QR code scanner modal
│   │   ├── location-verifier.tsx   # GPS verification component
│   │   ├── camera-capture.tsx      # Photo capture dialog
│   │   ├── signature-canvas.tsx    # Digital signature component
│   │   └── attendance-form.tsx     # Main 3-click form wrapper
│   ├── dashboard/
│   │   ├── student-dashboard.tsx
│   │   ├── moderator-dashboard.tsx
│   │   ├── admin-dashboard.tsx
│   │   ├── attendance-history.tsx  # Student attendance table
│   │   ├── event-form.tsx          # Moderator event creation/edit
│   │   └── qr-code-display.tsx     # Display generated QR codes
│   └── ui/                          # shadcn/ui components (existing)
├── actions/
│   ├── attendance/
│   │   ├── submit.ts               # Submit attendance record
│   │   ├── validate-qr.ts          # Validate QR code & event
│   │   └── check-duplicate.ts      # Check for existing attendance
│   └── events/
│       ├── create.ts               # Create new event
│       ├── update.ts               # Update event details
│       ├── generate-qr.ts          # Generate QR code for event
│       └── list.ts                 # Fetch events with filters
├── lib/
│   ├── cloudinary.ts               # Cloudinary upload utilities
│   ├── geolocation.ts              # GPS distance calculation
│   ├── qr-generator.ts             # QR code generation wrapper
│   └── validations/
│       ├── attendance.ts           # Attendance form Zod schemas
│       └── event.ts                # Event form Zod schemas
└── hooks/
    ├── use-qr-scanner.ts           # Hook for QR scanning logic
    ├── use-geolocation.ts          # Hook for GPS permission/access
    └── use-camera.ts               # Hook for camera permission/access

prisma/
└── schema.prisma                    # Add Event and Attendance models
```

**Structure Decision**: Next.js App Router monolith structure. Feature-based routing in `/app` with colocation of pages and layouts. Shared components in `/components` organized by domain (attendance, dashboard, ui). Server actions in `/actions` grouped by feature. Utility libraries in `/lib`. Custom React hooks in `/hooks`. Prisma schema extended with new models.



## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)


## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

No violations detected. All constitutional requirements satisfied.

## Progress Tracking

*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
  - [x] data-model.md created (Event and Attendance Prisma models)
  - [x] 7 API contracts created (event-create, event-update, event-qr-generate, attendance-submit, attendance-verify, qr-validate, dashboard-data)
  - [x] quickstart.md created (10 test scenarios with performance benchmarks)
  - [x] .github/copilot-instructions.md updated via update-agent-context.ps1
- [x] Phase 2: Task planning complete (/tasks command)
  - [x] tasks.md created with 65 numbered tasks (T001-T065)
  - [x] 36 tasks marked [P] for parallel execution (55%)
  - [x] Dependencies documented with critical path analysis
  - [x] Parallel execution examples provided for 7 phases
- [ ] Phase 3: Implementation in progress
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS (no new violations introduced)
- [x] All NEEDS CLARIFICATION resolved (via /clarify session 2025-10-06)
- [x] Complexity deviations documented (none)

---

*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
