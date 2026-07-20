# Task Row

The densest interactive primitive: a completion control, title, compact
metadata, optional drag affordance, and independent details action. It is a
single logical task but has separate completion and open targets.

## Reuse now

- `Button` for icon-only actions with accessible labels.
- `Badge` for compact labels/status when visual treatment remains appropriate.
- `Tooltip` for icon explanations.

## Add before implementation

- `Checkbox` via `pnpm ui:add checkbox` for a semantic completion control.

## States

Open, done, selected, overdue, due-today, focused, dragging, drag-over,
swipe-revealed, and reduced-motion. Done title decoration must preserve readable
contrast and not be the only status signal.

## Tests

Click completion; click body selection; double-click no-op/selection parity;
explicit details action; Enter/Space keyboard split; drag reorder; mobile swipe
action with button equivalent.
