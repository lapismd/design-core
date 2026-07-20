# Task detail page spec

Task detail is the focused editor for one task. Desktop uses a right rail when
space permits; portrait/mobile uses a full pager pane with a back action.

## Anatomy

- Close/back action, completion control, title, and selected-state context.
- Property actions: due date, assignee, priority, labels, and list membership.
- Optional note/content region.
- Activity/audit region and comment composer placeholder (presentational in v1).

## Interaction

- Opening moves focus to the detail heading/title.
- Inline title editing commits on Enter or blur and cancels on Escape.
- Property menus use the shared primitive menu/popover contract and retain a
  visible label for current value.
- On mobile, back and a right swipe return to the list; swipe must not conflict
  with row-level action gestures.
