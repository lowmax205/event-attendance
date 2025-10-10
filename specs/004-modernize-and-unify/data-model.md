# Data Model: Unified Dashboard Modernization

## Overview

Shared structures will power the admin, moderator, and student dashboards without altering underlying business entities. The model introduces presentational layers and configuration metadata that reference existing attendance, event, and analytics records already exposed by Prisma models.

## Entities

### DashboardShell

- **Identifier**: `shellId` (string; derived from role slug)
- **Attributes**:
  - `role` (enum: `admin`, `moderator`, `student`)
  - `brandTheme` (token set reference)
  - `navigation` (array of `ShellNavItem`)
  - `primaryActions` (array of `ShellAction`)
  - `layoutZones` (array of `ShellZone` describing grid placement)
  - `lastUpdated` (ISO timestamp for cache validation)
- **Relationships**:
  - Provides `WidgetInstance` collections per `ShellZone`
  - References contextual messages via `StateMessageRegistry`
- **Lifecycle**:
  - Generated during build/deploy from configuration
  - Invalidated whenever navigation taxonomy or zone definitions change

### ShellNavItem

- **Identifier**: `navKey` (string)
- **Attributes**:
  - `label` (string; localized copy)
  - `href` (string; relative route)
  - `icon` (string; maps to Lucide key)
  - `rolesAllowed` (array of roles to handle shared navigation entries)
  - `badge` (optional count/status for dynamic highlights)
- **Lifecycle**: Derived from role permissions; updates propagate through shell re-render.

### ShellZone

- **Identifier**: `zoneId` (string)
- **Attributes**:
  - `position` (enum: `hero`, `secondary`, `sidebar`, `footer`)
  - `breakpointLayout` (mapping of breakpoint → column span)
  - `widgetOrder` (array of widget keys to control ordering)
- **Lifecycle**: Config-driven; recalculated when shell layout tokens adjust.

### WidgetInstance

- **Identifier**: `widgetKey` (string unique within shell)
- **Attributes**:
  - `definitionId` (foreign key into `WidgetDefinition`)
  - `role` (enum aligning to shell role)
  - `dataSource` (string; server action identifier to call)
  - `refreshInterval` (number seconds; optional)
  - `visualProps` (JSON object of stylistic overrides within token constraints)
- **Lifecycle**: Created when shell config binds a widget definition to a zone; removed when definition is decommissioned.

### WidgetDefinition

- **Identifier**: `definitionId` (string)
- **Attributes**:
  - `type` (enum: `metricCard`, `trendChart`, `statusDistribution`, `timeline`)
  - `title` (string)
  - `description` (string for tooltips)
  - `dataShape` (schema reference describing expected response payload)
  - `component` (string mapping to shared React component)
- **Lifecycle**: Managed centrally by analytics team; reused across roles.

### TableViewConfig

- **Identifier**: `tableId` (string)
- **Attributes**:
  - `role` (enum)
  - `columns` (array of `TableColumnConfig`)
  - `defaultSort` (field + direction)
  - `filters` (array of `FilterConfig` including type, options, validation)
  - `pageSizeOptions` (array of numbers)
- **Lifecycle**: Defined in configuration, versioned to ensure compatibility with server responses.

### TableColumnConfig

- **Identifier**: `columnKey`
- **Attributes**:
  - `header` (string)
  - `accessor` (string dot-path into dataset)
  - `format` (enum: `text`, `date`, `status`, `avatar`)
  - `responsive` (object specifying visibility thresholds)
- **Lifecycle**: Adjusted when new fields surface or layout changes occur.

### FilterConfig

- **Identifier**: `filterKey`
- **Attributes**:
  - `type` (enum: `search`, `select`, `dateRange`, `statusToggle`)
  - `label` (string)
  - `optionsSource` (static array or server action reference)
  - `defaultValue` (string/array)
  - `required` (boolean)
- **Lifecycle**: Updates in tandem with table requirements and role permissions.

### StateMessageRegistry

- **Identifier**: composite key of `role` + `state` + `context`
- **Attributes**:
  - `state` (enum: `empty`, `loading`, `error`, `success`)
  - `headline` (string)
  - `body` (string; <=200 chars guidance)
  - `cta` (optional CTA definition: label + href/action)
  - `icon` (string)
- **Lifecycle**: Maintained by content designers; ensures consistent microcopy.

## Relationships Summary

- `DashboardShell` aggregates `ShellZone` which sequences `WidgetInstance` records referencing `WidgetDefinition`.
- `WidgetInstance` maps to data delivered by consolidated server actions using existing Prisma queries.
- `TableViewConfig` and `FilterConfig` bind to the same data endpoints, enabling all roles to interact with shared table primitives.
- `StateMessageRegistry` supplies composed states to both widgets and table views, ensuring aligned messaging for empty/loading/error contexts.
