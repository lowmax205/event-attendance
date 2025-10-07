# Feature Specification: QR-Based Attendance and Role-Based Dashboards

**Feature Branch**: `002-extend-the-event`  
**Created**: October 6, 2025  
**Status**: Draft  
**Input**: User description: "Extend the Event Attendance System with core attendance functionality and dashboard structure. This phase builds upon the foundation established in Phase 1 (landing pages and authentication) and adds: 3. **QR-based Attendance Form:** A streamlined 3-click attendance process triggered by scanning a QR code: - **Click 1: Verify Location** using the browser's Geolocation API. - **Click 2: Capture Photos** using the device camera (front and back). Images are uploaded to Cloudinary in the path: attendance/{eventId}/{userId}/{timestamp}_{attendanceId}_{front|back}.jpg. - **Click 3: Signature Canvas** for digital signature, saved as transparent PNG and uploaded to Cloudinary in path: attendance/{eventId}/{userId}/{timestamp}_{attendanceId}_signature.png. The form pre-fills user data from their profile and prevents duplicate check-ins. 4. **Role-Based Dashboards:** Create the basic shell layouts and routing for three dashboards (Student, Moderator, Admin). The Student dashboard should display their attendance history and quick access to QR scanning."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
   ✓ PARSED: QR attendance + role-based dashboards
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
   ✓ ACTORS: Students, Moderators, Admins
   ✓ ACTIONS: Scan QR, verify location, capture photos, sign, view history
   ✓ DATA: Attendance records, geolocation, photos, signatures
   ✓ CONSTRAINTS: 3-click process, no duplicates, specific image paths
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
   ✓ MARKED: Several clarifications needed (see requirements)
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
   ✓ COMPLETED: Primary flow and edge cases defined
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
   ✓ GENERATED: 33 functional requirements with 5 clarifications
6. Identify Key Entities (if data involved)
   ✓ IDENTIFIED: Attendance, Event, User, Location, Photo, Signature
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
   ⚠ WARNING: 5 items need clarification before implementation
8. Return: SUCCESS (spec ready for planning)
```


---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Clarifications

### Session 2025-10-06

- Q: What is the acceptable location accuracy radius for verifying a student is at the event venue? → A: 100 meters - Medium precision (suitable for campus quad or building cluster)

### Session 2025-10-07

- Q: What valid range should admins be allowed to set for the default GPS accuracy radius? → A: 10-500 meters (Medium - suitable for small campus or event complex)
- Q: What time period filters should the analytics dashboard support? → A: All-time + Last 7/30/90 days (standard analytics preset periods)
- Q: How should the system handle events where the check-in buffer extends into the past (e.g., event created with start time in 1 hour but 2-hour buffer)? → A: Block event creation (Strict - prevent impossible buffer windows)
- Q: How should students be able to appeal a rejected attendance verification? → A: Appeal button on student dashboard with message field (Simple UI addition to student dashboard)
- Q: How should the system transition events from Active to Completed status after they end? → A: Immediate on event end (Real-time trigger - requires event listeners/timers)
- Q: Should students with incomplete profiles be allowed to check in to events? → A: Block check-in - Prevent students from checking in if their profile is incomplete; display error message directing them to complete profile first
- Q: Should the system support offline mode for attendance check-ins (queue for later submission), or require real-time connectivity? → A: Real-time only - Require active internet connection; display error if offline and prevent check-in attempt
- Q: Are events time-bound? Can students check in before or after the scheduled event times? → A: Custom buffer windows before/after (configurable per event)
- Q: For this phase, what specific moderator dashboard features are needed? → A: Full event control - Create/edit events, manage QR codes, verify attendance, handle disputes, export data

---

## Clarifications

### Session 2025-10-06

- Q: What export format(s) should the moderator attendance export feature support? → A: CSV only (simple, universal compatibility)

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

**As a student attending an event**, I need to quickly record my attendance by scanning a QR code, so that I can prove my participation without lengthy manual processes.

The student arrives at an event venue, scans a QR code displayed at the entrance, and completes a simple 3-step verification process: confirming their location, taking two photos (front and back), and providing a digital signature. The system automatically fills in their profile information and prevents them from accidentally checking in twice to the same event.

**As an administrator**, I need to access a centralized dashboard where I can manage events and view attendance data, so that I can oversee the entire attendance system.

**As a moderator**, I need a dashboard that allows me to verify attendance records and manage event-specific tasks, so that I can assist with event operations.

**As a student**, I need to view my attendance history and quickly access the QR scanner, so that I can track my participation and easily check in to new events.

### Acceptance Scenarios

#### Scenario 1: Successful QR-Based Check-In

1. **Given** a student with a completed profile is at an event venue  
   **When** they scan the event's QR code  
   **Then** the attendance form opens with their profile data pre-filled

2. **Given** the attendance form is open  
   **When** the student grants location permission and their location is verified  
   **Then** the system confirms their location matches the event venue

3. **Given** location is verified  
   **When** the student captures their front and back photos  
   **Then** both photos are uploaded and confirmed

4. **Given** photos are uploaded  
   **When** the student provides their digital signature  
   **Then** the attendance record is created and the student receives confirmation

#### Scenario 2: Duplicate Check-In Prevention

1. **Given** a student has already checked in to an event  
   **When** they scan the same event's QR code again  
   **Then** the system displays a message indicating they are already checked in and prevents duplicate submission

#### Scenario 3: Dashboard Access by Role

1. **Given** a user with Student role is authenticated  
   **When** they navigate to their dashboard  
   **Then** they see their attendance history and a QR scanner button

2. **Given** a user with Moderator role is authenticated  
   **When** they navigate to their dashboard  
   **Then** they see event management tools and attendance verification features

3. **Given** a user with Admin role is authenticated  
   **When** they navigate to their dashboard  
   **Then** they see system-wide controls and full attendance data access

### Edge Cases

- **What happens when a student denies location permission?** The system should display an error explaining that location verification is required for attendance and offer to retry.
- **What happens when photo capture fails?** The system should allow the user to retry capturing photos and display clear error messages.
- **What happens when a student's profile is incomplete?** The system should prevent check-in and display an error message directing the student to complete their profile first.
- **What happens when network connectivity is lost during check-in?** The system should detect the offline state, display an error message explaining that internet connection is required, and prevent check-in attempt until connectivity is restored.
- **What happens when a QR code is scanned outside the event's time window?** The system should verify the current time is within the event's allowed check-in window (scheduled time plus configurable buffer periods before/after). If outside the window, display an error message with the allowed check-in times.
- **What happens when location verification fails but the student is actually at the venue?** The system should display an error and allow retry. Moderators may need manual verification capability if the issue persists due to GPS inaccuracy beyond the 100-meter radius.
- **What happens when signature canvas is left blank?** The system should require a signature before allowing submission.
- **What happens when a student without the required permissions tries to access moderator or admin dashboards?** The system should display an access denied message and redirect to their appropriate dashboard.
- **What happens when a moderator tries to create an event with a check-in buffer that extends into the past?** The system should block event creation and display a validation error message indicating that the start time minus buffer must be in the future.

## Requirements _(mandatory)_

### Functional Requirements

#### QR-Based Attendance System

- **FR-001**: System MUST provide a QR code scanner interface accessible to authenticated students
- **FR-002**: System MUST detect when a scanned QR code corresponds to a valid event
- **FR-003**: System MUST verify the current time is within the event's allowed check-in window (scheduled time plus configurable buffer periods)
- **FR-004**: System MUST display an error message with allowed check-in times if student attempts check-in outside the time window
- **FR-005**: System MUST verify active internet connectivity before allowing check-in process to begin
- **FR-006**: System MUST display an error message if the device is offline and prevent check-in attempt
- **FR-007**: System MUST verify the student's profile is complete before allowing check-in
- **FR-008**: System MUST display an error message directing students to complete their profile if required fields are missing
- **FR-009**: System MUST check if the student has already checked in to the event before displaying the attendance form
- **FR-010**: System MUST prevent duplicate attendance submissions for the same student and event combination
- **FR-011**: System MUST display a clear message when duplicate check-in is prevented, showing the previous check-in timestamp

#### Location Verification

- **FR-012**: System MUST request the student's device location when the attendance form is opened
- **FR-013**: System MUST verify that the student's location matches the event venue location within 100 meters radius
- **FR-014**: System MUST record the captured GPS coordinates (latitude, longitude) as part of the attendance record
- **FR-015**: System MUST display an error message when location verification fails
- **FR-016**: System MUST allow students to retry location verification if it initially fails

#### Photo Capture

- **FR-017**: System MUST provide a camera interface for capturing front-facing and back-facing photos
- **FR-018**: System MUST upload photos to image storage with the naming pattern: `attendance/{eventId}/{userId}/{timestamp}_{attendanceId}_{front|back}.jpg`
- **FR-019**: System MUST confirm successful upload of both photos before allowing progression to the signature step
- **FR-020**: System MUST allow students to retake photos if they are unsatisfied with the initial capture
- **FR-021**: System MUST display preview of captured photos before upload confirmation
- **FR-022**: System MUST validate that both front and back photos are captured before proceeding

#### Digital Signature

- **FR-023**: System MUST provide a signature canvas for students to draw their digital signature
- **FR-024**: System MUST save signatures as transparent PNG images
- **FR-025**: System MUST upload signatures to image storage with the naming pattern: `attendance/{eventId}/{userId}/{timestamp}_{attendanceId}_signature.png`
- **FR-026**: System MUST require a non-empty signature before allowing form submission
- **FR-027**: System MUST allow students to clear and redraw their signature

#### Form Pre-filling and Submission

- **FR-028**: System MUST pre-fill the attendance form with the student's profile data (name, ID number, etc.) as read-only fields
- **FR-029**: System MUST create an attendance record containing: student ID, event ID, timestamp, location coordinates, photo URLs, signature URL
- **FR-030**: System MUST display a confirmation message upon successful attendance submission

#### Role-Based Dashboards

- **FR-031**: System MUST provide three distinct dashboard layouts for Student, Moderator, and Admin roles
- **FR-032**: System MUST restrict dashboard access based on user role
- **FR-033**: Student dashboard MUST display the student's attendance history showing event name, date, and status
- **FR-033.1**: Student dashboard MUST allow students to appeal rejected attendances by clicking an "Request Review" button and providing an appeal message (transitions status to Disputed for admin review)
- **FR-034**: Student dashboard MUST provide quick access to the QR code scanner
- **FR-035**: Moderator dashboard MUST allow creation and editing of events (name, date/time, location, buffer windows)
- **FR-035.1**: System MUST validate that event start time minus check-in buffer is not in the past at creation time (prevent impossible buffer windows)
- **FR-036**: Moderator dashboard MUST allow generation and management of event QR codes
- **FR-037**: Moderator dashboard MUST display attendance records with search and filter capabilities
- **FR-038**: Moderator dashboard MUST allow verification and approval of attendance records with ability to add dispute notes when rejecting (dispute note is a text field where moderator can document reason for rejection or contested attendance details)
- **FR-039**: Moderator dashboard MUST allow export of attendance data in CSV format with columns: Student Name, Student ID, Event Name, Event Date, Submitted At, Verification Status, Verified By, Distance (meters)
- **FR-040**: Admin dashboard MUST display system-wide controls including: view all events across all creators, view all attendance records with advanced filters, user role assignment and modification, system configuration settings (default GPS accuracy radius, default buffer time windows), and analytics dashboard (total events, total attendances, verification rates)
- **FR-040.1**: System configuration MUST allow admins to set default GPS accuracy radius with valid range of 10-500 meters (default: 100 meters)
- **FR-040.2**: System configuration MUST allow admins to set default check-in and check-out buffer times with valid range of 0-120 minutes (default: 30 minutes each)
- **FR-040.3**: System configuration changes MUST be logged to audit trail with admin user ID and timestamp
- **FR-040.4**: Admin analytics dashboard MUST display the following metrics: Total Events (count of all events), Total Attendances (count of all attendance records), Verification Rate (percentage calculated as Approved Attendances / Total Attendances × 100%), Pending Verification Count (attendances with status=Pending), and Top 5 Events by Attendance Count
- **FR-040.5**: Admin analytics dashboard MUST support time period filters: All-time (default), Last 7 days, Last 30 days, and Last 90 days
- **FR-041**: System MUST redirect users to their role-appropriate dashboard after login
- **FR-042**: System MUST prevent users from accessing dashboards above their permission level
- **FR-043**: System MUST display error messages following a standardized pattern: error title describing the issue, explanation of why the error occurred, suggested action to resolve, and retry or alternative action button (applies to FR-004, FR-006, FR-008, FR-010, FR-014)

#### Dependencies and Assumptions

- **Assumption**: Phase 1 (authentication and user profiles) is complete and functional
- **Assumption**: Users have existing profiles with required data fields
- **Included in Phase**: Event creation, QR code generation, and location setup functionality are part of this phase via moderator dashboard
- **Dependency**: Role assignment system must be functional
- **Assumption**: Students are using devices with camera and GPS capabilities
- **Assumption**: Image storage service is configured and accessible
- **Technical Requirement**: System MUST implement real-time event status monitoring to automatically transition Event status from Active to Completed immediately when endDateTime + checkOutBufferMins expires

### Key Entities

- **Attendance**: Represents a single check-in record for a student at an event. Contains student identifier, event identifier, submission timestamp, GPS coordinates (latitude, longitude), URLs for front photo, back photo, and signature image, and verification status.

- **Event**: Represents an organized event where attendance is tracked. Contains event name, scheduled start date/time, scheduled end date/time, configurable check-in buffer before start, configurable check-out buffer after end, venue location (GPS coordinates), QR code identifier, and active status.

- **User**: Represents a person using the system with an assigned role. Contains profile information (name, ID number, email), assigned role (Student, Moderator, Admin), and authentication credentials.

- **Location**: Represents the geographical coordinates captured during check-in. Contains latitude, longitude, accuracy radius, and timestamp of capture.

- **Photo**: Represents an uploaded image (front or back). Contains image URL, upload timestamp, image type (front/back), and associated attendance record.

- **Signature**: Represents a digital signature image. Contains signature image URL, upload timestamp, and associated attendance record.

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain (5 items need clarification)
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed (with warnings)

---
