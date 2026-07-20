# Task Detail

Controlled selected-task editor with a close/back control, title, properties,
note, activity, and comment placeholder. It is a desktop rail or a mobile pager
pane; the content contract is identical.

## Reuse now

- `ScrollArea`, `Separator`, `Button`, `Textarea`, `Popover`, `DropdownMenu`.

## Add before implementation

- `Avatar` via `pnpm ui:add avatar` for assignee/presence treatments.

## Tests

Open from pointer and keyboard, initial focus, property changes, Escape, focus
return, mobile back, and right-swipe pager return.
