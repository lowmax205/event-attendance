# Event Attendance System

A modern, full-stack Event Attendance System built with Next.js 15, featuring role-based authentication and profile management for educational institutions.

## Features

- 🎨 Modern, responsive landing pages (Home, Events, RoadMap)
- 🌓 Dynamic theme switching (Light/Dark/System) with next-themes
- 🔐 Role-based authentication (Student, Moderator, Administrator)
- 📝 Academic profile completion with 7 required fields
- 🛡️ Comprehensive security: bcrypt hashing, JWT sessions, rate limiting
- ♿ WCAG 2.1 AA accessibility compliant
- ⚡ Performance optimized: FCP <1.8s, Lighthouse score ≥90
- 🎨 Green/yellow branding theme

## Prerequisites

- **Node.js**: 18+ ([Download](https://nodejs.org/))
- **PostgreSQL**: 12+ ([Download](https://www.postgresql.org/download/))
- **Upstash Redis** account ([Sign up](https://upstash.com/))

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router + Server Actions)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Theming**: next-themes (Light/Dark/System modes)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Custom JWT with bcryptjs
- **Forms**: React Hook Form + Zod validation
- **Rate Limiting**: Upstash Redis
- **UI Components**: shadcn/ui (Dialog, Input, Button, Select, etc.)

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
- SecurityLog (audit trail)

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

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Home landing page
│   ├── events/            # Events landing page
│   ├── roadmap/           # RoadMap landing page
│   ├── profile/complete/  # Profile completion page
│   ├── dashboard/         # Role-specific dashboards
│   └── actions/           # Server Actions (auth, profile)
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Persistent navigation bar
│   ├── auth-modal.tsx    # Authentication modal
│   ├── login-form.tsx    # Login form
│   ├── register-form.tsx # Registration form
│   └── profile-form.tsx  # Profile completion form
├── lib/                   # Utilities and business logic
│   ├── db.ts             # Prisma client singleton
│   ├── auth.ts           # bcrypt + JWT utilities
│   ├── session.ts        # Session management
│   ├── rate-limit.ts     # Rate limiting setup
│   └── validations.ts    # Zod schemas
├── hooks/                 # Custom React hooks
│   └── use-auth.ts       # Authentication hook
└── types/                 # TypeScript type definitions
    ├── auth.ts           # Auth types
    └── profile.ts        # Profile types
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

For comprehensive manual testing scenarios, see [quickstart.md](./specs/001-build-the-foundation/quickstart.md).

Tests cover:
1. Landing page navigation
2. User registration flow
3. Profile completion
4. Login flow
5. Rate limiting (5 attempts/hour per email)
6. Accessibility (WCAG 2.1 AA)
7. Performance (Lighthouse ≥90)
8. Security (JWT, bcrypt, headers, XSS prevention)
9. Role-based dashboard access
10. Logout and session invalidation

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
