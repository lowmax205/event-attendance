# Quickstart Guide: Phase 002 - Extend the Event

This guide provides end-to-end test scenarios for the QR-based attendance system and role-based dashboards.

## Prerequisites

- **Database**: PostgreSQL running with Phase 1 schema + Phase 2 migrations applied
- **Environment Variables**: 
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` configured
  - `JWT_SECRET` set for authentication
- **Test Users**: Created via Phase 1 auth flows with different roles:
  - `student@test.com` (role: Student, complete profile)
  - `moderator@test.com` (role: Moderator, complete profile)
  - `admin@test.com` (role: Administrator, complete profile)
  - `incomplete@test.com` (role: Student, incomplete profile - missing firstName)
- **Test Events**: 1 Active event created by `moderator@test.com` with:
  - Name: "Spring 2025 Orientation"
  - Start: Today + 1 hour
  - End: Today + 3 hours
  - Venue: Coordinates 14.5995, 120.9842 (example location)
  - Check-in buffer: 30 minutes before
  - Check-out buffer: 30 minutes after

## Scenario 1: Successful QR-Based Check-In

**Objective**: Student successfully checks in to an event using the 3-click process.

### Step 1: Scan QR Code
1. **Action**: Student navigates to `/attendance` page
2. **UI**: Shows "Scan QR Code" button and camera preview
3. **Action**: Student clicks "Start Scanning"
4. **Expected**: Browser requests camera permission
5. **Action**: Student points camera at event QR code printed by moderator
6. **Expected**: QR code payload detected: `attendance:clxyz123:1728950400000`

**API Call**: 
```http
POST /api/qr/validate
Content-Type: application/json
Authorization: Bearer <student_jwt>

{
  "qrPayload": "attendance:clxyz123:1728950400000"
}
```

**Expected Response**:
```json
{
  "valid": true,
  "eventId": "clxyz123",
  "event": {
    "name": "Spring 2025 Orientation",
    "startDateTime": "2025-10-15T10:00:00Z",
    "venueName": "Main Auditorium"
  },
  "checkInWindow": {
    "isOpen": true,
    "opensAt": "2025-10-15T09:30:00Z",
    "closesAt": "2025-10-15T13:30:00Z"
  },
  "userStatus": {
    "hasCheckedIn": false
  }
}
```

**UI State**: Camera stops, event details displayed, "Continue to Check-In" button enabled

---

### Step 2: Verify Location
1. **Action**: Student clicks "Continue to Check-In"
2. **Expected**: Browser requests geolocation permission
3. **Action**: Student allows location access
4. **Expected**: Geolocation API returns coordinates (e.g., 14.5994, 120.9843)
5. **Client-Side Calculation**: Haversine distance = 45 meters (within 100m threshold)
6. **UI State**: "Location verified ✓" indicator shown, "Next: Capture Photos" button enabled

**Browser API**:
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // Calculate distance client-side for UX feedback
    // Server will re-verify on submission
  },
  { enableHighAccuracy: true, timeout: 10000 }
);
```

---

### Step 3: Capture Photos
1. **Action**: Student clicks "Capture Front Photo (ID/Badge)"
2. **Expected**: Camera preview opens with 1280x720 ideal resolution
3. **Action**: Student positions ID card in frame, clicks "Capture"
4. **Expected**: Photo captured as Base64 JPEG, thumbnail shown
5. **Action**: Student clicks "Capture Back Photo (Selfie)"
6. **Expected**: Camera switches to user-facing (if available)
7. **Action**: Student positions face in frame, clicks "Capture"
8. **Expected**: Photo captured as Base64 JPEG, thumbnail shown
9. **UI State**: "Next: Sign" button enabled

**Browser API**:
```javascript
navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
}).then(stream => {
  // Render to <video>, capture to <canvas>, toDataURL('image/jpeg', 0.8)
});
```

---

### Step 4: Digital Signature
1. **Action**: Student clicks "Sign Below"
2. **Expected**: Signature canvas (react-signature-canvas) displayed
3. **Action**: Student draws signature with mouse/touch
4. **Action**: Student clicks "Submit Attendance"
5. **Expected**: Signature converted to transparent PNG Base64

**API Call**:
```http
POST /api/attendance
Content-Type: application/json
Authorization: Bearer <student_jwt>

{
  "eventId": "clxyz123",
  "latitude": 14.5994,
  "longitude": 120.9843,
  "frontPhotoBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "backPhotoBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "signatureBase64": "data:image/png;base64,iVBORw0KGgo..."
}
```

**Expected Response**:
```json
{
  "id": "clabc456",
  "eventId": "clxyz123",
  "submittedAt": "2025-10-15T10:15:00Z",
  "distanceFromVenue": 45.2,
  "frontPhotoUrl": "https://res.cloudinary.com/.../attendance/clxyz123/student123/1728951300_clabc456_front.jpg",
  "backPhotoUrl": "https://res.cloudinary.com/.../attendance/clxyz123/student123/1728951300_clabc456_back.jpg",
  "signatureUrl": "https://res.cloudinary.com/.../attendance/clxyz123/student123/1728951300_clabc456_signature.png",
  "verificationStatus": "Pending"
}
```

**UI State**: Success message shown, redirect to `/dashboard/student` with "Attendance submitted successfully! Status: Pending" toast

**Database State**:
- `Attendance` record created with unique constraint `(eventId, userId)`
- `SecurityLog` entry: action = `ATTENDANCE_SUBMITTED`, details include IP address, user agent

---

## Scenario 2: Duplicate Check-In Prevention

**Objective**: System prevents student from checking in twice to the same event.

### Setup
- Student `student@test.com` already checked in to event `clxyz123` at `2025-10-15T10:15:00Z`

### Test Steps
1. **Action**: Student scans same QR code again
2. **API Call**: `POST /api/qr/validate` with payload `attendance:clxyz123:1728950400000`
3. **Expected Response**:
```json
{
  "valid": false,
  "eventId": "clxyz123",
  "event": { "name": "Spring 2025 Orientation" },
  "userStatus": {
    "hasCheckedIn": true,
    "previousCheckIn": {
      "submittedAt": "2025-10-15T10:15:00Z",
      "verificationStatus": "Pending"
    }
  },
  "validationErrors": [
    "You have already checked in to this event"
  ]
}
```

4. **UI State**: Error dialog shown:
   - Title: "Already Checked In"
   - Message: "You submitted attendance on Oct 15, 2025 at 10:15 AM. Status: Pending verification."
   - Action: "View Dashboard" button redirects to `/dashboard/student`

**Database State**: No new `Attendance` record created (unique constraint enforced)

---

## Scenario 3: Location Verification Failure

**Objective**: System rejects check-in if student is too far from venue.

### Setup
- Event venue: 14.5995, 120.9842
- Student actual location: 14.6020, 120.9900 (approximately 450 meters away)

### Test Steps
1. **Action**: Student completes QR scan, location permission granted
2. **Client-Side**: Haversine calculation shows 450m distance
3. **UI State**: Warning shown: "You appear to be 450m from the venue. You must be within 100m to check in."
4. **Action**: Student proceeds anyway (UI allows submission for server verification)
5. **API Call**: `POST /api/attendance` with latitude 14.6020, longitude 120.9900
6. **Expected Response** (400 Bad Request):
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

7. **UI State**: Error message shown:
   - "Location Verification Failed"
   - "You must be within 100 meters of the venue. Your current distance: 450m"
   - "Please move closer and try again"

**Database State**: No `Attendance` record created, `SecurityLog` entry with action `LOCATION_VERIFICATION_FAILED`

---

## Scenario 4: Profile Incomplete Block

**Objective**: Student with incomplete profile cannot check in.

### Setup
- User `incomplete@test.com` has missing `firstName` in `UserProfile`

### Test Steps
1. **Action**: Incomplete student scans QR code
2. **API Call**: `POST /api/qr/validate`
3. **Expected Response** (403 Forbidden):
```json
{
  "error": "Profile incomplete: Please complete your profile before checking in"
}
```

4. **UI State**: Error dialog shown:
   - Title: "Complete Your Profile"
   - Message: "You must complete your profile before checking in to events."
   - Action: "Go to Profile" button redirects to `/profile/create`

**Database State**: No `Attendance` record created

---

## Scenario 5: Check-In Window Closed

**Objective**: System rejects check-in outside the allowed time window.

### Setup
- Event start: 2025-10-15T10:00:00Z
- Event end: 2025-10-15T12:00:00Z
- Check-in buffer: 30 minutes
- Check-out buffer: 30 minutes
- **Valid window**: 09:30 - 12:30
- **Current time**: 13:00 (30 minutes after window closed)

### Test Steps
1. **Action**: Student scans QR code at 13:00
2. **API Call**: `POST /api/qr/validate`
3. **Expected Response**:
```json
{
  "valid": false,
  "checkInWindow": {
    "opensAt": "2025-10-15T09:30:00Z",
    "closesAt": "2025-10-15T12:30:00Z",
    "isOpen": false
  },
  "validationErrors": [
    "Check-in window closed at 2025-10-15T12:30:00Z"
  ]
}
```

4. **UI State**: Error message shown:
   - "Check-In Closed"
   - "The check-in window for this event closed at 12:30 PM"
   - "Contact event organizer if you need assistance"

---

## Scenario 6: Offline Detection

**Objective**: System detects offline state and prevents check-in.

### Test Steps
1. **Action**: Student navigates to `/attendance` page
2. **Browser State**: `navigator.onLine = false` (simulated with DevTools or actual offline)
3. **UI State**: Banner shown at top:
   - "You are offline. Attendance submission requires internet connection."
   - "Scan QR Code" button disabled
4. **Action**: Network reconnects (`online` event fired)
5. **UI State**: Banner dismissed, "Scan QR Code" button re-enabled

**Client-Side Code**:
```javascript
useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

---

## Scenario 7: Dashboard Access by Role

**Objective**: Each role sees appropriate dashboard with role-specific data.

### Test Case 7A: Student Dashboard

**Login**: `student@test.com`

1. **Action**: Navigate to `/dashboard/student`
2. **API Call**: `GET /api/dashboard/student?page=1&limit=20`
3. **Expected Response**:
```json
{
  "attendanceHistory": [
    {
      "id": "clabc456",
      "eventName": "Spring 2025 Orientation",
      "eventStartDateTime": "2025-10-15T10:00:00Z",
      "submittedAt": "2025-10-15T10:15:00Z",
      "verificationStatus": "Pending"
    }
  ],
  "upcomingEvents": [
    {
      "id": "cldef789",
      "name": "Workshop: Career Planning",
      "startDateTime": "2025-10-18T14:00:00Z",
      "venueName": "Room 301",
      "qrCodeUrl": "https://res.cloudinary.com/.../events/cldef789/qr_1728960000.png"
    }
  ],
  "stats": {
    "totalAttendance": 1,
    "approvedCount": 0,
    "pendingCount": 1,
    "rejectedCount": 0,
    "attendanceRate": 0
  }
}
```

4. **UI Components**:
   - Header: "Student Dashboard"
   - Stats cards: Total Attendance (1), Approved (0), Pending (1), Attendance Rate (0%)
   - Attendance History table with columns: Event, Date, Status, Actions (View Details)
   - Upcoming Events section with QR code preview thumbnails
   - "Scan QR to Check In" floating action button

---

### Test Case 7B: Moderator Dashboard

**Login**: `moderator@test.com`

1. **Action**: Navigate to `/dashboard/moderator`
2. **API Call**: `GET /api/dashboard/moderator?page=1&limit=20`
3. **Expected Response**:
```json
{
  "myEvents": [
    {
      "id": "clxyz123",
      "name": "Spring 2025 Orientation",
      "startDateTime": "2025-10-15T10:00:00Z",
      "status": "Active",
      "attendanceCount": 1,
      "pendingCount": 1
    }
  ],
  "pendingVerifications": [
    {
      "id": "clabc456",
      "eventName": "Spring 2025 Orientation",
      "studentName": "John Doe",
      "studentEmail": "student@test.com",
      "submittedAt": "2025-10-15T10:15:00Z",
      "distanceFromVenue": 45.2,
      "frontPhotoUrl": "https://...",
      "backPhotoUrl": "https://...",
      "signatureUrl": "https://..."
    }
  ],
  "stats": {
    "totalEvents": 1,
    "activeEvents": 1,
    "totalAttendance": 1,
    "pendingVerifications": 1
  }
}
```

4. **UI Components**:
   - Header: "Moderator Dashboard"
   - Stats cards: Total Events (1), Active (1), Total Attendance (1), Pending (1)
   - My Events table with columns: Event, Date, Status, Attendance Count, Actions (Edit, View QR, View Attendees)
   - Pending Verifications section with expandable cards showing photos/signature
   - "Create Event" button → `/events/create`

---

### Test Case 7C: Administrator Dashboard

**Login**: `admin@test.com`

1. **Action**: Navigate to `/dashboard/administrator`
2. **API Call**: `GET /api/dashboard/administrator?page=1&limit=20`
3. **Expected Response**:
```json
{
  "systemStats": {
    "totalUsers": 4,
    "totalEvents": 2,
    "totalAttendance": 1,
    "activeEvents": 1,
    "pendingVerifications": 1,
    "disputedAttendance": 0
  },
  "recentActivity": [
    {
      "id": "cllog123",
      "action": "ATTENDANCE_SUBMITTED",
      "timestamp": "2025-10-15T10:15:00Z",
      "userEmail": "student@test.com",
      "details": "Event: Spring 2025 Orientation"
    }
  ],
  "alerts": []
}
```

4. **UI Components**:
   - Header: "Administrator Dashboard"
   - System-wide stats cards: Users (4), Events (2), Total Attendance (1), Disputed (0)
   - Recent Activity feed with last 50 SecurityLog entries
   - Alerts section (empty if no issues detected)
   - Quick actions: "View All Users", "View All Events", "Export Reports"

---

### Test Case 7D: Role-Based Access Control

**Objective**: Verify users cannot access dashboards for other roles.

1. **Login**: `student@test.com` (role: Student)
2. **Action**: Navigate to `/dashboard/moderator`
3. **Expected**: Middleware redirects to `/dashboard/student` (or shows 403 error page)
4. **API Call**: `GET /api/dashboard/moderator` (bypassing UI)
5. **Expected Response** (403 Forbidden):
```json
{
  "error": "Access denied: Your role (Student) does not match requested dashboard (moderator)"
}
```

---

## Scenario 8: Moderator Verifies Attendance

**Objective**: Moderator approves a pending attendance submission.

### Setup
- Attendance ID `clabc456` with status `Pending`
- Logged in as `moderator@test.com`

### Test Steps
1. **Action**: Moderator navigates to `/dashboard/moderator`
2. **UI**: Pending Verifications section shows 1 record
3. **Action**: Click "View Details" on attendance `clabc456`
4. **UI**: Modal opens showing:
   - Student name: John Doe
   - Event: Spring 2025 Orientation
   - Submitted: Oct 15, 2025 at 10:15 AM
   - Distance: 45.2m
   - Photos: Front and back thumbnails (click to enlarge)
   - Signature: Image preview
5. **Action**: Moderator clicks "Approve" button
6. **API Call**:
```http
PATCH /api/attendance/clabc456/verify
Content-Type: application/json
Authorization: Bearer <moderator_jwt>

{
  "verificationStatus": "Approved"
}
```

7. **Expected Response**:
```json
{
  "id": "clabc456",
  "verificationStatus": "Approved",
  "verifiedById": "clmod123",
  "verifiedAt": "2025-10-15T10:30:00Z"
}
```

8. **UI State**: Success toast shown, attendance removed from Pending list
9. **Database State**:
   - `Attendance.verificationStatus` = "Approved"
   - `SecurityLog` entry: action = `ATTENDANCE_VERIFIED`, details include moderator ID

**Student Notification**: In-app notification sent to `student@test.com`:
- "Your attendance for Spring 2025 Orientation has been approved!"

---

## Scenario 9: Moderator Rejects Attendance

**Objective**: Moderator rejects a suspicious attendance submission.

### Test Steps
1. **Action**: Moderator views attendance with distanceFromVenue = 95m (near threshold)
2. **Action**: Moderator clicks "Reject" button
3. **UI**: Rejection dialog opens:
   - "Reason for Rejection" textarea (required, max 1000 chars)
4. **Action**: Moderator enters: "Photos do not match student ID on file"
5. **Action**: Click "Confirm Rejection"
6. **API Call**:
```http
PATCH /api/attendance/clabc789/verify
Content-Type: application/json

{
  "verificationStatus": "Rejected",
  "disputeNote": "Photos do not match student ID on file"
}
```

7. **Expected Response**:
```json
{
  "id": "clabc789",
  "verificationStatus": "Rejected",
  "verifiedById": "clmod123",
  "verifiedAt": "2025-10-15T10:35:00Z",
  "disputeNote": "Photos do not match student ID on file"
}
```

8. **UI State**: Success toast, attendance removed from pending
9. **Student Notification**: Email sent to student with:
   - Subject: "Attendance Rejection: Spring 2025 Orientation"
   - Body: Includes disputeNote text and appeal instructions

---

## Scenario 10: Event Creation and QR Generation

**Objective**: Moderator creates a new event and QR code is auto-generated.

### Test Steps
1. **Login**: `moderator@test.com`
2. **Action**: Navigate to `/events/create`
3. **Action**: Fill form:
   - Name: "Fall 2025 Workshop"
   - Start: 2025-11-01T14:00:00Z
   - End: 2025-11-01T16:00:00Z
   - Venue: 14.5995, 120.9842
   - Venue Name: "Engineering Building"
   - Check-in buffer: 30 mins
4. **Action**: Click "Create Event"
5. **API Call**: `POST /api/events` (see event-create.json contract)
6. **Expected Response**:
```json
{
  "id": "clnew123",
  "name": "Fall 2025 Workshop",
  "qrCodeUrl": "https://res.cloudinary.com/.../events/clnew123/qr_1730470800.png",
  "qrCodePayload": "attendance:clnew123:1730470800000",
  "status": "Active"
}
```

7. **UI State**: Redirect to `/events/clnew123` showing event details page with:
   - QR code image displayed
   - "Download QR Code" button (PNG download)
   - "Print QR Code" button (opens print dialog with large QR)
   - Event details table

8. **Database State**:
   - `Event` record created with auto-generated `qrCodeUrl` and unique `qrCodePayload`
   - Cloudinary image stored at `events/clnew123/qr_1730470800.png`

---

## Performance Benchmarks

Run these tests to ensure compliance with constitution performance targets:

### Test 1: Attendance Submission Total Time
**Target**: < 5 seconds (including 3 Cloudinary uploads)

**Steps**:
1. Prepare 3 Base64 images (front: 150KB, back: 150KB, signature: 50KB)
2. Call `POST /api/attendance`
3. Measure time from request start to response received

**Expected**: 2.5 - 4.5 seconds on 3G network

---

### Test 2: Dashboard Load Time
**Target**: < 500ms API response

**Steps**:
1. Call `GET /api/dashboard/student?page=1&limit=20`
2. Measure time from request to response

**Expected**: 150 - 400ms (cached), 400 - 500ms (uncached)

---

### Test 3: QR Validation Latency
**Target**: < 200ms

**Steps**:
1. Call `POST /api/qr/validate`
2. Measure response time

**Expected**: 50 - 150ms

---

## Accessibility Tests

### Keyboard Navigation
1. Navigate `/attendance` page using only Tab key
2. **Expected**: All interactive elements reachable (Scan button, Continue, Capture, Submit)
3. **Expected**: Focus indicators visible (WCAG 2.1 AA compliant)

### Screen Reader
1. Use NVDA/JAWS to navigate attendance form
2. **Expected**: All labels announced correctly
3. **Expected**: Error messages associated with fields via `aria-describedby`

---

## Edge Cases Summary

| Scenario | Expected Behavior | Error Code |
|----------|-------------------|------------|
| Camera permission denied | Show fallback upload button | N/A |
| Photo capture fails | Allow retry, max 3 attempts | N/A |
| Geolocation permission denied | Show error, cannot proceed | N/A |
| GPS accuracy > 100m | Warning shown, server validates | 400 |
| Cloudinary upload timeout (>30s) | Retry once, then fail gracefully | 500 |
| Duplicate eventId+userId | Prevent submission, show previous | 409 |
| Invalid QR format | Show "Invalid QR code" error | 400 |
| Event status = Cancelled | QR validation fails | 422 |
| User role mismatch | Redirect to correct dashboard | 403 |

---

## Next Steps

After completing these scenarios:

1. **Run all scenarios** with Postman/automated tests
2. **Document any deviations** from expected responses
3. **Performance test** with 100 concurrent users checking in
4. **Accessibility audit** with axe-core and manual screen reader testing
5. **Update .github/copilot-instructions.md** with new API patterns
6. **Proceed to Phase 2**: Task generation via `/tasks` command
