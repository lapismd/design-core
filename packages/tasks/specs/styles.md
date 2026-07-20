# Tasks style specification

## Visual hierarchy

The outer canvas is cool and subdued. The working surface is a rounded light
panel; desktop adds a visually separate detail rail. Navigation, task lists, and
properties use quiet separators and compact, low-contrast controls. The primary
reading hierarchy is title → group → task title → metadata.

## Tokens

Use the scoped `.tasks-theme` variables only:

- **Surfaces:** `--tasks-canvas`, `--tasks-shell`, `--tasks-surface`, and
  `--tasks-surface-raised`.
- **Text and dividers:** `--tasks-ink`, `--tasks-muted-ink`, and
  `--tasks-divider`.
- **State:** `--tasks-accent`, `--tasks-selection`, `--tasks-focus-ring`,
  `--tasks-danger`, and `--tasks-success`.
- **Geometry:** sidebar/detail widths, row height, shell radius, and control
  radius.
- **Motion:** fast and standard durations; both become zero under reduced motion.

## Layout measurements

Use `--tasks-task-row-height: 44px` as the default dense row, then allow a
larger multi-line mobile row. Use `--tasks-sidebar-width: 264px` and
`--tasks-detail-width: 376px` only at desktop-capable widths. Do not reserve a
detail rail below the compact desktop breakpoint.

## Dark companion

The dark theme preserves semantic contrast and hierarchy; it is not a literal
inversion or imitation of the observed product. Verify focus, done text,
selection, overdue state, and disabled controls in both themes.
