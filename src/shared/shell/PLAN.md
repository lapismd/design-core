# Minimal composable app shell

This tracker covers the structural `@stevejuma/ui/shell` layer. CV Studio is
the visual reference only; its application store, routing, settings, and
workspace behavior are not copied.

## Public contract

- `AppShell.Root` installs an `AppShellController`.
- `AppShell.Sidebar` renders either the left or right bounded sidebar.
- `AppShell.Main`, `AppShell.Toolbar`, and `AppShell.Body` compose the center.
- `useAppShell()` exposes the nearest root controller to consumer components.
- Left and right sidebars collapse independently to persistent icon rails.

## Boundaries

- Desktop only; no mobile sheet or off-canvas behavior.
- No resizing, persistence, keyboard shortcuts, routing, plugins, or views.
- Sidebar contents and toolbar controls remain consumer-owned.
- Production sources use native CSS and public `--ui-shell-*` tokens.
- `@stevejuma/ui/workspace` remains the full workspace framework.

## Slices

| Slice                             | Code     | Unit | Stories | Catalog | Validation |
| --------------------------------- | -------- | ---- | ------- | ------- | ---------- |
| Controller, context, and tokens   | Complete | Pass | N/A     | N/A     | Pass       |
| Compound surfaces and package API | Pending  | N/A  | Pending | Pending | Pending    |

## Validation

1. Focused controller unit tests.
2. Focused Storybook interaction and accessibility tests.
3. `pnpm check:no-tailwind`, `pnpm check`, and static Storybook build.
4. Compare-only visual tests; new stories remain `visual-pending`.
5. `pnpm checks` before handoff.
