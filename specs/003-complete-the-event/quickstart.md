# Quickstart Validation Guide

**Feature**: 003-complete-the-event (Management System & Analytics)  
**Date**: 2025-10-08  
**Purpose**: Step-by-step manual validation scenarios to verify Phase 3 implementation

---

## Prerequisites

Before starting validation, ensure:

- [ ] Phase 1 & 2 features are fully functional (auth, profile, events, attendance)
- [ ] Database migrations applied (`npx prisma migrate dev`)
- [ ] Test data seeded (at least 1 admin, 2 moderators, 10 students, 5 events)
- [ ] Development server running (`npm run dev`)
- [ ] Browser DevTools open for network inspection
- [ ] At least one test user account for each role (ADMIN, MODERATOR, STUDENT)

---

## Scenario 1: User Management (Admin)

**Goal**: Validate admin can create, manage, suspend, and delete users (FR-001 to FR-015)

### Steps:

1. **Login as Admin**
   - Navigate to `/auth/login`
   - Login with admin credentials
   - Verify redirect to `/dashboard/admin`

2. **View User List**
   - Click "User Management" in admin sidebar
   - Verify user list displays with columns: Email, Role, Status, Last Login, Actions
   - Verify pagination controls visible (Page 1 of X)
   - **Expected**: List shows all users excluding soft-deleted (`deletedAt != null`)

3. **Filter by Role**
   - Select "STUDENT" from role filter dropdown
   - Click "Apply Filters"
   - Verify only students displayed
   - **Expected**: `GET /api/admin/users?role=STUDENT` returns filtered list

4. **Search by Name**
   - Enter "Juan" in search box
   - Verify results update to show matching users
   - **Expected**: API call `GET /api/admin/users?search=Juan` returns partial matches

5. **Create New User**
   - Click "Create User" button
   - Fill form: Email, Role (MODERATOR), Student Number, Name
   - Submit form
   - **Expected**: `POST /api/admin/users` returns 201, new user appears in list
   - **Verify**: SecurityLog contains USER_CREATED event

6. **Change User Role**
   - Find student user, click "Edit" → "Change Role"
   - Select "MODERATOR" from dropdown
   - **Expected**: Confirmation dialog appears (FR-008 if self-role change)
   - Confirm change
   - **Expected**: `PATCH /api/admin/users/:userId/role` returns 200
   - **Verify**: User row updates to show "MODERATOR" role
   - **Verify**: SecurityLog contains USER_ROLE_CHANGED event with metadata

7. **Suspend User Account**
   - Find active user, click "Actions" → "Suspend Account"
   - Enter suspension reason: "Testing suspension workflow"
   - Confirm suspension
   - **Expected**: `PATCH /api/admin/users/:userId/status` with status=SUSPENDED returns 200
   - **Verify**: User row shows status badge "SUSPENDED" (red)
   - **Verify**: SecurityLog contains USER_STATUS_CHANGED event

8. **Attempt to Login as Suspended User**
   - Logout from admin account
   - Try to login with suspended user credentials
   - **Expected**: Login fails with error "Account suspended. Contact administrator."
   - **Verify**: Auth middleware blocks login (accountStatus check)

9. **Reactivate Suspended Account**
   - Login as admin again
   - Navigate to User Management
   - Find suspended user, click "Actions" → "Reactivate Account"
   - **Expected**: `PATCH /api/admin/users/:userId/status` with status=ACTIVE returns 200
   - **Verify**: Status badge changes to "ACTIVE" (green)
   - **Verify**: User can now login successfully

10. **Reset User Password**
    - Find user, click "Actions" → "Reset Password"
    - System generates temporary password
    - **Expected**: `PATCH /api/admin/users/:userId/password` returns 200 with temp password
    - **Verify**: SecurityLog contains USER_PASSWORD_RESET event
    - **Verify**: User can login with temp password, forced to change on first login

11. **Delete User**
    - Find user with NO attendance records
    - Click "Actions" → "Delete User"
    - Confirm deletion with reason
    - **Expected**: `DELETE /api/admin/users/:userId` returns 200 (soft delete)
    - **Verify**: User disappears from list
    - **Verify**: Database: `deletedAt` is set, `deletedById` = current admin ID
    - **Verify**: SecurityLog contains USER_DELETED event

---

## Scenario 2: Event Management (Moderator)

**Goal**: Validate moderators can create, edit, and manage only their own events (FR-016 to FR-025)

### Steps:

1. **Login as Moderator**
   - Navigate to `/auth/login`
   - Login with moderator credentials
   - Verify redirect to `/dashboard/moderator`

2. **View Own Events Only**
   - Click "My Events" in moderator sidebar
   - **Expected**: `GET /api/moderator/events` returns only events where `createdById = currentUser.id`
   - **Verify**: No events from other moderators visible

3. **Create New Event**
   - Click "Create Event" button
   - Fill form: Name, Description, Start/End Date/Time, Venue, Location, Buffers
   - Submit form
   - **Expected**: `POST /api/moderator/events` returns 201
   - **Verify**: Event appears in "My Events" list
   - **Verify**: Database: `event.createdById = currentUser.id`
   - **Verify**: SecurityLog contains EVENT_CREATED event

4. **Edit Event Details**
   - Find newly created event, click "Edit"
   - Change event name and description
   - Submit changes
   - **Expected**: `PATCH /api/moderator/events/:eventId` returns 200
   - **Verify**: Changes reflected in event details
   - **Verify**: Database: `event.editHistory` JSON contains edit record with fields changed
   - **Verify**: SecurityLog contains EVENT_EDITED event

5. **Filter Events by Status**
   - Select "UPCOMING" from status filter
   - **Expected**: Only upcoming events displayed (FR-027)
   - **Verify**: `GET /api/moderator/events?status=UPCOMING` returns filtered list

6. **Filter Events by Date Range**
   - Select date range: Oct 1-31, 2025
   - **Expected**: Only events in date range displayed (FR-028)
   - **Verify**: `GET /api/moderator/events?startDate=2025-10-01&endDate=2025-10-31`

7. **Attempt to Delete Event with Attendances**
   - Find event with at least 1 attendance record (`hasAttendances = true`)
   - Click "Delete"
   - **Expected**: Error message "Cannot delete event with existing attendance records" (FR-020)
   - **Verify**: Delete request blocked by server validation

8. **Delete Event without Attendances**
   - Create new event (no attendances yet)
   - Click "Delete" immediately
   - Confirm deletion
   - **Expected**: `DELETE /api/moderator/events/:eventId` returns 200 (soft delete)
   - **Verify**: Event disappears from list, `deletedAt` is set in database

---

## Scenario 3: Attendance Verification (Moderator)

**Goal**: Validate moderators can verify attendance for own events only, with rejection/dispute flow (FR-029 to FR-042)

### Steps:

1. **View Pending Attendances**
   - Login as moderator
   - Navigate to "Attendance Management"
   - **Expected**: `GET /api/moderator/attendance?status=PENDING` returns list
   - **Verify**: Only attendances for events created by current moderator visible (FR-042)

2. **Approve Valid Attendance**
   - Find pending attendance with valid photos/location
   - Click "Verify" → "Approve"
   - Add optional resolution notes: "Verified successfully"
   - Submit approval
   - **Expected**: `PATCH /api/moderator/attendance/:id/verify` with status=APPROVED returns 200
   - **Verify**: Attendance status changes to "APPROVED" (green badge)
   - **Verify**: Database: `verifiedById`, `verifiedAt`, `resolutionNotes` populated
   - **Verify**: SecurityLog contains ATTENDANCE_VERIFIED event

3. **Reject Invalid Attendance**
   - Find pending attendance with issues (e.g., blurry photo, far location)
   - Click "Verify" → "Reject"
   - **Expected**: Dispute notes field is REQUIRED (FR-034)
   - Enter notes: "Location 500m from venue. Photos unclear."
   - Submit rejection
   - **Expected**: `PATCH /api/moderator/attendance/:id/verify` with status=REJECTED, disputeNotes returns 200
   - **Verify**: Attendance status = "REJECTED" (red badge)
   - **Verify**: Database: `disputeNotes` saved, `verifiedById/At` populated
   - **Verify**: SecurityLog contains ATTENDANCE_REJECTED event

4. **Student Appeals Rejection**
   - Logout moderator, login as rejected student
   - Navigate to "My Attendances"
   - Find rejected attendance, click "Appeal"
   - Enter appeal message: "I was inside the venue. GPS may be inaccurate."
   - Submit appeal
   - **Expected**: `PATCH /api/student/attendance/:id/appeal` returns 200
   - **Verify**: Attendance status changes to "DISPUTED" (purple badge)
   - **Verify**: Database: `appealMessage` saved, status=DISPUTED
   - **Verify**: SecurityLog contains ATTENDANCE_APPEALED event

5. **Moderator Resolves Dispute**
   - Logout student, login as moderator
   - Navigate to "Attendance Management" → Filter by "DISPUTED"
   - Find disputed attendance, click "Review Dispute"
   - View student's appeal message
   - **Option A: Approve** → Add resolution notes, approve
   - **Expected**: `PATCH /api/moderator/attendance/:id/resolve` with status=APPROVED returns 200
   - **Verify**: Status = "APPROVED", `resolutionNotes` saved (FR-041)
   - **Verify**: SecurityLog contains DISPUTE_RESOLVED event

6. **Moderator Cannot Verify Other Moderator's Events**
   - Find attendance for event created by different moderator
   - Attempt to verify
   - **Expected**: `403 Forbidden: You can only verify attendance for your own events` (FR-042)
   - **Verify**: Server action checks `event.createdById === currentUser.id`

7. **Admin Can Verify Any Event**
   - Logout moderator, login as admin
   - Navigate to "Attendance Management" (admin view)
   - Find attendance for any event (including other moderators' events)
   - Verify attendance (approve/reject)
   - **Expected**: Verification succeeds regardless of `createdById`
   - **Verify**: Admin has full access to all attendances

---

## Scenario 4: Data Export (Admin & Moderator)

**Goal**: Validate Excel/CSV export with filtering and audit trail (FR-043 to FR-052)

### Steps:

1. **Export All Attendances to Excel (Admin)**
   - Login as admin
   - Navigate to "Attendance Management"
   - Click "Export" → "Excel (.xlsx)"
   - Leave filters empty (export all)
   - **Expected**: `POST /api/export/attendance/xlsx` returns 200
   - **Verify**: Response contains `downloadUrl` and `expiresAt` (24hr expiry)
   - Click download link
   - **Verify**: Excel file downloads with proper formatting (headers bold, colored, status colors)

2. **Verify Excel Content**
   - Open downloaded .xlsx file
   - **Verify**: Headers match spec (Student Number, Name, Department, Event Name, Status, etc.)
   - **Verify**: All attendance records included (match database count)
   - **Verify**: Date columns formatted as `YYYY-MM-DD HH:mm:ss`
   - **Verify**: Status cells colored (APPROVED=green, REJECTED=red, PENDING=yellow, DISPUTED=purple)
   - **Verify**: Photo/signature URLs are clickable hyperlinks

3. **Export with Filters**
   - Navigate to "Attendance Management"
   - Select filters:
     * Event: "CS Orientation"
     * Date Range: Oct 1-31, 2025
     * Status: APPROVED
   - Click "Export" → "Excel (.xlsx)"
   - **Expected**: `POST /api/export/attendance/xlsx` with filters in request body
   - Download and open file
   - **Verify**: Only filtered records included (matching event, date range, status)

4. **Export to CSV**
   - Click "Export" → "CSV"
   - **Expected**: `POST /api/export/attendance/csv` returns 200
   - Download CSV file
   - **Verify**: Proper RFC 4180 format (quoted fields, escaped commas/quotes)
   - **Verify**: Same columns as Excel export
   - **Verify**: Can open in Excel/Google Sheets without errors

5. **Moderator Exports Own Events Only**
   - Logout admin, login as moderator
   - Navigate to "My Attendance Records"
   - Select event filter (one of moderator's events)
   - Click "Export" → "Excel"
   - **Expected**: Export succeeds
   - **Verify**: Only attendances for moderator's events included (FR-052 scope restriction)

6. **Moderator Cannot Export Other Moderator's Events**
   - Attempt to manually craft request with other moderator's eventId
   - **Expected**: `403 Forbidden: Moderators can only export attendance for their own events`
   - **Verify**: Server validates `event.createdById === currentUser.id`

7. **Export Exceeds Record Limit**
   - Select very broad filters (all time, all events)
   - **Expected**: If >10,000 records match, error message "Export exceeds maximum record limit (10,000 records). Please refine your filters."
   - **Verify**: Server counts records before generation, rejects if limit exceeded

8. **Verify Export Audit Trail**
   - Navigate to admin panel → "Export History"
   - **Verify**: ExportRecord created with:
     * exportedById = current user ID
     * format = XLSX or CSV
     * filters = JSON with applied filters
     * recordCount = number of exported records
     * status = COMPLETED
   - **Verify**: SecurityLog contains DATA_EXPORTED event with metadata

---

## Scenario 5: Analytics Dashboard (Admin)

**Goal**: Validate analytics dashboard with charts, key metrics, and filtering (FR-053 to FR-065)

### Steps:

1. **View Analytics Dashboard**
   - Login as admin
   - Navigate to "Analytics" from sidebar
   - **Expected**: `GET /api/admin/analytics/dashboard` returns 200
   - **Verify**: Dashboard loads with all sections visible

2. **Key Metrics Display**
   - Verify top section shows 4 metric cards:
     * Total Events (number)
     * Total Attendances (number)
     * Verification Rate (percentage, e.g., 92.3%)
     * Pending Verification Count (number)
   - **Verify**: Metrics match database counts (FR-054)

3. **Attendance Trends Line Chart**
   - Locate "Attendance Trends" section
   - **Verify**: Line chart displayed using Recharts library
   - **Verify**: X-axis = dates, Y-axis = attendance count
   - **Verify**: Line shows trend over time (last 30 days by default)
   - Hover over data points
   - **Verify**: Tooltip shows date and exact count (FR-063 interactive)
   - **Verify**: Chart responsive (resize browser, chart adapts) (FR-061)

4. **Top Events Bar Chart**
   - Locate "Top 10 Events by Attendance" section
   - **Verify**: Horizontal/vertical bar chart displayed
   - **Verify**: Shows top 10 events sorted by attendance count (FR-057)
   - **Verify**: Bar colors consistent
   - Click on bar
   - **Expected**: Optional drill-down to event details (if implemented)

5. **Event Status Pie Chart**
   - Locate "Event Status Distribution" section
   - **Verify**: Pie chart with segments for UPCOMING, ONGOING, COMPLETED, CANCELLED (FR-058)
   - **Verify**: Legend shows counts
   - Hover over segments
   - **Verify**: Tooltip shows status and percentage

6. **Verification Status Pie Chart**
   - Locate "Verification Status Distribution" section
   - **Verify**: Pie chart with APPROVED, REJECTED, PENDING, DISPUTED segments (FR-059)
   - **Verify**: Color coding matches app theme (APPROVED=green, REJECTED=red, etc.)

7. **Department Breakdown Bar Chart**
   - Locate "Attendance by Department" section
   - **Verify**: Bar chart showing attendance count per department (FR-064)
   - **Verify**: Departments sorted by count (descending)
   - **Verify**: Includes all departments from UserProfile.department

8. **Course Breakdown Bar Chart**
   - Locate "Attendance by Course" section
   - **Verify**: Bar chart showing attendance count per course (FR-065)
   - **Verify**: Courses sorted by count

9. **Filter by Date Range**
   - Locate date range filter at top of dashboard
   - Select "Last 7 days" from preset dropdown
   - **Expected**: All charts and metrics update to show only last 7 days of data (FR-055)
   - **Verify**: API call `GET /api/admin/analytics/dashboard?startDate=...&endDate=...`
   - **Verify**: Metrics recalculate based on date filter

10. **Custom Date Range**
    - Click "Custom Range"
    - Select dates: Oct 1-15, 2025
    - Apply filter
    - **Verify**: All charts filter to custom range
    - **Verify**: Key metrics reflect filtered period

11. **Cache Performance**
    - Open browser DevTools → Network tab
    - Refresh dashboard page
    - **Verify**: Initial load takes <2s (cold cache)
    - Refresh again immediately
    - **Verify**: Second load takes <500ms (warm cache, Redis hit)
    - **Verify**: Response header indicates cache hit (if implemented)

12. **Force Cache Refresh**
    - Click "Refresh Data" button (or add `?refresh=true` to URL)
    - **Expected**: Cache bypassed, fresh data loaded from database
    - **Verify**: API call includes `refresh=true` parameter
    - **Verify**: Response metadata shows `cacheHit: false`

13. **Chart Accessibility**
    - Use screen reader (NVDA/JAWS) to navigate dashboard
    - **Verify**: Chart titles announced (FR-062)
    - **Verify**: Data values accessible via keyboard navigation
    - **Verify**: ARIA labels present on interactive elements
    - Check color contrast
    - **Verify**: Chart colors meet WCAG AA standards (contrast ratio ≥4.5:1)

---

## Scenario 6: RBAC & Security

**Goal**: Validate role-based access control and security logging (FR-010, FR-052, Security principles)

### Steps:

1. **Student Cannot Access Admin Routes**
   - Login as student
   - Attempt to navigate to `/dashboard/admin/users`
   - **Expected**: 403 Forbidden or redirect to `/dashboard/student`
   - **Verify**: Middleware blocks unauthorized access

2. **Moderator Cannot Access Admin Analytics**
   - Login as moderator
   - Attempt to navigate to `/dashboard/admin/analytics`
   - **Expected**: 403 Forbidden
   - **Verify**: Admin-only routes protected

3. **Moderator Cannot Manage Users**
   - Attempt to navigate to `/dashboard/admin/users`
   - **Expected**: 403 Forbidden
   - **Verify**: User management restricted to admin

4. **Security Log Audit Trail**
   - Login as admin
   - Navigate to "Security Logs" (admin panel)
   - **Verify**: All major actions logged:
     * USER_ROLE_CHANGED (with metadata: fromRole, toRole, targetUserId)
     * USER_STATUS_CHANGED (with metadata: fromStatus, toStatus, reason)
     * USER_CREATED, USER_PASSWORD_RESET, USER_DELETED
     * EVENT_CREATED, EVENT_EDITED, EVENT_DELETED
     * ATTENDANCE_VERIFIED, ATTENDANCE_REJECTED, ATTENDANCE_APPEALED, DISPUTE_RESOLVED
     * DATA_EXPORTED (with metadata: exportId, recordCount, filters)
   - **Verify**: Each log entry includes: timestamp, userId, eventType, success, metadata JSON

5. **JWT Token Expiration**
   - Login as user
   - Wait for JWT to expire (or manually set short expiration in dev)
   - Attempt to perform action (e.g., create event)
   - **Expected**: 401 Unauthorized, redirect to login
   - **Verify**: Auth middleware validates token expiration

6. **Suspended User Session Revocation**
   - Login as user (active session)
   - In another tab, admin suspends this user
   - In original tab, attempt to perform action
   - **Expected**: 403 Forbidden "Account suspended" (if session check implemented)
   - **Verify**: Suspended status checked on each request (middleware or token refresh)

---

## Performance Validation

**Goal**: Verify performance targets met (Performance Principle, research.md targets)

### Steps:

1. **Page Load Performance**
   - Open DevTools → Performance tab
   - Navigate to `/dashboard/admin/analytics`
   - **Expected**: Page load <2s on simulated 3G network
   - **Verify**: Lighthouse score ≥90

2. **Core Web Vitals**
   - Run Lighthouse audit
   - **Verify**:
     * LCP (Largest Contentful Paint) <2.5s
     * FID (First Input Delay) <100ms
     * CLS (Cumulative Layout Shift) <0.1

3. **API Response Times**
   - Monitor Network tab during dashboard load
   - **Verify**: Analytics API response <2s (cold cache)
   - **Verify**: Subsequent requests <500ms (Redis cache hit)

4. **Data Table Pagination Performance**
   - Navigate to User Management (1000+ users)
   - Click through pages
   - **Verify**: Each page load <500ms
   - **Verify**: Smooth scrolling, no lag

5. **Export Generation Performance**
   - Export 5000 attendance records to Excel
   - **Verify**: File generation completes within 10 seconds
   - **Verify**: No timeout errors

---

## Accessibility Validation

**Goal**: Verify WCAG 2.1 AA compliance (UX First Principle, FR-062)

### Steps:

1. **Keyboard Navigation**
   - Navigate entire app using only keyboard (Tab, Enter, Arrow keys)
   - **Verify**: All interactive elements reachable
   - **Verify**: Focus indicators visible
   - **Verify**: Skip links present for main content

2. **Screen Reader Compatibility**
   - Test with NVDA/JAWS
   - **Verify**: Form labels announced
   - **Verify**: Button purposes clear
   - **Verify**: Chart data accessible (ARIA labels)
   - **Verify**: Error messages announced

3. **Color Contrast**
   - Use axe DevTools or WAVE
   - **Verify**: All text meets 4.5:1 contrast ratio
   - **Verify**: Chart colors distinguishable by colorblind users

4. **Responsive Design**
   - Test on mobile (375px width), tablet (768px), desktop (1920px)
   - **Verify**: Charts resize responsively (FR-061)
   - **Verify**: Data tables adapt (horizontal scroll or stacked layout on mobile)
   - **Verify**: No content clipped or hidden

---

## Error Handling Validation

**Goal**: Verify graceful error handling (FR-051, Maintainability Principle)

### Steps:

1. **Network Failure**
   - Simulate offline mode (DevTools → Network → Offline)
   - Attempt to load dashboard
   - **Expected**: Error boundary catches, shows user-friendly message "Unable to load data. Check your connection."
   - **Verify**: No white screen of death

2. **Export Failure**
   - Trigger export with invalid filters (e.g., startDate > endDate)
   - **Expected**: 400 Bad Request with clear error message
   - **Verify**: Error displayed to user in toast/alert

3. **Database Connection Error**
   - Simulate DB down (stop Prisma service)
   - Attempt to load analytics
   - **Expected**: 500 Internal Server Error caught by error boundary
   - **Verify**: Generic error message shown (don't leak DB details to user)
   - **Verify**: Error logged server-side for debugging

4. **Validation Errors**
   - Submit form with invalid data (e.g., empty required fields)
   - **Expected**: Zod validation catches, displays field-specific errors
   - **Verify**: Error messages helpful and actionable

---

## Data Integrity Validation

**Goal**: Verify database constraints and relationships (data-model.md constraints)

### Steps:

1. **Unique Constraints**
   - Attempt to create duplicate user email
   - **Expected**: 409 Conflict "Email already exists"
   - **Verify**: Database unique constraint enforced

2. **Foreign Key Constraints**
   - Attempt to delete user who created events
   - **Expected**: Soft delete succeeds (onDelete: SetNull for event.createdBy)
   - **Verify**: Events remain, createdById set to null

3. **Soft Delete Filtering**
   - Soft delete a user
   - Query user list
   - **Verify**: Deleted user not in results (WHERE deletedAt IS NULL)

4. **Attendance Duplicate Prevention**
   - Attempt to submit attendance twice for same event
   - **Expected**: 409 Conflict "Attendance already submitted"
   - **Verify**: Unique constraint on (studentId, eventId) enforced

---

## Success Criteria

All scenarios must pass with:

- ✅ All API endpoints return expected status codes and data structures
- ✅ Database constraints enforced (unique, foreign keys, validation)
- ✅ RBAC correctly limits access (admin vs moderator vs student)
- ✅ Security logs capture all significant actions with metadata
- ✅ Performance targets met (page load <2s, API <500ms cached)
- ✅ Accessibility: WCAG 2.1 AA compliant, keyboard navigable, screen reader compatible
- ✅ Charts render correctly, interactive, responsive
- ✅ Export files (Excel/CSV) formatted properly with all data
- ✅ Error handling graceful, user-friendly messages
- ✅ No console errors during normal operation

---

## Post-Validation Actions

After successful validation:

1. Document any bugs/issues found in GitHub Issues
2. Update test cases in `/tests` directory to automate scenarios
3. Generate test coverage report (`npm run test:coverage`)
4. Run E2E tests (`npm run test:e2e`) to regression-test Phase 1 & 2
5. Update `.github/copilot-instructions.md` with validated features
6. Merge feature branch to main after CI/CD passes

---

**Status**: ✅ Quickstart guide ready. Use for manual testing before automated test implementation.
