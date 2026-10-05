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
| Panel Toggle  | `@lapismd/design-core/shadcn/panel-toggle`  | DC-SHA-053  |

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

**Requirement.** Column Canvas MUST provide horizontally scrollable columns with consumer-owned items and responsive sizing. Wide auto mode MUST allocate scrolling pairs within bounds through inverse resizing and durable pair ratios. Leading `fixed` columns MUST pin their original expanded panels or collapsed rails, releasing trailing pins when scrolling minimums cannot fit. External Scroll Area viewports, custom rails, transient previews and accessible trailing content MUST preserve compact behavior and persistence.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/column-canvas`; controllers preserve identity and optional-property assignability, custom titles label headers/rails without generating headers, custom rails retain accessible fallbacks, headers retain shared start/tighter trailing insets and distinct hover tokens, trailing snippets use positive-width spacers without registration/persistence, blank spacers remain aria-hidden and compact omits spacers; `Body` defaults vertical and supports horizontal/both bounded scrolling, focus and near-end callbacks under native/styled strategies.
- Structural navigation, controller visibility changes and runtime registration activate and immediately align the deepest expanded pair, superseding queued resize restoration; pointer, keyboard and reset resizing activate adjacent expanded pairs without scrolling and resize inversely at constant total, deducting context, collapsed rails, margins and gaps from allocation while resize observation retains alignment without tracking measurement state.
- `fixed` defaults false and overrides `sticky` within the leading eligible prefix, pins original expanded/collapsed DOM with logical positioning, preserves spacing and independent resizing outside wide pairs, reserves scrolling pair minimums in wide mode or the largest remaining minimum in fixed mode including margins/gaps, releases trailing fixed pins until capacity fits and restores without durable changes, supports internal/external viewports and disables pinning in compact mode while preserving legacy gapless sticky-only rails.
- External viewports align sticky return rails at the viewport edge and retain return navigation; pinned contents retain focus, menus, drag/drop and vertical-wheel priority, queued work and measurements stop on teardown, and wide/fixed previews anchor to visible rails, preserve collapsed space, omit closed columns, retain interactive portals, avoid persistence and paint normal surfaces with thin neutral-grey boundaries above adjacent content while compact disables hover preview.

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

## DC-SHA-053 — Panel Toggle

**Requirement.** Panel Toggle MUST compose Button with a compact rectangular icon and controlled expanded state. Hover and keyboard focus MUST preview the opposite bar width without changing state. Column Canvas MUST use this icon by default.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/panel-toggle`; default button and icon sizes are 28×24px and 18×12px, with left or right orientation.
- Bar transitions MUST preserve frame geometry, reverse on pointer departure, and respect reduced motion and disabled controls.
- Button semantics, accessible labels, visible focus, forced colors and composed header hover tokens MUST remain available; consumers own state changes.
- Column Canvas toggles and collapsed rails MUST use the shared icon while retaining custom icons, rails, preview behavior and controller actions.
