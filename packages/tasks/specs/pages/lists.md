# Lists page spec

Lists is an index of task lists with filter chips for **All**, **Shared**,
**Private**, and **Meetings**. A row shows title, optional count/ownership
metadata, a favourite control, and a non-destructive overflow menu.

## Interaction

- Activating a row opens list detail.
- Favourite is independently focusable and does not open the row.
- Filter changes do not mutate list data.
- Creating a list is explicit and defaults to private; shared choice is a later
  controlled option, not an implicit side effect.
