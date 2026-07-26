# Minimal composable app shell

This tracker covers the structural `@stevejuma/ui/shell` layer. CV Studio is
the visual reference only; its application store, routing, settings, and
workspace behavior are not copied.

## Public contract

- `AppShell.Root` installs an `AppShellController`.
- `AppShell.Sidebar` renders either the left or right bounded sidebar.
- A sidebar may receive an independent `AppShellSidebarController` so repeated
  same-side surfaces can compose nested navigation layouts.
- `AppShell.Sidebar.Toggle` controls collapse/expand/open from shared chrome.
- A toggle may opt into a delayed expanded hover preview for its collapsed or
  closed sidebar.
- A `closeable` sidebar enables `AppShell.Sidebar.Close` in its header.
- An `outer` sidebar may opt into a collapsed/closed edge preview that overlays
  the shell without moving its icon rail or adjacent layout.
- `AppShell.Main`, `AppShell.Toolbar`, and `AppShell.Body` compose the center.
- `useAppShell()` exposes the nearest root controller to consumer components.
- Left and right sidebars collapse independently to persistent icon rails.
- Collapsed inline rails omit header/footer separators; expanded overlays
  restore them.
- Built-in header Toggle/Close actions align to the main toolbar baseline in
  collapsed rails.
- Closed sidebars leave layout completely and return their space to main.
- Expanded sidebars resize independently through accessible built-in handles.
- An edge-preview overlay retains the sidebar's resize handle and controller
  width.
- The root controller serializes built-in and named panels through an injected
  layout adapter; a package adapter provides versioned JSON in localStorage.

## Boundaries

- Desktop only; no responsive mobile sheet or off-canvas mode. The opt-in edge
  preview is a pointer/focus affordance for a closed desktop outer sidebar.
- Root fills `100vh` by default and remains non-fixed; bounded catalog hosts
  may override `--ui-shell-height`.
- No global shortcuts, routing, plugins, views, or consumer-content
  persistence. Shell persistence is limited to sidebar state and width.
- Resize handles support pointer drag plus focused Arrow, Shift+Arrow, Home,
  and End keys; configured controller bounds own width clamping.
- Sidebar contents and toolbar composition remain consumer-owned; Shell
  provides only its stateful Toggle and Close actions.
- Project selection, file navigation, and the decision to open a dependent
  sidebar remain consumer-owned.
- Shell containers do not scroll; main and sidebar body regions compose the
  shared shadcn Scroll Area.
- Shell may compose shadcn Button for its Toggle and Close actions.
- Production sources use native CSS and public `--ui-shell-*` tokens.
- `@stevejuma/ui/workspace` remains the full workspace framework.

## Slices

| Slice                               | Code     | Unit | Stories | Catalog | Validation |
| ----------------------------------- | -------- | ---- | ------- | ------- | ---------- |
| Controller, context, and tokens     | Complete | Pass | N/A     | N/A     | Pass       |
| Compound surfaces and package API   | Complete | Pass | Pass    | Pass    | Pass\*     |
| Nested left layout and edge preview | Complete | Pass | Pass    | Pass    | Pass\*     |
| Layout adapter and localStorage     | Complete | Pass | Pass    | Pass    | Pass\*     |

## Validation

1. Focused controller unit tests.
2. Focused Storybook interaction and accessibility tests.
3. `pnpm check:no-tailwind`, `pnpm check`, and static Storybook build.
4. Compare-only visual tests; new stories remain `visual-pending`.
5. `pnpm checks` before handoff.

\* Focused unit, Storybook interaction/accessibility, source, and static build
checks pass. Compare-only visual capture remains pending human approval. The
full catalog run currently reports missing baselines for existing AI stories
and serves a catalog that cannot resolve the Shell and Workspace story ids, so
those captures time out before comparison. No baselines were created or
updated.
