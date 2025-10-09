# AI Assistant Tool Usage Rules

## Library Documentation (Context7)

### When to Use

Before implementing features with external libraries (Recharts, Prisma, shadcn/ui, React Hook Form, Zod, jose, etc.)

### Required Usage

Use `#mcp_context7_get-library-docs` to fetch up-to-date documentation when:

- Implementing chart components (Recharts)
- Creating form validation schemas (Zod, React Hook Form)
- Working with database queries (Prisma)
- Implementing authentication flows (jose, bcryptjs)
- Using shadcn/ui components
- Integrating Cloudinary SDK

### Workflow

1. Use `#mcp_context7_resolve-library-id` to find the correct library identifier
2. Use `#mcp_context7_get-library-docs` with specific topic to get relevant API documentation
3. Implement feature following latest best practices from documentation

### Example

```
Before creating the AttendanceTrendsChart:
1. #mcp_context7_resolve-library-id "recharts"
2. #mcp_context7_get-library-docs with topic "LineChart"
3. Implement chart using latest Recharts API patterns
```

---

## Issue Tracking (Linear)

### When to Use

For documenting bugs, feature requests, or blockers during development

### Required Usage

Use `#mcp_linear_create_comment` to:

- Document bugs found during validation (T065)
- Report integration issues or blockers
- Link code changes to Linear issues
- Track implementation decisions

### Comment Format

Include:

- **Issue ID**: Reference to specific Linear issue
- **Clear Description**: What happened or what was changed
- **Code Snippets**: Relevant code (if applicable)
- **Affected Files**: List of files modified or impacted
- **Next Steps**: Proposed fix or follow-up actions

### Example

```
After finding a bug in user suspension:
#mcp_linear_create_comment on issue "T065"
Body: "Found validation bug in user suspension flow.
Error: Cannot suspend user with active attendance records.
Files: src/actions/admin/users.ts:45
Fix: Add pre-check for active attendance before suspension."
```

---

## Web Application Testing (Playwright)

### When to Use

For manual validation scenarios from `specs/003-complete-the-event/quickstart.md` (T065)

### Required Browser Tools

- `#mcp_playwright_browser_navigate` - Navigate to pages
- `#mcp_playwright_browser_snapshot` - Capture accessibility snapshots
- `#mcp_playwright_browser_click` - Click UI elements
- `#mcp_playwright_browser_fill_form` - Fill form fields
- `#mcp_playwright_browser_type` - Type into inputs
- `#mcp_playwright_browser_take_screenshot` - Visual verification
- `#mcp_playwright_browser_console_messages` - Check for errors
- `#mcp_playwright_browser_network_requests` - Monitor API calls
- `#mcp_playwright_browser_wait_for` - Wait for dynamic content

### Standard Testing Flow

1. **Setup**: Ensure dev server is running (`npm run dev`)
2. **Navigate**: Go to the page under test
3. **Initial State**: Take snapshot of initial page state
4. **Interact**: Perform user actions (click, fill, submit)
5. **Verify**: Check results (screenshot, console, network)
6. **Document**: Report any failures or issues

### Test Scenarios (from quickstart.md)

#### User Management Page

```
1. #mcp_playwright_browser_navigate to http://localhost:3000/dashboard/admin/users
2. #mcp_playwright_browser_snapshot
3. #mcp_playwright_browser_click on "Create User" button
4. #mcp_playwright_browser_fill_form with user details
5. #mcp_playwright_browser_take_screenshot
6. #mcp_playwright_browser_console_messages to check errors
```

#### Event Management

```
1. Navigate to /dashboard/moderator/events
2. Test event creation flow
3. Test event editing
4. Test event deletion
5. Verify QR code generation
```

#### Attendance Verification

```
1. Navigate to /dashboard/admin/attendance
2. Test approve/reject actions
3. Test dispute resolution
4. Verify status updates
```

#### Data Export

```
1. Navigate to analytics/export pages
2. Test CSV download
3. Test XLSX download
4. Verify file contents
```

#### Analytics Dashboard

```
1. Navigate to /dashboard/admin/analytics
2. Verify chart rendering (Recharts components)
3. Test filter interactions
4. Test drill-down navigation
5. Check data accuracy
```

#### RBAC Enforcement

```
1. Test as Student: Verify restricted access
2. Test as Moderator: Verify limited admin access
3. Test as Admin: Verify full access
4. Check access denied pages render correctly
```

### Error Detection

Always check:

- Console errors (`#mcp_playwright_browser_console_messages`)
- Network failures (`#mcp_playwright_browser_network_requests`)
- Broken UI elements (visual inspection via screenshot)
- Accessibility issues (from snapshot)

---

## Complete Workflow Example

### Task: "Implement the Department Breakdown Chart"

#### Step 1: Research (Context7)

```
1. #mcp_context7_resolve-library-id "recharts"
2. #mcp_context7_get-library-docs context7CompatibleLibraryID="/recharts" topic="BarChart"
3. Review documentation for BarChart, ResponsiveContainer, Tooltip, Legend
```

#### Step 2: Implementation

```
1. Create src/components/dashboard/DepartmentBreakdownChart.tsx
2. Use Recharts API patterns from documentation
3. Integrate with analytics data from Prisma
4. Apply shadcn/ui theming
```

#### Step 3: Testing (Playwright)

```
1. #mcp_playwright_browser_navigate to http://localhost:3000/dashboard/admin/analytics
2. #mcp_playwright_browser_snapshot (verify page structure)
3. #mcp_playwright_browser_take_screenshot filename="dept-chart-initial.png"
4. #mcp_playwright_browser_click on department filter
5. #mcp_playwright_browser_take_screenshot filename="dept-chart-filtered.png"
6. #mcp_playwright_browser_console_messages onlyErrors=true
7. #mcp_playwright_browser_network_requests (verify API calls)
```

#### Step 4: Documentation (Linear)

```
If bugs found:
#mcp_linear_create_comment issueId="T065"
Body: "Department chart testing results:
✅ Chart renders correctly
✅ Filter interaction works
❌ Tooltip shows incorrect percentages
Files: src/components/dashboard/DepartmentBreakdownChart.tsx:89
Fix: Update percentage calculation to use total, not filtered count"
```

---

## Priority Rules

### Must Follow

1. **Always fetch docs first** - Never assume API syntax without checking latest documentation via Context7
2. **Always test in browser** - Every UI component must be tested with Playwright before completion
3. **Always document issues** - Any validation failure must be logged in Linear immediately
4. **Never skip error checks** - Always run console_messages and network_requests after interactions
5. **Never assume behavior** - Test actual user flows, don't just verify code compiles

### Quality Gates

Before marking any task complete:

- ✅ Library documentation reviewed (Context7)
- ✅ Manual browser testing performed (Playwright)
- ✅ No console errors detected
- ✅ Network requests succeed
- ✅ Visual verification passed (screenshots)
- ✅ Issues documented (Linear)

---

### When in Doubt

- Need API info? → Use Context7
- Found a bug? → Use Linear
- Testing UI? → Use Playwright
