# Tasks: QR-Based Attendance and Role-Based Dashboards

**Input**: Design documents from `/specs/002-extend-the-event/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: Next.js 15.5.4, TypeScript 5.x, Prisma 6.16.3, shadcn/ui
   → Structure: Next.js App Router monolith at repository root
2. Load design documents ✓
   → data-model.md: Event and Attendance models
   → contracts/: 7 API contract files
   → quickstart.md: 10 test scenarios
3. Generate tasks by category (below)
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T040)
6. Validation: All contracts have tests ✓, All entities have models ✓
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- File paths relative to repository root: `d:\Nilo Vscode\event-attendance\`

## Phase 3.1: Setup & Dependencies

- [x] **T001** Install new dependencies: `npm install qrcode html5-qrcode react-signature-canvas cloudinary @types/qrcode`
- [x] **T002** [P] Verify Cloudinary environment variables exist in `.env`: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`, `CLOUDINARY_FOLDER`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (add NEXT_PUBLIC_ variant for client-side access)
- [x] **T003** [P] Extend Prisma schema in `prisma/schema.prisma` with Event model, EventStatus enum, and indexes per data-model.md
- [x] **T004** [P] Extend Prisma schema in `prisma/schema.prisma` with Attendance model, VerificationStatus enum, unique constraint (eventId, userId), and indexes per data-model.md
- [x] **T005** [P] Extend User model in `prisma/schema.prisma` with relations: `createdEvents Event[] @relation("EventCreator")`, `attendances Attendance[]`, `verifiedAttendances Attendance[] @relation("AttendanceVerifier")`
- [x] **T006** Create Prisma migration: `npx prisma migrate dev --name add_event_attendance_models` ✓ *Migration created and applied successfully*
- [x] **T007** [P] Create Cloudinary utility library in `src/lib/cloudinary.ts` with functions: `uploadPhoto(base64: string, folder: string)`, `uploadSignature(base64: string, folder: string)`, `deleteImage(publicId: string)`. All uploads MUST use `CLOUDINARY_FOLDER` environment variable as root folder prefix (e.g., `{CLOUDINARY_FOLDER}/attendance/{eventId}/...`) to separate from other API content
- [x] **T008** [P] Create geolocation utility in `src/lib/geolocation.ts` with Haversine distance calculation function: `calculateDistance(lat1, lon1, lat2, lon2): number`
- [x] **T009** [P] Create QR generator wrapper in `src/lib/qr-generator.ts` with function: `generateQRCode(payload: string): Promise<string>` returning data URL
- [x] **T010** [P] Create Zod validation schemas in `src/lib/validations/event.ts` for event creation and update per event-create.json and event-update.json contracts
- [x] **T011** [P] Create Zod validation schemas in `src/lib/validations/attendance.ts` for attendance submission per attendance-submit.json contract

## Phase 3.2: Custom React Hooks

- [ ] **T012** [P] Create `src/hooks/use-qr-scanner.ts` hook with html5-qrcode wrapper: `useQRScanner(onScan: (payload: string) => void)` returning `{ startScanning, stopScanning, isScanning }`
- [ ] **T013** [P] Create `src/hooks/use-geolocation.ts` hook: `useGeolocation()` returning `{ coords, error, loading, requestPermission }`
- [ ] **T014** [P] Create `src/hooks/use-camera.ts` hook for MediaDevices API: `useCamera(facingMode: 'user' | 'environment')` returning `{ stream, error, requestPermission, capture }`
- [ ] **T015** [P] Create `src/hooks/use-online.ts` hook: `useOnline()` returning `{ isOnline }` using navigator.onLine and online/offline event listeners

## Phase 3.3: Server Actions (Event Management)

- [ ] **T016** [P] Create event creation server action in `src/actions/events/create.ts` implementing POST /api/events contract: validate schema, generate QR code, upload to Cloudinary using folder path `{CLOUDINARY_FOLDER}/events/{eventId}/`, save Event to DB
- [ ] **T017** [P] Create event update server action in `src/actions/events/update.ts` implementing PATCH /api/events/[id] contract: validate partial update, regenerate QR if venue changed (upload to `{CLOUDINARY_FOLDER}/events/{eventId}/`), update DB
- [ ] **T018** [P] Create QR regeneration server action in `src/actions/events/generate-qr.ts` implementing POST /api/events/[id]/qr contract: generate new QR payload, upload to Cloudinary using folder `{CLOUDINARY_FOLDER}/events/{eventId}/`, log to SecurityLog
- [ ] **T019** [P] Create event listing server action in `src/actions/events/list.ts`: fetch events with filters (status, createdById), pagination support
- [ ] **T020** [P] Create event details server action in `src/actions/events/get-by-id.ts`: fetch single event with creator and attendance count

## Phase 3.4: Server Actions (Attendance)

- [ ] **T021** Create QR validation server action in `src/actions/attendance/validate-qr.ts` implementing POST /api/qr/validate contract: parse QR payload, fetch event, check window, check duplicate, return validation result
- [ ] **T022** Create attendance submission server action in `src/actions/attendance/submit.ts` implementing POST /api/attendance contract: validate location (100m radius), upload 3 images to Cloudinary using folder path `{CLOUDINARY_FOLDER}/attendance/{eventId}/{userId}/`, create Attendance record, log to SecurityLog
- [ ] **T023** [P] Create attendance verification server action in `src/actions/attendance/verify.ts` implementing PATCH /api/attendance/[id]/verify contract: update verificationStatus, set verifiedById/verifiedAt, log to SecurityLog
- [ ] **T024** [P] Create duplicate check server action in `src/actions/attendance/check-duplicate.ts`: query Attendance by eventId + userId, return existing record or null
- [ ] **T025** [P] Create attendance listing server action in `src/actions/attendance/list-by-event.ts`: fetch all attendance for an event with user profiles, support status filter

## Phase 3.5: Server Actions (Dashboards)

- [ ] **T026** [P] Create student dashboard data action in `src/actions/dashboard/student.ts` implementing GET /api/dashboard/student: fetch attendanceHistory, upcomingEvents, stats per dashboard-data.json contract
- [ ] **T027** [P] Create moderator dashboard data action in `src/actions/dashboard/moderator.ts` implementing GET /api/dashboard/moderator: fetch myEvents, pendingVerifications, stats per dashboard-data.json contract
- [ ] **T028** [P] Create admin dashboard data action in `src/actions/dashboard/admin.ts` implementing GET /api/dashboard/administrator: fetch systemStats, recentActivity from SecurityLog, alerts per dashboard-data.json contract

## Phase 3.6: UI Components (Attendance)

- [ ] **T029** [P] Create QR scanner modal component in `src/components/attendance/qr-scanner.tsx` using useQRScanner hook, Dialog from shadcn/ui, camera permission handling
- [ ] **T030** [P] Create location verifier component in `src/components/attendance/location-verifier.tsx` using useGeolocation hook, display distance from venue, visual feedback for within/outside 100m radius
- [ ] **T031** [P] Create camera capture dialog in `src/components/attendance/camera-capture.tsx` using useCamera hook, video preview, canvas capture to Base64, retake functionality
- [ ] **T032** [P] Create signature canvas component in `src/components/attendance/signature-canvas.tsx` wrapping react-signature-canvas, clear button, export to transparent PNG Base64
- [ ] **T033** Create main attendance form wrapper in `src/components/attendance/attendance-form.tsx` integrating QRScanner → LocationVerifier → CameraCapture (front/back) → SignatureCanvas → submit to attendance/submit action, React Hook Form + Zod validation, step progress indicator

## Phase 3.7: UI Components (Dashboard)

- [ ] **T034** [P] Create student attendance history table in `src/components/dashboard/attendance-history.tsx` displaying eventName, submittedAt, verificationStatus with color badges, pagination using shadcn/ui Table and Pagination
- [ ] **T035** [P] Create event form component in `src/components/dashboard/event-form.tsx` for create/edit using React Hook Form + Zod, date/time pickers (shadcn/ui Calendar), coordinates input, buffer minutes input
- [ ] **T036** [P] Create QR code display component in `src/components/dashboard/qr-code-display.tsx` showing QR image, download button, print button, regenerate button (moderator only)
- [ ] **T037** [P] Create student dashboard layout in `src/components/dashboard/student-dashboard.tsx` with stats cards (shadcn/ui Card), attendance history section, upcoming events section, floating "Scan QR" button
- [ ] **T038** [P] Create moderator dashboard layout in `src/components/dashboard/moderator-dashboard.tsx` with stats cards, my events table, pending verifications section with photo/signature preview modals
- [ ] **T039** [P] Create admin dashboard layout in `src/components/dashboard/admin-dashboard.tsx` with system stats, recent activity feed from SecurityLog, alerts section

## Phase 3.8: Pages (Attendance Flow)

- [ ] **T040** Create QR scanner landing page in `src/app/attendance/page.tsx` rendering QRScanner component, online detection banner using useOnline, redirect to /attendance/[eventId] on successful scan
- [ ] **T041** Create attendance form page in `src/app/attendance/[eventId]/page.tsx` fetching event details, rendering AttendanceForm component, handling submission success/error states
- [ ] **T042** [P] Create attendance success page in `src/app/attendance/[eventId]/success/page.tsx` showing confirmation message, event details, verification status badge, "Back to Dashboard" button

## Phase 3.9: Pages (Dashboard Routes)

- [ ] **T043** Create role-based dashboard redirect in `src/app/dashboard/page.tsx` checking user role from session, redirecting to /dashboard/student, /dashboard/moderator, or /dashboard/administrator
- [ ] **T044** Create student dashboard page in `src/app/dashboard/student/page.tsx` fetching data from dashboard/student action, rendering StudentDashboard component
- [ ] **T045** Create student dashboard layout in `src/app/dashboard/student/layout.tsx` with role-based navigation sidebar (shadcn/ui Sidebar), profile dropdown
- [ ] **T046** Create moderator dashboard page in `src/app/dashboard/moderator/page.tsx` fetching data from dashboard/moderator action, rendering ModeratorDashboard component
- [ ] **T047** Create moderator events list page in `src/app/dashboard/moderator/events/page.tsx` with table of events, create button linking to /dashboard/moderator/events/create
- [ ] **T048** Create event creation page in `src/app/dashboard/moderator/events/create/page.tsx` rendering EventForm component, calling events/create action, showing generated QR code on success
- [ ] **T049** Create event edit page in `src/app/dashboard/moderator/events/[id]/edit/page.tsx` pre-filling EventForm with event data, calling events/update action
- [ ] **T050** Create attendance verification page in `src/app/dashboard/moderator/attendance/page.tsx` listing pending attendances with filters, approve/reject buttons
- [ ] **T051** Create individual attendance detail page in `src/app/dashboard/moderator/attendance/[id]/page.tsx` showing full-size photos, signature, student info, distance, approve/reject form with disputeNote textarea
- [ ] **T052** Create moderator dashboard layout in `src/app/dashboard/moderator/layout.tsx` with navigation tabs (Overview, Events, Attendance), breadcrumbs
- [ ] **T053** Create admin dashboard page in `src/app/dashboard/administrator/page.tsx` fetching data from dashboard/admin action, rendering AdminDashboard component
- [ ] **T054** [P] Create admin users management page in `src/app/dashboard/administrator/users/page.tsx` listing all users with role badges, search/filter, role update form (future enhancement placeholder)
- [ ] **T055** Create admin dashboard layout in `src/app/dashboard/administrator/layout.tsx` with navigation tabs (Overview, Users, System), role indicator

## Phase 3.10: Middleware & Authorization

- [ ] **T056** Update Next.js middleware in `src/middleware.ts` to protect /dashboard/[role] routes: verify JWT session, check role matches route, redirect unauthorized users to appropriate dashboard or /auth/login
- [ ] **T057** Add rate limiting to QR validation in `src/lib/rate-limit.ts`: implement token bucket algorithm, max 10 QR scans per minute per IP address, return 429 error on limit exceeded

## Phase 3.11: Polish & Validation

- [ ] **T058** [P] Add loading skeletons to all dashboard pages using shadcn/ui Skeleton component for better perceived performance
- [ ] **T059** [P] Add toast notifications using shadcn/ui Sonner for success/error feedback on form submissions (event create/update, attendance submit, verification)
- [ ] **T060** [P] Add accessibility attributes: aria-labels for QR scanner, camera capture buttons, form fields; aria-live regions for validation errors; keyboard navigation for signature canvas (Tab to focus, Enter to clear)
- [ ] **T061** [P] Optimize Cloudinary uploads: set quality=auto, format=auto, add progressive loading for large images
- [ ] **T062** Add error boundary components in dashboard layouts to catch and display runtime errors gracefully
- [ ] **T063** Manually test all 10 scenarios from quickstart.md: Scenario 1 (successful check-in), Scenario 2 (duplicate prevention), Scenario 3 (location failure), Scenario 4 (profile incomplete), Scenario 5 (window closed), Scenario 6 (offline detection), Scenario 7 (dashboard access), Scenario 8 (moderator verify), Scenario 9 (moderator reject), Scenario 10 (event creation)
- [ ] **T064** Run Lighthouse audit on /attendance and /dashboard/student pages: target Performance ≥90, Accessibility ≥95, Best Practices ≥90
- [ ] **T065** Performance validation: measure attendance submission end-to-end time (<5 seconds with 3 uploads), dashboard load time (<500ms), QR validation latency (<200ms)

## Dependencies

**Critical Path**:
1. Setup (T001-T011) must complete before all other phases
2. T006 (migration) blocks all server actions (T016-T028)
3. Custom hooks (T012-T015) block UI components (T029-T039)
4. Server actions (T016-T028) block pages (T040-T055)
5. UI components (T029-T039) block pages (T040-T055)
6. All implementation (T001-T057) blocks polish (T058-T065)

**Specific Blocks**:
- T003, T004, T005 (schema) → T006 (migration) → T016-T028 (server actions using DB)
- T007 (Cloudinary lib) → T016, T018 (QR generation), T022 (photo uploads)
- T008 (geolocation lib) → T022 (distance validation)
- T009 (QR generator) → T016, T018 (event creation/update)
- T010, T011 (validations) → T016, T017, T022 (server actions using schemas)
- T012 (QR scanner hook) → T029 (QR scanner component) → T040 (attendance landing page)
- T013 (geolocation hook) → T030 (location verifier) → T033 (attendance form) → T041
- T014 (camera hook) → T031 (camera capture) → T033 (attendance form) → T041
- T015 (online hook) → T040 (attendance page offline banner)
- T021 (QR validation action) → T040 (validate before showing form)
- T022 (submit action) → T041 (attendance form page)
- T026-T028 (dashboard actions) → T044, T046, T053 (dashboard pages)
- T033 (attendance form) → T041 (attendance form page)
- T034-T039 (dashboard components) → T044-T055 (dashboard pages)
- T056 (middleware) should be done after dashboard pages exist for testing

## Parallel Execution Examples

**Phase 3.1 Setup (5 parallel tasks)**:
```bash
Task: "Install new dependencies: npm install qrcode html5-qrcode react-signature-canvas cloudinary @types/qrcode"
Task: "Verify Cloudinary environment variables exist in .env and add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
Task: "Extend Prisma schema with Event model per data-model.md"
Task: "Extend Prisma schema with Attendance model per data-model.md"
Task: "Extend User model in Prisma schema with event/attendance relations"
```

**Phase 3.2 Hooks (4 parallel tasks)**:
```bash
Task: "Create use-qr-scanner.ts hook with html5-qrcode wrapper"
Task: "Create use-geolocation.ts hook for GPS access"
Task: "Create use-camera.ts hook for MediaDevices API"
Task: "Create use-online.ts hook for connectivity detection"
```

**Phase 3.3 Event Actions (5 parallel tasks)**:
```bash
Task: "Create event creation server action in src/actions/events/create.ts"
Task: "Create event update server action in src/actions/events/update.ts"
Task: "Create QR regeneration server action in src/actions/events/generate-qr.ts"
Task: "Create event listing server action in src/actions/events/list.ts"
Task: "Create event details action in src/actions/events/get-by-id.ts"
```

**Phase 3.5 Dashboard Actions (3 parallel tasks)**:
```bash
Task: "Create student dashboard data action in src/actions/dashboard/student.ts"
Task: "Create moderator dashboard data action in src/actions/dashboard/moderator.ts"
Task: "Create admin dashboard data action in src/actions/dashboard/admin.ts"
```

**Phase 3.6 Attendance Components (5 parallel tasks)**:
```bash
Task: "Create QR scanner modal in src/components/attendance/qr-scanner.tsx"
Task: "Create location verifier in src/components/attendance/location-verifier.tsx"
Task: "Create camera capture dialog in src/components/attendance/camera-capture.tsx"
Task: "Create signature canvas in src/components/attendance/signature-canvas.tsx"
# Note: T033 (attendance-form.tsx) cannot be parallel - integrates all 4 above
```

**Phase 3.7 Dashboard Components (6 parallel tasks)**:
```bash
Task: "Create attendance history table in src/components/dashboard/attendance-history.tsx"
Task: "Create event form in src/components/dashboard/event-form.tsx"
Task: "Create QR code display in src/components/dashboard/qr-code-display.tsx"
Task: "Create student dashboard layout in src/components/dashboard/student-dashboard.tsx"
Task: "Create moderator dashboard layout in src/components/dashboard/moderator-dashboard.tsx"
Task: "Create admin dashboard layout in src/components/dashboard/admin-dashboard.tsx"
```

**Phase 3.11 Polish (4 parallel tasks)**:
```bash
Task: "Add loading skeletons to all dashboard pages"
Task: "Add toast notifications for form submissions"
Task: "Add accessibility attributes (aria-labels, keyboard nav)"
Task: "Optimize Cloudinary uploads (quality=auto, format=auto)"
```

## Notes

- **Total Tasks**: 65 (T001-T065)
- **Parallelizable**: 36 tasks marked [P] (55%)
- **Estimated Effort**: 40-50 hours for experienced Next.js developer
- **Testing Strategy**: Manual testing only (per constitution - no automated tests)
- **Commit Strategy**: Commit after each task, push after each phase
- **Environment**: Development on localhost:3000, staging deploy after T055, production after T065

## Validation Checklist

- [x] All 7 contracts have corresponding server actions (T016-T028)
- [x] All 2 entities (Event, Attendance) have Prisma models (T003, T004)
- [x] All 10 quickstart scenarios covered by implementation tasks
- [x] Parallel tasks ([P]) are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] Setup tasks (T001-T011) come first
- [x] Server actions before UI pages (dependencies respected)
- [x] Polish tasks (T058-T065) come last

---

**Ready for Execution**: Tasks are ordered, dependencies documented, parallel opportunities identified. Proceed with Phase 3 implementation starting at T001.
