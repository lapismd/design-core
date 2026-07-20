# List Navigation and Index

Two related compositions: the persistent shell navigation list collection and
the Lists page index. Both use independently focusable favourite/overflow
actions so list activation remains predictable.

## Reuse now

- `Sidebar`, `Button`, `ScrollArea`, `Separator`, `DropdownMenu`, `ToggleGroup`.

## Add when required

- `ContextMenu` via `pnpm ui:add context-menu` for desktop list-row secondary
  actions. It must not be the only path to a command.
