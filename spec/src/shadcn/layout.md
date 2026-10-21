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
- Compact cards MUST apply the smaller inset and title size to their parts; Header and Footer MUST support `data-divided="true"` without utility classes.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-036 — Column Canvas

Collapsed rail names retain their full visible title and count. Rich catalog
rows use their complete rendered text rather than title-only naming overrides.

**Requirement.** Column Canvas MUST provide horizontally scrollable columns with consumer-owned items and responsive sizing. Wide auto mode MUST allocate scrolling pairs within bounds through inverse resizing and durable pair ratios. Leading `fixed` columns MUST pin their original expanded panels or collapsed rails, releasing trailing pins when scrolling minimums cannot fit. External Scroll Area viewports, custom rails, transient previews and accessible trailing content MUST preserve compact behavior and persistence.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/column-canvas`; controllers preserve identity and optional-property assignability, custom titles label headers/rails without generating headers, custom rails retain accessible fallbacks, headers retain shared start/tighter trailing insets and distinct hover tokens, trailing snippets use positive-width spacers without registration/persistence, blank spacers remain aria-hidden and compact omits spacers; `Body` defaults vertical and supports horizontal/both bounded scrolling, focus and near-end callbacks under native/styled strategies.
- Structural navigation, controller visibility changes and runtime registration supersede resize capture and immediately align the deepest expanded pair; pointer, keyboard and reset resizing activate adjacent expanded pairs without scrolling and resize inversely at constant total, deducting context, collapsed rails, margins and gaps; measurements retain horizontal position across temporary width resets, resize completion releases capture before later native scroll, and resize observation retains alignment without tracking measurement state.
- `fixed` defaults false and overrides `sticky` within the leading eligible prefix, pins original expanded/collapsed DOM with logical positioning, preserves spacing and independent resizing outside wide pairs, reserves scrolling pair minimums in wide mode or the largest remaining minimum in fixed mode including margins/gaps, releases trailing fixed pins until capacity fits and restores without durable changes, supports internal/external viewports and disables pinning in compact mode while preserving legacy gapless sticky-only rails.
- External viewports align sticky return rails at the viewport edge; pinned contents retain focus, portals, drag/drop and vertical-wheel priority; teardown cancels measurements and obsolete interaction handlers; wide/fixed previews default to collapsed/custom/sticky rail hover (600 ms reveal, 120 ms dismissal), support per-column opt-out/timing, preserve one content instance, rail space and closed-column omission, never persist, and anchor within the viewport with normal surfaces and neutral boundaries; compact disables hover previews.

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
- Browser coverage MUST prove wheel, keyboard, programmatic, track, and thumb-drag scrolling; bounded direct and imperative layouts; overflow-aware geometry; each visibility mode without relying on native scrollbar paint; and safe native/styled listener/observer teardown without runtime diagnostics, including queued resize work and document pointer events after disposal.

## DC-SHA-039 — Separator

**Requirement.** The Separator family MUST render semantic or decorative separation in horizontal and vertical orientations.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/separator`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-040 — Sidebar

**Requirement.** The Sidebar family MUST compose responsive navigation rails, content groups, menus, toggles, and controlled open state.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/sidebar`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract; Sidebar.Trigger MUST accept a left/right side defaulting to left and derive expanded state from the current desktop or mobile provider state.

## DC-SHA-053 — Panel Toggle

**Requirement.** Panel Toggle MUST provide controlled standard and compact panel icons for left, right, top and bottom edges through a shared native-CSS implementation.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/panel-toggle`; compact remains the default with a 28×24px button and 18×12px icon, while standard reproduces Workspace's frame and bar geometry at a default 16×16px size.
- Expanded state MUST thicken the indicated edge without rotating the frame; button hover and keyboard focus preview the opposite thickness without changing state, respecting disabled controls and reduced motion.
- The decorative icon MUST accept native SVG styling attributes and documented sizing tokens; Workspace, AppShell, Sidebar triggers and mobile/settings controls MUST compose it while retaining controller state, labels, focus, drag exclusions, hints and surface sizing.
- Column Canvas MUST retain its compact default, custom content, preview behavior, controller actions and composed header hover tokens.
