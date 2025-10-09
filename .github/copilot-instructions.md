# event-attendance Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-06

## Active Technologies

- TypeScript 5.x with Next.js 15.5.4 (React 18.3.1), strict mode enabled + Next.js App Router, Prisma 6.16.3 (PostgreSQL), React Hook Form 7.64.0, Zod 4.1.11, shadcn/ui (Radix UI), jose 6.1.0 (JWT), bcryptjs 3.0.2, chart library (Recharts recommended for React/Next.js compatibility) (003-complete-the-event)
- PostgreSQL via Prisma ORM for user/event/attendance data; Cloudinary for photos/signatures (003-complete-the-event)

- TypeScript 5.x with Next.js 15.5.4 (React 18.3.1), strict mode enabled + Next.js App Router, Prisma 6.16.3 (PostgreSQL), React Hook Form 7.64.0, Zod 4.1.11, shadcn/ui (Radix UI), Cloudinary SDK, jose 6.1.0 (JWT), bcryptjs 3.0.2 (002-extend-the-event)

- PostgreSQL (via Prisma ORM) for attendance/event data; Cloudinary for photos/signatures (002-extend-the-event)

## Project Structure

```
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x with Next.js 15.5.4 (React 18.3.1), strict mode enabled: Follow standard conventions

## AI Tool Usage

**Important**: For comprehensive guidelines on when and how to use AI assistant tools (Context7, Linear, Playwright), see [tool-usage-rules.md](./tool-usage-rules.md).

### Quick Reference

- **Context7**: Fetch library docs before implementing features with Recharts, Prisma, Zod, shadcn/ui, etc.
- **Linear**: Document bugs, progress updates, and blockers found during development
- **Playwright**: Test all UI components and user flows via browser automation

### Required for Phase 3 Tasks

All implementation tasks (T058-T065) must:

1. ✅ Review library documentation via Context7 before coding
2. ✅ Test UI components with Playwright browser tools
3. ✅ Document issues and progress in Linear
4. ✅ Verify no console errors or network failures
5. ✅ Take screenshots for visual verification

See [tool-usage-rules.md](./tool-usage-rules.md) for detailed workflows and examples.

## Recent Changes

- 003-complete-the-event: Added TypeScript 5.x with Next.js 15.5.4 (React 18.3.1), strict mode enabled + Next.js App Router, Prisma 6.16.3 (PostgreSQL), React Hook Form 7.64.0, Zod 4.1.11, shadcn/ui (Radix UI), jose 6.1.0 (JWT), bcryptjs 3.0.2, chart library (Recharts recommended for React/Next.js compatibility)

- 001-build-the-foundation: Initial project setup with TypeScript 5.x, Next.js 15.5.4 (React 18.3.1), Prisma 6.16.3 (PostgreSQL), React Hook Form 7.64.0, Zod 4.1.11, shadcn/ui (Radix UI)
- 002-extend-the-event: Added TypeScript 5.x with Next.js 15.5.4 (React 18.3.1), strict mode enabled + Next.js App Router, Prisma 6.16.3 (PostgreSQL), React Hook Form 7.64.0, Zod 4.1.11, shadcn/ui (Radix UI), Cloudinary SDK, jose 6.1.0 (JWT), bcryptjs 3.0.2

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
