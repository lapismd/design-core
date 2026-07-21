# Tasks style specification

## Visual hierarchy

The outer canvas is cool and subdued. The working surface is a rounded light
panel; desktop adds a visually separate detail rail. Navigation, task lists, and
properties use quiet separators and compact, low-contrast controls. The primary
reading hierarchy is title → group → task title → metadata.

## Tokens

Use the scoped `.tasks-theme` variables only:

- **Surfaces:** `--tasks-canvas`, `--tasks-shell`, `--tasks-surface`, and
  `--tasks-surface-raised`. Desktop shell chrome uses a near-white cool canvas
  that matches the main surface (flush frame); raised surfaces are reserved for
  overlays and compact controls.
- **Text and dividers:** `--tasks-ink`, `--tasks-muted-ink`, and
  `--tasks-divider`.
- **State:** `--tasks-accent`, `--tasks-selection`, `--tasks-focus-ring`,
  `--tasks-danger`, and `--tasks-success`. Active navigation uses a quiet cool
  selection fill plus a thin coral accent bar (`--tasks-accent`), kept distinct
  from `--tasks-danger`.
- **Tip strip:** `--tasks-tip-bg` and `--tasks-tip-border` — soft
  lavender/selection color-mixes used behind the destination header's
  contextual tip. Rendered with `--tasks-radius-control`, not a full pill.
- **Type:** `--tasks-title-size` (destination header `<h1>`) and
  `--tasks-section-label-size` (uppercase nav section labels).
- **Geometry:** `--tasks-sidebar-width`, `--tasks-detail-width`,
  `--tasks-task-row-height`, `--tasks-nav-item-height`, and
  `--tasks-topbar-height`.
- **Spacing:** `--tasks-space-canvas` (shell outer padding; `0` for full-bleed
  desktop captures), `--tasks-space-canvas-compact`, and `--tasks-gap-nav`.
- **Radius:** `--tasks-radius-shell`, `--tasks-radius-control`, and
  `--tasks-radius-pill` (fully rounded counts/circular chrome buttons).
- **Shadow:** `--tasks-shadow-workspace` (nav/main edge), `--tasks-shadow-detail`
  (compact-desktop detail rail overlay).
- **Motion:** fast and standard durations; both become zero under reduced motion.

## Layout measurements

Use `--tasks-task-row-height: 44px` as the default dense row, then allow a
larger multi-line mobile row. Use `--tasks-sidebar-width: 267px` and
`--tasks-detail-width: 450px` only at desktop-capable widths. Do not reserve a
detail rail below the compact desktop breakpoint.

## Dark companion

The dark theme preserves semantic contrast and hierarchy; it is not a literal
inversion or imitation of the observed product. Verify focus, done text,
selection, overdue state, and disabled controls in both themes.
