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

**Requirement.** Column Canvas MUST provide horizontally scrollable columns with consumer-owned items and responsive sizing. Wide auto mode MUST allocate adjacent expanded columns within bounds through inverse resizing and durable pair ratios. Collapsed or closed columns MAY expose custom rails and transient full-height previews without changing persistence. Fixed canvases MAY use an external Scroll Area viewport; column bodies accept an explicit scroll strategy, while compact behavior remains unchanged.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/column-canvas`; controller updates must preserve consumer item identity, header actions must use distinct public hover tokens, column headers must keep the shared start inset and a tighter trailing inset so actions sit closer to the column edge, custom collapsed rails must retain the default accessible fallback, and constructing a controller without persistence plus layout-change events that omit `relatedColumnId` MUST stay assignable under `exactOptionalPropertyTypes`.
- Structural navigation and direct controller open, close, collapse, expand, and runtime column registration changes activate the deepest pair of expanded columns, skip collapsed rails as pair members, deduct their widths, margins, and intervening gaps from the shared stage, supersede any pending resize-scroll restoration, and update the wide-mode native scroll position immediately.
- Pointer, keyboard, or reset interaction on any eligible divider activates that adjacent expanded pair without moving the canvas; resizing changes the two widths inversely while their total remains constant.
- External fixed viewports MUST align sticky return rails at the viewport edge, retain return navigation and stop queued work on teardown; resize observation retains active-pair alignment without tracking measurement state; wide/fixed previews preserve collapsed rail space, omit closed columns, retain interactive portals, avoid persistence, expose a thin neutral-grey boundary and paint the normal surface above adjacent content, while compact mode disables hover preview.

## DC-SHA-037 — Resizable

**Requirement.** The Resizable family MUST compose keyboard-accessible resizable panels and handles with documented orientation.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/resizable`.
- Pointer handles MUST expose column or row resize cursors for their orientation and retain that cursor across the document for the duration of a pointer drag, including in system WebViews where axis-combined resize cursors are unavailable.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-038 — Scroll Area

**Requirement.** The Scroll Area family MUST provide styled viewport and scrollbar parts while preserving native scrolling semantics. In `scroll` visibility mode, an overflowing overlay MUST retain a transparent interaction rail after its paint hides so pointer entry can reveal the thumb. A shown overlay MUST remain visible while its track or thumb is hovered or dragged and resume delayed hiding after pointer departure; hovering only the content MUST NOT activate it.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/scroll-area`; opt-in `fillContent` fills a bounded viewport for percentage-sized child layouts.
- Blink and Gecko default to Bits UI; WebKit, explicit `scrollStrategy="native"` and root `data-ui-scroll-strategy="native"` hosts MUST use the dedicated native viewport outside hidden-scrollbar selectors; explicit strategies win; both strategies MUST reserve no gutter, place compact thumbs one pixel from the inline/block end, expand and darken inward on hover/drag without widening the rail, update thumb length without transition, and MAY animate cross-axis expansion; native viewports MUST avoid duplicate landmarks and cancel queued work during teardown.
- `ScrollAreaVisibility` MUST expose `scroll`, `hover`, and `always`; an omitted local type MUST inherit the nearest App Shell preference, while an explicit type remains authoritative for standalone consumers.
- Browser coverage MUST prove wheel, keyboard, programmatic, track, and thumb-drag scrolling; bounded direct and imperative layouts; overflow-aware geometry; each visibility mode without relying on native scrollbar paint; and safe overlay listener/observer teardown when Svelte clears bound references before effect cleanup.

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
