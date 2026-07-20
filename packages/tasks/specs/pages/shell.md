# Shell page spec

## Purpose

Provide the stable navigation and workspace frame around all core Tasks pages.

## Desktop anatomy

1. Muted outer canvas.
2. Persistent left navigation: product switcher/account area, Inbox, Today,
   Tasks, Updates, Lists, then private/shared list collections.
3. Rounded main working surface with page header and scrollable content.
4. Optional right detail rail for the selected task at wide desktop widths.

The active destination is a quiet filled selection, not a heavy tab. Numeric
counts are secondary. Sidebar controls retain icon + text labels; do not make
the visible sidebar icon-only.

## Responsive behavior

At 896px and below, remove the persistent sidebar and present the list and
detail as adjacent pager panes. Preserve the active destination in a compact
top control; never squeeze the desktop three-column layout into mobile.

## Storybook states

- Desktop, no selection.
- Desktop, selected task with detail rail.
- Compact desktop, selected task in constrained detail presentation.
- Tablet portrait list pane.
- Mobile detail pane with back action.

## Acceptance

- Sidebar width and detail width come from `--tasks-sidebar-width` and
  `--tasks-detail-width`.
- Main scroll is independent from navigation and detail scroll.
- Opening/closing detail does not reset the list scroll position.
