<!--
Sync Impact Report:
- Version Change: 0.0.0 → 1.0.0
- Type: MAJOR (Initial constitution establishment)
- New Principles Added:
  1. Code Quality & TypeScript Excellence
  2. User Experience First
  3. Performance Standards
  4. Security & Privacy
  5. Maintainability & Component Architecture
- New Sections Added:
  - Technology Stack Requirements
  - Development Standards & Quality Gates
- Templates Requiring Updates:
  ✅ plan-template.md (reviewed - compatible with constitution gates)
  ✅ spec-template.md (reviewed - compatible with requirement structure)
  ✅ tasks-template.md (reviewed - compatible with TDD and modular approach)
- Follow-up TODOs: None
- Rationale: Initial constitution for Event Attendance System establishing core development principles around TypeScript, modern web practices, user experience, performance, and security standards.
-->

# Event Attendance System Constitution

## Core Principles

### I. Code Quality & TypeScript Excellence

**All code MUST adhere to strict TypeScript, ESLint, and Prettier standards.**

- TypeScript MUST be used for all source code with strict mode enabled (`"strict": true` in tsconfig.json)
- ESLint rules MUST be enforced on every commit; builds MUST fail on linting errors
- Prettier MUST auto-format code on save; inconsistent formatting is not acceptable
- Code MUST be well-commented: complex logic requires explanatory comments, public functions SHOULD have JSDoc (recommended for maintainability)
- Modularity is MANDATORY: Functions should be focused (single responsibility), components should be reusable
- Type safety MUST NOT be bypassed: No `any` types without explicit justification documented in code comments

**Rationale**: TypeScript prevents runtime errors, ESLint catches bugs early, Prettier eliminates formatting debates, and clear comments ensure long-term maintainability. This principle ensures code quality remains consistently high across all contributors.

### II. User Experience First

**The interface MUST be intuitive, accessible (WCAG 2.1 AA), and responsive across all devices.**

- Mobile-first design MANDATORY for attendance features: Touch targets ≥44×44px, readable without zoom
- Desktop-optimized dashboards MANDATORY for admin/analytics: Efficient use of screen real estate, keyboard shortcuts
- Accessibility MUST meet WCAG 2.1 Level AA standards: Semantic HTML, proper ARIA labels, keyboard navigation, screen reader compatibility
- UI feedback MUST be immediate: Loading states, error messages, success confirmations within 100ms of user action
- Navigation MUST be intuitive: Maximum 3 clicks to any feature, consistent patterns, clear visual hierarchy
- Forms MUST validate on blur with clear, actionable error messages

**Rationale**: Users will abandon poorly designed interfaces. Mobile-first ensures attendance marking works in the field. Accessibility is both legally required and morally correct. Immediate feedback builds trust and reduces user frustration.

### III. Performance Standards (NON-NEGOTIABLE)

**Page load times MUST be under 2 seconds on 3G connections; Core Web Vitals MUST meet "Good" thresholds.**

- Initial page load (FCP) MUST be <1.8s on 3G
- Largest Contentful Paint (LCP) MUST be <2.5s
- First Input Delay (FID) MUST be <100ms
- Cumulative Layout Shift (CLS) MUST be <0.1
- Images MUST be optimized: Modern formats (WebP/AVIF), lazy loading, responsive sizes
- Data fetching MUST be efficient: Server-side rendering for initial load, client-side caching, optimistic UI updates
- Bundle sizes MUST be monitored: Code splitting by route, tree shaking enabled, dependencies audited quarterly
- Performance validation REQUIRED: Manual Lighthouse audits for each major feature, target score ≥90 (automated CI testing not required per project decision)

**Rationale**: Slow applications frustrate users and reduce engagement. Performance is a feature, not an optimization. The 2-second target ensures usability even on poor network connections common in schools/events.

### IV. Security & Privacy

**Authentication MUST be secure, inputs MUST be validated, and API secrets MUST NEVER be exposed client-side.**

- Authentication MUST use industry-standard protocols: OAuth 2.0, JWT with secure signing, refresh token rotation
- Passwords MUST be hashed with bcrypt (cost factor ≥12) or Argon2id
- Input validation MANDATORY on both client and server: Sanitize all user inputs, use allowlists over denylists
- API keys/secrets MUST be stored in environment variables, NEVER committed to repository
- HTTPS REQUIRED for all production traffic (infrastructure/deployment concern, verify in production checklist)
- CORS policies MUST be restrictive: Allowlist specific origins, no wildcard in production
- Rate limiting REQUIRED on all API endpoints: Prevent brute force and DDoS attacks
- Security headers MANDATORY: CSP, X-Frame-Options, HSTS, X-Content-Type-Options
- User data MUST be handled per privacy regulations: GDPR compliance for EU users, data minimization principles

**Rationale**: Security breaches destroy user trust and expose the organization to legal liability. Defense in depth ensures multiple layers protect sensitive data. Client-side validation improves UX; server-side validation ensures security.

### V. Maintainability & Component Architecture

**Folder structure MUST be consistent; components MUST be reusable following shadcn/ui patterns.**

- shadcn/ui MUST be used for all UI components: Ensures consistency, accessibility, and maintainability
- Component structure MANDATORY: `src/components/ui/` for base components, `src/components/` for composed components
- File organization REQUIRED:
  - `/src/app/` for Next.js app router pages and layouts
  - `/src/components/` for React components (ui/ subfolder for shadcn primitives)
  - `/src/lib/` for utility functions and shared logic
  - `/src/hooks/` for custom React hooks
- Components MUST follow single responsibility: One component, one purpose; composition over inheritance
- Prop interfaces MUST be explicitly typed and documented
- Storybook or similar documentation RECOMMENDED for component libraries
- Breaking changes to shared components REQUIRE migration guide and deprecation period

**Rationale**: Consistent structure reduces onboarding time and cognitive load. Reusable components accelerate development and ensure UI consistency. shadcn/ui provides accessible, customizable primitives that align with modern React patterns.

## Technology Stack Requirements

**Frontend Framework**: Next.js 15+ with React 18+ and TypeScript 5+  
**Styling**: Tailwind CSS 4+ with shadcn/ui component library  
**State Management**: React hooks and Context API (Zustand or Redux Toolkit if global state complexity warrants)  
**Data Fetching**: Next.js Server Components and Server Actions (prefer server-side data fetching)  
**Form Handling**: React Hook Form with Zod schema validation  
**Icons**: Lucide React (already in dependencies)  
**Date Handling**: date-fns (already in dependencies)  
**UI Notifications**: Sonner (already in dependencies)

**Build & Deployment**:

- Turbopack for development and production builds
- Vercel or similar edge platform for deployment
- GitHub Actions for CI/CD pipeline

**Testing Stack**: None (testing not required for this project)

**Code Quality Tools**:

- ESLint 9+ with Next.js config (already configured)
- Prettier for code formatting
- Husky for pre-commit hooks
- TypeScript strict mode enabled

## Development Standards & Quality Gates

**Pre-Commit Gates** (enforced via Git hooks):

- [ ] ESLint passes with zero errors
- [ ] Prettier formatting applied
- [ ] TypeScript compilation successful with no errors

**Pull Request Gates** (enforced via CI):

- [ ] Build succeeds without warnings
- [ ] ESLint passes with zero errors
- [ ] TypeScript compilation successful
- [ ] Lighthouse performance score ≥90 (manual validation)
- [ ] Accessibility audit passes (manual validation with browser DevTools)
- [ ] At least one approving review from code owner

**Code Review Standards**:

- Reviewers MUST verify adherence to all five core principles
- Security-related changes REQUIRE review from designated security lead
- UI changes MUST include screenshots/video in PR description
- Breaking changes REQUIRE migration documentation
- Performance regressions >10% MUST be justified or rejected

**Definition of Done**:

- [ ] Feature implemented per specification
- [ ] Accessibility tested with keyboard navigation and screen reader
- [ ] Mobile responsive tested on iOS Safari and Chrome Android
- [ ] Performance metrics validated (LCP <2.5s) using browser DevTools
- [ ] Documentation updated (README, API docs, component docs)
- [ ] Code reviewed and approved
- [ ] Deployed to staging and validated

## Governance

This constitution supersedes all other development practices and guidelines. It establishes the non-negotiable standards for the Event Attendance System project.

**Amendment Process**:

- Amendments require written proposal with rationale
- Proposals must be reviewed by project maintainers
- Breaking changes to principles require unanimous approval
- Minor clarifications require simple majority
- All amendments must include migration plan for existing code
- Version must be incremented per semantic versioning rules (see below)

**Compliance Verification**:

- All pull requests MUST pass automated gates enforcing these principles
- Manual code reviews MUST explicitly verify constitution adherence
- Quarterly audits REQUIRED to identify technical debt and constitution violations
- Violations must be documented in issue tracker with remediation timeline

**Versioning Policy**:

- **MAJOR**: Backward-incompatible changes (principle removal/redefinition, technology stack changes)
- **MINOR**: New principles added, sections expanded, new requirements introduced
- **PATCH**: Clarifications, wording improvements, typo fixes, non-semantic refinements

**Conflict Resolution**:

- When requirements conflict with constitution, constitution takes precedence
- When constitution is unclear, default to principle intent over literal interpretation
- Unresolvable conflicts escalate to project maintainers for ruling
- Rulings must be documented and may trigger amendment process

**Runtime Development Guidance**:

- Agent-specific development guidance stored in `.github/copilot-instructions.md` (for GitHub Copilot) or agent-specific files as needed
- Guidance files provide tactical implementation patterns; constitution provides strategic principles
- Guidance must never contradict constitution; conflicts trigger constitution review

**Version**: 1.0.0 | **Ratified**: 2025-10-06 | **Last Amended**: 2025-10-06
