# Manual Testing Guide - Event Attendance System

This guide provides step-by-step instructions for manually testing all features of the Event Attendance System. Follow each scenario carefully and document any issues you encounter.

---

## Prerequisites

Before you begin testing, ensure:

1. **Database Setup**:
   - PostgreSQL is running
   - All migrations are applied: `npx prisma migrate deploy`
   - Database is seeded with test data (see "Test Data Setup" below)

2. **Environment Variables**:
   - All required environment variables are set in `.env`
   - `JWT_SECRET` is configured
   - Cloudinary credentials are valid
   - Upstash Redis credentials are set (for rate limiting)

3. **Development Server**:
   - Run `npm run dev` to start the Next.js development server
   - Server should be running on `http://localhost:3000`

4. **Browser DevTools**:
   - Open browser DevTools (F12) for console logs
   - Enable location services in browser settings
   - Allow camera and microphone permissions when prompted

---

## Test Data Setup

Create the following test users and events using the registration and event creation flows:

### Test Users

| Email                 | Password    | Role          | Profile Status                 |
| --------------------- | ----------- | ------------- | ------------------------------ |
| `student@test.com`    | `Test1234!` | Student       | Complete                       |
| `student2@test.com`   | `Test1234!` | Student       | Complete                       |
| `incomplete@test.com` | `Test1234!` | Student       | Incomplete (missing firstName) |
| `moderator@test.com`  | `Test1234!` | Moderator     | Complete                       |
| `admin@test.com`      | `Test1234!` | Administrator | Complete                       |

### Test Events

**Event 1: Active Event (for check-in testing)**

- **Name**: "Spring 2025 Orientation"
- **Start DateTime**: Current date + 1 hour
- **End DateTime**: Current date + 3 hours
- **Venue Coordinates**: Your current location (or 14.5995, 120.9842)
- **Venue Name**: "Main Auditorium"
- **Check-in Buffer**: 30 minutes
- **Check-out Buffer**: 30 minutes
- **Status**: Active
- **Created By**: `moderator@test.com`

**Event 2: Upcoming Event (for dashboard testing)**

- **Name**: "Workshop: Career Planning"
- **Start DateTime**: Current date + 3 days
- **End DateTime**: Current date + 3 days + 2 hours
- **Venue Coordinates**: 14.5995, 120.9842
- **Venue Name**: "Room 301"
- **Check-in Buffer**: 30 minutes
- **Check-out Buffer**: 30 minutes
- **Status**: Active
- **Created By**: `moderator@test.com`

---

## Scenario 1: Successful QR-Based Check-In ✅

**Objective**: Verify the complete 3-click attendance submission flow works correctly.

### Prerequisites

- Logged in as `student@test.com`
- "Spring 2025 Orientation" event is active and within check-in window
- Event QR code is available (generated during event creation)

### Test Steps

#### Step 1: Navigate to Attendance Page

1. Click on "Attendance" in the navigation menu (or go to `/attendance`)
2. **Verify**: Page loads with "QR-Based Attendance" heading
3. **Verify**: "Scan QR Code" button is visible and enabled
4. **Verify**: If offline, banner shows "You are offline" and button is disabled

#### Step 2: Scan QR Code

1. Click "Start Scanning" button
2. **Verify**: Browser requests camera permission (allow it)
3. **Verify**: Camera preview appears in a modal dialog
4. **Verify**: Scanner status shows "Position QR code in view"
5. Point camera at the event QR code (printed or on screen)
6. **Verify**: QR code is detected automatically
7. **Verify**: Camera stops and success message appears
8. **Verify**: Event details are displayed:
   - Event name: "Spring 2025 Orientation"
   - Start time and venue
   - Check-in window status: "Open"
9. **Verify**: "Continue to Check-In" button is enabled
10. **Verify**: If you already checked in, error shows "Already checked in"

**Expected Console Logs**:

```
QR Validation: Checking payload attendance:clxyz123:1728950400000
QR Validation: Success - Event details received
```

#### Step 3: Verify Location

1. Click "Continue to Check-In" button
2. **Verify**: Browser requests location permission (allow it)
3. **Verify**: Loading indicator shows "Getting your location..."
4. **Verify**: After 1-3 seconds, location status updates:
   - ✅ If within 100m: "Location verified" with green checkmark
   - ❌ If outside 100m: Warning shows "You are XXXm from venue"
5. **Verify**: Distance from venue is displayed (e.g., "45m from venue")
6. **Verify**: "Next: Capture Photos" button is enabled (even if outside range for testing, but server will reject)

**Expected Console Logs**:

```
Geolocation: Current position 14.5994, 120.9843
Distance calculation: 45.2 meters
Location verification: PASSED
```

**If Location Fails**:

- Error message: "Unable to get location. Please enable location services."
- "Retry" button should allow re-attempting location fetch

#### Step 4: Capture Front Photo (ID/Badge)

1. Click "Capture Front Photo" button
2. **Verify**: Camera dialog opens with video preview
3. **Verify**: Camera uses rear-facing camera (if available on mobile)
4. **Verify**: Hint text shows "Position your ID card in the frame"
5. Position your ID card or badge in view
6. Click "Capture Photo" button
7. **Verify**: Photo is captured and displayed as preview
8. **Verify**: "Retake" and "Use This Photo" buttons appear
9. (Optional) Click "Retake" to recapture
10. Click "Use This Photo" to confirm
11. **Verify**: Camera dialog closes
12. **Verify**: Thumbnail of captured photo appears on the form
13. **Verify**: "Capture Back Photo" button is now enabled

**Expected Console Logs**:

```
Camera: Requesting rear camera (environment)
Camera: Stream started
Photo capture: Image size 1280x720 captured
Photo: Converted to JPEG base64 (~150KB)
```

#### Step 5: Capture Back Photo (Selfie)

1. Click "Capture Back Photo" button
2. **Verify**: Camera dialog opens
3. **Verify**: Camera switches to front-facing camera (if available)
4. **Verify**: Hint text shows "Take a clear selfie"
5. Position your face in the frame
6. Click "Capture Photo" button
7. **Verify**: Photo is captured and displayed
8. Click "Use This Photo" to confirm
9. **Verify**: Thumbnail of selfie appears on the form
10. **Verify**: "Next: Sign" button is now enabled

**Expected Console Logs**:

```
Camera: Requesting front camera (user)
Camera: Stream started
Photo capture: Image size 1280x720 captured
Photo: Converted to JPEG base64 (~150KB)
```

**Camera Permissions Denied**:

- If denied: Error message "Camera permission denied"
- Fallback: "Upload from file" button should appear (future enhancement)

#### Step 6: Draw Digital Signature

1. Click "Sign Below" or scroll to signature section
2. **Verify**: Signature canvas appears (white/transparent background)
3. **Verify**: "Sign here" placeholder text is visible when empty
4. Draw your signature using mouse or touch
5. **Verify**: Signature appears as you draw in real-time
6. **Verify**: "Clear" button becomes enabled after drawing
7. (Optional) Click "Clear" to erase and redraw
8. **Verify**: After drawing, canvas shows your signature
9. **Verify**: "Submit Attendance" button at bottom is enabled

**Expected Console Logs**:

```
Signature: Canvas initialized
Signature: Drawing started
Signature: Drawing ended, signature captured
Signature: Converted to PNG base64 (~50KB)
```

#### Step 7: Submit Attendance

1. Review all captured data:
   - Event name
   - Location status
   - Front photo thumbnail
   - Back photo thumbnail
   - Signature preview
2. Click "Submit Attendance" button
3. **Verify**: Loading indicator appears on button ("Submitting...")
4. **Verify**: Button is disabled during submission
5. **Verify**: Wait 2-5 seconds for upload to complete
6. **Verify**: Success toast/notification appears:
   - "Attendance submitted successfully!"
   - "Status: Pending verification"
7. **Verify**: Redirect to Student Dashboard (`/dashboard/student`)
8. **Verify**: Dashboard shows new attendance record with "Pending" status

**Expected Console Logs**:

```
Attendance submission: Starting...
Cloudinary upload: Front photo uploaded (2.1s)
Cloudinary upload: Back photo uploaded (1.9s)
Cloudinary upload: Signature uploaded (1.2s)
Attendance submission: Success - ID clabc456
Redirect: /dashboard/student
```

**Expected Network Requests** (DevTools > Network):

1. `POST /api/attendance` - Status 200 OK
2. Response body contains:
   ```json
   {
     "id": "clabc456",
     "eventId": "clxyz123",
     "submittedAt": "2025-10-15T10:15:00.000Z",
     "distanceFromVenue": 45.2,
     "frontPhotoUrl": "https://res.cloudinary.com/...",
     "backPhotoUrl": "https://res.cloudinary.com/...",
     "signatureUrl": "https://res.cloudinary.com/...",
     "verificationStatus": "Pending"
   }
   ```

**Expected Database State**:

- New record in `Attendance` table:
  - `eventId` = event ID
  - `userId` = student's user ID
  - `verificationStatus` = "Pending"
  - `distanceFromVenue` = calculated distance (e.g., 45.2)
  - Photo and signature URLs populated
- New record in `SecurityLog` table:
  - `action` = "ATTENDANCE_SUBMITTED"
  - `userId` = student's user ID

### Validation Checklist

- [ ] QR scanner detects and validates QR code
- [ ] Event details display correctly after QR scan
- [ ] Geolocation retrieves current position
- [ ] Distance calculation shows meters from venue
- [ ] Location warning appears if >100m away
- [ ] Camera permissions requested for both front and back photos
- [ ] Photos captured at reasonable resolution (~1280x720)
- [ ] Photo thumbnails display after capture
- [ ] Signature canvas allows drawing and clearing
- [ ] All form fields populate correctly
- [ ] Submit button disabled until all data captured
- [ ] Loading state shows during submission
- [ ] Success message appears after submission
- [ ] Redirect to dashboard works
- [ ] Attendance record appears in dashboard with "Pending" status

---

## Scenario 2: Duplicate Check-In Prevention ❌

**Objective**: Verify system prevents double check-in to same event.

### Prerequisites

- Completed Scenario 1 successfully
- Still logged in as `student@test.com`
- Already checked into "Spring 2025 Orientation"

### Test Steps

1. Navigate to `/attendance` page again
2. Click "Start Scanning"
3. Scan the same event QR code
4. **Verify**: QR validation fails with error message
5. **Verify**: Error dialog appears with:
   - Title: "Already Checked In"
   - Message: "You have already checked in to this event"
   - Previous submission details (date, time, status)
6. **Verify**: "View Dashboard" button is available
7. Click "View Dashboard"
8. **Verify**: Redirects to `/dashboard/student`
9. **Verify**: Previous attendance record is still shown (not duplicated)

**Expected Console Logs**:

```
QR Validation: Checking payload...
QR Validation: FAILED - User already checked in
Error: Duplicate check-in prevented
```

**Expected Network Request**:

- `POST /api/qr/validate` - Status 200 OK
- Response body:
  ```json
  {
    "valid": false,
    "userStatus": {
      "hasCheckedIn": true,
      "previousCheckIn": {
        "submittedAt": "2025-10-15T10:15:00.000Z",
        "verificationStatus": "Pending"
      }
    },
    "validationErrors": ["You have already checked in to this event"]
  }
  ```

### Validation Checklist

- [ ] QR validation detects duplicate check-in
- [ ] Error dialog displays with clear message
- [ ] Previous check-in details shown (date, time, status)
- [ ] "View Dashboard" redirects correctly
- [ ] No new attendance record created in database
- [ ] Unique constraint `(eventId, userId)` enforced

---

## Scenario 3: Location Verification Failure 📍

**Objective**: Verify system rejects check-in when too far from venue.

### Prerequisites

- Login as `student2@test.com` (who hasn't checked in yet)
- Have a test event with known venue coordinates
- **Testing Method**: Either physically move 100m+ away from venue, OR use browser DevTools to spoof location

### Spoofing Location (Chrome DevTools)

1. Open DevTools (F12)
2. Press `Ctrl+Shift+P` to open Command Palette
3. Type "sensors" and select "Show Sensors"
4. In Sensors tab, find "Geolocation" dropdown
5. Select "Other" and enter coordinates far from venue:
   - **Venue**: 14.5995, 120.9842
   - **Fake Location**: 14.6020, 120.9900 (approximately 450m away)
6. Click "Override" checkbox

### Test Steps

1. Navigate to `/attendance`
2. Scan event QR code successfully
3. Click "Continue to Check-In"
4. **Verify**: Browser gets spoofed/actual location
5. **Verify**: Client-side distance calculation shows >100m
6. **Verify**: Warning message appears:
   - "⚠️ You appear to be 450m from the venue"
   - "You must be within 100m to check in"
7. Proceed to capture photos and signature (UI should still allow for testing)
8. Click "Submit Attendance"
9. **Verify**: Server-side validation fails
10. **Verify**: Error message appears:
    - "Location Verification Failed"
    - "You must be within 100 meters of the venue"
    - "Your current distance: 450m"
11. **Verify**: No attendance record created
12. **Verify**: Form remains on page (doesn't redirect)

**Expected Console Logs**:

```
Geolocation: Position 14.6020, 120.9900
Distance calculation: 450.5 meters
Location verification: FAILED (outside 100m threshold)
Client warning: Distance too far
Attendance submission: Starting...
Server validation: Location check FAILED
Error: Distance 450m exceeds maximum 100m
```

**Expected Network Request**:

- `POST /api/attendance` - Status 400 Bad Request
- Response body:
  ```json
  {
    "error": "Validation failed",
    "details": [
      {
        "field": "distanceFromVenue",
        "message": "Location verification failed: Not within 100m of venue (distance: 450m)"
      }
    ]
  }
  ```

### Validation Checklist

- [ ] Client-side distance calculation works
- [ ] Warning shown when >100m away
- [ ] Form allows submission for testing (client doesn't hard-block)
- [ ] Server-side validation rejects submission
- [ ] Error message clearly states distance requirement
- [ ] No attendance record created in database
- [ ] SecurityLog entry created with action "LOCATION_VERIFICATION_FAILED"

---

## Scenario 4: Profile Incomplete Block 🚫

**Objective**: Verify incomplete profiles cannot check in.

### Prerequisites

- Login as `incomplete@test.com`
- This user has incomplete profile (e.g., missing `firstName` field)

### Setup Incomplete Profile

If not already set up, manually edit the database:

```sql
UPDATE "UserProfile"
SET "firstName" = NULL
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'incomplete@test.com');
```

Or create a new user and skip profile completion during registration.

### Test Steps

1. Navigate to `/attendance`
2. Click "Start Scanning"
3. Scan event QR code
4. **Verify**: QR validation fails immediately
5. **Verify**: Error dialog appears:
   - Title: "Complete Your Profile"
   - Message: "You must complete your profile before checking in to events"
   - Required fields listed
6. **Verify**: "Go to Profile" button is available
7. Click "Go to Profile"
8. **Verify**: Redirects to `/profile/create`
9. Complete the profile form (add firstName, lastName, etc.)
10. Submit profile
11. **Verify**: Success message appears
12. Retry attendance check-in
13. **Verify**: QR validation now succeeds

**Expected Network Request**:

- `POST /api/qr/validate` - Status 403 Forbidden
- Response body:
  ```json
  {
    "error": "Profile incomplete: Please complete your profile before checking in"
  }
  ```

### Validation Checklist

- [ ] QR validation checks profile completeness
- [ ] Error message clearly states requirement
- [ ] "Go to Profile" button redirects correctly
- [ ] After completing profile, check-in works
- [ ] Middleware/server action enforces profile check

---

## Scenario 5: Check-In Window Closed ⏰

**Objective**: Verify system rejects check-in outside time window.

### Prerequisites

- Create a test event with past end time, OR
- Wait until check-out buffer expires for existing event

### Setup Past Event

Option 1: Create event with past times

- Start: Current time - 2 hours
- End: Current time - 30 minutes
- Check-out buffer: 30 minutes
- **Result**: Check-in window closed 30 minutes ago

Option 2: Manually update database

```sql
UPDATE "Event"
SET "startDateTime" = NOW() - INTERVAL '2 hours',
    "endDateTime" = NOW() - INTERVAL '30 minutes'
WHERE id = 'your-event-id';
```

### Test Steps

1. Login as `student@test.com`
2. Navigate to `/attendance`
3. Scan the event QR code
4. **Verify**: QR validation fails with error
5. **Verify**: Error dialog shows:
   - Title: "Check-In Closed"
   - Message: "The check-in window for this event closed at [time]"
   - Window details: Opens at [time], Closes at [time]
6. **Verify**: "Contact Organizer" or "OK" button dismisses dialog
7. **Verify**: Cannot proceed to location/photo steps

**Expected Network Request**:

- `POST /api/qr/validate` - Status 200 OK (validation endpoint returns details)
- Response body:
  ```json
  {
    "valid": false,
    "checkInWindow": {
      "opensAt": "2025-10-15T09:30:00Z",
      "closesAt": "2025-10-15T12:30:00Z",
      "isOpen": false
    },
    "validationErrors": ["Check-in window closed at 2025-10-15T12:30:00Z"]
  }
  ```

### Validation Checklist

- [ ] QR validation calculates window correctly
- [ ] Error shows when window not open
- [ ] Window open/close times displayed
- [ ] User cannot bypass validation
- [ ] Helpful message guides user

---

## Scenario 6: Offline Detection 📡

**Objective**: Verify system detects offline state and prevents check-in.

### Test Steps

#### Simulating Offline Mode

**Option 1: Browser DevTools**

1. Open DevTools (F12)
2. Go to Network tab
3. Change throttling dropdown to "Offline"

**Option 2: System Network**

1. Disable WiFi/Ethernet
2. Ensure no cellular data connection

### Test Steps

1. Navigate to `/attendance` page (while online)
2. Enable offline mode (using method above)
3. **Verify**: Banner appears at top of page:
   - "🔌 You are offline"
   - "Attendance submission requires internet connection"
4. **Verify**: "Scan QR Code" button is disabled
5. **Verify**: Clicking disabled button does nothing
6. Re-enable network connection
7. **Verify**: "Online" event fires
8. **Verify**: Banner disappears or updates to "✅ Back online"
9. **Verify**: "Scan QR Code" button becomes enabled
10. **Verify**: Can now proceed with check-in normally

**Expected Console Logs**:

```
Network status: OFFLINE detected
UI: Scan button disabled
Network status: ONLINE detected
UI: Scan button enabled
```

### Validation Checklist

- [ ] Offline detection works via `navigator.onLine`
- [ ] Banner displays when offline
- [ ] Interactive elements disabled appropriately
- [ ] Online event handler re-enables features
- [ ] Helpful message explains requirement

---

## Scenario 7: Dashboard Access by Role 👥

**Objective**: Verify each role sees appropriate dashboard with role-specific data.

### Test Case 7A: Student Dashboard

#### Prerequisites

- Login as `student@test.com`
- Has 1 pending attendance record

#### Test Steps

1. Navigate to `/dashboard` or `/dashboard/student`
2. **Verify**: Page loads with "Student Dashboard" heading
3. **Verify**: Stats cards display:
   - **Total Attendance**: 1
   - **Approved**: 0
   - **Pending**: 1
   - **Attendance Rate**: 0% or 100% depending on calculation
4. **Verify**: Attendance History table shows:
   - Columns: Event, Date, Submitted, Status, Actions
   - Row 1: "Spring 2025 Orientation", [date], "Pending", "View Details" button
5. **Verify**: Upcoming Events section shows events you can attend:
   - "Workshop: Career Planning" with date and venue
   - QR code thumbnail preview (if available)
6. **Verify**: Navigation shows "Dashboard" as active
7. Click "View Details" on attendance record
8. **Verify**: Details modal/page shows:
   - Event name and details
   - Submission timestamp
   - Status: Pending
   - Distance from venue
   - Photo thumbnails (click to enlarge)
   - Signature preview

**Expected Network Request**:

- `GET /api/dashboard/student?page=1&limit=20` - Status 200 OK
- Response contains attendance history, upcoming events, and stats

#### Validation Checklist

- [ ] Dashboard loads for Student role
- [ ] Stats accurately reflect user's data
- [ ] Attendance history displays correctly
- [ ] Status badges colored appropriately (Pending=yellow, Approved=green, Rejected=red)
- [ ] Upcoming events list shows future events
- [ ] View details works for attendance records

---

### Test Case 7B: Moderator Dashboard

#### Prerequisites

- Login as `moderator@test.com`
- Created "Spring 2025 Orientation" event
- Has 1 pending verification from `student@test.com`

#### Test Steps

1. Navigate to `/dashboard` or `/dashboard/moderator`
2. **Verify**: Page loads with "Moderator Dashboard" heading
3. **Verify**: Stats cards display:
   - **Total Events**: 2
   - **Active Events**: 2
   - **Total Attendance**: 1
   - **Pending Verifications**: 1
4. **Verify**: My Events section shows:
   - Table with columns: Event, Date, Status, Attendance, Actions
   - Row: "Spring 2025 Orientation", Active, 1 attendee
   - Actions: "Edit", "View QR", "View Attendees"
5. **Verify**: Pending Verifications section shows:
   - Card for student's pending attendance
   - Student name: Student's display name
   - Event: "Spring 2025 Orientation"
   - Submitted: [timestamp]
   - "View Details" button
6. Click "View QR" on event
7. **Verify**: Modal opens with QR code image
8. **Verify**: "Download" and "Print" buttons available
9. Click "View Attendees" on event
10. **Verify**: List of all attendance records for that event
11. **Verify**: Can filter by status (All, Pending, Approved, Rejected)

**Expected Network Request**:

- `GET /api/dashboard/moderator?page=1&limit=20` - Status 200 OK
- Response contains events created by moderator and pending verifications

#### Validation Checklist

- [ ] Dashboard loads for Moderator role
- [ ] My Events shows only events created by this moderator
- [ ] Pending verifications show records needing review
- [ ] QR code modal displays correctly
- [ ] Attendee list filters work
- [ ] "Create Event" button navigates to event creation

---

### Test Case 7C: Administrator Dashboard

#### Prerequisites

- Login as `admin@test.com`
- System has multiple users, events, and attendance records

#### Test Steps

1. Navigate to `/dashboard` or `/dashboard/administrator`
2. **Verify**: Page loads with "Administrator Dashboard" heading
3. **Verify**: System-wide stats cards display:
   - **Total Users**: 5 (all users in system)
   - **Total Events**: 2
   - **Total Attendance**: 1
   - **Active Events**: 2
   - **Pending Verifications**: 1
   - **Disputed Attendance**: 0
4. **Verify**: Recent Activity feed shows:
   - Last 20-50 security log entries
   - Each entry shows: Action, User, Timestamp, Details
   - Examples: "ATTENDANCE_SUBMITTED", "EVENT_CREATED", "LOGIN"
5. **Verify**: Alerts section displays:
   - System alerts (if any)
   - Examples: "3 verifications pending >24 hours", "Low storage warning"
6. **Verify**: Quick Actions buttons:
   - "View All Users"
   - "View All Events"
   - "Export Reports"
   - "System Settings"
7. Click "View All Users"
8. **Verify**: User management page loads with list of all users
9. **Verify**: Can filter by role (All, Student, Moderator, Administrator)
10. **Verify**: Can search users by email/name

**Expected Network Request**:

- `GET /api/dashboard/administrator?page=1&limit=20` - Status 200 OK
- Response contains system-wide statistics and recent security logs

#### Validation Checklist

- [ ] Dashboard loads for Administrator role
- [ ] Stats show system-wide totals (not user-specific)
- [ ] Recent activity feed displays SecurityLog entries
- [ ] Alerts highlight issues needing attention
- [ ] Quick actions navigate to admin pages
- [ ] User management functions work

---

### Test Case 7D: Role-Based Access Control (RBAC)

**Objective**: Verify users cannot access dashboards for other roles.

#### Test Steps

1. Login as `student@test.com` (role: Student)
2. Navigate to `/dashboard/moderator`
3. **Verify**: One of the following occurs:
   - **Option A**: Middleware redirects to `/dashboard/student`
   - **Option B**: 403 Forbidden page displays
4. Open DevTools Network tab
5. Try to call API directly: `GET /api/dashboard/moderator`
6. **Verify**: Response is 403 Forbidden:
   ```json
   {
     "error": "Access denied: Your role (Student) does not match requested dashboard (moderator)"
   }
   ```
7. Logout and login as `moderator@test.com`
8. Navigate to `/dashboard/administrator`
9. **Verify**: Access denied (redirect or 403 page)
10. Login as `admin@test.com`
11. **Verify**: Can access all dashboards (Student, Moderator, Administrator)

#### Validation Checklist

- [ ] Middleware protects dashboard routes by role
- [ ] Students cannot access Moderator/Admin dashboards
- [ ] Moderators cannot access Admin dashboard
- [ ] Server actions verify role before returning data
- [ ] Direct API calls also enforced with 403 errors
- [ ] Administrators can access all dashboards

---

## Scenario 8: Moderator Verifies Attendance ✅

**Objective**: Moderator approves a pending attendance submission.

### Prerequisites

- Login as `moderator@test.com`
- `student@test.com` has pending attendance for "Spring 2025 Orientation"

### Test Steps

1. Navigate to `/dashboard/moderator`
2. **Verify**: Pending Verifications section shows 1 record
3. Click "View Details" on pending attendance
4. **Verify**: Modal/detail page opens showing:
   - **Student Info**: Name, email
   - **Event**: "Spring 2025 Orientation"
   - **Submitted**: Date and time
   - **Distance**: "45.2m from venue"
   - **Photos**: Front and back thumbnails
   - **Signature**: Image preview
5. Click on photo thumbnails to enlarge
6. **Verify**: Full-size images load in lightbox/modal
7. Review submission details carefully
8. Click "Approve" button
9. **Verify**: Confirmation dialog appears:
   - "Approve this attendance submission?"
   - "This action cannot be undone"
10. Click "Confirm Approval"
11. **Verify**: Loading state on button
12. **Verify**: Success toast appears: "Attendance approved successfully"
13. **Verify**: Modal closes
14. **Verify**: Pending Verifications count decreases by 1
15. **Verify**: Record removed from pending list
16. Navigate to event attendees list
17. **Verify**: Student's attendance shows status "Approved"

**Expected Network Request**:

- `PATCH /api/attendance/{id}/verify` - Status 200 OK
- Request body:
  ```json
  {
    "verificationStatus": "Approved"
  }
  ```
- Response body:
  ```json
  {
    "id": "clabc456",
    "verificationStatus": "Approved",
    "verifiedById": "clmod123",
    "verifiedAt": "2025-10-15T10:30:00.000Z"
  }
  ```

**Expected Database State**:

- Attendance record updated:
  - `verificationStatus` = "Approved"
  - `verifiedById` = moderator's user ID
  - `verifiedAt` = current timestamp
- SecurityLog entry created:
  - `action` = "ATTENDANCE_VERIFIED"
  - `userId` = moderator's ID
  - `details` = JSON with attendanceId, studentId

**Student Notification** (if implemented):

- In-app notification sent to student
- Email notification (optional)

### Validation Checklist

- [ ] Moderator can view pending attendance details
- [ ] Photos and signature display correctly
- [ ] Approval button triggers verification flow
- [ ] Confirmation dialog prevents accidental approval
- [ ] Success feedback provided
- [ ] Record status updates to "Approved"
- [ ] Pending list updates in real-time
- [ ] Database state changes correctly
- [ ] Security log entry created

---

## Scenario 9: Moderator Rejects Attendance ❌

**Objective**: Moderator rejects a suspicious attendance submission.

### Prerequisites

- Login as `moderator@test.com`
- Have a pending attendance record to reject (can use `student2@test.com`)

### Test Steps

1. Navigate to `/dashboard/moderator`
2. Click "View Details" on a pending attendance
3. Review the submission details
4. Click "Reject" button
5. **Verify**: Rejection dialog opens with:
   - Title: "Reject Attendance Submission"
   - Text area: "Reason for Rejection" (required field)
   - Character limit: 1000 characters
   - Buttons: "Cancel", "Confirm Rejection"
6. Leave reason blank and click "Confirm Rejection"
7. **Verify**: Validation error: "Please provide a reason for rejection"
8. Enter reason: "Photos do not match student ID on file"
9. Click "Confirm Rejection"
10. **Verify**: Loading state on button
11. **Verify**: Success toast: "Attendance rejected"
12. **Verify**: Modal closes
13. **Verify**: Record removed from pending list
14. Navigate to event attendees list
15. **Verify**: Student's attendance shows status "Rejected"
16. Click on rejected record details
17. **Verify**: Dispute note displayed: "Photos do not match student ID on file"

**Expected Network Request**:

- `PATCH /api/attendance/{id}/verify` - Status 200 OK
- Request body:
  ```json
  {
    "verificationStatus": "Rejected",
    "disputeNote": "Photos do not match student ID on file"
  }
  ```
- Response body:
  ```json
  {
    "id": "clabc789",
    "verificationStatus": "Rejected",
    "verifiedById": "clmod123",
    "verifiedAt": "2025-10-15T10:35:00.000Z",
    "disputeNote": "Photos do not match student ID on file"
  }
  ```

**Expected Database State**:

- Attendance record updated:
  - `verificationStatus` = "Rejected"
  - `verifiedById` = moderator's user ID
  - `verifiedAt` = current timestamp
  - `disputeNote` = rejection reason
- SecurityLog entry created:
  - `action` = "ATTENDANCE_REJECTED"

**Student Notification** (if implemented):

- Email sent to student with:
  - Subject: "Attendance Rejection: Spring 2025 Orientation"
  - Body: Includes dispute note and appeal instructions

### Validation Checklist

- [ ] Reject button opens rejection dialog
- [ ] Reason text area is required
- [ ] Validation prevents empty submission
- [ ] Rejection confirmation works
- [ ] Status updates to "Rejected"
- [ ] Dispute note stored and displayed
- [ ] Security log entry created
- [ ] Student notification sent (if implemented)

---

## Scenario 10: Event Creation and QR Generation 📅

**Objective**: Moderator creates a new event and QR code is auto-generated.

### Prerequisites

- Login as `moderator@test.com`

### Test Steps

1. Navigate to `/dashboard/moderator`
2. Click "Create Event" button
3. **Verify**: Redirects to `/events/create`
4. **Verify**: Event creation form displays with fields:
   - Event Name (required, text)
   - Start Date & Time (required, datetime-local)
   - End Date & Time (required, datetime-local)
   - Venue Latitude (required, number, -90 to 90)
   - Venue Longitude (required, number, -180 to 180)
   - Venue Name (required, text)
   - Check-in Buffer (required, minutes)
   - Check-out Buffer (required, minutes)
   - Description (optional, textarea)

#### Fill Out Form

5. Enter event details:
   - **Name**: "Fall 2025 Workshop"
   - **Start**: Select a date 3 days from now, 2:00 PM
   - **End**: Same date, 4:00 PM
   - **Venue Latitude**: 14.5995
   - **Venue Longitude**: 120.9842
   - **Venue Name**: "Engineering Building"
   - **Check-in Buffer**: 30
   - **Check-out Buffer**: 30
   - **Description**: "Annual career planning workshop for students"

6. **Verify**: Form validation works:
   - Leave name blank → Error: "Event name is required"
   - Set end before start → Error: "End time must be after start time"
   - Invalid latitude (e.g., 95) → Error: "Latitude must be between -90 and 90"

7. Correct any errors and click "Create Event"
8. **Verify**: Loading state on button ("Creating...")
9. **Verify**: Wait 2-3 seconds for Cloudinary QR upload
10. **Verify**: Success toast: "Event created successfully"
11. **Verify**: Redirects to event details page (`/events/{eventId}`)

#### Verify Event Details Page

12. **Verify**: Page shows:
    - Event name: "Fall 2025 Workshop"
    - Start and end times (formatted)
    - Venue name and coordinates
    - Check-in window times (calculated with buffers)
    - Status badge: "Active"
    - Description

13. **Verify**: QR Code section displays:
    - QR code image preview (800x800px)
    - "Download QR Code" button
    - "Print QR Code" button
    - QR payload displayed: `attendance:{eventId}:{timestamp}`

14. Click "Download QR Code"
15. **Verify**: PNG file downloads with name like `event-fall-2025-workshop-qr.png`

16. Click "Print QR Code"
17. **Verify**: Print dialog opens with print-friendly layout:
    - Large QR code centered
    - Event name and details
    - Instructions for attendees

18. Navigate back to `/dashboard/moderator`
19. **Verify**: New event appears in "My Events" list
20. **Verify**: Stats updated:
    - Total Events: +1
    - Active Events: +1

**Expected Network Request**:

- `POST /api/events` - Status 201 Created
- Request body:
  ```json
  {
    "name": "Fall 2025 Workshop",
    "startDateTime": "2025-11-01T14:00:00.000Z",
    "endDateTime": "2025-11-01T16:00:00.000Z",
    "venueLatitude": 14.5995,
    "venueLongitude": 120.9842,
    "venueName": "Engineering Building",
    "checkInBuffer": 30,
    "checkOutBuffer": 30,
    "description": "Annual career planning workshop for students"
  }
  ```
- Response body:
  ```json
  {
    "id": "clnew123",
    "name": "Fall 2025 Workshop",
    "qrCodeUrl": "https://res.cloudinary.com/.../events/clnew123/qr_1730470800.png",
    "qrCodePayload": "attendance:clnew123:1730470800000",
    "status": "Active",
    "createdById": "clmod123"
  }
  ```

**Expected Database State**:

- New `Event` record created:
  - All fields populated from form
  - `qrCodeUrl` and `qrCodePayload` auto-generated
  - `status` = "Active"
  - `createdById` = moderator's user ID
- Cloudinary image uploaded to `events/{eventId}/qr_{timestamp}.png`
- SecurityLog entry:
  - `action` = "EVENT_CREATED"

### Validation Checklist

- [ ] Event creation form displays correctly
- [ ] All form validations work
- [ ] Date/time pickers functional
- [ ] Coordinate validation enforces ranges
- [ ] Create button triggers submission
- [ ] Loading state during creation
- [ ] QR code generated and uploaded to Cloudinary
- [ ] Event details page displays all information
- [ ] QR code image displays correctly
- [ ] Download QR code works
- [ ] Print QR code opens print dialog
- [ ] Event appears in moderator's event list
- [ ] Stats updated correctly

---

## Performance Testing 🚀

### Test 1: Attendance Submission Total Time

**Target**: < 5 seconds (including 3 Cloudinary uploads)

#### Test Steps

1. Login as `student@test.com`
2. Complete attendance flow (scan, location, photos, signature)
3. Open DevTools > Network tab
4. Click "Submit Attendance"
5. Measure time from click to success toast appears
6. **Target Time**: 2.5 - 4.5 seconds

**Expected Timeline**:

- T+0s: Submit button clicked
- T+0.5s: Server receives request
- T+0.5s - T+2.5s: Front photo upload to Cloudinary
- T+2.5s - T+4.0s: Back photo upload to Cloudinary
- T+4.0s - T+4.5s: Signature upload to Cloudinary
- T+4.5s - T+5.0s: Database write and response
- T+5.0s: Success toast appears

**Validation**:

- [ ] Total time < 5 seconds
- [ ] Photos upload in parallel (check Network waterfall)
- [ ] No unnecessary delays between uploads
- [ ] User sees loading indicator throughout

---

### Test 2: Dashboard Load Time

**Target**: < 500ms API response

#### Test Steps

1. Login as `student@test.com`
2. Clear browser cache
3. Open DevTools > Network tab
4. Navigate to `/dashboard/student`
5. Find `GET /api/dashboard/student` request in Network tab
6. Check "Time" column for API response time
7. **Target Time**: 400 - 500ms (uncached), 150 - 400ms (cached)

**Expected Timeline**:

- T+0ms: Request sent
- T+50ms: JWT verification
- T+100ms: Database query (Attendance + Events)
- T+200ms: Data serialization
- T+250ms: Response sent
- T+400ms: Client receives response

**Validation**:

- [ ] API responds in < 500ms
- [ ] Page renders within 1 second total
- [ ] No N+1 query issues (check console if Prisma logging enabled)
- [ ] Stats calculation efficient

---

### Test 3: QR Validation Latency

**Target**: < 200ms

#### Test Steps

1. Login as `student@test.com`
2. Navigate to `/attendance`
3. Open DevTools > Network tab
4. Scan QR code
5. Find `POST /api/qr/validate` request
6. Check response time
7. **Target Time**: 50 - 150ms

**Expected Timeline**:

- T+0ms: Request sent
- T+20ms: JWT verification
- T+50ms: Parse QR payload
- T+80ms: Query Event + check duplicate
- T+120ms: Response sent

**Validation**:

- [ ] API responds in < 200ms
- [ ] Scanner UI feels instant
- [ ] Event details appear immediately after scan

---

## Accessibility Testing ♿

### Test 1: Keyboard Navigation

**Objective**: Verify all features accessible via keyboard only.

#### Test Steps

1. Navigate to `/attendance` page
2. **Do NOT use mouse** - use Tab, Shift+Tab, Enter, Space only
3. Press Tab repeatedly
4. **Verify**: Focus moves through all interactive elements:
   - Navigation links
   - "Scan QR Code" button
   - Other form elements (when visible)
5. **Verify**: Focus indicators are visible (outline or ring)
6. Press Enter on "Scan QR Code" button
7. **Verify**: Scanner modal opens
8. Tab through scanner controls
9. **Verify**: Can reach "Cancel" button
10. Press Enter to close modal
11. Complete attendance flow using keyboard:
    - Tab to "Capture Photo" → Enter
    - Tab to "Capture" → Enter
    - Tab to "Use This Photo" → Enter
    - Repeat for second photo
    - Tab to signature canvas → Draw with mouse (keyboard signature not required)
    - Tab to "Submit" → Enter

#### Validation Checklist

- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible (WCAG 2.1 Level AA)
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals/dialogs
- [ ] No keyboard traps (can Tab out of all components)

---

### Test 2: Screen Reader Testing

**Objective**: Verify screen reader announces content correctly.

#### Prerequisites

- Install NVDA (Windows) or VoiceOver (Mac)

#### Test Steps

1. Start screen reader (NVDA: Ctrl+Alt+N, VoiceOver: Cmd+F5)
2. Navigate to `/attendance` page
3. **Verify**: Page title announced: "QR-Based Attendance"
4. Navigate to "Scan QR Code" button
5. **Verify**: Announced as "Button, Start QR code scanner"
6. Activate button (Enter)
7. **Verify**: Scanner modal announced with aria-describedby text
8. Navigate through scanner
9. **Verify**: Status messages announced via aria-live regions:
   - "Position QR code in view"
   - "QR code detected"
10. Navigate to location section
11. **Verify**: Location status announced:
    - "Getting your location..."
    - "Location verified" or "Outside 100m range"
12. Navigate to photo capture
13. **Verify**: Buttons have accessible labels:
    - "Capture front photo from camera"
    - "Use this photo"
    - "Retake photo"
14. Navigate to signature canvas
15. **Verify**: Canvas announced as "Signature drawing area, Draw your signature here"
16. Check error messages
17. **Verify**: Errors associated with fields via aria-describedby

#### Validation Checklist

- [ ] All labels announced correctly
- [ ] ARIA roles present (region, alert, status, dialog)
- [ ] aria-live regions announce dynamic changes
- [ ] aria-describedby associates hints with inputs
- [ ] Form validation errors read aloud
- [ ] No "clickable" or generic announcements

---

### Test 3: Color Contrast

**Objective**: Verify text meets WCAG AA contrast ratios.

#### Test Steps

1. Install axe DevTools browser extension
2. Navigate to `/attendance` page
3. Run axe accessibility scan
4. **Verify**: No "Contrast" violations reported
5. Check manually with contrast checker:
   - Background: #FFFFFF (white) or #0F172A (dark)
   - Text: #1E293B (slate-800) or #F1F5F9 (slate-100)
   - Buttons: Primary blue (#3B82F6) with white text
6. **Target Ratios**:
   - Normal text: 4.5:1 minimum
   - Large text (18pt+): 3:1 minimum
   - UI components: 3:1 minimum

#### Validation Checklist

- [ ] All text meets 4.5:1 contrast ratio
- [ ] Buttons and interactive elements meet 3:1
- [ ] Focus indicators have sufficient contrast
- [ ] Dark mode (if implemented) also passes

---

## Edge Cases & Error Handling 🛡️

### Test 1: Camera Permission Denied

1. Navigate to `/attendance`
2. Scan QR code
3. Click "Capture Front Photo"
4. **When browser prompts**: Click "Block" or "Deny"
5. **Verify**: Error message appears:
   - "Camera permission denied"
   - "Please enable camera access in browser settings"
6. **Verify**: Fallback option appears (if implemented):
   - "Upload from File" button allows selecting image from device
7. Re-enable camera permission in browser settings
8. Retry capture
9. **Verify**: Camera works normally

---

### Test 2: Geolocation Permission Denied

1. Navigate to `/attendance`
2. Scan QR code
3. Click "Continue to Check-In"
4. **When browser prompts**: Click "Block" or "Deny"
5. **Verify**: Error message:
   - "Unable to get location"
   - "Please enable location services in browser settings"
6. **Verify**: "Retry" button available
7. Re-enable location in browser
8. Click "Retry"
9. **Verify**: Location fetch works

---

### Test 3: Photo Capture Failure

1. Start photo capture
2. Simulate camera failure (disconnect webcam mid-capture)
3. **Verify**: Error message:
   - "Failed to capture photo"
   - "Please try again"
4. **Verify**: "Retry" button allows re-attempting (max 3 times)
5. After 3 failures, show alternative option

---

### Test 4: GPS Accuracy > 100m

1. Use browser DevTools to spoof location
2. Set accuracy to 150m (low accuracy)
3. Complete attendance submission
4. **Verify**: Warning displayed:
   - "⚠️ GPS accuracy is low (150m)"
   - "Location verification may fail"
5. Proceed with submission
6. **Verify**: Server may accept or reject based on accuracy threshold

---

### Test 5: Cloudinary Upload Timeout

1. Simulate slow network (DevTools > Network > Slow 3G)
2. Complete attendance submission
3. **Verify**: Loading indicator shows during upload
4. If upload takes >30 seconds:
   - **Verify**: Timeout error: "Upload timeout. Please try again."
   - **Verify**: Retry mechanism attempts once more
   - **Verify**: After retry failure, shows error and allows resubmission

---

### Test 6: Invalid QR Code Format

1. Create a fake QR code with payload: `invalid:payload`
2. Scan the fake QR code
3. **Verify**: Error message:
   - "Invalid QR code format"
   - "Please scan a valid event QR code"
4. **Verify**: Scanner remains active to scan again

---

### Test 7: Cancelled Event

1. Create an event
2. Manually update database: `UPDATE "Event" SET status = 'Cancelled' WHERE id = 'event-id'`
3. Scan event QR code
4. **Verify**: Validation fails with:
   - "This event has been cancelled"
   - "Contact event organizer for details"

---

### Test 8: Rate Limit Exceeded (QR Scanning)

**Objective**: Verify rate limiting prevents abuse.

1. Navigate to `/attendance`
2. Rapidly scan QR code 10+ times in 1 minute
3. **Verify**: After 10 scans, error appears:
   - "Too many scan attempts"
   - "Please wait X seconds before trying again"
4. **Verify**: Retry-after time displayed (e.g., "Try again in 30 seconds")
5. Wait for rate limit to reset
6. **Verify**: Scanning works again

**Expected Response** (after 10 scans):

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 30,
  "message": "Too many QR validation attempts. Please try again in 30 seconds."
}
```

---

## Testing Checklist Summary

Use this checklist to track your testing progress:

### Core Features

- [ ] Scenario 1: Successful QR-Based Check-In
- [ ] Scenario 2: Duplicate Check-In Prevention
- [ ] Scenario 3: Location Verification Failure
- [ ] Scenario 4: Profile Incomplete Block
- [ ] Scenario 5: Check-In Window Closed
- [ ] Scenario 6: Offline Detection
- [ ] Scenario 7A: Student Dashboard
- [ ] Scenario 7B: Moderator Dashboard
- [ ] Scenario 7C: Administrator Dashboard
- [ ] Scenario 7D: Role-Based Access Control
- [ ] Scenario 8: Moderator Verifies Attendance
- [ ] Scenario 9: Moderator Rejects Attendance
- [ ] Scenario 10: Event Creation and QR Generation

### Performance

- [ ] Test 1: Attendance Submission < 5s
- [ ] Test 2: Dashboard Load < 500ms
- [ ] Test 3: QR Validation < 200ms

### Accessibility

- [ ] Test 1: Keyboard Navigation
- [ ] Test 2: Screen Reader
- [ ] Test 3: Color Contrast (WCAG AA)

### Edge Cases

- [ ] Camera Permission Denied
- [ ] Geolocation Permission Denied
- [ ] Photo Capture Failure
- [ ] GPS Accuracy Low
- [ ] Cloudinary Upload Timeout
- [ ] Invalid QR Code Format
- [ ] Cancelled Event
- [ ] Rate Limit Exceeded

---

## Bug Reporting Template

If you encounter issues during testing, document them using this template:

```markdown
### Bug Title

[Concise description of the issue]

**Severity**: [Critical / High / Medium / Low]

**Scenario**: [Which test scenario were you running?]

**Steps to Reproduce**:

1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**:
[What should happen?]

**Actual Behavior**:
[What actually happened?]

**Screenshots**:
[Attach screenshots if applicable]

**Console Errors**:
```

[Paste any console errors]

```

**Network Errors**:
[Paste any failed API requests from Network tab]

**Environment**:
- Browser: [Chrome 120 / Firefox 121 / Safari 17]
- OS: [Windows 11 / macOS 14 / Ubuntu 22.04]
- Screen Size: [1920x1080 / Mobile 375x667]
```

---

## Next Steps After Testing

Once you've completed all test scenarios:

1. **Document Results**:
   - Note which tests passed ✅
   - Document any failures or bugs ❌
   - Record performance metrics

2. **Create Bug Reports**:
   - Use the bug reporting template above
   - Prioritize critical issues

3. **Performance Optimization**:
   - If targets not met, identify bottlenecks
   - Optimize Cloudinary uploads (compression, parallel uploads)
   - Database query optimization (add indexes)

4. **Accessibility Fixes**:
   - Address any ARIA issues
   - Fix color contrast violations
   - Improve keyboard navigation

5. **Proceed to Automated Testing**:
   - Run Lighthouse audit (T064)
   - Automated performance validation (T065)
   - Write E2E tests for critical paths

6. **Update Documentation**:
   - Document any changes to quickstart.md
   - Update API contracts if behavior changed
   - Update .github/copilot-instructions.md

---

## Support & Resources

**Documentation**:

- Quickstart: `specs/002-extend-the-event/quickstart.md`
- API Contracts: `specs/002-extend-the-event/contracts/`
- Data Model: `specs/002-extend-the-event/data-model.md`

**Development Tools**:

- Prisma Studio: `npx prisma studio` (database GUI)
- Cloudinary Console: https://cloudinary.com/console
- Upstash Console: https://console.upstash.com (rate limiting)

**Browser DevTools**:

- Network tab: Monitor API calls and timing
- Console tab: View logs and errors
- Application tab: Check localStorage, cookies
- Sensors tab: Spoof geolocation
- Lighthouse tab: Run audits

**Common Commands**:

```powershell
# Start dev server
npm run dev

# Reset database (destructive!)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Check TypeScript errors
npm run type-check

# Run linter
npm run lint
```

---

**Happy Testing! 🎉**

If you encounter any issues or have questions, document them carefully using the bug reporting template and proceed with the next test scenario. Testing helps ensure a robust, reliable, and accessible application for all users.
