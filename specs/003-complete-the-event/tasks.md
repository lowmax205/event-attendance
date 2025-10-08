# Tasks: Management System & Analytics

**Feature**: 003-complete-the-event  
**Input**: Design documents from `/specs/003-complete-the-event/`  
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

---

## Execution Summary

**Total Tasks**: 67  
**Estimated Timeline**: 12-16 weeks  
**Critical Path**: Prisma migrations → Server actions → UI components → Validation  
**Parallel Capacity**: Up to 6 tasks simultaneously in Phase 3.1-3.2

---

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- All file paths are absolute from repository root: `D:\Shared Folder\VS Code Project\Coding 2025\School\event-attendance\`

---

## Phase 3.1: Database Schema & Dependencies ✅ COMPLETE

**Goal**: Extend Prisma schema with new models, enums, and fields for management features

- [x] **T001** [P] Extend User model with account management fields in `prisma/schema.prisma`
  - Add `accountStatus` enum (ACTIVE, SUSPENDED)
  - Add `suspendedAt`, `suspendedBy`, `suspendedById` fields
  - Add `passwordResetAt`, `passwordResetBy`, `passwordResetById` fields
  - Add `deletedAt`, `deletedBy`, `deletedById` fields (soft delete)
  - Add relations: `createdEvents`, `verifiedAttendances`, `exports`
  - Add self-referential relations: `suspendedUsers`, `passwordResets`, `deletedUsers`
  - Add indexes: `accountStatus`, `suspendedById`, `deletedAt`
  - **Dependencies**: None
  - **Reference**: data-model.md lines 15-87

- [x] **T002** [P] Extend Event model with ownership and audit fields in `prisma/schema.prisma`
  - Add `createdBy` relation and `createdById` field
  - Add `editHistory` JSON field
  - Add `hasAttendances` boolean flag (default false)
  - Add `deletedAt`, `deletedBy`, `deletedById` fields (soft delete)
  - Add indexes: `createdById`, `status + startDateTime`, `deletedAt`
  - **Dependencies**: None
  - **Reference**: data-model.md lines 93-166

- [x] **T003** [P] Extend Attendance model with verification workflow fields in `prisma/schema.prisma`
  - Add `verifiedBy` relation and `verifiedById` field
  - Add `verifiedAt` timestamp
  - Add `disputeNotes` text field
  - Add `appealMessage` text field
  - Add `resolutionNotes` text field
  - Add indexes: `verifiedById + verifiedAt`, `submittedAt`, `eventId + status`
  - **Dependencies**: None
  - **Reference**: data-model.md lines 172-234

- [x] **T004** [P] Create ExportRecord model in `prisma/schema.prisma`
  - Add fields: `id`, `createdAt`, `exportedBy`, `exportedById`, `format`, `filters`, `recordCount`, `status`, `errorMessage`, `fileSize`, `downloadUrl`, `expiresAt`
  - Add enums: `ExportFormat` (CSV, XLSX), `ExportStatus` (PENDING, PROCESSING, COMPLETED, FAILED)
  - Add indexes: `exportedById + createdAt`, `createdAt`, `status`
  - **Dependencies**: None
  - **Reference**: data-model.md lines 240-307

- [x] **T005** [P] Extend SecurityEventType enum in `prisma/schema.prisma`
  - Add new event types: USER_ROLE_CHANGED, USER_STATUS_CHANGED, USER_CREATED, USER_PASSWORD_RESET, USER_DELETED
  - Add: EVENT_CREATED, EVENT_EDITED, EVENT_DELETED
  - Add: ATTENDANCE_VERIFIED, ATTENDANCE_REJECTED, ATTENDANCE_APPEALED, DISPUTE_RESOLVED
  - Add: DATA_EXPORTED, ANALYTICS_ACCESSED
  - **Dependencies**: None
  - **Reference**: data-model.md lines 313-378

- [x] **T006** Extend SecurityLog model with metadata JSON field in `prisma/schema.prisma`
  - Add `metadata` JSON field for event-specific data
  - **Dependencies**: T005 (SecurityEventType enum)
  - **Reference**: data-model.md lines 313-378

- [x] **T007** Generate and apply Prisma migration for Phase 3 schema extensions
  - Run: `npx prisma migrate dev --name add_management_and_analytics`
  - Verify migration applied successfully
  - Create data backfill script if needed (set `createdById` for existing events, `accountStatus` for users, `hasAttendances` flag)
  - **Migration**: `20251008011316_add_management_and_analytics` applied successfully
  - **Fixed**: Updated all existing code to use AccountStatus enum (ACTIVE/SUSPENDED) and SecurityEventType enum
  - **Dependencies**: T001, T002, T003, T004, T005, T006
  - **Reference**: data-model.md lines 496-531

- [x] **T008** [P] Install new dependencies for Phase 3 features
  - Add `recharts` (^2.0.0) for analytics charts
  - Add `xlsx` (^0.18.0) for Excel export generation (Note: latest is 0.18.5, not 0.20.0)
  - Add `@tanstack/react-table` (^8.0.0) for data table logic
  - Run: `npm install recharts xlsx @tanstack/react-table`
  - Update `package.json`
  - **Dependencies**: None
  - **Reference**: research.md

---

## Phase 3.2: Validation Schemas (Zod) ✅ COMPLETE

**Goal**: Create Zod validation schemas for all management forms and API endpoints

- [x] **T009** [P] Create user management validation schemas in `src/lib/validations/user-management.ts`
  - `userListQuerySchema`: Validate pagination, role filter, status filter, search, sortBy, sortOrder
  - `userRoleUpdateSchema`: Validate role (enum), confirmSelfChange (boolean)
  - `userStatusUpdateSchema`: Validate accountStatus (enum), reason (optional string)
  - `userPasswordResetSchema`: Validate userId (cuid)
  - `userCreateSchema`: Validate email, role, student number, name fields
  - `userDeleteSchema`: Validate userId, reason (optional string)
  - **Dependencies**: None
  - **Reference**: contracts/admin-users-*.json

- [x] **T010** [P] Create event management validation schemas in `src/lib/validations/event-management.ts`
  - `eventListQuerySchema`: Validate pagination, status filter, date range (startDate, endDate), sortBy, sortOrder
  - `eventCreateSchema`: Validate name, description, start/end datetime, venue, location, buffers (inherit from Phase 2, extend if needed)
  - `eventUpdateSchema`: Same fields as create, all optional
  - **Dependencies**: None
  - **Reference**: contracts/moderator-events-list.json

- [x] **T011** [P] Create attendance verification validation schemas in `src/lib/validations/attendance-verification.ts`
  - `attendanceVerifySchema`: Validate status (APPROVED/REJECTED), disputeNotes (required if REJECTED), resolutionNotes (optional)
  - `attendanceAppealSchema`: Validate appealMessage (required, max 1000 chars)
  - `attendanceListQuerySchema`: Validate pagination, eventId filter, status filter, date range
  - `disputeResolutionSchema`: Validate resolution with required resolutionNotes
  - **Dependencies**: None
  - **Reference**: contracts/moderator-attendance-verify.json

- [x] **T012** [P] Create export validation schemas in `src/lib/validations/export.ts`
  - `exportFiltersSchema`: Validate eventIds (array), startDate, endDate, status (enum), studentName
  - Validate max 50 eventIds, max 10,000 record limit (server-side check)
  - Added `validateExportRecordCount()` helper function
  - **Dependencies**: None
  - **Reference**: contracts/export-attendance-xlsx.json

- [x] **T013** [P] Create analytics validation schemas in `src/lib/validations/analytics.ts`
  - `analyticsQuerySchema`: Validate startDate, endDate (ISO 8601), refresh (boolean)
  - Validate date range (startDate < endDate), max 365 days
  - `chartDrillDownSchema`: Validate chart type and drill-down filters (FR-058)
  - **Dependencies**: None
  - **Reference**: contracts/analytics-dashboard-data.json

---

## Phase 3.3: Server Actions - User Management ✅ COMPLETE

**Goal**: Implement admin user management CRUD operations with RBAC enforcement

- [x] **T014** Implement admin user listing in `src/actions/admin/users.ts`
  - Export `listUsers` server action
  - Validate JWT, check role = ADMIN
  - Parse query params with `userListQuerySchema` (T009)
  - Query Prisma: `User.findMany` with filters (role, accountStatus, search on email/name), pagination, sorting
  - Filter out soft-deleted users (`deletedAt IS NULL`)
  - Return: users array + pagination metadata
  - **Dependencies**: T001 (User model), T007 (migration), T009 (validation)
  - **Reference**: contracts/admin-users-list.json

- [x] **T015** Implement user role update in `src/actions/admin/users.ts`
  - Export `updateUserRole` server action
  - Validate JWT, check role = ADMIN
  - Validate input with `userRoleUpdateSchema` (T009)
  - Check self-role change: if `userId === currentUser.id` and `confirmSelfChange !== true`, return error
  - Update User.role in Prisma
  - Log to SecurityLog: eventType = USER_ROLE_CHANGED, metadata = {fromRole, toRole, targetUserId}
  - **Dependencies**: T001, T007, T009, T014
  - **Reference**: contracts/admin-users-update-role.json

- [x] **T016** Implement user account suspension in `src/actions/admin/users.ts`
  - Export `updateUserStatus` server action
  - Validate JWT, check role = ADMIN
  - Validate input with `userStatusUpdateSchema` (T009)
  - Prevent self-suspension: if `userId === currentUser.id`, return error
  - Update User: accountStatus, suspendedAt, suspendedBy relation (if SUSPENDED), clear fields (if ACTIVE)
  - Log to SecurityLog: eventType = USER_STATUS_CHANGED, metadata = {fromStatus, toStatus, targetUserId, reason}
  - **Dependencies**: T001, T007, T009, T014
  - **Reference**: contracts/admin-users-suspend.json

- [x] **T017** [P] Implement user password reset in `src/actions/admin/users.ts`
  - Export `resetUserPassword` server action
  - Validate JWT, check role = ADMIN
  - Validate userId
  - Generate temporary password (bcryptjs hash)
  - Update User: passwordHash, passwordResetAt, passwordResetBy relation
  - Log to SecurityLog: eventType = USER_PASSWORD_RESET, metadata = {targetUserId}
  - Return temporary password to admin (display once)
  - **Dependencies**: T001, T007, T009
  - **Reference**: quickstart.md Scenario 1 Step 10

- [x] **T018** [P] Implement user creation in `src/actions/admin/users.ts`
  - Export `createUser` server action
  - Validate JWT, check role = ADMIN
  - Validate input with `userCreateSchema` (T009)
  - Check email uniqueness
  - Hash temporary password
  - Create User with Prisma (include profile if student)
  - Log to SecurityLog: eventType = USER_CREATED, metadata = {newUserId, role}
  - **Dependencies**: T001, T007, T009
  - **Reference**: quickstart.md Scenario 1 Step 5

- [x] **T019** [P] Implement user soft delete in `src/actions/admin/users.ts`
  - Export `deleteUser` server action
  - Validate JWT, check role = ADMIN
  - Validate userId, reason
  - Check user has no attendance records (or allow with confirmation)
  - Update User: deletedAt, deletedBy relation (soft delete), accountStatus = SUSPENDED
  - Log to SecurityLog: eventType = USER_DELETED, metadata = {targetUserId, reason}
  - **Dependencies**: T001, T007, T009
  - **Reference**: quickstart.md Scenario 1 Step 11

---

## Phase 3.4: Server Actions - Event Management ✅ COMPLETE

**Goal**: Implement moderator/admin event management with scope filtering

- [x] **T020** Implement moderator event listing in `src/actions/events/list.ts`
  - Export `listEvents` server action
  - Validate JWT, check role = MODERATOR or ADMIN
  - Parse query params with `eventListQuerySchema` (T010)
  - Query Prisma: `Event.findMany`
    - If MODERATOR: WHERE `createdById = currentUser.id`
    - If ADMIN: no createdById filter
    - Apply: status filter, date range filter, deletedAt IS NULL
  - Return: events array + pagination metadata, include `_count.attendances`
  - **Dependencies**: T002 (Event model), T007 (migration), T010 (validation)
  - **Reference**: contracts/moderator-events-list.json

- [x] **T021** [P] Implement event creation in `src/actions/events/create.ts`
  - Export `createEvent` server action (inherited from Phase 2, already sets createdById)
  - Validate JWT, check role = MODERATOR or ADMIN
  - Validate input with `eventCreateSchema` (T010)
  - Set `createdById = currentUser.id`
  - Create Event with Prisma, generate QR code
  - Log to SecurityLog: eventType = EVENT_CREATED, metadata = {eventId}
  - **Dependencies**: T002, T007, T010
  - **Reference**: quickstart.md Scenario 2 Step 3

- [x] **T022** [P] Implement event update in `src/actions/events/update.ts`
  - Export `updateEvent` server action
  - Validate JWT, check role = MODERATOR or ADMIN
  - Validate eventId and input with `eventUpdateSchema` (T010)
  - If MODERATOR: verify `event.createdById === currentUser.id`
  - Update Event fields
  - Append to `editHistory` JSON: {editedBy, editedAt, fields, changes}
  - Log to SecurityLog: eventType = EVENT_EDITED, metadata = {eventId, fields}
  - **Dependencies**: T002, T007, T010, T020
  - **Reference**: quickstart.md Scenario 2 Step 4

- [x] **T023** [P] Implement event soft delete in `src/actions/events/delete.ts`
  - Export `deleteEvent` server action
  - Validate JWT, check role = MODERATOR or ADMIN (prefer ADMIN only)
  - Validate eventId
  - Check `event.hasAttendances`: if true, return error (FR-020)
  - If MODERATOR: verify `event.createdById === currentUser.id`
  - Update Event: deletedAt, deletedBy (soft delete)
  - Log to SecurityLog: eventType = EVENT_DELETED, metadata = {eventId}
  - **Dependencies**: T002, T007, T020
  - **Reference**: quickstart.md Scenario 2 Steps 7-8

---

## Phase 3.5: Server Actions - Attendance Verification ✅ COMPLETE

**Goal**: Implement attendance verification workflow with moderator scope

- [x] **T024** Implement attendance listing for moderators in `src/actions/moderator/attendance.ts`
  - Export `listAttendances` server action
  - Validate JWT, check role = MODERATOR or ADMIN
  - Parse query params with `attendanceListQuerySchema` (T011)
  - Query Prisma: `Attendance.findMany` with join to Event
    - If MODERATOR: WHERE `event.createdById = currentUser.id`
    - If ADMIN: no filter
    - Apply: status filter, eventId filter, date range
  - Include: student profile, event details, verifier info
  - Return: attendances array + pagination metadata
  - **Dependencies**: T003 (Attendance model), T007 (migration), T011 (validation)
  - **Reference**: quickstart.md Scenario 3 Step 1

- [x] **T025** Implement attendance verification (approve/reject) in `src/actions/moderator/attendance.ts`
  - Export `verifyAttendance` server action
  - Validate JWT, check role = MODERATOR or ADMIN
  - Validate input with `attendanceVerifySchema` (T011)
  - Fetch attendance with event join
  - If MODERATOR: verify `event.createdById === currentUser.id` (FR-038)
  - If status = REJECTED and no disputeNotes: return error (FR-034)
  - Update Attendance: status, verifiedById, verifiedAt, disputeNotes (if REJECTED), resolutionNotes
  - Log to SecurityLog: eventType = ATTENDANCE_VERIFIED or ATTENDANCE_REJECTED, metadata = {attendanceId, studentId, eventId, decision}
  - **Dependencies**: T003, T007, T011, T024
  - **Reference**: contracts/moderator-attendance-verify.json

- [x] **T026** [P] Implement student attendance appeal in `src/actions/attendance/appeal.ts`
  - Export `appealAttendance` server action
  - Validate JWT, check attendance belongs to current student
  - Validate input with `attendanceAppealSchema` (T011)
  - Check current status = REJECTED
  - Update Attendance: status = DISPUTED, appealMessage
  - Log to SecurityLog: eventType = ATTENDANCE_APPEALED, metadata = {attendanceId, studentId}
  - **Dependencies**: T003, T007, T011
  - **Reference**: quickstart.md Scenario 3 Step 4

- [x] **T027** [P] Implement dispute resolution in `src/actions/moderator/attendance.ts`
  - Export `resolveDispute` server action (can reuse `verifyAttendance` with status = DISPUTED check)
  - Validate JWT, check role = MODERATOR or ADMIN
  - Validate input (status, resolutionNotes required for disputes)
  - If MODERATOR: verify event ownership
  - Update Attendance: status (APPROVED or REJECTED), resolutionNotes
  - Log to SecurityLog: eventType = DISPUTE_RESOLVED, metadata = {attendanceId, resolution}
  - **Dependencies**: T003, T007, T025
  - **Reference**: quickstart.md Scenario 3 Step 5

---

## Phase 3.6: Server Actions - Data Export ✅ COMPLETE

**Goal**: Implement CSV and Excel export with filtering and audit trail

- [x] **T028** Implement CSV export generation in `src/lib/export/csv-generator.ts`
  - Export `generateAttendanceCSV` function
  - Accept: attendance records array
  - Generate RFC 4180-compliant CSV
  - Headers: Student Number, Name, Department, Course, Year Level, Section, Event Name, Event Date, Venue, Check-In, Check-Out, Submission, Status, Verified By, Verified At, Distance, Photo URLs, Signature URL, Dispute Notes, Appeal, Resolution Notes
  - Escape quotes, commas in field values
  - Return: CSV string
  - **Dependencies**: None
  - **Reference**: research.md (CSV Export section), contracts/export-attendance-xlsx.json

- [x] **T029** Implement Excel export generation in `src/lib/export/xlsx-generator.ts`
  - Export `generateAttendanceXLSX` function
  - Use `xlsx` library (SheetJS)
  - Accept: attendance records array
  - Create workbook with single sheet
  - Headers: bold, colored background (#4F46E5), white font
  - Status cells: color-coded (APPROVED=green, REJECTED=red, PENDING=yellow, DISPUTED=purple)
  - Date columns: format as "YYYY-MM-DD HH:mm:ss"
  - Photo/signature URLs: hyperlinks
  - Return: Buffer or file path
  - **Dependencies**: T008 (xlsx library)
  - **Reference**: research.md (Excel Export section), contracts/export-attendance-xlsx.json

- [x] **T030** Implement export endpoint with filtering in `src/actions/export/export-xlsx.ts` and `src/actions/export/export-csv.ts`
  - Export `exportAttendanceXLSX` and `exportAttendanceCSV` server actions
  - Validate JWT, check role = ADMIN or MODERATOR
  - Validate input with `exportFiltersSchema` (T012)
  - Query Prisma: Attendance with filters (eventIds, date range, status, studentName)
    - If MODERATOR: add WHERE `event.createdById = currentUser.id`
  - Count records first: if >10,000, return error (FR-046 record limit)
  - Fetch records with joins (User, UserProfile, Event)
  - Call `generateAttendanceCSV` (T028) or `generateAttendanceXLSX` (T029)
  - Save file to Cloudinary for consistency with existing photo/signature storage
  - Generate signed download URL with 24hr expiration
  - Create ExportRecord: exportedById, format, filters, recordCount, status=COMPLETED, fileSize, downloadUrl, expiresAt
  - Log to SecurityLog: eventType = DATA_EXPORTED, metadata = {exportId, recordCount, filters}
  - Return: exportId, downloadUrl, expiresAt
  - **Dependencies**: T004 (ExportRecord model), T007, T012 (validation), T028 (CSV), T029 (XLSX)
  - **Reference**: contracts/export-attendance-xlsx.json

---

## Phase 3.7: Server Actions - Analytics

**Goal**: Implement analytics aggregations with Redis caching

- [x] **T031** Implement analytics aggregation functions in `src/lib/analytics/aggregations.ts`
  - Export functions:
    - `getKeyMetrics(startDate, endDate)`: total events, total attendances, verification rate, pending count
    - `getAttendanceTrends(startDate, endDate)`: group by date, count attendances (for line chart)
    - `getTopEvents(limit = 10)`: events sorted by attendance count (for bar chart)
    - `getEventStatusDistribution()`: group by status, count events (for pie chart)
    - `getVerificationStatusDistribution(startDate, endDate)`: group by attendance status, count (for pie chart)
    - `getDepartmentBreakdown(startDate, endDate)`: group by department, count approved attendances (for bar chart)
    - `getCourseBreakdown(startDate, endDate)`: group by course, count approved attendances (for bar chart)
  - Use Prisma aggregations: `count()`, `groupBy()`
  - Filter: deletedAt IS NULL for events, date ranges for attendances
  - **Dependencies**: T001, T002, T003, T007
  - **Reference**: data-model.md (Analytics Aggregation Queries), contracts/analytics-dashboard-data.json

- [x] **T032** Implement analytics dashboard endpoint with caching in `src/actions/dashboard/admin.ts`
  - Export `getAnalyticsDashboard` server action
  - Validate JWT, check role = ADMIN
  - Validate input with `analyticsQuerySchema` (T013)
  - Generate cache key: `analytics:dashboard:{startDate}:{endDate}`
  - If `refresh !== true`: try to fetch from Redis cache (5min TTL)
  - If cache miss or refresh:
    - Call all aggregation functions from T031 in parallel (Promise.all)
    - Structure response: keyMetrics, charts (attendanceTrends, topEvents, eventStatusDistribution, verificationStatusDistribution, departmentBreakdown, courseBreakdown)
    - Store in Redis with TTL 300s
  - Add metadata: generatedAt, cacheHit, queryTimeMs
  - Log to SecurityLog: eventType = ANALYTICS_ACCESSED (optional)
  - Return: analytics data
  - **Dependencies**: T013 (validation), T031 (aggregations)
  - **Reference**: contracts/analytics-dashboard-data.json

---

## Phase 3.8: UI Components - Data Tables ✅ COMPLETE

**Goal**: Create reusable data table components with shadcn/ui + TanStack Table

- [x] **T033** [P] Create base DataTable component in `src/components/dashboard/shared/data-table.tsx`
  - Use TanStack Table for headless logic (useReactTable hook)
  - Accept props: columns (ColumnDef[]), data, pagination, onPaginationChange, sorting, onSortingChange, filters
  - Render: shadcn/ui Table component
  - Features: sortable columns, pagination controls, row selection (optional)
  - Responsive: horizontal scroll on mobile
  - Accessibility: ARIA labels, keyboard navigation
  - **Dependencies**: T008 (@tanstack/react-table)
  - **Reference**: research.md (Data Table Architecture)

- [x] **T034** [P] Create FilterPanel component in `src/components/dashboard/shared/filter-panel.tsx`
  - Accept props: filters array (name, type, options), onFilterChange
  - Render: shadcn/ui Select, Input, DatePicker components
  - Support: dropdown filters (role, status), search input, date range pickers
  - "Apply Filters" and "Clear Filters" buttons
  - **Dependencies**: None (uses existing shadcn/ui)
  - **Reference**: plan.md (Project Structure)

- [x] **T035** [P] Create ExportButton component in `src/components/dashboard/shared/export-button.tsx`
  - Accept props: exportType (CSV | XLSX), filters, onExport
  - Render: shadcn/ui Button with dropdown (CSV, Excel options)
  - On click: call export server action, show loading state, handle download URL
  - Show toast on success/error
  - **Dependencies**: T030 (export actions)
  - **Reference**: quickstart.md Scenario 4

---

## Phase 3.9: UI Components - User Management ✅ COMPLETE

**Goal**: Build admin user management dashboard

- [x] **T036** Create UserTable component in `src/components/dashboard/admin/user-management/user-table.tsx`
  - Use DataTable (T033) with user-specific columns
  - Columns: Email, Role, Account Status, Last Login, Actions (Edit, Suspend, Delete dropdowns)
  - Status badges: color-coded (ACTIVE=green, SUSPENDED=red)
  - Action handlers: open dialogs for role change, suspension, deletion
  - **Dependencies**: T033 (DataTable)
  - **Reference**: quickstart.md Scenario 1

- [x] **T037** [P] Create UserFilters component in `src/components/dashboard/admin/user-management/user-filters.tsx`
  - Use FilterPanel (T034) with user-specific filters
  - Filters: Role dropdown, Status dropdown, Search input (email/name), Sort dropdown
  - On change: update query params, trigger refetch
  - **Dependencies**: T034 (FilterPanel)
  - **Reference**: contracts/admin-users-list.json

- [x] **T038** [P] Create UserEditDialog component in `src/components/dashboard/admin/user-management/user-edit-dialog.tsx`
  - shadcn/ui Dialog with form
  - Fields: Role dropdown (with self-change confirmation), Account Status toggle
  - React Hook Form + Zod validation (userRoleUpdateSchema, userStatusUpdateSchema)
  - On submit: call updateUserRole or updateUserStatus action
  - Show success toast, close dialog, refresh table
  - **Dependencies**: T009 (validation), T015, T016 (actions)
  - **Reference**: contracts/admin-users-update-role.json, admin-users-suspend.json

- [x] **T039** [P] Create UserCreateForm component in `src/components/dashboard/admin/user-management/user-create-form.tsx`
  - shadcn/ui Dialog or page with form
  - Fields: Email, Role dropdown, Student Number (if student), First/Middle/Last Name, Department, Course (if student)
  - React Hook Form + Zod validation (userCreateSchema)
  - On submit: call createUser action
  - Show temporary password (display once, copy to clipboard)
  - **Dependencies**: T009 (validation), T018 (action)
  - **Reference**: quickstart.md Scenario 1 Step 5

- [x] **T040** Create User Management page in `src/app/dashboard/admin/users/page.tsx`
  - Fetch users with listUsers action (T014) with filters from URL params
  - Render: UserTable (T036), UserFilters (T037), "Create User" button
  - Handle pagination: update URL params, refetch
  - Integrate: UserEditDialog (T038), UserCreateForm (T039)
  - Loading states, error handling
  - **Dependencies**: T014 (action), T036, T037, T038, T039 (components)
  - **Reference**: quickstart.md Scenario 1

---

## Phase 3.10: UI Components - Event Management

**Goal**: Build moderator/admin event management dashboard

- [ ] **T041** Create EventTable component in `src/components/dashboard/moderator/event-management/event-table.tsx`
  - Use DataTable (T033) with event-specific columns
  - Columns: Name, Start Date, Status, Attendance Count, Actions (Edit, Download QR, Delete)
  - Status badges: color-coded
  - Action handlers: navigate to edit page, download QR modal, delete confirmation
  - **Dependencies**: T033 (DataTable)
  - **Reference**: quickstart.md Scenario 2

- [ ] **T042** [P] Create EventFilters component in `src/components/dashboard/moderator/event-management/event-filters.tsx`
  - Use FilterPanel (T034) with event-specific filters
  - Filters: Status dropdown, Date Range picker (start/end date), Sort dropdown
  - **Dependencies**: T034 (FilterPanel)
  - **Reference**: contracts/moderator-events-list.json

- [ ] **T043** [P] Create EventForm component in `src/components/dashboard/moderator/event-management/event-form.tsx`
  - Reuse from Phase 2 or create new with extended fields
  - Fields: Name, Description, Start/End DateTime, Venue Location, Lat/Lng, Check-in/out Buffers
  - React Hook Form + Zod validation (eventCreateSchema/eventUpdateSchema)
  - On submit: call createEvent or updateEvent action
  - **Dependencies**: T010 (validation), T021, T022 (actions)
  - **Reference**: quickstart.md Scenario 2 Steps 3-4

- [ ] **T044** Create Moderator Event Management page in `src/app/dashboard/moderator/events/page.tsx`
  - Fetch events with listEvents action (T020) with filters
  - Render: EventTable (T041), EventFilters (T042), "Create Event" button
  - Moderator scope: only show own events
  - **Dependencies**: T020 (action), T041, T042, T043 (components)
  - **Reference**: quickstart.md Scenario 2

---

## Phase 3.11: UI Components - Attendance Management

**Goal**: Build moderator/admin attendance verification interface

- [ ] **T045** Create AttendanceTable component in `src/components/dashboard/moderator/attendance-management/attendance-table.tsx`
  - Use DataTable (T033) with attendance-specific columns
  - Columns: Student Name, Event, Submission Time, Status, Distance, Actions (View Details, Verify)
  - Status badges: PENDING=yellow, APPROVED=green, REJECTED=red, DISPUTED=purple
  - Action handlers: open detail dialog, open verify dialog
  - **Dependencies**: T033 (DataTable)
  - **Reference**: quickstart.md Scenario 3

- [ ] **T046** [P] Create AttendanceDetailDialog component in `src/components/dashboard/moderator/attendance-management/attendance-detail-dialog.tsx`
  - shadcn/ui Dialog showing full attendance record
  - Display: student info, event info, photos (front/back), signature, GPS data, submission time
  - Show: dispute notes (if rejected), appeal message (if disputed), resolution notes
  - Actions: Verify button (opens VerificationForm)
  - **Dependencies**: None (display only)
  - **Reference**: quickstart.md Scenario 3 Step 2

- [ ] **T047** [P] Create VerificationForm component in `src/components/dashboard/moderator/attendance-management/verification-form.tsx`
  - shadcn/ui Dialog with form
  - Fields: Status radio (Approve/Reject), Dispute Notes textarea (required if Reject), Resolution Notes textarea (optional)
  - React Hook Form + Zod validation (attendanceVerifySchema)
  - On submit: call verifyAttendance action
  - Show success toast, close dialog, refresh table
  - **Dependencies**: T011 (validation), T025 (action)
  - **Reference**: contracts/moderator-attendance-verify.json

- [ ] **T048** Create Moderator Attendance Management page in `src/app/dashboard/moderator/attendance/page.tsx`
  - Fetch attendances with listAttendances action (T024) with filters
  - Render: AttendanceTable (T045), FilterPanel (status, event, date range)
  - Moderator scope: only show attendances for own events
  - Integrate: AttendanceDetailDialog (T046), VerificationForm (T047)
  - **Dependencies**: T024 (action), T045, T046, T047 (components)
  - **Reference**: quickstart.md Scenario 3

---

## Phase 3.12: UI Components - Analytics Dashboard

**Goal**: Build admin analytics dashboard with Recharts visualizations

- [ ] **T049** [P] Create MetricsSummary component in `src/components/dashboard/admin/analytics/metrics-summary.tsx`
  - 4 metric cards: Total Events, Total Attendances, Verification Rate, Pending Count
  - shadcn/ui Card components with icons
  - Display: number + label + trend indicator (optional)
  - **Dependencies**: None
  - **Reference**: quickstart.md Scenario 5 Step 2

- [ ] **T050** [P] Create AttendanceTrendsChart component in `src/components/dashboard/admin/analytics/attendance-trends-chart.tsx`
  - Use Recharts LineChart
  - Data: array of {date, count}
  - X-axis: dates, Y-axis: attendance count
  - Responsive: ResponsiveContainer with 100% width
  - Interactive: Tooltip shows exact values on hover
  - Accessible: ARIA labels, keyboard navigation
  - **Dependencies**: T008 (recharts)
  - **Reference**: research.md (Recharts), contracts/analytics-dashboard-data.json

- [ ] **T051** [P] Create TopEventsChart component in `src/components/dashboard/admin/analytics/top-events-chart.tsx`
  - Use Recharts BarChart
  - Data: array of {eventName, attendanceCount}
  - X-axis: event names, Y-axis: count
  - Sort: descending by count (top 10)
  - **Dependencies**: T008 (recharts)
  - **Reference**: contracts/analytics-dashboard-data.json

- [ ] **T052** [P] Create EventStatusChart component in `src/components/dashboard/admin/analytics/event-status-chart.tsx`
  - Use Recharts PieChart
  - Data: array of {status, count}
  - Segments: UPCOMING, ONGOING, COMPLETED, CANCELLED
  - Show: legend with percentages
  - **Dependencies**: T008 (recharts)
  - **Reference**: contracts/analytics-dashboard-data.json

- [ ] **T053** [P] Create VerificationStatusChart component in `src/components/dashboard/admin/analytics/verification-status-chart.tsx`
  - Use Recharts PieChart
  - Data: array of {status, count}
  - Segments: APPROVED, REJECTED, PENDING, DISPUTED
  - Color-coded: match status badges
  - **Dependencies**: T008 (recharts)
  - **Reference**: contracts/analytics-dashboard-data.json

- [ ] **T054** [P] Create DepartmentBreakdownChart component in `src/components/dashboard/admin/analytics/department-breakdown-chart.tsx`
  - Use Recharts BarChart
  - Data: array of {department, count}
  - Sort: descending by count
  - **Dependencies**: T008 (recharts)
  - **Reference**: contracts/analytics-dashboard-data.json

- [ ] **T055** [P] Create CourseBreakdownChart component in `src/components/dashboard/admin/analytics/course-breakdown-chart.tsx`
  - Use Recharts BarChart
  - Data: array of {course, count}
  - Sort: descending by count
  - **Dependencies**: T008 (recharts)
  - **Reference**: contracts/analytics-dashboard-data.json

- [ ] **T056** [P] Create TimePeriodFilter component in `src/components/dashboard/admin/analytics/time-period-filter.tsx`
  - shadcn/ui Select with presets: Last 7 days, Last 30 days, Last 90 days, Custom Range
  - If Custom: show DateRangePicker
  - "Refresh Data" button (bypass cache)
  - On change: update query params, refetch analytics
  - **Dependencies**: None
  - **Reference**: contracts/analytics-dashboard-data.json

- [ ] **T057** Create Admin Analytics Dashboard page in `src/app/dashboard/admin/analytics/page.tsx`
  - Fetch analytics with getAnalyticsDashboard action (T032) with date filters
  - Render: MetricsSummary (T049), all chart components (T050-T055), TimePeriodFilter (T056)
  - Layout: responsive grid (2-column on desktop, 1-column on mobile)
  - Loading states: skeleton loaders for charts
  - Error handling: error boundary
  - **Dependencies**: T032 (action), T049-T056 (components)
  - **Reference**: quickstart.md Scenario 5

- [ ] **T057.1** [P] Implement chart drill-down navigation in all chart components
  - Add onClick handlers to chart components (T050-T055)
  - On click: navigate to corresponding management page with pre-filled filters
  - Example: Click "Computer Science" bar in DepartmentBreakdownChart → navigate to `/dashboard/admin/attendance?department=Computer%20Science&status=APPROVED`
  - Pass date range from analytics filter to attendance filter
  - Show loading state during navigation
  - **Dependencies**: T050-T055 (chart components), T048 (attendance page with filters)
  - **Reference**: spec.md FR-058

---

## Phase 3.13: Middleware & Security

**Goal**: Enforce RBAC, audit logging, and session management

- [ ] **T058** Extend auth middleware for account status check in `src/middleware.ts`
  - After JWT validation, fetch User with accountStatus
  - If `accountStatus === SUSPENDED`: return 403 "Account suspended"
  - If `deletedAt !== null`: return 403 "Account not found"
  - Allow request to proceed if ACTIVE
  - **Dependencies**: T001 (User model), T007 (migration)
  - **Reference**: quickstart.md Scenario 1 Step 8

- [ ] **T059** [P] Add route protection for admin/moderator paths in `src/middleware.ts`
  - Define protected routes:
    - `/dashboard/admin/*` → role = ADMIN
    - `/dashboard/moderator/*` → role = MODERATOR or ADMIN
  - If role mismatch: redirect to appropriate dashboard or return 403
  - **Dependencies**: T058
  - **Reference**: quickstart.md Scenario 6 Steps 1-3

- [ ] **T060** [P] Implement security logging helper in `src/lib/security/log-event.ts`
  - Export `logSecurityEvent` function
  - Accept: eventType, userId, success, metadata, ipAddress, userAgent
  - Create SecurityLog record with Prisma
  - Used by all management actions (T014-T032)
  - **Dependencies**: T006 (SecurityLog model), T007
  - **Reference**: data-model.md (SecurityLog Extensions)

---

## Phase 3.14: Integration & Polish

**Goal**: Final integration, performance optimization, and validation

- [ ] **T061** Update navigation with management links in `src/components/navigation.tsx`
  - Admin nav: add links to User Management, Analytics, All Events, All Attendances
  - Moderator nav: add links to My Events, My Attendances
  - Conditional rendering based on user role
  - **Dependencies**: None
  - **Reference**: plan.md (Project Structure)

- [ ] **T062** [P] Add loading skeletons for data tables in `src/components/loading-skeletons.tsx`
  - Create skeleton components for tables, charts, forms
  - Use during async data fetching
  - Prevent CLS (Cumulative Layout Shift)
  - **Dependencies**: None
  - **Reference**: Constitution (Performance Standards)

- [ ] **T063** [P] Implement error boundaries for management pages
  - Wrap each management page route with ErrorBoundary
  - Show user-friendly error messages
  - Log errors to console (or external service)
  - **Dependencies**: Existing ErrorBoundary component
  - **Reference**: Constitution (Maintainability)

- [ ] **T064** Optimize bundle size with code splitting
  - Ensure Next.js dynamic imports for heavy components (charts, data tables)
  - Verify separate bundles for `/admin/*` and `/moderator/*` routes
  - Run `npm run build` and analyze bundle sizes
  - Target: each route <500KB gzipped
  - **Dependencies**: All UI tasks complete
  - **Reference**: Constitution (Performance Standards)

- [ ] **T065** Run manual validation scenarios from quickstart.md
  - Execute all 6 scenarios: User Management, Event Management, Attendance Verification, Data Export, Analytics Dashboard, RBAC & Security
  - Verify: all acceptance criteria met, no console errors, WCAG 2.1 AA compliance
  - Document: any bugs found, create GitHub issues
  - **Dependencies**: All tasks T001-T064 complete
  - **Reference**: quickstart.md (all scenarios)

- [ ] **T066** [P] Update project documentation
  - Update README.md with Phase 3 features
  - Add management feature screenshots (optional)
  - Document: new environment variables (if any, e.g., Redis URL), deployment notes
  - **Dependencies**: T065 (validation complete)
  - **Reference**: Constitution (Maintainability)

---

## Dependencies Graph

```
Phase 3.1 (Schema): T001-T008 [parallel except T006→T005, T007→T001-T006]
    ↓
Phase 3.2 (Validation): T009-T013 [all parallel]
    ↓
Phase 3.3 (User Actions): T014 → T015,T016 (sequential), T017-T019 [parallel]
    ↓
Phase 3.4 (Event Actions): T020 → T021-T023 [parallel after T020]
    ↓
Phase 3.5 (Attendance Actions): T024 → T025 → T026,T027 [parallel after T025]
    ↓
Phase 3.6 (Export): T028,T029 [parallel] → T030
    ↓
Phase 3.7 (Analytics): T031 → T032
    ↓
Phase 3.8 (Base UI): T033,T034,T035 [all parallel]
    ↓
Phase 3.9 (User UI): T036 → T037-T039 [parallel] → T040
    ↓
Phase 3.10 (Event UI): T041 → T042,T043 [parallel] → T044
    ↓
Phase 3.11 (Attendance UI): T045 → T046,T047 [parallel] → T048
    ↓
Phase 3.12 (Analytics UI): T049-T056 [all parallel] → T057
    ↓
Phase 3.13 (Security): T058 → T059,T060 [parallel]
    ↓
Phase 3.14 (Polish): T061-T064 [parallel] → T065 → T066
```

---

## Parallel Execution Examples

### Example 1: Database Schema Extensions (Phase 3.1)
```bash
# Run T001-T005 in parallel (different model sections):
Task T001: Extend User model in prisma/schema.prisma
Task T002: Extend Event model in prisma/schema.prisma  
Task T003: Extend Attendance model in prisma/schema.prisma
Task T004: Create ExportRecord model in prisma/schema.prisma
Task T005: Extend SecurityEventType enum in prisma/schema.prisma

# Then sequential:
Task T006: Extend SecurityLog model (depends on T005)
Task T007: Generate migration (depends on all above)
Task T008: Install dependencies [P] (can run anytime after T007)
```

### Example 2: Validation Schemas (Phase 3.2)
```bash
# All parallel (different files):
Task T009: Create user-management.ts
Task T010: Create event-management.ts
Task T011: Create attendance-verification.ts
Task T012: Create export.ts
Task T013: Create analytics.ts
```

### Example 3: Chart Components (Phase 3.12)
```bash
# All parallel (different files):
Task T049: Create metrics-summary.tsx
Task T050: Create attendance-trends-chart.tsx
Task T051: Create top-events-chart.tsx
Task T052: Create event-status-chart.tsx
Task T053: Create verification-status-chart.tsx
Task T054: Create department-breakdown-chart.tsx
Task T055: Create course-breakdown-chart.tsx
Task T056: Create time-period-filter.tsx
```

---

## Validation Checklist

*GATE: Verify before marking tasks complete*

- [x] All contracts have corresponding API endpoints (7 contracts → T014-T016, T020, T025, T030, T032)
- [x] All entities have model extension tasks (User→T001, Event→T002, Attendance→T003, ExportRecord→T004)
- [x] All Zod validation schemas created before server actions (T009-T013 before T014-T032)
- [x] All server actions have corresponding UI components (T014-T032 → T036-T057)
- [x] Parallel tasks operate on different files (no conflicts)
- [x] Each task specifies exact file path
- [x] All quickstart scenarios have validation tasks (Scenario 1-6 → T065)
- [x] Security logging integrated (T060 used by all management actions)
- [x] Performance optimizations included (T062 skeletons, T064 code splitting)
- [x] Accessibility requirements met (T033 ARIA labels, T050-T055 chart accessibility)

---

## Notes

- **Manual Testing Only**: No automated test framework configured per project decision (plan.md). Use quickstart.md for validation.
- **Redis Setup**: Ensure Redis is running locally or configure Upstash connection for analytics caching (T032).
- **File Storage**: Export files (T030) require temp directory or cloud storage configuration (Cloudinary/S3).
- **Prisma Client**: Run `npx prisma generate` after T007 to update Prisma Client types.
- **Commit Strategy**: Commit after each phase completion (e.g., after T008, after T013, after T019, etc.).
- **TypeScript Strict Mode**: Ensure no `any` types introduced; use proper interfaces for all component props.

---

**Total Tasks**: 67  
**Ready for Execution**: ✅  
**Next Step**: Begin with Phase 3.1 (T001-T008) - Database schema extensions
