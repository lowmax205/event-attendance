# Research: Unified Dashboard Modernization

## Shared Dashboard Shell Patterns

- **Decision**: Adopt a role-aware shell component that exposes a consistent global navigation, page header, and action bar, using shadcn/ui primitives with Tailwind design tokens.
- **Rationale**: Aligns all dashboards to a shared layout grid, reduces redundant markup, and leverages accessible primitives already audited in the project.
- **Alternatives Considered**:
  - Keep role-specific shells per dashboard (rejected: perpetuates drift and duplicate CSS).
  - Introduce a third-party layout framework (rejected: increases dependency surface and theming conflicts with Tailwind tokens).

## Widget Consolidation with Recharts

- **Decision**: Build a centralized widget registry that maps role + metric identifiers to shared Recharts-based components configured via props.
- **Rationale**: Enables reuse of chart scaffolding, supports responsive breakpoints through a single `ResponsiveContainer`, and simplifies legend/tooltip theming.
- **Alternatives Considered**:
  - Copy existing charts into a `shared` folder without abstraction (rejected: limited flexibility and no prop-level configuration).
  - Replace Recharts with another library (rejected: exceeds current scope and contradicts active technology guidance).

## Contextual Messaging Standards

- **Decision**: Define a catalog of empty/loading/error state descriptors with role-specific copy and iconography controlled through a shared messaging service.
- **Rationale**: Ensures consistent tone, prevents missing states, and satisfies business goal of boosted first-time comprehension.
- **Alternatives Considered**:
  - Allow each dashboard to manage copy inline (rejected: high risk of divergence and inaccessible phrasing).
  - Move messaging into CMS (rejected: adds operational overhead for this phase).

## Hook and State Deduplication

- **Decision**: Consolidate dashboard data fetching into server actions under `src/actions/dashboard/` and expose memoized client hooks that wrap shared SWR/react-query style helpers.
- **Rationale**: Eliminates multiple bespoke hooks, keeps data transformations centralized, and allows consistent caching/optimistic update strategies.
- **Alternatives Considered**:
  - Continue using disparate hooks per role (rejected: maintenance burden and bundle bloat).
  - Shift all fetching to client-only hooks (rejected: violates Next.js server-first guidance and increases data exposure risk).
