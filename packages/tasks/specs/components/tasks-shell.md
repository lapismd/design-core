# Tasks Shell

The controlled root layout. It receives `navigation`, `main`, and optional
`detail` snippets plus `activePage`, `selectedTaskId`, and responsive state.

## Reuse now

- `@stevejuma/ui/shadcn/sidebar`
- `@stevejuma/ui/shadcn/resizable`
- `@stevejuma/ui/shadcn/scroll-area`
- `@stevejuma/ui/shadcn/separator`

## Custom Tasks responsibility

The responsive pane/pager policy and selected-task coordination are task-domain
composition, not a general workspace shell. Keep it inside this package.

## Layout

- Outer `.tasks-shell` canvas with padding; navigation sits on the canvas.
- Rounded `.tasks-shell__workspace` surface panel holds main + optional detail.
- No hard divider between navigation and workspace; subtle divider between main
  and detail inside the workspace when detail is open.
- Sidebar and detail widths use `--tasks-sidebar-width` (267px target) and
  `--tasks-detail-width` (450px target).

## Stories and tests

- Destination variants: Inbox, Today, Tasks, Updates, Lists, and per-list
  destinations (e.g. Tasks UI Reference, Shared planning).
- Wide desktop with detail open.
- Compact desktop detail constraint.
- Portrait/mobile pager positions.
- Focus restore after closing detail; no scroll reset.
