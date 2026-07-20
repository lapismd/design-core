# List detail page spec

List detail combines a list header, task collection, composer, and optional
rich list description. The header has original Tasks controls for sharing,
filtering, favourite, and more actions; their visibility may change by viewport
but no action becomes unreachable.

## States

- Private fixture list with open and completed tasks.
- Filtered list.
- Composer active.
- Selected task / detail open.
- Empty list.

The list title is editable through an explicit action. Editing must not trigger
when a user merely opens the list or selects a task.
