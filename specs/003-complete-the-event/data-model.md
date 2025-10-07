# Data Model: Management System & Analytics

**Feature**: 003-complete-the-event  
**Date**: 2025-10-08  
**Status**: Complete

## Overview

This document extends the existing Prisma schema from Phases 1 & 2 to support management capabilities and analytics. New fields, relations, and models are added to enable user management, event ownership tracking, attendance verification workflow, data exports, and analytics aggregations.

---

## Schema Extensions

### 1. User Model Extensions

**Purpose**: Support admin user management (FR-001 to FR-015) with account status tracking and audit trail.

```prisma
model User {
  // ========== EXISTING FIELDS FROM PHASE 1 ==========
  id                String        @id @default(cuid())
  email             String        @unique
  passwordHash      String
  role              UserRole
  createdAt         DateTime      @default(now())
  lastLoginAt       DateTime?
  
  // ========== EXISTING FROM PHASE 1: Profile ==========
  profile           UserProfile?
  
  // ========== EXISTING FROM PHASE 2: Attendance ==========
  attendances       Attendance[]
  
  // ========== NEW FOR PHASE 3: Account Management ==========
  accountStatus     AccountStatus @default(ACTIVE)       // FR-007
  suspendedAt       DateTime?
  suspendedBy       User?         @relation("SuspendedUsers", fields: [suspendedById], references: [id], onDelete: SetNull)
  suspendedById     String?
  
  passwordResetAt   DateTime?
  passwordResetBy   User?         @relation("PasswordResets", fields: [passwordResetById], references: [id], onDelete: SetNull)
  passwordResetById String?
  
  deletedAt         DateTime?                            // Soft delete
  deletedBy         User?         @relation("DeletedUsers", fields: [deletedById], references: [id], onDelete: SetNull)
  deletedById       String?
  
  // ========== NEW FOR PHASE 3: Relationships ==========
  createdEvents     Event[]       @relation("CreatedEvents")  // FR-016, FR-026
  verifiedAttendances Attendance[] @relation("VerifiedAttendances")  // FR-035
  exports           ExportRecord[] @relation("UserExports")  // FR-052
  
  // Self-referential relations for audit trail
  suspendedUsers    User[]        @relation("SuspendedUsers")
  passwordResets    User[]        @relation("PasswordResets")
  deletedUsers      User[]        @relation("DeletedUsers")
  
  // ========== INDEXES ==========
  @@index([email])
  @@index([role])
  @@index([accountStatus])
  @@index([suspendedById])
  @@index([deletedAt])  // For filtering active users
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
}
```

**Key Changes**:
- `accountStatus`: Enables admin to suspend/reactivate accounts (FR-007)
- `suspendedBy/At`: Audit trail for suspensions (FR-010)
- `passwordResetBy/At`: Track admin password resets (FR-012)
- `deletedBy/At`: Soft delete with audit trail (FR-014)
- `createdEvents`: Link to events created by moderators/admins (FR-016, FR-026)
- `verifiedAttendances`: Link to attendance records verified by moderators/admins (FR-035)

**Validation Rules**:
- `accountStatus = SUSPENDED` → Cannot login (enforce in auth middleware)
- `deletedAt != null` → Treated as non-existent (filter in all queries)
- `suspendedById` → Must reference ADMIN role user

---

### 2. Event Model Extensions

**Purpose**: Track event ownership for moderator scope restrictions (FR-026) and prevent deletion when attendances exist (FR-020).

```prisma
model Event {
  // ========== EXISTING FIELDS FROM PHASE 2 ==========
  id                String        @id @default(cuid())
  name              String
  description       String?
  startDateTime     DateTime
  endDateTime       DateTime
  venueLocation     String
  venueLatitude     Float
  venueLongitude    Float
  checkInBufferMins Int           @default(30)
  checkOutBufferMins Int          @default(30)
  qrCodeId          String        @unique
  status            EventStatus   @default(UPCOMING)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  // ========== EXISTING FROM PHASE 2: Attendances ==========
  attendances       Attendance[]
  
  // ========== NEW FOR PHASE 3: Ownership & Audit ==========
  createdBy         User          @relation("CreatedEvents", fields: [createdById], references: [id])
  createdById       String                                   // FR-016, FR-026
  
  editHistory       Json?                                    // FR-017: Store edit log
  // Example: [{ editedBy: "userId", editedAt: "2025-10-08T10:00:00Z", fields: ["name", "startDateTime"] }]
  
  hasAttendances    Boolean       @default(false)            // FR-020: Cached flag for deletion prevention
  
  deletedAt         DateTime?                                // Soft delete (FR-020)
  deletedBy         User?         @relation("DeletedEvents", fields: [deletedById], references: [id], onDelete: SetNull)
  deletedById       String?
  
  deletedEvents     User[]        @relation("DeletedEvents")
  
  // ========== INDEXES ==========
  @@index([createdById])                   // Fast moderator event lookup (FR-026)
  @@index([status, startDateTime])         // Event filtering (FR-027, FR-028)
  @@index([startDateTime])                 // Date range filtering (FR-024)
  @@index([deletedAt])                     // Filter active events
}
```

**Key Changes**:
- `createdBy/createdById`: Ownership tracking for moderator scope (FR-026)
- `editHistory`: JSON array of edit records with editor, timestamp, changed fields (FR-017)
- `hasAttendances`: Cached boolean to quickly check if deletion is allowed (FR-020)
- `deletedBy/deletedAt`: Soft delete with audit trail

**Validation Rules**:
- `startDateTime - checkInBufferMins` must be in future at creation (FR-015)
- `hasAttendances = true` → Cannot delete event (FR-020)
- Moderators can only query/update where `createdById = currentUser.id` (FR-026)

**Edit History Example**:
```json
[
  {
    "editedBy": "clx123abc",
    "editedAt": "2025-10-08T14:30:00Z",
    "fields": ["name", "description"],
    "changes": {
      "name": { "from": "Old Name", "to": "New Name" },
      "description": { "from": "Old desc", "to": "New desc" }
    }
  }
]
```

---

### 3. Attendance Model Extensions

**Purpose**: Support verification workflow with moderator/admin approval, rejection notes, and dispute resolution (FR-033 to FR-042).

```prisma
model Attendance {
  // ========== EXISTING FIELDS FROM PHASE 2 ==========
  id                String              @id @default(cuid())
  studentId         String
  student           User                @relation(fields: [studentId], references: [id])
  eventId           String
  event             Event               @relation(fields: [eventId], references: [id])
  submittedAt       DateTime            @default(now())
  latitude          Float
  longitude         Float
  distance          Float                // Distance from venue in meters
  frontPhotoUrl     String
  backPhotoUrl      String
  signatureUrl      String
  status            AttendanceStatus    @default(PENDING)
  checkInTime       DateTime?
  checkOutTime      DateTime?
  
  // ========== NEW FOR PHASE 3: Verification Workflow ==========
  verifiedBy        User?               @relation("VerifiedAttendances", fields: [verifiedById], references: [id], onDelete: SetNull)
  verifiedById      String?                                  // FR-035
  verifiedAt        DateTime?                                // FR-035
  
  disputeNotes      String?             @db.Text            // FR-034: Moderator rejection reason
  appealMessage     String?             @db.Text            // FR-033.1: Student appeal
  resolutionNotes   String?             @db.Text            // FR-041: Final resolution notes
  
  // ========== INDEXES ==========
  @@unique([studentId, eventId])                             // Prevent duplicate check-ins
  @@index([status])                                          // Verification status filtering (FR-029)
  @@index([verifiedById, verifiedAt])                        // Attendance management queries
  @@index([submittedAt])                                     // Analytics time-series queries (FR-056)
  @@index([eventId, status])                                 // Event-specific attendance filtering
}

enum AttendanceStatus {
  PENDING      // Initial state after submission
  APPROVED     // Verified by moderator/admin
  REJECTED     // Rejected by moderator/admin with disputeNotes
  DISPUTED     // Student appealed rejection (appealMessage provided)
}
```

**Key Changes**:
- `verifiedBy/verifiedById`: Track who verified the attendance (FR-035)
- `verifiedAt`: Timestamp of verification (FR-035)
- `disputeNotes`: Required when rejecting attendance, explains reason (FR-034)
- `appealMessage`: Student's appeal message when disputing rejection (FR-033.1)
- `resolutionNotes`: Final notes when resolving disputed attendance (FR-041)

**State Transitions**:
```
PENDING → APPROVED (verifiedBy, verifiedAt, optional resolutionNotes)
PENDING → REJECTED (verifiedBy, verifiedAt, disputeNotes required)
REJECTED → DISPUTED (student adds appealMessage)
DISPUTED → APPROVED (verifiedBy, verifiedAt, resolutionNotes required)
DISPUTED → REJECTED (verifiedBy, verifiedAt, updated disputeNotes/resolutionNotes)
```

**Validation Rules**:
- `status = REJECTED` → `disputeNotes` must not be null
- `status = DISPUTED` → `appealMessage` must not be null
- `status = APPROVED || REJECTED` → `verifiedBy`, `verifiedAt` must not be null
- Moderators can only verify attendances where `event.createdById = currentUser.id` (FR-042)

---

### 4. ExportRecord Model (New)

**Purpose**: Audit trail for data exports (FR-043 to FR-052) and track export history.

```prisma
model ExportRecord {
  id            String        @id @default(cuid())
  createdAt     DateTime      @default(now())
  
  exportedBy    User          @relation("UserExports", fields: [exportedById], references: [id])
  exportedById  String                                   // FR-052
  
  format        ExportFormat                             // FR-044, FR-045
  filters       Json                                     // FR-048: Store filter criteria
  // Example: { eventIds: ["id1", "id2"], startDate: "2025-10-01", endDate: "2025-10-31", status: "APPROVED" }
  
  recordCount   Int                                      // Number of records exported
  status        ExportStatus  @default(PENDING)
  errorMessage  String?       @db.Text                   // FR-051: Error details if failed
  
  fileSize      Int?                                     // File size in bytes (optional)
  downloadUrl   String?                                  // Temporary signed URL (if async export)
  expiresAt     DateTime?                                // URL expiration (if async export)
  
  @@index([exportedById, createdAt])                     // User export history
  @@index([createdAt])                                   // Cleanup old exports
  @@index([status])                                      // Query pending/failed exports
}

enum ExportFormat {
  CSV
  XLSX
}

enum ExportStatus {
  PENDING      // Export queued (for async exports)
  PROCESSING   // Export in progress
  COMPLETED    // Successfully generated
  FAILED       // Generation failed (see errorMessage)
}
```

**Purpose**:
- Audit trail for all exports (who, when, what filters)
- Support future async export feature for large datasets (>10k records)
- Track export success/failure for debugging

**Filter JSON Examples**:
```json
{
  "eventIds": ["clx123", "clx456"],
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "status": "APPROVED",
  "studentName": "John Doe"
}
```

---

### 5. SecurityLog Extensions

**Purpose**: Audit trail for user management actions (FR-010) and export actions (FR-052).

```prisma
model SecurityLog {
  // ========== EXISTING FIELDS FROM PHASE 1 ==========
  id             String          @id @default(cuid())
  timestamp      DateTime        @default(now())
  userId         String?
  user           User?           @relation(fields: [userId], references: [id], onDelete: SetNull)
  eventType      SecurityEventType
  ipAddress      String?
  userAgent      String?
  success        Boolean
  failureReason  String?
  
  // ========== NEW FOR PHASE 3: Additional Context ==========
  metadata       Json?                                    // Additional event-specific data
  // Example for USER_ROLE_CHANGED: { "fromRole": "STUDENT", "toRole": "MODERATOR", "targetUserId": "clx789" }
  
  @@index([userId, timestamp])
  @@index([eventType, timestamp])
}

enum SecurityEventType {
  // ========== EXISTING FROM PHASE 1 ==========
  REGISTRATION
  LOGIN
  LOGOUT
  FAILED_LOGIN
  PASSWORD_CHANGE
  
  // ========== NEW FOR PHASE 3 ==========
  USER_ROLE_CHANGED          // FR-010: Admin changed user role
  USER_STATUS_CHANGED        // FR-010: Admin suspended/reactivated user
  USER_CREATED               // FR-011: Admin created new user
  USER_PASSWORD_RESET        // FR-012: Admin reset user password
  USER_DELETED               // FR-014: Admin deleted user
  
  EVENT_CREATED              // FR-016: Moderator/admin created event
  EVENT_EDITED               // FR-017: Moderator/admin edited event
  EVENT_DELETED              // Admin deleted event (rare, only if no attendances)
  
  ATTENDANCE_VERIFIED        // FR-033: Moderator/admin approved attendance
  ATTENDANCE_REJECTED        // FR-034: Moderator/admin rejected attendance
  ATTENDANCE_APPEALED        // FR-033.1: Student appealed rejection
  DISPUTE_RESOLVED           // FR-041: Moderator/admin resolved dispute
  
  DATA_EXPORTED              // FR-052: User exported attendance data
  ANALYTICS_ACCESSED         // Optional: Admin viewed analytics dashboard
}
```

**Metadata Examples**:

```json
// USER_ROLE_CHANGED
{
  "targetUserId": "clx789abc",
  "fromRole": "STUDENT",
  "toRole": "MODERATOR",
  "changedBy": "clx123admin"
}

// ATTENDANCE_VERIFIED
{
  "attendanceId": "clx456def",
  "eventId": "clx789ghi",
  "studentId": "clx101jkl",
  "verifiedBy": "clx123moderator",
  "previousStatus": "PENDING",
  "newStatus": "APPROVED"
}

// DATA_EXPORTED
{
  "exportId": "clx234mno",
  "format": "XLSX",
  "recordCount": 523,
  "filters": { "eventIds": ["clx789"], "status": "APPROVED" }
}
```

---

## Validation & Constraints Summary

| Entity | Constraint | Rule | Enforcement |
|--------|------------|------|-------------|
| User | Account Status | `SUSPENDED` users cannot login | Auth middleware |
| User | Soft Delete | `deletedAt != null` excluded from queries | Application layer |
| User | Role Change | Admin cannot change own role without confirmation | Server action validation (FR-008) |
| Event | Time Validation | `startDateTime - checkInBufferMins` must be future | Server action validation (FR-015) |
| Event | Deletion | Cannot delete if `hasAttendances = true` | Server action validation (FR-020) |
| Event | Moderator Scope | Moderators can only access own events (`createdById`) | Query filter (FR-026) |
| Attendance | Duplicate Prevention | Unique constraint on `(studentId, eventId)` | Database constraint |
| Attendance | Rejection Notes | `disputeNotes` required when `status = REJECTED` | Server action validation (FR-034) |
| Attendance | Verification | `verifiedBy`, `verifiedAt` required when `status != PENDING` | Server action validation (FR-035) |
| Attendance | Moderator Scope | Moderators can only verify for own events | Query join + filter (FR-042) |
| ExportRecord | Record Limit | Max 10,000 records per export | Server action validation |

---

## Analytics Aggregation Queries

**Key Metrics** (FR-054):

```typescript
// Total Events
const totalEvents = await prisma.event.count({
  where: { 
    deletedAt: null,
    createdAt: { gte: startDate, lte: endDate }
  }
});

// Total Attendances
const totalAttendances = await prisma.attendance.count({
  where: { 
    submittedAt: { gte: startDate, lte: endDate }
  }
});

// Verification Rate (FR-054)
const approvedCount = await prisma.attendance.count({
  where: { 
    status: 'APPROVED',
    submittedAt: { gte: startDate, lte: endDate }
  }
});
const verificationRate = (approvedCount / totalAttendances) * 100;

// Pending Verification Count
const pendingCount = await prisma.attendance.count({
  where: { status: 'PENDING' }
});

// Department Breakdown (FR-064)
const departmentStats = await prisma.attendance.groupBy({
  by: ['student.profile.department'],
  where: { 
    status: 'APPROVED',
    submittedAt: { gte: startDate, lte: endDate }
  },
  _count: { _all: true }
});

// Course Breakdown (FR-065)
const courseStats = await prisma.attendance.groupBy({
  by: ['student.profile.course'],
  where: { 
    status: 'APPROVED',
    submittedAt: { gte: startDate, lte: endDate }
  },
  _count: { _all: true }
});
```

**Chart Data Queries**:

```typescript
// Attendance Trends (FR-056) - Line Chart
const trendData = await prisma.attendance.groupBy({
  by: ['submittedAt'],
  where: { submittedAt: { gte: startDate, lte: endDate } },
  _count: { _all: true },
  orderBy: { submittedAt: 'asc' }
});

// Top Events (FR-057) - Bar Chart
const topEvents = await prisma.event.findMany({
  where: { deletedAt: null },
  select: {
    id: true,
    name: true,
    _count: { select: { attendances: true } }
  },
  orderBy: { attendances: { _count: 'desc' } },
  take: 10
});

// Verification Status Distribution (FR-059) - Pie Chart
const statusDistribution = await prisma.attendance.groupBy({
  by: ['status'],
  where: { submittedAt: { gte: startDate, lte: endDate } },
  _count: { _all: true }
});
```

---

## Migration Strategy

**Phase 3 Migration Steps**:

1. Add new enums: `AccountStatus`, `ExportFormat`, `ExportStatus`
2. Extend `User` model with account management fields
3. Extend `Event` model with ownership and audit fields
4. Extend `Attendance` model with verification workflow fields
5. Create `ExportRecord` model
6. Extend `SecurityEventType` enum with new event types
7. Add indexes for performance optimization
8. Run data migration to set default values:
   - `User.accountStatus` = `ACTIVE` for all existing users
   - `Event.createdById` = first admin user (or prompt for manual assignment)
   - `Event.hasAttendances` = `COUNT(attendances) > 0`

**Prisma Migrate Command**:
```bash
npx prisma migrate dev --name add_management_and_analytics
```

**Data Backfill Script** (if needed):
```typescript
// Set createdById for existing events (assign to first admin)
const firstAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
await prisma.event.updateMany({
  where: { createdById: null },
  data: { createdById: firstAdmin.id }
});

// Set hasAttendances flag for events
const eventsWithAttendances = await prisma.event.findMany({
  select: { id: true, _count: { select: { attendances: true } } }
});
for (const event of eventsWithAttendances) {
  await prisma.event.update({
    where: { id: event.id },
    data: { hasAttendances: event._count.attendances > 0 }
  });
}
```

---

## Relationships Diagram

```
User (extended)
├── 1:N → Event (createdBy) [FR-016, FR-026]
├── 1:N → Attendance (verified by) [FR-035]
├── 1:N → ExportRecord (exported by) [FR-052]
├── 1:N → User (suspended by, password reset by, deleted by) [Self-referential audit]
└── 1:1 → UserProfile (existing from Phase 1)

Event (extended)
├── N:1 → User (createdBy) [FR-016]
├── 1:N → Attendance (existing from Phase 2)
└── JSON → editHistory [FR-017]

Attendance (extended)
├── N:1 → User (student, existing from Phase 2)
├── N:1 → Event (existing from Phase 2)
└── N:1 → User (verifiedBy) [FR-035]

ExportRecord (new)
└── N:1 → User (exportedBy) [FR-052]

SecurityLog (extended)
├── N:1 → User (existing from Phase 1)
└── JSON → metadata [FR-010, FR-052]
```

---

## Next Steps

With the data model defined, proceed to:
1. Generate API contracts for CRUD operations
2. Create quickstart validation scenarios
3. Update agent context file with new models and relationships

**Status**: ✅ Data model design complete. Ready for contract generation (Phase 1 continued).
