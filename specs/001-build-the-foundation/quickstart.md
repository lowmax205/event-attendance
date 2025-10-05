# Quickstart: Landing Pages & Authentication Foundation

**Feature**: 001-build-the-foundation  
**Date**: 2025-10-06  
**Purpose**: End-to-end testing guide to validate the complete authentication flow and landing pages

---

## Prerequisites

Before running these tests, ensure:

1. ✅ Development environment is running:

   ```powershell
   npm run dev
   ```

2. ✅ Database is set up and seeded:

   ```powershell
   npx prisma migrate dev
   npx prisma db seed  # Optional: adds test data
   ```

3. ✅ Environment variables configured in `.env.local`:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/event_attendance"
   JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
   UPSTASH_REDIS_URL="https://..."
   UPSTASH_REDIS_TOKEN="..."
   ```

4. ✅ Browser extensions disabled (ad blockers, cookie blockers may interfere with tests)

---

## Test Scenario 1: Landing Page Navigation

**Objective**: Verify all landing pages are accessible and navigation works correctly.

### Steps

1. **Open home page**

   - Navigate to: `http://localhost:3000/`
   - **Expected**: Home page loads within 2 seconds (check Network tab FCP)
   - **Verify**:
     - Page displays Event Attendance System branding
     - Green primary color and yellow secondary color visible
     - Navigation bar present with links: Home, Events, RoadMap, Login/Get Started

2. **Navigate to Events page**

   - Click "Events" in navigation bar
   - Navigate to: `http://localhost:3000/events`
   - **Expected**: Events page loads within 2 seconds
   - **Verify**:
     - Page explains how attendance tracking works
     - Mentions all three user roles: Student, Moderator, Administrator
     - Navigation bar persists

3. **Navigate to RoadMap page**

   - Click "RoadMap" in navigation bar
   - Navigate to: `http://localhost:3000/roadmap`
   - **Expected**: RoadMap page loads within 2 seconds
   - **Verify**:
     - Page displays upcoming features and milestones
     - Content is organized by development phases or timeline
     - Navigation bar persists

4. **Mobile responsiveness check**
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test screen widths: 320px, 768px, 1024px, 1920px
   - **Verify**:
     - Layout adapts gracefully at all breakpoints
     - Navigation collapses to hamburger menu on mobile (<768px)
     - All interactive elements are at least 44×44px
     - Text remains readable without zooming

### Expected Results

- ✅ All 3 landing pages load successfully
- ✅ Navigation between pages works smoothly
- ✅ Pages are responsive across all device sizes
- ✅ Green/yellow color scheme consistently applied
- ✅ Page load times <2 seconds (check Lighthouse report)

---

## Test Scenario 2: User Registration Flow

**Objective**: Verify new user can register and complete profile.

### Steps

1. **Open registration modal**

   - From Home page, click "Get Started" button
   - **Expected**: Modal appears with authentication form
   - **Verify**:
     - Modal has dark overlay
     - Focus is trapped within modal (Tab cycles through form fields)
     - Modal can be closed with X button, clicking outside, or Escape key

2. **Switch to registration mode**

   - Click "Register" tab in modal
   - **Expected**: Form switches to registration mode
   - **Verify**:
     - Fields visible: Email, Password, Confirm Password, Role (dropdown)
     - Role dropdown has options: Student, Moderator, Administrator
     - All fields have visible labels
     - "Register" button is disabled (no inputs yet)

3. **Test form validation**

   **Test 3a: Invalid email**

   - Enter email: `invalid-email`
   - Tab to next field (trigger blur validation)
   - **Expected**: Error message appears below email field: "Invalid email address"

   **Test 3b: Weak password**

   - Enter password: `weak` (too short, no uppercase, no number, no special char)
   - Tab to next field
   - **Expected**: Multiple error messages or password strength indicator shows "Weak"

   **Test 3c: Mismatched passwords**

   - Enter password: `SecurePass123!`
   - Enter confirmPassword: `DifferentPass456!`
   - Tab to next field
   - **Expected**: Error message: "Passwords do not match"

   **Test 3d: No role selected**

   - Leave role dropdown at default (placeholder)
   - Try to submit
   - **Expected**: Error message: "Please select a role"

4. **Register with valid data**

   - Email: `john.doe@university.edu`
   - Password: `MySecure123!`
   - Confirm Password: `MySecure123!`
   - Role: `Student`
   - Click "Register" button
   - **Expected**:
     - Loading spinner appears during API call
     - Modal closes
     - User is redirected to `/profile/complete`
     - Page loads with profile completion form

5. **Verify registration side effects**
   - Open DevTools > Application > Cookies
   - **Verify**: `refreshToken` cookie exists (httpOnly, 7-day expiry)
   - Open DevTools > Console
   - **Verify**: No JavaScript errors
   - Check database (Prisma Studio or SQL client):
     ```sql
     SELECT * FROM "User" WHERE email = 'john.doe@university.edu';
     ```
   - **Verify**: User record exists with:
     - `passwordHash` (bcrypt hash, starts with `$2b$12$`)
     - `role = 'Student'`
     - `accountStatus = 'active'`
     - `createdAt` timestamp
   - Check SecurityLog:
     ```sql
     SELECT * FROM "SecurityLog" WHERE eventType = 'registration' ORDER BY "createdAt" DESC LIMIT 1;
     ```
   - **Verify**: Log entry with `success = true`

### Expected Results

- ✅ Registration modal opens and closes correctly
- ✅ Form validation prevents invalid submissions
- ✅ Valid registration creates user, sets cookie, redirects to profile completion
- ✅ Password is hashed (never stored in plain text)
- ✅ Registration event is logged

---

## Test Scenario 3: Profile Completion Flow

**Objective**: Verify user can complete academic profile after registration.

### Steps

1. **Verify profile form is pre-populated**

   - After registration redirect, user should be on `/profile/complete`
   - **Verify**:
     - Email field is pre-filled with `john.doe@university.edu` (read-only)
     - Role field shows `Student` (read-only)
     - Other fields are empty (Year, Section, ID Number, etc.)

2. **Fill profile form**

   - ID Number: `2024-12345`
   - Year: `3rd` (select from dropdown)
   - Section: `A`
   - Course: `Computer Science`
   - Department: `College of Engineering`
   - Campus: `Main Campus`
   - Current Semester: `2nd Sem` (select from dropdown)
   - Click "Complete Profile" button

3. **Verify redirection to dashboard**

   - **Expected**: User is redirected to `/dashboard/student`
   - **Verify**:
     - URL is `/dashboard/student` (matches role)
     - Page displays student dashboard placeholder
     - Navigation bar shows "Logout" button (user is authenticated)

4. **Verify profile in database**

   - Check database:
     ```sql
     SELECT * FROM "UserProfile" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'john.doe@university.edu');
     ```
   - **Verify**: UserProfile record exists with:
     - All 7 academic fields correctly saved
     - `completedAt` timestamp
     - `updatedAt` timestamp

5. **Test profile completion is required**
   - Manually navigate to `/dashboard/student` (before completing profile)
   - **Expected**: User is redirected back to `/profile/complete`
   - **Verify**: Cannot access dashboard without completed profile

### Expected Results

- ✅ Profile form displays correctly with pre-populated read-only fields
- ✅ All 7 academic fields can be filled
- ✅ Profile submission creates UserProfile record
- ✅ User is redirected to correct role-specific dashboard
- ✅ Dashboard access requires completed profile

---

## Test Scenario 4: Login Flow (Existing User)

**Objective**: Verify existing user can log in and access dashboard.

### Steps

1. **Logout if already logged in**

   - If logged in, click "Logout" button in navigation
   - **Expected**: User is redirected to home page, cookie cleared

2. **Open login modal**

   - From Home page, click "Login" button
   - **Expected**: Modal appears with authentication form

3. **Switch to login mode**

   - Click "Login" tab in modal (should be default)
   - **Expected**: Form shows Email and Password fields (no confirmPassword or role)

4. **Test login validation**

   **Test 4a: Wrong password**

   - Email: `john.doe@university.edu`
   - Password: `WrongPassword123!`
   - Click "Login"
   - **Expected**: Error message: "Invalid credentials. Please check your email and password."
   - **Verify**: Same error message as non-existent email (no user enumeration)
   - Check SecurityLog:
     ```sql
     SELECT * FROM "SecurityLog" WHERE eventType = 'failed_login' ORDER BY "createdAt" DESC LIMIT 1;
     ```
   - **Verify**: Log entry with `success = false`, `failReason = 'Invalid credentials'`

   **Test 4b: Non-existent email**

   - Email: `nonexistent@university.edu`
   - Password: `AnyPassword123!`
   - Click "Login"
   - **Expected**: Same error message as wrong password (security requirement)

5. **Login with correct credentials**

   - Email: `john.doe@university.edu`
   - Password: `MySecure123!`
   - Click "Login"
   - **Expected**:
     - Loading spinner appears
     - Modal closes
     - User is redirected to `/dashboard/student` (profile already complete)

6. **Verify login side effects**

   - Check DevTools > Cookies
   - **Verify**: New `refreshToken` cookie (different from registration token)
   - Check User table:
     ```sql
     SELECT "lastLoginAt" FROM "User" WHERE email = 'john.doe@university.edu';
     ```
   - **Verify**: `lastLoginAt` is updated to current timestamp
   - Check SecurityLog:
     ```sql
     SELECT * FROM "SecurityLog" WHERE eventType = 'login' ORDER BY "createdAt" DESC LIMIT 1;
     ```
   - **Verify**: Log entry with `success = true`

7. **Test profile-incomplete user login**
   - Register a new user: `jane.smith@university.edu` / `SecurePass456!` / `Moderator`
   - Do NOT complete profile (close browser or logout)
   - Login again with: `jane.smith@university.edu` / `SecurePass456!`
   - **Expected**: User is redirected to `/profile/complete` (not dashboard)
   - **Verify**: Profile form appears for completion

### Expected Results

- ✅ Login modal opens correctly
- ✅ Invalid credentials show generic error (no user enumeration)
- ✅ Correct credentials redirect to dashboard (if profile complete) or profile form (if incomplete)
- ✅ `lastLoginAt` timestamp is updated
- ✅ Login events are logged (both success and failure)

---

## Test Scenario 5: Rate Limiting

**Objective**: Verify rate limiting prevents brute force attacks.

### Steps

1. **Test login rate limit**

   - Attempt to login with wrong password 6 times in a row
   - Email: `john.doe@university.edu`
   - Password: `WrongPassword123!`
   - Click "Login" 6 times (wait for each to complete)
   - **Expected on 6th attempt**: Error message: "Too many login attempts. Please try again in 15 minutes."
   - **Verify**: HTTP status code is 429 (Too Many Requests)

2. **Test registration rate limit**

   - Attempt to register with the same email 6 times in a row
   - Email: `spam@test.com`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`
   - Role: `Student`
   - **Expected on 6th attempt**: Error message: "Too many registration attempts. Please try again in 15 minutes."

3. **Verify rate limit reset**
   - Wait 15 minutes (or reset Redis manually in development)
   - Attempt login again
   - **Expected**: Login attempt is allowed (rate limit reset)

### Expected Results

- ✅ Rate limiting triggers after 5 failed attempts
- ✅ Rate limit error message is clear
- ✅ Rate limit resets after 15 minutes

---

## Test Scenario 6: Accessibility Compliance

**Objective**: Verify WCAG 2.1 AA compliance.

### Steps

1. **Keyboard navigation test**

   - Open home page
   - Press Tab key repeatedly
   - **Verify**:
     - Focus moves through all interactive elements (nav links, buttons)
     - Focus indicators are visible (outline or other styling)
     - Pressing Enter on "Login" button opens modal
     - Tab within modal cycles through form fields (focus trap)
     - Pressing Escape closes modal and returns focus to trigger button

2. **Screen reader test** (NVDA on Windows or VoiceOver on Mac)

   - Enable screen reader
   - Navigate through home page
   - **Verify**:
     - Page title is announced
     - Headings are properly structured (H1, H2, H3)
     - Form labels are announced when focusing inputs
     - Error messages are announced when validation fails
     - Modal announces its purpose when opened

3. **Color contrast test**

   - Use browser extension (e.g., axe DevTools, WAVE)
   - Scan all pages: Home, Events, RoadMap, Profile Form, Dashboard
   - **Verify**:
     - Text color contrast meets WCAG AA (4.5:1 for normal text)
     - Button color contrast meets WCAG AA (3:1 for large text)
     - Green and yellow colors used do not fail contrast checks

4. **Automated accessibility audit**
   - Open DevTools > Lighthouse
   - Run Accessibility audit
   - **Expected**: Score ≥90 (per constitution requirement)
   - **Verify**: No critical violations

### Expected Results

- ✅ All interactive elements accessible via keyboard
- ✅ Screen reader announces all content correctly
- ✅ Color contrast meets WCAG AA standards
- ✅ Lighthouse Accessibility score ≥90

---

## Test Scenario 7: Performance Validation

**Objective**: Verify page load times meet constitutional requirements.

### Steps

1. **Lighthouse performance audit**

   - Open DevTools > Lighthouse
   - Select "Performance" category
   - Device: Mobile (simulated 3G throttling)
   - Run audit
   - **Expected**:
     - Performance score ≥90
     - First Contentful Paint (FCP) <1.8s
     - Largest Contentful Paint (LCP) <2.5s
     - First Input Delay (FID) <100ms
     - Cumulative Layout Shift (CLS) <0.1

2. **Network throttling test**

   - Open DevTools > Network tab
   - Select throttling: "Slow 3G"
   - Hard reload page (Ctrl+Shift+R)
   - **Verify**:
     - Page becomes interactive within 2 seconds
     - No blocking resources delay FCP
     - Images load with lazy loading (only above-fold images load first)

3. **Bundle size check**
   - Run production build:
     ```powershell
     npm run build
     ```
   - Check build output in terminal
   - **Verify**:
     - JavaScript bundle size <200KB (gzipped)
     - Landing pages use Server Components (minimal JS)
     - Code splitting by route (separate chunks for /events, /roadmap, etc.)

### Expected Results

- ✅ Lighthouse performance score ≥90
- ✅ Core Web Vitals meet "Good" thresholds
- ✅ Page interactive within 2 seconds on 3G
- ✅ Bundle size optimized with code splitting

---

## Test Scenario 8: Security Validation

**Objective**: Verify security requirements are met.

### Steps

1. **Password hashing check**

   - Check database:
     ```sql
     SELECT "passwordHash" FROM "User" WHERE email = 'john.doe@university.edu';
     ```
   - **Verify**:
     - Hash starts with `$2b$12$` (bcrypt with cost factor 12)
     - Hash is 60 characters long
     - Hash is different from original password `MySecure123!`

2. **JWT token inspection**

   - Login and capture access token (check browser console or Network tab)
   - Decode JWT at [jwt.io](https://jwt.io)
   - **Verify**:
     - Algorithm: HS256
     - Payload contains: `userId`, `role`
     - Expiry (exp) is 15 minutes from issuance (iat)
     - Token is signed (cannot be tampered without secret)

3. **HttpOnly cookie verification**

   - Open DevTools > Application > Cookies
   - Inspect `refreshToken` cookie
   - **Verify**:
     - `HttpOnly` flag is set (true)
     - `Secure` flag is set (true in production, false in dev)
     - `SameSite` is `Lax` or `Strict`
     - `Path` is `/`
     - JavaScript cannot access cookie (`document.cookie` does not show refreshToken)

4. **Security headers check**

   - Open DevTools > Network tab
   - Reload page, inspect response headers for any page
   - **Verify headers are present**:
     - `X-Frame-Options: DENY`
     - `X-Content-Type-Options: nosniff`
     - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
     - `Content-Security-Policy: ...` (check CSP rules)
     - `Referrer-Policy: strict-origin-when-cross-origin`

5. **XSS prevention test**

   - Try to inject script in form fields
   - Example: Section field = `<script>alert('XSS')</script>`
   - Submit profile form
   - **Expected**: Script is sanitized (rendered as plain text, not executed)
   - Check database:
     ```sql
     SELECT section FROM "UserProfile" ORDER BY "createdAt" DESC LIMIT 1;
     ```
   - **Verify**: Section is stored as escaped text or sanitized

6. **CORS policy test**
   - From a different origin (e.g., http://localhost:3001), try to make API call:
     ```javascript
     fetch("http://localhost:3000/api/auth/login", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ email: "test@test.com", password: "Test123!" }),
     });
     ```
   - **Expected**: CORS error in console (request blocked by browser)
   - **Verify**: Only allowlisted origins can make API requests

### Expected Results

- ✅ Passwords hashed with bcrypt cost factor 12
- ✅ JWT tokens properly signed with expiry times
- ✅ Refresh tokens stored in httpOnly cookies
- ✅ Security headers present on all responses
- ✅ XSS attacks prevented via input sanitization
- ✅ CORS policy restrictive (allowlist only)

---

## Test Scenario 9: Role-Based Dashboard Access

**Objective**: Verify different user roles access different dashboards.

### Steps

1. **Register and complete profile as Student**

   - Email: `student@test.edu`
   - Password: `Student123!`
   - Role: `Student`
   - Complete profile
   - **Expected**: Redirected to `/dashboard/student`

2. **Register and complete profile as Moderator**

   - Email: `moderator@test.edu`
   - Password: `Moderator123!`
   - Role: `Moderator`
   - Complete profile
   - **Expected**: Redirected to `/dashboard/moderator`

3. **Register and complete profile as Administrator**

   - Email: `admin@test.edu`
   - Password: `Admin123!`
   - Role: `Administrator`
   - Complete profile
   - **Expected**: Redirected to `/dashboard/admin`

4. **Test cross-role access prevention**
   - Login as Student
   - Manually navigate to `/dashboard/moderator`
   - **Expected**: Redirected to `/dashboard/student` (or shown 403 Forbidden)
   - **Verify**: Users cannot access dashboards for other roles

### Expected Results

- ✅ Students access `/dashboard/student`
- ✅ Moderators access `/dashboard/moderator`
- ✅ Administrators access `/dashboard/admin`
- ✅ Role-based access control prevents cross-role access

---

## Test Scenario 10: Logout and Session Invalidation

**Objective**: Verify logout terminates session correctly.

### Steps

1. **Login as any user**

   - Email: `john.doe@university.edu`
   - Password: `MySecure123!`
   - **Verify**: Redirected to dashboard

2. **Click logout button**

   - In navigation bar, click "Logout"
   - **Expected**:
     - User is redirected to home page
     - Navigation bar shows "Login" button (not "Logout")

3. **Verify session termination**

   - Check DevTools > Cookies
   - **Verify**: `refreshToken` cookie is cleared (deleted or maxAge=0)
   - Check database:
     ```sql
     SELECT * FROM "Session" WHERE "userId" = (SELECT id FROM "User" WHERE email = 'john.doe@university.edu');
     ```
   - **Verify**: Session record is deleted (or marked as expired)
   - Check SecurityLog:
     ```sql
     SELECT * FROM "SecurityLog" WHERE eventType = 'logout' ORDER BY "createdAt" DESC LIMIT 1;
     ```
   - **Verify**: Log entry with `success = true`

4. **Test dashboard access after logout**
   - Manually navigate to `/dashboard/student`
   - **Expected**: Redirected to home page with login modal opened
   - **Verify**: Cannot access protected pages without active session

### Expected Results

- ✅ Logout button terminates session
- ✅ Refresh token cookie is cleared
- ✅ Session record is deleted from database
- ✅ Logout event is logged
- ✅ Dashboard access is blocked after logout

---

## Success Criteria Summary

The feature passes quickstart validation if all scenarios pass:

- ✅ **Scenario 1**: All landing pages load and navigate correctly
- ✅ **Scenario 2**: User registration works with validation
- ✅ **Scenario 3**: Profile completion redirects to correct dashboard
- ✅ **Scenario 4**: Login works for existing users
- ✅ **Scenario 5**: Rate limiting prevents abuse
- ✅ **Scenario 6**: Accessibility meets WCAG 2.1 AA
- ✅ **Scenario 7**: Performance meets constitutional standards
- ✅ **Scenario 8**: Security measures are implemented
- ✅ **Scenario 9**: Role-based access control works
- ✅ **Scenario 10**: Logout terminates session properly

---

## Troubleshooting

### Issue: Modal doesn't open

**Solution**: Check browser console for JavaScript errors. Ensure shadcn/ui Dialog component is properly installed.

### Issue: Form validation not working

**Solution**: Verify React Hook Form and Zod are installed. Check `src/lib/validations.ts` exports schemas.

### Issue: Database errors

**Solution**: Run `npx prisma migrate reset` to reset database, then `npx prisma migrate dev` to apply migrations.

### Issue: Rate limiting not working

**Solution**: Verify Upstash Redis credentials in `.env.local`. Use `redis-cli` to check connection.

### Issue: Lighthouse score <90

**Solution**: Check bundle size, image optimization, and Network tab for blocking resources. Use Lighthouse suggestions to identify bottlenecks.

### Issue: CORS errors

**Solution**: Verify `next.config.ts` CORS configuration. Ensure API routes are on same origin in development.

---

**Status**: ✅ Quickstart Complete - All test scenarios documented
