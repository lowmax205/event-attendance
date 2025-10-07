# Research: Management System & Analytics

**Feature**: 003-complete-the-event  
**Date**: 2025-10-08  
**Status**: Complete

## Technology Decisions

### 1. Chart Library for Analytics Dashboard

**Decision**: **Recharts 2.x**

**Rationale**:
- Native React components with TypeScript support
- Built on D3.js (industry standard)
- Excellent Next.js SSR compatibility
- Supports all required chart types: Line, Bar, Pie
- Responsive by default
- Active maintenance and large community
- MIT license
- Composable API fits shadcn/ui patterns
- Accessibility features built-in

**Alternatives Considered**:
- **Chart.js + react-chartjs-2**: More imperative API, less React-idiomatic, heavier bundle
- **Victory**: Similar features but larger bundle size, less TypeScript support
- **Nivo**: Beautiful but opinionated styling conflicts with shadcn/ui Tailwind approach
- **Apache ECharts**: Powerful but overkill for requirements, larger bundle, less React-native

**Implementation Notes**:
- Install: `npm install recharts`
- Use ResponsiveContainer for all charts (mobile responsiveness)
- Customize colors using Tailwind CSS variables for theme consistency
- Implement loading skeletons to prevent CLS during data fetch

---

### 2. Excel Export Library

**Decision**: **xlsx (SheetJS Community Edition) 0.20.x**

**Rationale**:
- Industry standard for Excel generation in Node.js
- Supports .xlsx format (modern Excel 2007+)
- Server-side generation (secure, no client-side data exposure)
- Handles large datasets efficiently (streaming support)
- Auto-sizing columns, formatting headers, cell styling
- Apache 2.0 license (permissive)
- TypeScript definitions available (@types/xlsx)
- Works seamlessly with Next.js Server Actions

**Alternatives Considered**:
- **exceljs**: More features (formulas, pivot tables) but heavier, unnecessary for requirements
- **node-xlsx**: Simpler but limited formatting capabilities
- **papaparse** (CSV only): Good for CSV but we need .xlsx support

**Implementation Notes**:
- Install: `npm install xlsx @types/xlsx`
- Use `XLSX.utils.json_to_sheet()` for data conversion
- Apply column widths with `ws['!cols']`
- Style headers with cell formatting (`ws[cell].s`)
- Stream large exports to avoid memory issues (>5000 records)

---

### 3. CSV Export Approach

**Decision**: **Manual CSV generation with RFC 4180 compliance**

**Rationale**:
- Simple format doesn't warrant external library overhead
- Full control over escaping, quoting, newlines
- No additional dependencies
- Better performance for small to medium datasets
- Easy to implement with array join/map operations

**Alternatives Considered**:
- **papaparse**: Overkill for simple CSV generation (primarily for parsing)
- **csv-stringify**: Adds dependency for trivial functionality

**Implementation Notes**:
```typescript
// Escape double quotes and wrap fields containing commas/newlines
const escapeCSV = (value: string) => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

// Generate CSV string
const generateCSV = (headers: string[], rows: string[][]) => {
  const headerRow = headers.map(escapeCSV).join(',');
  const dataRows = rows.map(row => row.map(escapeCSV).join(',')).join('\n');
  return `${headerRow}\n${dataRows}`;
};
```

---

### 4. Data Table Component Architecture

**Decision**: **Custom DataTable wrapper around shadcn/ui Table + TanStack Table (headless)**

**Rationale**:
- TanStack Table (formerly React Table) provides headless logic (sorting, filtering, pagination)
- shadcn/ui Table provides accessible, styled UI primitives
- Separation of concerns: Logic (TanStack) + Presentation (shadcn/ui)
- Type-safe column definitions with TypeScript
- Server-side pagination support (important for 10k+ records)
- Built-in filter/sort state management
- Compatible with Next.js Server Actions

**Alternatives Considered**:
- **AG Grid**: Enterprise-grade but commercial license for advanced features, overkill
- **MUI DataGrid**: Heavy bundle, requires Material-UI (conflicts with shadcn/ui)
- **Pure shadcn/ui Table**: Lacks built-in sorting/filtering/pagination logic
- **Custom from scratch**: Reinventing wheel, high maintenance burden

**Implementation Notes**:
- Install: `npm install @tanstack/react-table`
- Create reusable `<DataTable>` component accepting generic column definitions
- Implement server-side pagination to limit initial payload
- Use URL search params for filter/sort state persistence (FR-070)
- Add debounced search input (300ms delay to reduce API calls)
- Skeleton loader during data fetch (prevent CLS)

**Example Column Definition**:
```typescript
import { ColumnDef } from '@tanstack/react-table';

const userColumns: ColumnDef<User>[] = [
  { accessorKey: 'fullName', header: 'Full Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  { accessorKey: 'role', header: 'Role', enableColumnFilter: true },
  { accessorKey: 'status', header: 'Status', enableColumnFilter: true },
  // Actions column with edit/delete buttons
];
```

---

### 5. Analytics Data Aggregation Strategy

**Decision**: **Prisma aggregations + optional Redis caching for expensive queries**

**Rationale**:
- Prisma provides `aggregate`, `groupBy`, `count` operations (built-in)
- Direct database queries ensure data freshness
- Redis caching layer for time-period filtered analytics (e.g., "Last 30 days")
- Cache TTL: 5 minutes for aggregations (balance freshness vs performance)
- No need for separate analytics database at current scale (<10k users)

**Alternatives Considered**:
- **Pre-computed materialized views**: Adds complexity, overkill for scale
- **Separate analytics database**: Premature optimization, sync overhead
- **Real-time stream processing**: Unnecessary, batch aggregation sufficient

**Implementation Notes**:
```typescript
// Example: Calculate verification rate
const verificationRate = await prisma.attendance.aggregate({
  where: { 
    submittedAt: { gte: startDate, lte: endDate }
  },
  _count: { _all: true },
  _sum: { 
    _all: true,
    status: { equals: 'APPROVED' }
  }
});

const rate = (verificationRate._sum.status / verificationRate._count._all) * 100;
```

- Use Prisma `groupBy` for department/course breakdowns (FR-064, FR-065)
- Implement Redis caching in `/lib/analytics/cache.ts`
- Cache key pattern: `analytics:{period}:{metric}:{timestamp}`
- Invalidate cache on new attendance approval/rejection

---

### 6. Role-Based Access Control (RBAC) Enforcement

**Decision**: **Middleware-based route protection + Server Action-level checks**

**Rationale**:
- Defense in depth: Both route-level and action-level validation
- Middleware intercepts unauthorized access before page load (UX + security)
- Server Actions validate user permissions before data mutation
- Moderator scope filtering (own events only) enforced in Prisma queries with `where` clause

**Implementation Pattern**:
```typescript
// middleware.ts - Route protection
export function middleware(request: NextRequest) {
  const user = await getUser(request);
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/dashboard/admin') && user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (path.startsWith('/dashboard/moderator') && !['MODERATOR', 'ADMIN'].includes(user?.role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

// Server Action - Data-level protection
export async function updateUser(userId: string, data: UserUpdate) {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Additional check: prevent self-role-downgrade (FR-008)
  if (userId === currentUser.id && data.role && data.role !== currentUser.role) {
    throw new Error('Cannot change your own role');
  }
  
  // ... update logic
}

// Moderator scope filtering example
export async function getModeratorEvents(moderatorId: string) {
  return prisma.event.findMany({
    where: { createdById: moderatorId }, // FR-026: Own events only
    orderBy: { startDateTime: 'desc' }
  });
}
```

---

### 7. Form Validation Strategy

**Decision**: **React Hook Form + Zod schemas (existing pattern from Phase 1 & 2)**

**Rationale**:
- Already in use (consistency across project)
- Type-safe validation with TypeScript inference
- Client-side validation (immediate feedback) + server-side validation (security)
- Supports nested objects, arrays, custom validators
- Integrates seamlessly with shadcn/ui form components

**New Schemas to Create**:
- `userManagementSchema`: Create/edit user forms (FR-011)
- `eventManagementSchema`: Create/edit event forms (FR-014, FR-017)
- `verificationSchema`: Approve/reject attendance with notes (FR-034, FR-038)
- `exportFilterSchema`: Export filter parameters (FR-048)

---

## Best Practices Research

### Data Table Performance Optimization

**Findings**:
1. **Virtualization**: For tables >1000 rows, use `@tanstack/react-virtual` to render only visible rows
2. **Server-side pagination**: Essential for 10k+ records (FR-067: 50 records/page)
3. **Debounced filters**: 300-500ms delay for search inputs to reduce API calls
4. **Skeleton loaders**: Prevent CLS during data fetch (use shadcn/ui Skeleton)
5. **Memoization**: Wrap column definitions in `useMemo` to prevent re-renders

**Reference Implementation**:
- shadcn/ui DataTable example: https://ui.shadcn.com/docs/components/data-table
- TanStack Table docs: https://tanstack.com/table/latest

### Chart Accessibility Best Practices

**Findings**:
1. **Color contrast**: Ensure WCAG AA compliance (4.5:1 ratio) for chart colors
2. **Alternative text**: Provide `<title>` and `<desc>` SVG elements for screen readers
3. **Keyboard navigation**: Enable tooltips on keyboard focus (not just hover)
4. **Data tables fallback**: Provide tabular view option for screen reader users
5. **Reduced motion**: Respect `prefers-reduced-motion` for animations

**Implementation**:
```typescript
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={data} aria-label="Attendance trends over time">
    <title>Attendance Trends</title>
    <desc>Line chart showing daily attendance submissions from {startDate} to {endDate}</desc>
    {/* ... chart components */}
  </LineChart>
</ResponsiveContainer>
```

### Export File Size Limits

**Findings**:
- **10,000 records**: Reasonable limit for synchronous generation (~2-3MB Excel file)
- **Streaming**: For >10k records, implement async background job + email download link
- **Compression**: Excel files are already ZIP-compressed (.xlsx format)
- **Memory**: Node.js default heap ~512MB; 10k records ~50MB in memory (safe margin)

**Implementation Strategy**:
- Synchronous export for \u226410k records (FR-048: loading indicator)
- Display warning if filter yields >10k records, suggest narrowing filters
- Future enhancement: Queue-based background export for >10k records (out of scope for Phase 3)

---

## Integration Considerations

### Extending Prisma Schema

**New Fields Required**:

**User model**:
```prisma
model User {
  // ... existing fields
  accountStatus     AccountStatus @default(ACTIVE) // FR-007
  suspendedAt       DateTime?
  suspendedBy       User?         @relation("SuspendedUsers", fields: [suspendedById], references: [id])
  suspendedById     String?
  passwordResetAt   DateTime?
  passwordResetBy   User?         @relation("PasswordResets", fields: [passwordResetById], references: [id])
  passwordResetById String?
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
}
```

**Event model**:
```prisma
model Event {
  // ... existing fields
  createdBy     User   @relation(fields: [createdById], references: [id])
  createdById   String
  editHistory   Json?  // Store edit timestamps and editors
  hasAttendance Boolean @default(false) // Cached flag for deletion prevention (FR-020)
}
```

**Attendance model**:
```prisma
model Attendance {
  // ... existing fields
  verifiedBy       User?     @relation(fields: [verifiedById], references: [id])
  verifiedById     String?
  verifiedAt       DateTime?
  disputeNotes     String?   // Moderator rejection notes (FR-034)
  appealMessage    String?   // Student appeal (FR-033.1)
  resolutionNotes  String?   // Final resolution notes (FR-041)
}
```

**New models**:
```prisma
model ExportRecord {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  exportedBy   User     @relation(fields: [exportedById], references: [id])
  exportedById String
  format       ExportFormat
  filters      Json     // Store filter criteria
  recordCount  Int
  status       ExportStatus @default(PENDING)
}

enum ExportFormat {
  CSV
  XLSX
}

enum ExportStatus {
  PENDING
  COMPLETED
  FAILED
}
```

### Database Indexes

**Performance Optimization**:
```prisma
@@index([createdById]) // Fast moderator event lookup (FR-026)
@@index([status, startDateTime]) // Event filtering (FR-027, FR-028)
@@index([verifiedById, verifiedAt]) // Attendance management queries
@@index([submittedAt]) // Analytics time-series queries
@@index([status]) // Verification status filtering (FR-029)
```

---

## Security Considerations

1. **Session Invalidation** (FR-009): Invalidate JWT refresh tokens on role/status change
   - Implement token blacklist in Redis with TTL = token expiration
   - Middleware checks blacklist before allowing request

2. **Audit Logging** (FR-010, FR-052): Log all sensitive operations
   - User management actions: Log to SecurityLog with admin ID, timestamp, action type
   - Export actions: Log to ExportRecord with user ID, filters, timestamp
   - Analytics access: Optional logging (consider privacy implications)

3. **Rate Limiting**: Apply to export endpoints
   - Max 10 exports per hour per user (prevent abuse)
   - Use existing @upstash/ratelimit pattern from Phase 1

4. **Input Sanitization**: Validate all form inputs server-side
   - Zod schemas enforce type safety
   - Prisma ORM prevents SQL injection
   - Sanitize file names for QR code downloads (FR-019)

---

## Performance Targets Validation

| Metric | Target | Strategy |
|--------|--------|----------|
| Page Load (3G) | <2s | Code split dashboard routes, SSR initial data, defer chart rendering |
| LCP | <2.5s | Optimize chart bundle size, lazy load heavy components, skeleton loaders |
| FID | <100ms | Debounce search inputs, optimistic UI updates, client-side caching |
| CLS | <0.1 | Fixed dimensions for charts/tables, skeleton loaders, avoid dynamic content |
| Lighthouse Score | \u226590 | Follow all above strategies + image optimization + minimize JS bundle |

**Monitoring**:
- Manual Lighthouse audits during development
- Chrome DevTools Performance panel for LCP/FID/CLS measurement
- Network throttling to simulate 3G (Slow 3G preset in DevTools)

---

## Open Questions Resolved

1. **Chart library choice**: Recharts (decided above)
2. **Excel library**: xlsx/SheetJS (decided above)
3. **Data table approach**: TanStack Table + shadcn/ui (decided above)
4. **Analytics caching**: Redis with 5min TTL (decided above)
5. **RBAC enforcement**: Middleware + Server Actions (decided above)

All technical unknowns have been resolved. Ready to proceed to Phase 1: Design & Contracts.
