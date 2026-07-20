# Task List

Renders ordered task rows, grouped headings, collapsed Done state, empty state,
and a composer insertion point. It owns list semantics and roving/explicit row
focus but receives task data and callbacks from its page.

## Reuse now

- `ScrollArea`, `Collapsible`, `Empty`, `Separator`, and `Skeleton`.

## Contract

Groups are semantic sections with headings. Order mutation is optimistic only
when the owner accepts `onReorder`; no internal persistence or router imports.
Keep a selected task visible after opening its detail.
