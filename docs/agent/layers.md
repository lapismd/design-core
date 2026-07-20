---
id: layers
title: Package layers
summary: Choose shadcn, forms, workspace shell, AI, or app-specific UI.
sources:
  - README.md
  - COMPONENT_AUDIT.md
  - AGENTS.md
  - src/shared/Welcome.mdx
---

# Package layers

Pick the thinnest correct layer. Do not invent a new shared primitive when an
existing family already covers the need.

## Layers

1. **Shadcn** (`src/shared/shadcn/<family>/`) — generic primitives. Import from
   `@stevejuma/ui/shadcn/<family>`. Catalog: `Shadcn/...`. Guidance:
   `Shadcn/Guidance`.
2. **Forms** (`src/shared/forms/<family>/`) — schema-shaped editing and form-row
   chrome. Import from `@stevejuma/ui/forms` or `@stevejuma/ui/forms/core`.
   Catalog: `UI Forms/...`. Guidance: `UI Forms/Guidance`.
3. **Workspace shell** (`src/shared/workspace-shell/`) — prop-driven Studio
   chrome (sidebar / main / AI regions). No app routers or workspace context.
4. **AI** (`src/shared/ai/`) — shared AI panel primitives. Catalog: `AI/...`.
5. **Apps** (`src/apps/cv`, `src/apps/beancount`) — domain UI only. Receive props
   and callbacks. Catalog: `Apps/CV/...`, `Apps/Beancount/...`.
6. **Workspace package** (`packages/workspace`) — separate `@stevejuma/workspace`
   surface. See that package's `VENDOR.md`.
7. **Tasks reference** (`packages/tasks`) — clean-room task product contracts,
   synthetic fixtures, capture evidence, and a scoped companion theme. Read
   `pnpm ui guide tasks` before implementing its future components.

## Dependency rules

- `shared/shadcn` must not import forms or apps.
- `shared/forms` may import shadcn; must not import apps.
- `apps/*` may import shared; must not import sibling apps.
- App components take props/callbacks — no application routers or workspace
  context imports.
- Tasks composes shared primitives but owns task-specific responsive pager and
  task selection behavior; it does not import `@stevejuma/workspace` for mobile
  navigation.

## Classification

Before adding a visual export, update `COMPONENT_AUDIT.md`: shared primitive,
app-specific, or deferred. Prefer extending an audited family over a one-off.

## Next topics

- `pnpm ui guide shadcn` — add/convert shadcn families
- `pnpm ui guide forms` — forms vs shadcn controls
- `pnpm ui guide testing` — verify after changing a core component
- `pnpm ui guide tasks` — task product specs and capture evidence
