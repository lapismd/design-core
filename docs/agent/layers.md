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
   `@lapismd/design-core/shadcn/<family>`. Catalog: `Shadcn/...`. Guidance:
   `Shadcn/Guidance`.
2. **Forms** (`src/shared/forms/<family>/`) — schema-shaped editing and form-row
   chrome. Import from `@lapismd/design-core/forms` or `@lapismd/design-core/forms/core`.
   Catalog: `UI Forms/...`. Guidance: `UI Forms/Guidance`.
3. **Filter** (`src/shared/filter/`) — search chrome and filter-query language
   (`PowerSearch`, `SearchFilterBar`, `parseFilterQuery`, host `filterSyntax`).
   Import from
   `@lapismd/design-core/filter`. Catalog: `Filter/...`. Guidance: `Filter/Guidance`.
4. **AI** (`src/shared/ai/<component>/`) — shared AI chat primitives (one
   folder per component; experimental under `experimental/<component>/`).
   Import from `@lapismd/design-core/ai`, `@lapismd/design-core/ai/chat`, or
   `@lapismd/design-core/ai/experimental`. Catalog: `AI/...`.
5. **Shell** (`src/shared/shell/app-shell/`) — bounded structural application
   chrome with independently controlled collapsible, closeable, and resizable
   left/right rails, optional same-side nesting, a full-height outer variant
   with collapsed/closed edge and delayed toggle-hover previews, fixed sidebar
   regions, a toolbar, and shadcn Scroll Areas for main and sidebar bodies. One
   compound composition resolves desktop or a transient left/main/right mobile
   track from the bounded root width; multiple panels on an edge use shadcn
   Select. Auto mode is the default. Constrained desktop protects a minimum
   main width by presenting lower-priority outer panels as overlays without
   mutating durable layout. Its injected versioned adapter persists desktop
   sidebar state and widths, including named same-side panels, but not
   transient mobile state. Layer root keeps `Guidance.mdx`, tokens, and the
   `@lapismd/design-core/shell` re-export barrel. Catalog: `Shell/App Shell`. Guidance:
   `Shell/Guidance` and `pnpm ui guide shell`. It owns geometry plus
   Toggle/Close actions; consumers own navigation selection, other actions,
   content, and non-layout persistence.
6. **Workspace** (`src/shared/workspace/`) — application-independent workspace
   framework, controller, layout, views, shell components, settings, and static
   plugin presentation. Import from `@lapismd/design-core/workspace`. Catalog:
   `Workspace/...`. Its shell geometry uses native CSS; declarative settings
   and other generic controls compose UI-owned shadcn primitives.

## Dependency rules

- `shared/shadcn` must not import forms, filter, or AI.
- `shared/filter` may import shadcn; it must not import forms in production
  code (stories may compose forms pickers).
- `shared/forms` may import shadcn and filter.
- `shared/ai` may compose generic shared controls but must remain
  host-controlled and reusable.
- `shared/shell` may compose shadcn Scroll Area for bounded section scrolling,
  Button for Toggle/Close actions, and Select for a mobile edge with multiple
  registered panels. It must not import workspace or application state in
  production sources. Stories may compose other shadcn controls.
- `shared/workspace` may import generic controls from `shared/shadcn` and may
  use headless Bits UI and Paneforge directly for workspace-specific geometry.
  It must not import forms, filter, AI, or application-specific surfaces.

## Folder layout

Layout is driven by **catalog/story identity**, not “one `.svelte` file per
folder.”

| Layer          | Path shape                    | Keep together                             | Split apart                                          |
| -------------- | ----------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| Shadcn         | `<family>/`                   | Multipart parts of one family             | Never split Dialog/Sidebar-style parts               |
| Forms / Filter | `<family>/`                   | Supporting helpers of one catalog surface | Independently titled catalog components              |
| AI             | `<component>/`                | Internal helpers of that component        | Separate catalog components                          |
| Shell          | `app-shell/` under layer root | All `AppShell.*` parts + controllers      | Do not flatten to `shell/*.svelte`                   |
| Workspace      | `<family>/`                   | Compound visual families                  | Only if a family gains multiple primary story titles |

Anti-patterns to avoid:

- Dumping several independently titled Storybook groups into one directory
  (the old `forms/structured-form` + YAML/JSON orchestrators case).
- Flattening a compound API across the layer root (the old `shell/AppShell*.svelte`
  dump).
- Splitting shadcn or workspace compound parts into one folder per part.

Baselines follow nested import paths (`forms/<family>/…`, `shell/app-shell/…`).
When you move sources, move snapshot dirs and any hard-coded `visualDelta` URLs
with them; do not refresh PNG pixels unless visuals change.

## Classification

Before adding a visual export, update `COMPONENT_AUDIT.md`: shared primitive or
deferred. Prefer extending an audited family over a one-off.

## Next topics

- `pnpm ui guide shadcn` — add/convert shadcn families
- `pnpm ui guide forms` — forms vs shadcn controls
- `pnpm ui guide shell` — canonical shell topology and interaction placement
- `pnpm ui guide testing` — verify after changing a core component
