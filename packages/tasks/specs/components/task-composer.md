# Task Composer

An inline, low-friction add-task control. Idle state is a button/placeholder;
active state is a labelled text field with submit and cancel handling.

## Reuse now

- `Input` or `Textarea`, `InputGroup`, `Button`, `Field`, and `Popover`.

## Behavior

Enter submits a non-empty title. Escape cancels only a blank draft. A submit
returns focus to the new row. Metadata shortcuts must be discoverable through
buttons/menus, not syntax alone.
