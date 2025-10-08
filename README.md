# Event Attendance System

A modern, full-stack Event Attendance System built with Next.js 15, featuring role-based authentication, QR code-based attendance tracking, and comprehensive management capabilities for educational institutions.

## Features

### Phase 1: Foundation

- 🎨 Modern, responsive landing pages (Home, Events, RoadMap)
- 🌓 Dynamic theme switching (Light/Dark/System) with next-themes
- 🔐 Role-based authentication (Student, Moderator, Administrator)
- 📝 Academic profile completion with 7 required fields
- 🛡️ Comprehensive security: bcrypt hashing, JWT sessions, rate limiting
- ♿ WCAG 2.1 AA accessibility compliant
- ⚡ Performance optimized: FCP <1.8s, Lighthouse score ≥90
- 🎨 Green/yellow branding theme

### Phase 2: QR Attendance & Dashboards

- 📱 QR code-based attendance submission with photo capture (front/back)
- ✍️ Digital signature capture for attendance verification
- 📍 GPS location verification with distance validation
- 📊 Role-specific dashboards (Student, Moderator, Administrator)
- 🔔 Real-time attendance status tracking (PENDING/APPROVED/REJECTED/DISPUTED)
- 📋 Attendance history with filtering capabilities
- 🎯 Event creation and management with QR code generation

### Phase 3: Management System & Analytics (NEW)

- 👥 **User Management** (Admin): Create, suspend, delete users, change roles, reset passwords
- 📊 **Analytics Dashboard** (Admin): Interactive charts for attendance trends, event statistics, department/course breakdowns
- 📋 **Event Management** (Moderator/Admin): Create, edit, delete events with creator ownership
- ✅ **Attendance Verification** (Moderator/Admin): Approve/reject submissions with notes, dispute resolution
- 📤 **Data Export**: Export attendance records to CSV/Excel with filtering
- 🔍 **Drill-down Navigation**: Click on chart elements to view detailed filtered records
- 🔒 **Enhanced Security**: Role-based route protection, account status enforcement, comprehensive audit logging

## Prerequisites

- **Node.js**: 18+ ([Download](https://nodejs.org/))
- **PostgreSQL**: 12+ ([Download](https://www.postgresql.org/download/))
- **Upstash Redis** account ([Sign up](https://upstash.com/))

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router + Server Actions)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Theming**: next-themes (Light/Dark/System modes)
- **Database**: PostgreSQL + Prisma ORM 6.16.3
- **Authentication**: Custom JWT with bcryptjs, jose 6.1.0
- **Forms**: React Hook Form 7.64.0 + Zod 4.1.11 validation
- **Rate Limiting**: Upstash Redis
- **UI Components**: shadcn/ui (Dialog, Input, Button, Select, etc.)
- **Charts**: Recharts 2.15.4 (analytics visualizations)
- **Data Tables**: TanStack Table 8+ (headless table logic)
- **Export**: xlsx (SheetJS) for Excel export, custom CSV generator
- **Storage**: Cloudinary for photos/signatures

## Getting Started

### 1. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

- **DATABASE_URL**: PostgreSQL connection string
  - Example: `postgresql://username:password@localhost:5432/event_attendance`
- **JWT_SECRET**: Generate with `openssl rand -base64 32`
- **JWT_ACCESS_EXPIRY**: Token lifetime, e.g., `"1h"` for 1 hour
- **JWT_REFRESH_EXPIRY**: Refresh token lifetime, e.g., `"30d"` for 30 days
- **UPSTASH_REDIS_REST_URL**: Your Upstash Redis URL
- **UPSTASH_REDIS_REST_TOKEN**: Your Upstash Redis token

**Time string format**: Use `"1h"` for 1 hour, `"30d"` for 30 days, `"15m"` for 15 minutes, etc.

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Run Prisma migrations to create the database schema:

```bash
npm run db:migrate
```

This creates tables for:

- User (authentication)
- UserProfile (academic details)
- Session (JWT sessions with single active session constraint)
- Event (event management with QR codes)
- Attendance (QR-based attendance with verification workflow)
- ExportRecord (data export audit trail)
- SecurityLog (comprehensive audit trail)
- SystemConfig (system-wide configuration)

### 4. Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Database Management (Optional)

View and edit database records with Prisma Studio:

```bash
npm run db:studio
```

## Project Structure

```text
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Home landing page
│   ├── events/            # Events landing page
│   ├── roadmap/           # RoadMap landing page
│   ├── attendance/        # QR attendance submission
│   ├── profile/complete/  # Profile completion page
│   ├── dashboard/         # Role-specific dashboards
│   │   ├── admin/         # Admin dashboard (users, analytics, attendance)
│   │   ├── moderator/     # Moderator dashboard (events, attendance)
│   │   └── student/       # Student dashboard (attendance history)
│   └── api/               # API routes
├── actions/               # Server Actions
│   ├── admin/            # User management, analytics
│   ├── moderator/        # Event & attendance management
│   ├── attendance/       # Attendance submission & verification
│   ├── auth/             # Authentication
│   ├── events/           # Event CRUD
│   ├── export/           # CSV/Excel export
│   └── profile/          # Profile management
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   │   ├── admin/        # User management, analytics charts
│   │   ├── moderator/    # Event/attendance management
│   │   └── shared/       # Data tables, filters, export buttons
│   ├── attendance/       # QR scanner, camera, signature
│   ├── navigation.tsx    # Persistent navigation bar
│   ├── auth-modal.tsx    # Authentication modal
│   └── profile-form.tsx  # Profile completion form
├── lib/                   # Utilities and business logic
│   ├── db.ts             # Prisma client singleton
│   ├── auth/             # JWT, session, hashing
│   ├── analytics/        # Data aggregations
│   ├── export/           # CSV/Excel generators
│   ├── security/         # Audit logging, CORS, headers
│   ├── events/           # Event utilities
│   └── validations/      # Zod schemas
├── hooks/                 # Custom React hooks
│   ├── use-auth.ts       # Authentication hook
│   ├── use-camera.ts     # Camera capture
│   ├── use-qr-scanner.ts # QR code scanning
│   └── use-geolocation.ts# GPS location
└── types/                 # TypeScript type definitions
prisma/
└── schema.prisma          # Database schema
```

## Build

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Manual Testing

For comprehensive manual testing scenarios, see:

- **Phase 1**: [quickstart.md](./specs/001-build-the-foundation/quickstart.md)
- **Phase 2**: [quickstart.md](./specs/002-extend-the-event/quickstart.md)
- **Phase 3**: [quickstart.md](./specs/003-complete-the-event/quickstart.md)

### Automated Validation (Phase 3)

Run the automated validation script to verify Phase 3 implementation:

```powershell
# 1. Ensure dev server is running
npm run dev

# 2. Run validation script (in new terminal)
.\scripts\validate-phase3.ps1
```

The script will:

- ✅ Check TypeScript compilation (no errors)
- ✅ Verify production build (<500KB bundle sizes)
- ✅ Validate database connection and migrations
- ✅ Confirm all required components exist
- ✅ Generate manual test checklist (~90 minutes)

See [scripts/README.md](./scripts/README.md) for details.

### Manual Test Scenarios

Tests cover:

1. Landing page navigation
2. User registration flow
3. Profile completion
4. Login flow
5. QR attendance submission
6. Event creation and management
7. Attendance verification workflow
8. User management (admin)
9. Analytics dashboard
10. Data export (CSV/Excel)
11. Rate limiting (5 attempts/hour per email)
12. Accessibility (WCAG 2.1 AA)
13. Performance (Lighthouse ≥90)
14. Security (JWT, bcrypt, headers, XSS prevention)
15. Role-based dashboard access
16. Logout and session invalidation

## Security Features

- ✅ bcrypt password hashing (cost factor 12)
- ✅ JWT access tokens (1 hour expiry)
- ✅ JWT refresh tokens (30 days expiry, httpOnly cookies)
- ✅ Single active session per user (new login invalidates old sessions)
- ✅ Rate limiting: 5 failed login attempts per hour per email
- ✅ Input sanitization (XSS prevention)
- ✅ Security headers: CSP, X-Frame-Options, HSTS
- ✅ CORS allowlisting
- ✅ Security audit logging (all auth events)

## Accessibility

This application meets WCAG 2.1 Level AA standards:

- ♿ Semantic HTML with ARIA labels
- ⌨️ Full keyboard navigation support
- 👆 Minimum 44×44px touch targets
- 🎨 4.5:1 color contrast ratios
- 📱 Screen reader compatible
- 🔍 Focus indicators for all interactive elements

## Performance

- ⚡ First Contentful Paint (FCP) <1.8s on 3G
- 📊 Lighthouse performance score ≥90
- 🖼️ Optimized images (WebP, responsive sizes)
- 📦 Code splitting by route
- 🚀 Server Components for zero-JS landing pages

## License

See [LICENSE](./LICENSE) file for details.

## Contributing

This is a private educational project. For questions or contributions, please contact the project maintainers.
