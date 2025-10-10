# Quickstart Validation: Unified Dashboard Modernization

## Prerequisites

- Install dependencies: `npm install`
- Database ready with seeded events and attendance data (`npx prisma db seed` if necessary)
- Development server running: `npm run dev`
- Test accounts for admin, moderator, and student roles

## Scenario 1: Shared Shell Consistency

1. Sign in as an admin and navigate to `/dashboard/admin`.
2. Confirm global navigation, header, and action bar match the shared shell design (logo, primary links, global search).
3. Resize browser to 1280px → 768px → 375px widths; layout zones should reorder without clipping content.
4. Repeat steps 1-3 for moderator (`/dashboard/moderator`) and student (`/dashboard/student`) routes.

## Scenario 2: Reusable Widget Catalog

1. On each dashboard, locate metric cards and charts and verify legend, tooltip, and typography styling match across roles.
2. Toggle any timeframe filter or role-specific selector; ensure widget data updates without layout shifts >0.1 CLS.
3. Open DevTools network tab to confirm widgets request shared endpoints (`/api/dashboard/widgets`) with role-specific params.

## Scenario 3: Consolidated Tables and Filters

1. Visit admin attendance table and apply multiple filter combinations.
2. Confirm the same filter UI appears on the moderator dispute review table and student attendance history (with scoped options).
3. Verify pagination controls and bulk action bars are identical in structure and behavior.

## Scenario 4: Contextual Messaging

1. Force empty state by filtering to a future date range; verify headline, body copy, CTA, and icon align with messaging catalog.
2. Simulate loading by throttling network to Slow 3G; check that loading skeletons and progress indicators match the shared standard.
3. Trigger an error (e.g., via network offline mode) and ensure error banners provide guidance consistent across roles.

## Scenario 5: Accessibility Regression Sweep

1. Run keyboard-only navigation through each dashboard shell and confirm focus outlines and skip links remain intact.
2. Execute `npx @axe-core/playwright` (or browser Axe extension) to confirm no new WCAG 2.1 AA violations.
3. Review responsive charts at 200% zoom to ensure axes labels remain readable and interactive targets meet 44×44px minimum.
