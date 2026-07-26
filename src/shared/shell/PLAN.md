# Minimal composable app shell

This tracker covers the structural `@stevejuma/ui/shell` layer. CV Studio is
the visual reference only; its application store, routing, settings, and
workspace behavior are not copied.

## Public contract

- `AppShell.Root` installs an `AppShellController`.
- `AppShell.Sidebar` renders either the left or right bounded sidebar.
- `AppShell.Sidebar.Toggle` controls collapse/expand/open from shared chrome.
- A `closeable` sidebar enables `AppShell.Sidebar.Close` in its header.
- `AppShell.Main`, `AppShell.Toolbar`, and `AppShell.Body` compose the center.
- `useAppShell()` exposes the nearest root controller to consumer components.
- Left and right sidebars collapse independently to persistent icon rails.
- Closed sidebars leave layout completely and return their space to main.
- Expanded sidebars resize independently through accessible built-in handles.

## Boundaries

- Desktop only; no mobile sheet or off-canvas behavior.
- Root fills `100vh` by default and remains non-fixed; bounded catalog hosts
  may override `--ui-shell-height`.
- No width persistence, global shortcuts, routing, plugins, or views.
- Resize handles support pointer drag plus focused Arrow, Shift+Arrow, Home,
  and End keys; configured controller bounds own width clamping.
- Sidebar contents and toolbar composition remain consumer-owned; Shell
  provides only its stateful Toggle and Close actions.
- Shell containers do not scroll; main and sidebar body regions compose the
  shared shadcn Scroll Area.
- Shell may compose shadcn Button for its Toggle and Close actions.
- Production sources use native CSS and public `--ui-shell-*` tokens.
- `@stevejuma/ui/workspace` remains the full workspace framework.

## Slices

| Slice                             | Code     | Unit | Stories | Catalog | Validation |
| --------------------------------- | -------- | ---- | ------- | ------- | ---------- |
| Controller, context, and tokens   | Complete | Pass | N/A     | N/A     | Pass       |
| Compound surfaces and package API | Complete | Pass | Pass    | Pass    | Pass\*     |

## Validation

1. Focused controller unit tests.
2. Focused Storybook interaction and accessibility tests.
3. `pnpm check:no-tailwind`, `pnpm check`, and static Storybook build.
4. Compare-only visual tests; new stories remain `visual-pending`.
5. `pnpm checks` before handoff.

\* Focused unit, Storybook interaction/accessibility, source, and static build
checks pass. Compare-only visual capture remains pending human approval and
currently stops before comparison because the catalog readiness marker is not
published for Shell and existing Workspace stories. No baselines were created
or updated.
