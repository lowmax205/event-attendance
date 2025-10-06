# Data Model: QR-Based Attendance and Role-Based Dashboards

**Phase**: 1 (Design & Contracts)  
**Date**: 2025-10-06  
**Status**: Complete

## Overview

This document defines the database schema extensions for the Event Attendance System, adding Event and Attendance models to support QR-based check-ins with location verification, photo capture, and digital signatures.

## Prisma Schema Extensions

### Event Model

```prisma
model Event {
  id                String       @id @default(cuid())
  name              String
  description       String?      @db.Text
  startDateTime     DateTime
  endDateTime       DateTime
  venueLatitude     Float
  venueLongitude    Float
  venueName         String
  venueAddress      String?
  checkInBufferMins Int          @default(30)  // Buffer before startDateTime
  checkOutBufferMins Int         @default(30)  // Buffer after endDateTime
  qrCodeUrl         String?      // Cloudinary URL or data URL
  qrCodePayload     String       @unique       // Format: attendance:{eventId}:{timestamp}
  status            EventStatus  @default(Active)
  createdById       String
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  
  createdBy         User         @relation("EventCreator", fields: [createdById], references: [id])
  attendances       Attendance[]
  
  @@index([startDateTime, endDateTime])
  @@index([status])
  @@index([createdById])
}

enum EventStatus {
  Active
  Completed
  Cancelled
}
```

**Field Explanations**:
- `name`: Event title (e.g., "Welcome Orientation 2025")
- `description`: Optional detailed description
- `startDateTime` / `endDateTime`: Scheduled event time window
- `venueLatitude` / `venueLongitude`: GPS coordinates for location verification (decimal degrees)
- `venueName`: Human-readable venue name (e.g., "Main Auditorium")
- `checkInBufferMins`: Minutes before `startDateTime` check-in allowed (configurable per event)
- `checkOutBufferMins`: Minutes after `endDateTime` check-in allowed (configurable per event)
- `qrCodeUrl`: Generated QR code image URL (Cloudinary or base64 data URL)
- `qrCodePayload`: Scannable payload string, must be unique to prevent QR reuse
- `status`: Event lifecycle state
- `createdById`: Moderator/Admin who created the event

**Validation Rules**:
- `startDateTime` must be before `endDateTime`
- `venueLatitude` must be between -90 and 90
- `venueLongitude` must be between -180 and 180
- `checkInBufferMins` and `checkOutBufferMins` must be ≥ 0
- `qrCodePayload` format validated server-side: `^attendance:[a-z0-9]+:\d+$`

**Indexes**:
- Composite index on `(startDateTime, endDateTime)` for time window queries
- Index on `status` for filtering active events
- Index on `createdById` for moderator dashboard queries

---

### Attendance Model

```prisma
model Attendance {
  id                String           @id @default(cuid())
  eventId           String
  userId            String
  submittedAt       DateTime         @default(now())
  latitude          Float
  longitude         Float
  distanceFromVenue Float            // Calculated distance in meters
  frontPhotoUrl     String
  backPhotoUrl      String
  signatureUrl      String
  verificationStatus VerificationStatus @default(Pending)
  verifiedById      String?
  verifiedAt        DateTime?
  disputeNote       String?          @db.Text
  ipAddress         String?
  userAgent         String?
  
  event             Event            @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user              User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  verifiedBy        User?            @relation("AttendanceVerifier", fields: [verifiedById], references: [id])
  
  @@unique([eventId, userId])        // Prevent duplicate check-ins
  @@index([userId, submittedAt])
  @@index([eventId, verificationStatus])
  @@index([verificationStatus])
}

enum VerificationStatus {
  Pending      // Awaiting moderator review
  Approved     // Verified by moderator
  Rejected     // Rejected due to location/photo issues
  Disputed     // Flagged for admin review
}
```

**Field Explanations**:
- `eventId`: Foreign key to Event
- `userId`: Foreign key to User (student who checked in)
- `submittedAt`: Timestamp of attendance submission
- `latitude` / `longitude`: Student's GPS coordinates at check-in
- `distanceFromVenue`: Calculated server-side using Haversine formula (meters)
- `frontPhotoUrl`: Cloudinary URL for front-facing photo (ID/badge)
- `backPhotoUrl`: Cloudinary URL for back-facing photo (selfie)
- `signatureUrl`: Cloudinary URL for digital signature PNG
- `verificationStatus`: Workflow state (default: Pending)
- `verifiedById`: Moderator who approved/rejected (nullable)
- `verifiedAt`: Timestamp of verification action
- `disputeNote`: Optional note for rejected/disputed attendances
- `ipAddress` / `userAgent`: Audit trail metadata

**Validation Rules**:
- `latitude` must be between -90 and 90
- `longitude` must be between -180 and 180
- `distanceFromVenue` must be ≤ 100 (enforced during submission)
- All URLs must be valid HTTPS Cloudinary URLs
- Unique constraint on `(eventId, userId)` prevents duplicate submissions

**Indexes**:
- Composite index on `(userId, submittedAt)` for student attendance history queries
- Composite index on `(eventId, verificationStatus)` for moderator verification dashboard
- Index on `verificationStatus` for admin system-wide queries

**Business Logic**:
- Cascade delete: If Event deleted, all Attendances deleted
- Cascade delete: If User deleted, all Attendances deleted
- Verification workflow:
  1. Submitted → Pending (automatic)
  2. Pending → Approved/Rejected (moderator action)
  3. Rejected → Disputed (student appeal)
  4. Disputed → Approved/Rejected (admin final decision)

---

### User Model Extensions

Extend existing `User` model with new relations:

```prisma
model User {
  // ... existing fields ...
  
  createdEvents     Event[]      @relation("EventCreator")
  attendances       Attendance[]
  verifiedAttendances Attendance[] @relation("AttendanceVerifier")
}
```

No new fields required; only relations added.

---

## Entity Relationships

```
User (Student)
  ├── attendances (1:N) → Attendance
  └── profile (1:1) → UserProfile

User (Moderator/Admin)
  ├── createdEvents (1:N) → Event
  └── verifiedAttendances (1:N) → Attendance

Event
  ├── attendances (1:N) → Attendance
  └── createdBy (N:1) → User

Attendance
  ├── event (N:1) → Event
  ├── user (N:1) → User (student)
  └── verifiedBy (N:1) → User (moderator, nullable)
```

---

## Migration Strategy

1. **Add Enums**:
   ```prisma
   enum EventStatus { Active, Completed, Cancelled }
   enum VerificationStatus { Pending, Approved, Rejected, Disputed }
   ```

2. **Add Event Model** with all fields and indexes

3. **Add Attendance Model** with all fields, unique constraint, and indexes

4. **Update User Model** with new relations

5. **Run Migration**:
   ```bash
   npm run db:migrate -- --name add_event_attendance_models
   ```

---

## Data Volume Estimates

Based on 10,000 students, 500 events/year, 80% attendance rate:

- **Events**: ~500 records/year, ~2KB/record = 1MB/year
- **Attendances**: ~400,000 records/year (10k students × 500 events × 0.8)
  - Metadata: ~1KB/record = 400MB/year
  - Images (Cloudinary): 3 images/attendance × 500KB/image = 600GB/year stored externally
- **Total Database Growth**: ~401MB/year (acceptable for PostgreSQL)

---

## Query Patterns

### Student Dashboard: Attendance History

```typescript
const attendances = await prisma.attendance.findMany({
  where: { userId },
  include: {
    event: { select: { name: true, startDateTime: true, venueName: true } },
  },
  orderBy: { submittedAt: 'desc' },
  take: 50, // Pagination
});
```

### Moderator Dashboard: Events List

```typescript
const events = await prisma.event.findMany({
  where: {
    createdById: moderatorId,
    status: 'Active',
  },
  include: {
    _count: { select: { attendances: true } },
  },
  orderBy: { startDateTime: 'desc' },
});
```

### Moderator Dashboard: Pending Verifications

```typescript
const pendingAttendances = await prisma.attendance.findMany({
  where: {
    event: { createdById: moderatorId },
    verificationStatus: 'Pending',
  },
  include: {
    event: { select: { name: true } },
    user: { select: { firstName: true, lastName: true, profile: true } },
  },
  orderBy: { submittedAt: 'asc' },
});
```

### Admin Dashboard: System-Wide Statistics

```typescript
const stats = await prisma.$transaction([
  prisma.event.count({ where: { status: 'Active' } }),
  prisma.attendance.count({ where: { verificationStatus: 'Pending' } }),
  prisma.attendance.count({
    where: {
      submittedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  }),
]);
```

---

## Performance Optimizations

1. **Indexes**: All critical query paths covered (see @@index directives)
2. **Eager Loading**: Use `include` for N+1 prevention
3. **Pagination**: Limit results with `take` and `skip`
4. **Select Specific Fields**: Avoid fetching entire User object when only name needed
5. **Caching**: Cache active events list (low mutation rate)

---

## Security Considerations

1. **Row-Level Security**:
   - Students can only read their own `Attendance` records
   - Moderators can read `Attendance` for their created `Events`
   - Admins can read all records

2. **Cascade Deletes**:
   - Event deletion removes all attendances (by design)
   - User deletion removes all attendances (GDPR compliance)

3. **Audit Trail**:
   - `ipAddress` and `userAgent` logged for dispute resolution
   - `verifiedById` and `verifiedAt` track moderator actions

---

## Validation Rules Summary

| Field | Constraint | Error Message |
|-------|-----------|---------------|
| Event.startDateTime | < endDateTime | "Start time must be before end time" |
| Event.venueLatitude | -90 to 90 | "Invalid latitude coordinates" |
| Event.venueLongitude | -180 to 180 | "Invalid longitude coordinates" |
| Event.checkInBufferMins | ≥ 0 | "Buffer must be non-negative" |
| Attendance.distanceFromVenue | ≤ 100 | "Location verification failed: Not within 100m of venue" |
| Attendance.eventId + userId | Unique | "You have already checked in to this event" |

---

## State Transitions

### Event Lifecycle

```
[Created] → Active → Completed
                  ↘ Cancelled
```

- **Active**: Default state, check-in allowed within time windows
- **Completed**: Auto-transitioned after `endDateTime + checkOutBufferMins`
- **Cancelled**: Manual action by moderator/admin

### Attendance Verification Workflow

```
[Submitted] → Pending → Approved
                     ↘ Rejected → Disputed → Approved
                                           ↘ Rejected (final)
```

- **Pending**: Default state after submission
- **Approved**: Moderator verification passed
- **Rejected**: Location/photo issues, can be appealed
- **Disputed**: Student requested review, requires admin action

---

## Data Model Checklist

- [x] Event model defined with all required fields
- [x] Attendance model defined with all required fields
- [x] User model relations added
- [x] Enums defined (EventStatus, VerificationStatus)
- [x] Unique constraints applied (Event.qrCodePayload, Attendance eventId+userId)
- [x] Indexes defined for query performance
- [x] Cascade delete rules documented
- [x] Validation rules specified
- [x] State transitions documented
- [x] Query patterns provided
- [x] Performance optimizations noted
- [x] Security considerations addressed

---

**Next Steps**: Define API contracts in `/contracts` directory
