# Minimal composable app shell

This tracker covers the structural `@stevejuma/ui/shell` layer. CV Studio is
the visual reference only; its application store, routing, settings, and
workspace behavior are not copied.

## Public contract

- `AppShell.Root` installs an `AppShellController`.
- `AppShell.Root` defaults to `displayMode="auto"` and resolves desktop or
  mobile presentation from its own bounded width at a default 1024px
  breakpoint. Consumers compose the compound parts once for both modes.
- Explicit `desktop` and `mobile` modes remain reactive so applications and
  deterministic tests may override automatic presentation.
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
- Main reuses its bottom inset at the trailing edge when an inline right shell
  sidebar is absent.
- `AppShell.Body` supports a regions layout with independently scrolling
  `Body.Sidebar` and `Body.Content` parts for consumer-owned document chrome.
- `AppShell.Body.Sidebar` registers an optional stable panel id and remains
  consumer-controlled on desktop while joining the corresponding mobile lane.
- `AppShell.Body.Toggle` places consumer-controlled sidebar actions at the
  corresponding top-left or top-right body corner and may target a registered
  mobile body panel.
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
- Portalled popup content linked through `aria-controls`/`aria-owns` or opened
  by an accessible popup trigger remains inside the preview interaction
  boundary.
- The root controller serializes built-in and named panels through an injected
  layout adapter; a package adapter provides versioned JSON in localStorage.
- `controller.mobile` owns transient resolved mode, left/main/right stage, and
  the active panel for each mobile edge. Mobile state is never serialized.
- Mobile uses one full-height lane per edge. A shadcn selector switches between
  multiple registered panels on the same edge.
- Constrained desktop protects a configurable minimum main width. Lower
  priority outer sidebars become transient overlays without changing their
  persisted collapsed, closed, or width state.

## Boundaries

- Desktop retains the bounded inline layout and opt-in edge previews.
- Desktop prioritizes the main body before moving the right, named outer-left,
  and finally built-in left sidebar out of inline flow.
- Mobile presentation uses a Workspace-inspired off-canvas three-stage track
  selected by root container width, explicit mode, toolbar actions, or touch
  gestures.
- Desktop collapse, close, and width state is retained while mobile is active.
  Mobile dismissal never mutates that durable layout.
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
- Document-local sidebar openness remains consumer-owned and is not persisted
  by the shell controller. Mounted body panels may register with mobile lanes.
- Body toggles retain consumer-owned desktop openness and use transient mobile
  presentation when their target is registered.
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
| Body content and local sidebars     | Complete | Pass | Pass    | Pass    | Pass\*     |
| Mobile controller and mode contract | Complete | Pass | Pass    | Pass    | Pass       |
| Single-composition mobile lanes     | Complete | Pass | Pass    | Pass    | Pass       |
| Mobile gestures and accessibility   | Complete | Pass | Pass    | Pass    | Pass       |
| Mobile catalog and documentation    | Complete | Pass | Pass    | Pass    | Pass\*     |
| Constrained desktop presentation    | Complete | Pass | Pass    | Pass    | Pass       |

## Validation

1. Focused controller unit tests.
2. Focused Storybook interaction and accessibility tests.
3. `pnpm check:no-tailwind`, `pnpm check`, and static Storybook build.
4. Compare-only visual tests; new stories remain `visual-pending`.
5. `pnpm checks` before handoff.

The `Complete shell composition` story combines the outer project selector,
files sidebar, document body sidebar, main content, and right AI panel in one
interactive fixture. Forced desktop, tablet, and mobile stories must reuse that
single composition rather than maintaining parallel shell markup.

\* Current validation passes 15 focused controller/public API tests, all 10
Shell Storybook interaction and accessibility tests, both real pointer gesture
tests, all 499 repository Storybook tests, `pnpm check`, the no-Tailwind source
gate, and the static Storybook build. Compare-only visual validation passes 350
existing baselines; the 10 `visual-pending` Shell stories remain deliberately
unbaselined (five missing-baseline results and five 15-second readiness limits
on long-play fixtures). No baselines were created or updated.
