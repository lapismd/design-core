---
id: layers
title: Package layers
summary: Choose shadcn, forms, filter, or AI.
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

## Dependency rules

- `shared/shadcn` must not import forms, filter, or AI.
- `shared/filter` may import shadcn; it must not import forms in production
  code (stories may compose forms pickers).
- `shared/forms` may import shadcn and filter.
- `shared/ai` may compose generic shared controls but must remain
  host-controlled and reusable.

## Classification

Before adding a visual export, update `COMPONENT_AUDIT.md`: shared primitive or
deferred. Prefer extending an audited family over a one-off.

## Next topics

- `pnpm ui guide shadcn` — add/convert shadcn families
- `pnpm ui guide forms` — forms vs shadcn controls
- `pnpm ui guide testing` — verify after changing a core component
