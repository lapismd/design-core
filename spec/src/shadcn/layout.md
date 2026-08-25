# Shadcn / Layout

Layout primitives establish reusable spatial, scrolling, and responsive composition without application-domain policy.

## Public surface coverage

| Surface       | Public boundary                             | Requirement |
| ------------- | ------------------------------------------- | ----------- |
| Card          | `@lapismd/design-core/shadcn/card`          | DC-SHA-035  |
| Column Canvas | `@lapismd/design-core/shadcn/column-canvas` | DC-SHA-036  |
| Resizable     | `@lapismd/design-core/shadcn/resizable`     | DC-SHA-037  |
| Scroll Area   | `@lapismd/design-core/shadcn/scroll-area`   | DC-SHA-038  |
| Separator     | `@lapismd/design-core/shadcn/separator`     | DC-SHA-039  |
| Sidebar       | `@lapismd/design-core/shadcn/sidebar`       | DC-SHA-040  |

## DC-SHA-034 — Shared Shadcn invariants

**Requirement.** Shadcn families MUST retain upstream semantic composition while using Design Core tokens, provenance metadata, and accessible focus behavior.

### Acceptance details

- Multipart primitives must remain importable as one family.
- Owned source must preserve `data-slot` and Design Core provenance metadata where generated.

## DC-SHA-035 — Card

**Requirement.** The Card family MUST compose related header, content, footer, media, title, description, and action regions.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/card`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-036 — Column Canvas

**Requirement.** The Column Canvas family MUST lay out horizontally scrollable columns with consumer-owned items and responsive sizing. In wide auto mode, adjacent expanded columns MUST share the available stage within configured bounds through one inverse resize divider when structurally activated or explicitly resized, with independent durable pair ratios. Collapsed or closed columns MAY expose consumer-owned rails and transient full-height previews without changing durable layout. Fixed and compact modes MUST retain their documented behavior.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/column-canvas`; controller updates must preserve consumer item identity, header actions must use distinct public hover tokens, and custom collapsed rails must retain the default accessible fallback.
- Structural navigation and direct controller open, close, collapse, expand, and runtime column registration changes activate the deepest pair of expanded columns, skip collapsed rails as pair members, deduct their widths, margins, and intervening gaps from the shared stage, supersede any pending resize-scroll restoration, and update the wide-mode native scroll position immediately.
- Pointer, keyboard, or reset interaction on any eligible divider activates that adjacent expanded pair without moving the canvas; resizing changes the two widths inversely while their total remains constant.
- Wide and fixed previews must preserve collapsed rail space, leave closed columns out of inline flow, keep owned portalled controls interactive, and remain outside layout persistence; their zero-width boundary MUST expose a thin neutral-grey hover/focus affordance rather than the primary accent, their overlay MUST paint the normal column surface above adjacent content, and compact presentation must disable hover preview.

## DC-SHA-037 — Resizable

**Requirement.** The Resizable family MUST compose keyboard-accessible resizable panels and handles with documented orientation.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/resizable`.
- Pointer handles MUST expose column or row resize cursors for their orientation and retain that cursor across the document for the duration of a pointer drag, including in system WebViews where axis-combined resize cursors are unavailable.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-038 — Scroll Area

**Requirement.** The Scroll Area family MUST provide styled viewport and scrollbar parts while preserving native scrolling semantics.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/scroll-area`.
- Blink and Gecko MUST retain Bits UI scrolling while WebKit hosts identified by an engine marker or user agent MUST use a dedicated native viewport outside Bits UI's hidden-scrollbar selector; both strategies MUST render Design Core-owned, compact edge-anchored thumbs that reserve no native gutter, expand inward, and adopt a stronger shade while hovered or dragged without widening the transparent interaction rail.
- `ScrollAreaVisibility` MUST expose `scroll`, `hover`, and `always`; an omitted local type MUST inherit the nearest App Shell preference, while an explicit type remains authoritative for standalone consumers.
- Browser coverage MUST prove wheel, keyboard, programmatic, track, and thumb-drag scrolling; bounded direct and imperative layouts; overflow-aware geometry; and each visibility mode without relying on the native scrollbar paint.

## DC-SHA-039 — Separator

**Requirement.** The Separator family MUST render semantic or decorative separation in horizontal and vertical orientations.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/separator`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-040 — Sidebar

**Requirement.** The Sidebar family MUST compose responsive navigation rails, content groups, menus, toggles, and controlled open state.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/sidebar`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
