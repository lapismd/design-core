---
id: layers
title: Package layers
summary: Choose shadcn, forms, filter, AI, shell, or workspace.
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
3. **Filter** (`src/shared/filter/`) — search chrome and filter-query language
   (`PowerSearch`, `SearchFilterBar`, `parseFilterQuery`, host `filterSyntax`).
   Import from
   `@stevejuma/ui/filter`. Catalog: `Filter/...`. Guidance: `Filter/Guidance`.
4. **AI** (`src/shared/ai/`) — shared AI panel primitives. Catalog: `AI/...`.
5. **Shell** (`src/shared/shell/`) — bounded structural application chrome with
   independently controlled collapsible, closeable, and resizable left/right
   rails, optional same-side nesting, a full-height outer variant with
   collapsed/closed edge and delayed toggle-hover previews, fixed sidebar
   regions, a toolbar, and shadcn
   Scroll Areas for main and sidebar bodies. Its injected versioned adapter may
   persist sidebar state and widths, including named same-side panels. Import from
   `@stevejuma/ui/shell`. Catalog:
   `Shell/App Shell`. It owns geometry plus Toggle/Close actions; consumers own
   navigation selection, other actions, content, and non-layout persistence.
6. **Workspace** (`src/shared/workspace/`) — application-independent workspace
   framework, controller, layout, views, shell components, settings, and static
   plugin presentation. Import from `@stevejuma/ui/workspace`. Catalog:
   `Workspace/...`. It uses native CSS and does not import the shadcn layer.

## Dependency rules

- `shared/shadcn` must not import forms, filter, or AI.
- `shared/filter` may import shadcn; it must not import forms in production
  code (stories may compose forms pickers).
- `shared/forms` may import shadcn and filter.
- `shared/ai` may compose generic shared controls but must remain
  host-controlled and reusable.
- `shared/shell` may compose shadcn Scroll Area for bounded section scrolling
  and Button for its Toggle/Close actions. It must not import workspace or
  application state in production sources. Stories may compose other shadcn
  controls.
- `shared/workspace` may use headless Bits UI and Paneforge directly; it must
  not import shadcn, forms, filter, AI, or application-specific surfaces.

## Classification

Before adding a visual export, update `COMPONENT_AUDIT.md`: shared primitive or
deferred. Prefer extending an audited family over a one-off.

## Next topics

- `pnpm ui guide shadcn` — add/convert shadcn families
- `pnpm ui guide forms` — forms vs shadcn controls
- `pnpm ui guide testing` — verify after changing a core component
