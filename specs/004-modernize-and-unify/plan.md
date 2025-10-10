
# Implementation Plan: Unified Dashboard Modernization

**Branch**: `004-modernize-and-unify` | **Date**: 2025-10-11 | **Spec**: specs/004-modernize-and-unify/spec.md
**Input**: Feature specification from `specs/004-modernize-and-unify/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Unify the admin, moderator, and student dashboards behind a shared shell that delivers consistent navigation, reusable visualization widgets, and consolidated tables/filters. Preserve existing business capabilities while eliminating duplicate UI/state logic, improving maintainability, and raising comprehension through aligned information architecture and contextual messaging.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)
**Primary Dependencies**: Next.js 15.5.4 (App Router), React 18.3, shadcn/ui, Tailwind CSS, Prisma 6.16.3, React Hook Form 7.64, Zod 4.1, jose 6.1, bcryptjs 3.0.2, Recharts 2.x
**Storage**: PostgreSQL (via Prisma ORM)
**Testing**: Manual Playwright browser runs per Phase 3 guidelines; existing Jest/Playwright infra optional but not required
**Target Platform**: Web (desktop + mobile) deployed via Vercel edge
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: Meet constitution budgets—FCP <1.8s, LCP <2.5s, CLS <0.1, FID <100ms on dashboards
**Constraints**: Preserve functional parity, reduce bundle size by consolidating components, maintain current WCAG 2.1 AA baseline without regressions, avoid API changes that break downstream consumers
**Scale/Scope**: Three role dashboards (admin, moderator, student) covering existing attendance/event datasets for thousands of concurrent student records

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality & TypeScript Excellence**: Plan consolidates UI components without bypassing strict typing; shared utilities will expose typed props and Zod schemas. PASS.
- **User Experience First**: Shared shell keeps responsive breakpoints and WCAG 2.1 AA baseline; contextual states defined in spec. PASS.
- **Performance Standards**: Bundle reduction via reuse supports Core Web Vitals targets; table/chart consolidation avoids redundant data fetching. PASS.
- **Security & Privacy**: No new data exposures; plan keeps authentication and role gating unchanged. PASS.
- **Maintainability & Component Architecture**: Shared component strategy aligns with shadcn/ui patterns and constitution directory guidelines. PASS.

Post-design review confirms the consolidated data model and contracts maintain these compliance guarantees.

## Project Structure

### Documentation (this feature)

```text
specs/004-modernize-and-unify/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```text
src/
├── actions/
│   ├── admin/
│   ├── attendance/
│   ├── dashboard/
│   └── events/
├── app/
│   ├── dashboard/
│   │   ├── admin/
│   │   ├── moderator/
│   │   └── student/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── attendance/
│   ├── dashboard/
│   │   ├── admin/
│   │   ├── moderator/
│   │   ├── student/
│   │   └── shared/
│   ├── ui/
│   └── ...
├── hooks/
├── lib/
│   ├── analytics/
│   ├── auth/
│   ├── events/
│   └── validations/
└── middleware.ts

prisma/
├── schema.prisma
└── migrations/

public/
└── images/
```

**Structure Decision**: Single Next.js App Router project with consolidated shared components and server actions under `src/`, aligning with constitution guidance for maintainability.

## Phase 0: Outline & Research

1. Identify unknowns impacting unified dashboards:
   - Evaluate existing admin/moderator/student layouts to catalogue reusable shell regions, navigation, and widget overlap.
   - Confirm shared design tokens (color, spacing, typography) and breakpoints needed for consistent responsive behavior.
   - Assess data-fetching patterns across dashboard server actions to define consolidation strategy without altering business logic.

2. Research tasks to dispatch:
   - "Research shared dashboard shell patterns for Next.js App Router using shadcn/ui to ensure accessible navigation."
   - "Find best practices for consolidating dashboard data widgets with Recharts in responsive layouts."
   - "Verify guidelines for contextual empty/loading/error messaging aligned with management & analytics spec."
   - "Review strategies for deduplicating React hooks/state while maintaining Prisma-backed role authorization."

3. Consolidate findings in `research.md` with Decision, Rationale, Alternatives for each topic.

**Output**: research.md capturing shell design, widget consolidation, state management approach, and messaging standards.

## Phase 1: Design & Contracts

Prerequisite: research.md complete

1. Produce `data-model.md` outlining shared dashboard entities (shell layout, widget catalog, table/filter set, contextual messaging registry) with attributes, relationships, and lifecycle rules.

2. Define API/server action contracts enabling shared components:
   - `GET /api/dashboard/shell` for shell/navigation metadata per role.
   - `GET /api/dashboard/widgets` with query parameters for role and timeframe.
   - `GET /api/dashboard/table` to deliver paginated row sets with shared filter schemas.
   - Server action notes for updating acknowledgment states without duplicating logic.

3. Add JSON contract fixtures under `contracts/` representing expected request/response payloads for each endpoint, ensuring role-based gating fields remain intact.

4. Draft quickstart scenario linking user stories to UI verification steps, including responsiveness and contextual messaging checks.

5. Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` after design artifacts exist, updating the agent guidance with new shared component strategy.

**Output**: data-model.md, contracts/*.json, quickstart.md, and updated agent context file (no code tests required per project rules).

## Phase 2: Task Planning Approach

This section describes what the /tasks command will do - DO NOT execute during /plan

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

These phases are beyond the scope of the /plan command.

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

Fill ONLY if Constitution Check has violations that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|

## Progress Tracking

This checklist is updated during execution flow.

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
