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

## Stories and tests

- Wide desktop with no detail and with detail.
- Compact desktop detail constraint.
- Portrait/mobile pager positions.
- Focus restore after closing detail; no scroll reset.
