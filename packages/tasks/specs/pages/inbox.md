# Inbox page spec

Inbox is the default collection of untriaged or incoming tasks. Its header
contains an Inbox title, an optional contextual education/callout region, and
an always-available new-task affordance. Rows show completion first, then title
and only the most useful metadata.

## States

- Default open tasks.
- Composer active at top or bottom of the list.
- Selected row / open detail.
- Empty state with an action to add the first task.
- Done items collapsed below open items when present.

## Interactions

- Click row body selects it and reveals its details affordance; that affordance
  opens detail. The observed desktop double click does not replace this route.
- Click completion changes only completion state.
- `n` or the new-task button starts composition when the focus context permits.
- Escape cancels a blank composer and closes a transient detail view.
