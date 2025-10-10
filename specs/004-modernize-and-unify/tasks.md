# Tasks: Unified Dashboard Modernization

**Input**: Design documents from `/specs/004-modernize-and-unify/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```text
Setup → Models → Shared services → UI composition → Integration hardening → Polish
```

## Phase 3.1: Setup

- [ ] T001 Baseline audit of existing admin/moderator/student dashboard implementations; document current shell/layout duplication in `docs/notes/unified-dashboard-audit.md`
- [ ] T002 Update workspace dependencies if needed by running `npm install` to ensure shared component libraries are current
- [ ] T003 [P] Configure lint scripts to target new shared directories by updating `package.json` lint task and verifying via `npm run lint`

## Phase 3.2: Core Data & Config Models

- [ ] T004 [P] Implement `DashboardShell` config model and types in `src/lib/dashboard/shell-config.ts`
- [ ] T005 [P] Implement `ShellNavItem` and `ShellZone` definitions in `src/lib/dashboard/shell-navigation.ts`
- [ ] T006 [P] Implement `WidgetDefinition` and `WidgetInstance` registry in `src/lib/dashboard/widget-registry.ts`
- [ ] T007 [P] Implement `TableViewConfig`, `TableColumnConfig`, and `FilterConfig` schemas in `src/lib/dashboard/table-config.ts`
- [ ] T008 [P] Implement `StateMessageRegistry` catalog utilities in `src/lib/dashboard/state-messages.ts`

## Phase 3.3: Shared Services & Server Actions

- [ ] T009 Create unified dashboard shell server action `src/actions/dashboard/get-shell.ts` returning data matching `dashboard-shell.json`
- [ ] T010 Implement shared widgets server action `src/actions/dashboard/get-widgets.ts` normalizing role/timeframe queries per `dashboard-widgets.json`
- [ ] T011 Implement consolidated table server action `src/actions/dashboard/get-table.ts` producing results per `dashboard-table.json`
- [ ] T012 Refactor existing admin/moderator/student dashboard server actions to consume shared utilities in `src/actions/dashboard/`

## Phase 3.4: UI Composition

- [ ] T013 Refactor dashboard layout components to use shared shell in `src/app/dashboard/layout.tsx` and role-specific entry points
- [ ] T014 Build shared navigation/header components in `src/components/dashboard/shared/shell.tsx`
- [ ] T015 Replace role-specific widgets with shared registry components in `src/components/dashboard/shared/widgets.tsx`
- [ ] T016 Swap table implementations to shared table component in `src/components/dashboard/shared/table.tsx`
- [ ] T017 Update contextual messaging usage across dashboards using `src/components/dashboard/shared/state-message.tsx`

## Phase 3.5: Integration Hardening

- [ ] T018 Ensure responsive breakpoints and theming tokens align with shared shell in `src/app/globals.css` and Tailwind config
- [ ] T019 Consolidate duplicated hooks into `src/hooks/use-dashboard-data.ts` consuming shared server actions
- [ ] T020 Add performance instrumentation (loading states, suspense boundaries) to shared dashboard components in `src/components/dashboard/shared`
- [ ] T021 Validate Prisma queries reused by server actions meet performance targets; adjust caching strategies in `src/lib/analytics`

## Phase 3.6: Polish & Verification

- [ ] T022 [P] Update documentation (`README.md` or `docs/dashboard.md`) describing unified dashboard architecture
- [ ] T023 [P] Capture updated dashboard screenshots for design QA in `docs/qa/dashboard-visuals`
- [ ] T024 [P] Log manual accessibility findings (keyboard, screen reader) in `docs/qa/dashboard-accessibility.md`
- [ ] T025 Run `npm run lint` to confirm consolidated code paths meet quality gates

## Dependencies

- T001 → T004-T025
- Model tasks (T004-T008) precede shared services (T009-T012)
- Shared services (T009-T011) unblock UI composition (T013-T017)
- Hook consolidation (T019) depends on shared server actions
- Integration hardening (T018-T021) precedes polish (T022-T025)

## Parallel Execution Example

```text
# Example: run multiple model definitions in parallel
Task: "T004 [P] Implement DashboardShell config model..."
Task: "T005 [P] Implement ShellNavItem and ShellZone definitions..."
Task: "T006 [P] Implement WidgetDefinition and WidgetInstance registry..."

# Example: polish activities that can be parallelized
Task: "T022 [P] Update documentation..."
Task: "T023 [P] Capture updated dashboard screenshots..."
Task: "T024 [P] Log manual accessibility findings..."
```

## Notes

- Mark [P] tasks run in different files with no dependencies; remove [P] if file overlap occurs
- Commit after each task to maintain traceability
- Follow constitution requirements for TypeScript strictness, accessibility, and performance guards
