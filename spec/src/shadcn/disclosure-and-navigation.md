# Shadcn / Disclosure and navigation

Disclosure and navigation primitives retain semantic structure and keyboard behavior across controlled compositions.

## Public surface coverage

| Surface     | Public boundary                           | Requirement |
| ----------- | ----------------------------------------- | ----------- |
| Accordion   | `@lapismd/design-core/shadcn/accordion`   | DC-SHA-018  |
| Collapsible | `@lapismd/design-core/shadcn/collapsible` | DC-SHA-019  |
| Tabs        | `@lapismd/design-core/shadcn/tabs`        | DC-SHA-020  |
| Breadcrumb  | `@lapismd/design-core/shadcn/breadcrumb`  | DC-SHA-021  |
| Pagination  | `@lapismd/design-core/shadcn/pagination`  | DC-SHA-022  |

## DC-SHA-017 — Shared Shadcn invariants

**Requirement.** Shadcn families MUST retain upstream semantic composition while using Design Core tokens, provenance metadata, and accessible focus behavior.

### Acceptance details

- Multipart primitives must remain importable as one family.
- Owned source must preserve `data-slot` and Design Core provenance metadata where generated.

## DC-SHA-018 — Accordion

**Requirement.** The Accordion family MUST coordinate accessible single or multiple disclosure items with keyboard navigation.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/accordion`.
- Triggers MUST default their disclosure indicator to the inline end, support an explicit inline-start position, and offer right-when-closed/down-when-open disclosure arrows without changing accessible state.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-019 — Collapsible

**Requirement.** The Collapsible family MUST expose controlled disclosure state across trigger and content parts.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/collapsible`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-020 — Tabs

**Requirement.** The Tabs family MUST coordinate tab list, triggers, panels, orientation, and keyboard selection.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/tabs`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-021 — Breadcrumb

**Requirement.** The Breadcrumb family MUST render hierarchical navigation with semantic current-page and overflow treatment.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/breadcrumb`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-022 — Pagination

**Requirement.** The Pagination family MUST compose labelled page navigation with active, previous, next, and ellipsis states.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/pagination`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
