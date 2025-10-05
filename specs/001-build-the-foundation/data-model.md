# Data Model: Landing Pages & Authentication Foundation

**Feature**: 001-build-the-foundation  
**Date**: 2025-10-06  
**Status**: Complete

## Overview

This document defines the data entities, relationships, validation rules, and state transitions for the Event Attendance System authentication and profile management.

---

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email (unique)  │◄─────┐
│ passwordHash    │      │
│ role (enum)     │      │
│ accountStatus   │      │
│ emailVerified   │      │
│ createdAt       │      │
│ lastLoginAt     │      │
└────────┬────────┘      │
         │               │
         │ 1:1           │ 1:N
         │               │
         ▼               │
┌─────────────────┐      │
│  UserProfile    │      │
├─────────────────┤      │
│ id (PK)         │      │
│ userId (FK)     │──────┘
│ idNumber        │
│ year            │
│ section         │
│ course          │
│ department      │
│ campus          │
│ currentSemester │
│ completedAt     │
│ updatedAt       │
└─────────────────┘

         ┌────────────────┐
         │    Session     │
         ├────────────────┤
         │ id (PK)        │
         │ userId (FK)    │──────┐
         │ accessToken    │      │
         │ refreshToken   │      │ N:1
         │ ipAddress      │      │
         │ userAgent      │      │
         │ deviceType     │      │
         │ createdAt      │      │
         │ expiresAt      │      │
         │ refreshedAt    │      │
         └────────────────┘      │
                                 │
                                 ▼
                          ┌──────────┐
                          │   User   │
                          └──────────┘
                                 ▲
                                 │ N:1
                                 │
         ┌────────────────┐      │
         │  SecurityLog   │      │
         ├────────────────┤      │
         │ id (PK)        │      │
         │ userId (FK)    │──────┘
         │ eventType      │
         │ success        │
         │ failReason     │
         │ ipAddress      │
         │ userAgent      │
         │ createdAt      │
         └────────────────┘
```

---

## Entities

### 1. User

**Purpose**: Represents an authenticated user with access to the system.

**Attributes**:

| Field           | Type          | Constraints                | Description                                |
| --------------- | ------------- | -------------------------- | ------------------------------------------ |
| `id`            | String (CUID) | PRIMARY KEY                | Unique identifier                          |
| `email`         | String        | UNIQUE, NOT NULL, INDEXED  | User's email (username)                    |
| `passwordHash`  | String        | NOT NULL                   | bcrypt hash (cost factor 12)               |
| `role`          | Enum          | NOT NULL                   | Student, Moderator, or Administrator       |
| `accountStatus` | String        | NOT NULL, DEFAULT 'active' | active, suspended, deleted                 |
| `emailVerified` | Boolean       | NOT NULL, DEFAULT false    | Email verification status (future feature) |
| `createdAt`     | DateTime      | NOT NULL, DEFAULT now()    | Registration timestamp                     |
| `lastLoginAt`   | DateTime      | NULLABLE                   | Last successful login timestamp            |

**Relationships**:

- **1:1** with `UserProfile` (optional until profile completion)
- **1:N** with `Session` (user can have multiple active sessions across devices)
- **1:N** with `SecurityLog` (user has audit trail)

**Validation Rules**:

- `email`: Must match RFC 5322 email format, max 254 characters
- `passwordHash`: Never exposed in API responses, only compared via bcrypt.compare()
- `role`: Must be one of three enum values (enforced by database)
- `accountStatus`: Only administrators can change status (future feature)

**State Transitions**:

```
[Registration] → accountStatus = 'active', emailVerified = false
[Email Verify] → emailVerified = true (future feature)
[Suspend] → accountStatus = 'suspended' (admin action, future)
[Delete] → accountStatus = 'deleted', soft delete (future)
```

---

### 2. UserProfile

**Purpose**: Academic and institutional details for a user, required for full system access.

**Attributes**:

| Field             | Type          | Constraints                   | Description                            |
| ----------------- | ------------- | ----------------------------- | -------------------------------------- |
| `id`              | String (CUID) | PRIMARY KEY                   | Unique identifier                      |
| `userId`          | String        | FOREIGN KEY, UNIQUE, NOT NULL | Reference to User.id                   |
| `idNumber`        | String        | NOT NULL                      | School/institution ID number           |
| `year`            | String        | NOT NULL                      | Academic year: 1st, 2nd, 3rd, 4th, 5th |
| `section`         | String        | NOT NULL                      | Class section                          |
| `course`          | String        | NOT NULL                      | Degree program/course name             |
| `department`      | String        | NOT NULL                      | Academic department                    |
| `campus`          | String        | NOT NULL                      | Campus location                        |
| `currentSemester` | String        | NOT NULL                      | 1st Sem, 2nd Sem, Summer               |
| `completedAt`     | DateTime      | NOT NULL, DEFAULT now()       | Profile completion timestamp           |
| `updatedAt`       | DateTime      | NOT NULL, AUTO UPDATE         | Last update timestamp                  |

**Relationships**:

- **N:1** with `User` (belongs to one user, CASCADE DELETE if user deleted)

**Validation Rules**:

- `year`: Must be one of: '1st', '2nd', '3rd', '4th', '5th' (dropdown enforced)
- `currentSemester`: Must be one of: '1st Sem', '2nd Sem', 'Summer' (dropdown enforced)
- All fields: Trim whitespace, min 1 character, max 100 characters
- `idNumber`: Alphanumeric, no special characters except hyphens

**State Transitions**:

```
[User Registers] → UserProfile does NOT exist (profile incomplete)
[Profile Completion] → UserProfile created with completedAt = now()
[Profile Update] → updatedAt = now() (future feature)
```

**Business Rules**:

- Profile MUST be completed before user can access role-specific dashboards
- After login, if UserProfile does not exist for userId, redirect to `/profile/complete`
- Once completed, user is redirected to role-specific dashboard based on User.role

---

### 3. Session

**Purpose**: Represents an active user session with access and refresh tokens.

**Attributes**:

| Field          | Type          | Constraints                    | Description                                       |
| -------------- | ------------- | ------------------------------ | ------------------------------------------------- |
| `id`           | String (CUID) | PRIMARY KEY                    | Unique identifier                                 |
| `userId`       | String        | FOREIGN KEY, NOT NULL, INDEXED | Reference to User.id                              |
| `accessToken`  | String        | UNIQUE, NOT NULL               | JWT access token (15min TTL)                      |
| `refreshToken` | String        | UNIQUE, NOT NULL               | JWT refresh token (7d TTL)                        |
| `ipAddress`    | String        | NULLABLE                       | Client IP address                                 |
| `userAgent`    | String        | NULLABLE                       | Browser user agent string                         |
| `deviceType`   | String        | NULLABLE                       | mobile, tablet, desktop (derived from user agent) |
| `createdAt`    | DateTime      | NOT NULL, DEFAULT now()        | Session creation timestamp                        |
| `expiresAt`    | DateTime      | NOT NULL                       | Refresh token expiration (createdAt + 7d)         |
| `refreshedAt`  | DateTime      | NULLABLE                       | Last token refresh timestamp                      |

**Relationships**:

- **N:1** with `User` (user can have multiple sessions, CASCADE DELETE if user deleted)

**Validation Rules**:

- `accessToken`: JWT signed with HS256, contains { userId, role }, 15min expiry
- `refreshToken`: JWT signed with HS256, contains { userId }, 7d expiry
- `expiresAt`: Must be > now() for valid session
- Tokens are unique (prevents token reuse attacks)

**State Transitions**:

```
[Login/Register] → Session created, tokens generated
[Token Refresh] → refreshedAt updated, old tokens invalidated, new tokens generated
[Logout] → Session deleted
[Token Expiry] → Session soft-deleted after expiresAt (cleanup job, future)
```

**Security Considerations**:

- Refresh tokens stored in httpOnly cookies (XSS protection)
- Access tokens never stored in cookies or localStorage (transmitted in Authorization header)
- On token refresh, old tokens are invalidated (prevents replay attacks)
- Session records enable tracking active devices and force logout (future feature)

---

### 4. Role (Enum)

**Purpose**: Defines user permission levels.

**Values**:

| Value           | Permissions (Current MVP)                                | Permissions (Future)                                              |
| --------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| `Student`       | View own profile, access student dashboard placeholder   | Mark own attendance, view attendance history, join events         |
| `Moderator`     | View own profile, access moderator dashboard placeholder | Create events, verify attendance, view event analytics            |
| `Administrator` | View own profile, access admin dashboard placeholder     | Full system access, user management, global analytics, audit logs |

**Validation Rules**:

- Must be one of three values (database enum constraint)
- Role cannot be changed by user themselves (only admins can change, future feature)
- Role is immutable during registration (user selects once, no edit in MVP)

**Business Rules**:

- Role determines dashboard URL: `/dashboard/student`, `/dashboard/moderator`, `/dashboard/admin`
- Future features will implement granular permissions per role

---

### 5. SecurityLog

**Purpose**: Audit trail for authentication and security events.

**Attributes**:

| Field        | Type          | Constraints                      | Description                                   |
| ------------ | ------------- | -------------------------------- | --------------------------------------------- |
| `id`         | String (CUID) | PRIMARY KEY                      | Unique identifier                             |
| `userId`     | String        | FOREIGN KEY, NULLABLE, INDEXED   | Reference to User.id (null if failed login)   |
| `eventType`  | String        | NOT NULL, INDEXED                | Event category                                |
| `success`    | Boolean       | NOT NULL                         | Whether event succeeded                       |
| `failReason` | String        | NULLABLE                         | Reason for failure (e.g., "Invalid password") |
| `ipAddress`  | String        | NULLABLE                         | Client IP address                             |
| `userAgent`  | String        | NULLABLE                         | Browser user agent                            |
| `createdAt`  | DateTime      | NOT NULL, DEFAULT now(), INDEXED | Event timestamp                               |

**Relationships**:

- **N:1** with `User` (SET NULL if user deleted, preserve audit trail)

**Validation Rules**:

- `eventType`: Must be one of: 'registration', 'login', 'logout', 'failed_login', 'password_change', 'token_refresh'
- `failReason`: Required if success = false, null if success = true
- Logs are append-only (never updated or deleted except by data retention policy)

**Indexed Fields**:

- `userId` + `createdAt`: Fast queries for user's recent activity
- `eventType` + `createdAt`: Fast queries for specific event types over time
- `createdAt`: Fast queries for recent events across all users

**Business Rules**:

- All authentication attempts MUST be logged (per FR-048)
- Failed login logs do NOT expose whether email exists (failReason is generic)
- Logs older than 90 days may be archived or deleted (future data retention policy)

**Example Log Entries**:

```typescript
// Successful registration
{
  eventType: 'registration',
  userId: 'clx123...',
  success: true,
  failReason: null,
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
}

// Failed login (wrong password)
{
  eventType: 'failed_login',
  userId: 'clx123...', // User exists, but wrong password
  success: false,
  failReason: 'Invalid credentials', // Generic message
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
}

// Failed login (email not found)
{
  eventType: 'failed_login',
  userId: null, // User doesn't exist
  success: false,
  failReason: 'Invalid credentials', // Same message as wrong password
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
}
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== Core Entities =====

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          Role
  accountStatus String   @default("active")
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  lastLoginAt   DateTime?

  // Relationships
  profile       UserProfile?
  sessions      Session[]
  securityLogs  SecurityLog[]

  @@index([email])
}

model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Academic details
  idNumber        String
  year            String   // 1st, 2nd, 3rd, 4th, 5th
  section         String
  course          String
  department      String
  campus          String
  currentSemester String   // 1st Sem, 2nd Sem, Summer

  // Metadata
  completedAt     DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum Role {
  Student
  Moderator
  Administrator
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Tokens
  accessToken  String   @unique
  refreshToken String   @unique

  // Client metadata
  ipAddress    String?
  userAgent    String?
  deviceType   String?  // mobile, tablet, desktop

  // Timestamps
  createdAt    DateTime @default(now())
  expiresAt    DateTime // Refresh token expiry (7 days from creation)
  refreshedAt  DateTime? // Last time tokens were refreshed

  @@index([userId])
  @@index([refreshToken])
}

model SecurityLog {
  id          String   @id @default(cuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Event details
  eventType   String   // registration, login, logout, failed_login, password_change, token_refresh
  success     Boolean
  failReason  String?

  // Client metadata
  ipAddress   String?
  userAgent   String?

  // Timestamp
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
  @@index([eventType, createdAt])
  @@index([createdAt])
}
```

---

## Validation Schemas (Zod)

```typescript
// src/lib/validations.ts
import { z } from "zod";

// === Registration ===
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .max(254, "Email too long"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z.string(),

    role: z.enum(["Student", "Moderator", "Administrator"], {
      errorMap: () => ({ message: "Please select a role" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// === Login ===
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),

  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// === Profile Completion ===
export const profileSchema = z.object({
  idNumber: z
    .string()
    .min(1, "ID Number is required")
    .max(50, "ID Number too long")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "ID Number can only contain letters, numbers, and hyphens"
    ),

  year: z.enum(["1st", "2nd", "3rd", "4th", "5th"], {
    errorMap: () => ({ message: "Please select a year" }),
  }),

  section: z
    .string()
    .min(1, "Section is required")
    .max(100, "Section too long")
    .trim(),

  course: z
    .string()
    .min(1, "Course is required")
    .max(100, "Course too long")
    .trim(),

  department: z
    .string()
    .min(1, "Department is required")
    .max(100, "Department too long")
    .trim(),

  campus: z
    .string()
    .min(1, "Campus is required")
    .max(100, "Campus too long")
    .trim(),

  currentSemester: z.enum(["1st Sem", "2nd Sem", "Summer"], {
    errorMap: () => ({ message: "Please select a semester" }),
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
```

---

## State Machine: User Authentication Flow

```
                    ┌─────────────────┐
                    │   Anonymous     │
                    │   Visitor       │
                    └────────┬────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
            [Register]            [Login (no profile)]
                  │                     │
                  ▼                     ▼
         ┌────────────────┐    ┌────────────────┐
         │ User Created   │    │ Authenticated  │
         │ (no profile)   │    │ (no profile)   │
         └───────┬────────┘    └───────┬────────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                   [Redirect to /profile/complete]
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Profile Completion  │
                 │ Form                │
                 └──────────┬──────────┘
                            │
                      [Submit Profile]
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Authenticated       │
                 │ (profile complete)  │
                 └──────────┬──────────┘
                            │
               ┌────────────┼────────────┐
               │            │            │
         [Student]   [Moderator]  [Administrator]
               │            │            │
               ▼            ▼            ▼
      /dashboard/student  /dashboard/moderator  /dashboard/admin
               │            │            │
               └────────────┼────────────┘
                            │
                       [Logout]
                            │
                            ▼
                    ┌─────────────────┐
                    │   Anonymous     │
                    │   Visitor       │
                    └─────────────────┘
```

---

## Database Indexes

**Performance Optimization**:

```sql
-- User lookups by email (login)
CREATE INDEX idx_user_email ON User(email);

-- Session validation (access token verification)
CREATE INDEX idx_session_refresh_token ON Session(refreshToken);
CREATE INDEX idx_session_user_id ON Session(userId);

-- Security log queries
CREATE INDEX idx_security_log_user_created ON SecurityLog(userId, createdAt);
CREATE INDEX idx_security_log_event_created ON SecurityLog(eventType, createdAt);
CREATE INDEX idx_security_log_created ON SecurityLog(createdAt);

-- Profile lookup (check if profile exists for user)
-- Covered by UNIQUE constraint on UserProfile.userId
```

---

## Data Retention & Privacy

**GDPR Compliance Considerations** (future implementation):

1. **Right to Access**: Users can request export of their User, UserProfile, Session, and SecurityLog records
2. **Right to Deletion**: Soft delete User (accountStatus = 'deleted'), CASCADE to Profile and Sessions, SET NULL on SecurityLogs
3. **Data Minimization**: Only collect necessary fields (e.g., idNumber for institutional identification)
4. **Retention Policy**:
   - Active sessions: 7 days (refresh token TTL)
   - Expired sessions: Archive after 30 days, delete after 90 days
   - Security logs: Retain for 90 days for audit, then archive or delete
   - Deleted users: Soft delete immediately, hard delete after 30-day grace period

---

**Status**: ✅ Data Model Complete - All entities, relationships, and validation rules defined
