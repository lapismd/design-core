# Workspace framework migration

This document tracks the migration of the standalone Lapis workspace-shell
framework into the `Workspace` layer of `@stevejuma/ui`.

The migration is target-first. The source package remains intact until the
target implementation has passed functional, interaction, visual, and manual
review gates.

## Source contract

- Source checkout:
  `/Users/stevejuma/code/lapis-notes/.changeyard/workspaces/CY-0004/repo/app-shell`
- Validated source slice: `b06d1e3f58c3`
- Pinned Lapis source revision:
  `a371198e495d9e4e465c2960a04b3a4fd11f4023`
- Target migration base: `bfa709f3`
- Target JJ workspace:
  `/Users/stevejuma/ui-workspace-shell`

The source package currently contains:

- 30 core TypeScript files;
- 12 settings Svelte components;
- 53 shell Svelte components;
- 185 copied primitive Svelte components that must not be migrated;
- 16 Storybook CSF files;
- 20 unit-test files;
- 52 committed Visual Delta candidate images;
- F-Mode and Notifications optional plugins.

## Non-negotiable boundaries

- Production files below `src/shared/workspace` use native CSS and public
  `--ui-workspace-*` tokens.
- Workspace sources do not import `@stevejuma/ui/shadcn`, `shadcn-svelte`,
  `tailwind-merge`, or `tailwind-variants`.
- Workspace sources do not contain Tailwind utility strings or `cn()` class
  composition.
- Accessible behavior may use headless Bits UI primitives directly.
- Recursive resizing may use Paneforge.
- No Lapis runtime package, global application value, vault, filesystem,
  router, or dynamic plugin loader is imported.
- All persisted values remain JSON-safe.
- The Lapis reference PNGs are immutable during normal validation.

## Target public surface

The primary import is:

```ts
import {
  AppShell,
  AppShellController,
  WorkspaceView,
} from "@stevejuma/ui/workspace";
```

Optional plugins use:

```ts
import { fModePlugin } from "@stevejuma/ui/workspace/plugins/fmode";
import { notificationsPlugin } from "@stevejuma/ui/workspace/plugins/notifications";
```

The existing public names are retained while the move is in progress.
Compatibility aliases are removed only through an explicit reviewed slice.

## Progress

| Slice                            | Source                                                     | Target                     | Code                | Unit    | Stories  | Visual  | Review  |
| -------------------------------- | ---------------------------------------------------------- | -------------------------- | ------------------- | ------- | -------- | ------- | ------- |
| Layer contract and tokens        | package/spec                                               | `workspace/`               | Complete            | Pass    | Guidance | N/A     | Pending |
| Controller and events            | `core/app-shell-controller*`, `event-dispatcher.ts`        | `core/controller/`         | Complete            | Pass    | Pending  | N/A     | Pending |
| Layout and persistence           | `core/layout*`, `workspace-json*`, `persistence.ts`        | `core/layout/`             | Complete            | Pass    | N/A      | N/A     | Pending |
| Views and editor associations    | `core/view*`, `workspace-view.ts`, `editor-view-registry*` | `core/views/`              | Complete            | Pass    | Pending  | N/A     | Pending |
| Commands and keymaps             | `core/command-*`                                           | `core/commands/`           | Complete            | Pass    | Pending  | N/A     | Pending |
| Configuration and settings model | `settings/*.ts`, `core/built-in-settings*`                 | `core/settings/`           | Complete            | Pass    | Pending  | N/A     | Pending |
| Plugin lifecycle                 | `core/plugin-manager*`, UI registry                        | `core/plugins/`            | Complete            | Pass    | Pending  | N/A     | Pending |
| Notifications model              | notice and notification managers                           | `core/notifications/`      | Complete            | Pass    | Pending  | N/A     | Pending |
| Tabs and splits                  | tab, pane, tree, drag modules                              | component families         | In progress         | Pass    | Partial  | Pending | Pending |
| Sidebars and groups              | sidebar modules                                            | component families         | In progress         | Pass    | Partial  | Pending | Pending |
| View chrome and menus            | view header, empty, menus                                  | component families         | Complete            | Pass    | Pass     | Pending | Pending |
| Windows and overlays             | window and drop modules                                    | component families         | In progress         | Pass    | Partial  | Pending | Pending |
| Mobile shell                     | mobile modules                                             | component families         | In progress         | Pass    | Partial  | Pending | Pending |
| Ribbon and status                | ribbon/status modules                                      | component families         | Complete            | Pass    | Pass     | Pending | Pending |
| Settings presentation            | settings Svelte components                                 | component families         | Complete            | Pass    | Pass     | Pending | Pending |
| Compound AppShell                | `app-shell-*` modules                                      | component families         | In progress         | Pass    | Partial  | Pending | Pending |
| F-Mode                           | optional plugin package                                    | `plugins/f-mode/`          | Pending             | Pending | Pending  | Pending | Pending |
| Notifications                    | optional plugin package                                    | `plugins/notifications/`   | Pending             | Pending | Pending  | Pending | Pending |
| Demo and reference               | demos, stories, references                                 | `demo/`, `reference/`      | Pending             | Pending | Pending  | Pending | Pending |
| Lapis source removal             | `lapis-notes/app-shell`                                    | separate Changeyard change | Blocked on approval | N/A     | N/A      | N/A     | Pending |

## Validation cadence

For each implementation slice:

1. Run focused unit or Storybook tests.
2. Run `pnpm check:no-tailwind`.
3. Run `pnpm check`.
4. Preview changed stories and run their Storybook tests.
5. Run compare-only Visual Delta checks when pixels are affected.
6. Commit the verified slice with Jujutsu.

Before handoff run `pnpm checks`. Candidate baseline creation or replacement
requires explicit human approval and the repository's guarded Visual Delta
workflow.

## Validation evidence

### Layer contract and tokens

- Changed-file Prettier check: pass.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- `pnpm build-storybook`: pass.
- `pnpm checks`: reaches a pre-existing repository-wide formatting baseline
  failure affecting 167 files outside `src/shared/workspace`.
- `pnpm test:unit`: reaches pre-existing data-ui, generated-doc, and Node
  `localStorage` failures. The diagnostics do not include Workspace files.

### Serializable layout foundation

- Focused Workspace unit tests: 3 files and 7 tests pass.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Public exports cover events, normalized V2 layout, Lapis-compatible
  `WorkspaceJson`, persistence, popout contracts, menus, and view definitions.

### Headless application framework

- Focused Workspace unit tests: 10 files and 47 tests pass.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- The public `@stevejuma/ui/workspace`, `/core`, and `/settings` exports now
  include the application controller, workspace mutation controller, view and
  editor registries, declarative configuration, commands, hotkeys, static
  plugins, notices, notifications, and persistence adapters.

### Native visual foundations

- Added individually importable icon, empty-view, empty-sidebar,
  sidebar-toggle, drag state, and tab-body drop-overlay families.
- Production components use semantic markup, colocated native CSS, public
  `--ui-workspace-*` tokens, and no shadcn/Tailwind primitives.
- Focused drag/drop unit tests: 2 files and 6 tests pass.
- The stories are indexed and previewed in the target Storybook. The MCP
  runner's focused Svelte-CSF selection currently reports them as skipped in
  this JJ workspace because Storybook change detection expects Git metadata.
  Supplemental focused execution through the same Storybook Vitest project is
  recorded per component slice below.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Controller-backed tabs and view host

- Added source-shaped top tabs, hidden-scrollbar overflow, priority close
  geometry, controller-owned add/select/close mutations, registered drop
  targets, a Svelte view host, and missing-view fallback.
- Replaced inert Tailwind fixture classes with native Storybook fixture CSS.
- Focused Storybook interaction and accessibility execution: 2 files and 5
  stories pass through the repository's Storybook Vitest project.
- The required MCP focused run was also invoked; its JJ-workspace story
  selection limitation remains as documented above.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Stacked tabs and recursive splits

- Added individually importable `WorkspaceStackedTabs`, `WorkspaceSplit`, and
  `WorkspaceTree` component families with colocated native CSS, Storybook
  stories, and MDX documentation.
- The recursive tree renders top and stacked panes from the live serializable
  layout; Paneforge resize callbacks write normalized sizes through the
  controller.
- Focused Storybook interaction and accessibility execution: 3 files and 3
  stories pass through the repository's Storybook Vitest project.
- The required MCP focused run was also invoked; its JJ-workspace story
  selection limitation remains as documented above.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Grouped sidebar panels

- Added the measured grouped-panel layout, native Paneforge stack,
  click-to-collapse headers, live view bodies, coherent size persistence, and
  registered top/bottom insertion targets.
- Focused layout unit tests: 1 file and 2 tests pass.
- Focused Storybook interaction and accessibility execution: 1 file and 1
  story passes through the repository's Storybook Vitest project.
- The required MCP focused run was also invoked; its JJ-workspace story
  selection limitation remains as documented above.
- A mistakenly broadened MCP run reached the target repository's pre-existing
  Visual Delta manager React-hook failures; Workspace-specific focused
  validation remains green.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Sidebar surfaces

- Added individually importable left/right sidebar surfaces with icon tabs,
  grouped-panel and leaf rendering, source-shaped empty-container treatment,
  close controls, and top/bottom-only leaf drop targets.
- Selecting a sidebar icon updates the live controller identity; closing the
  sidebar uses the same controller mutation path as programmatic changes.
- Focused Storybook interaction and accessibility execution: 1 file and 2
  stories pass through the repository's Storybook Vitest project.
- The required MCP focused run was also invoked; it broadened into the target
  repository's pre-existing Visual Delta manager failures after the base
  Storybook process reclaimed the shared port. Workspace-specific focused
  validation remains green.
- Both stories are indexed and previewable in the target Storybook.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### View header and declarative menus

- Added a direct-Bits renderer for the controller-owned `WorkspaceMenu` model,
  including items, separators, disabled and checked states, and nested menus.
- Added the source-shaped view header with history actions, breadcrumbs, title,
  view-contributed actions, and the shared pane menu.
- Top and stacked leaf bodies now render the header through the same
  `WorkspaceViewDefinition.getChrome()` contract while sidebar views retain
  their compact source presentation.
- Focused Storybook interaction and accessibility execution: 5 files and 7
  stories pass through the repository's Storybook Vitest project.
- The required MCP focused run was invoked; it returned no per-story result in
  the JJ workspace. Supplemental focused execution remains green.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Ribbon and status surfaces

- Added independently importable ribbon, status-item, and status-bar component
  families, each with colocated native CSS, documentation, and interaction
  stories.
- Both surfaces consume the existing controller registries, retain source
  geometry and hint targets, and can be omitted or replaced by an application.
- Status items support direct actions, icons, segments, busy state, and shared
  declarative menus.
- Focused Storybook interaction and accessibility execution: 3 files and 3
  stories pass through the repository's Storybook Vitest project.
- The required MCP focused run was invoked. Its first attempt broadened into
  the target repository's pre-existing Visual Delta manager failures and lost
  the MCP transport; after the semantic landmark fix, a second focused request
  completed without returning per-story results. Supplemental focused
  execution remains green.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Floating windows and layer

- Added independently importable floating-window and floating-layer component
  families with the source window chrome, serialized bounds, and normal,
  collapsed, minimized, and maximized presentation states.
- Window controls use controller mutations for focus, collapse, minimize,
  maximize, redock, and close; pointer movement and all eight resize handles
  share the persisted bounds path.
- Free windows reuse `WorkspaceTree`; minimized windows render in the centered
  source dock. Popout hosting remains the existing runtime adapter.
- Focused Storybook interaction and accessibility execution: 2 files and 3
  stories pass through the repository's Storybook Vitest project.
- The required MCP focused runs were invoked and returned no per-story result
  in the JJ workspace. Supplemental focused execution remains green.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Compound application shell

- Added the public `AppShell.Root` context and lifecycle component plus
  independently composable `Ribbon`, `LeftSidebar`, `Workspace`,
  `RightSidebar`, `FloatingLayer`, and `StatusBar` surfaces.
- `AppShell.Surface` provides the current default desktop composition without
  hiding the lower-level components or installing a global controller.
- All surfaces share one controller-owned drag state and active-surface
  registration. Closed-sidebar toggles are assigned to the same leading and
  top-right main panes as the source shell.
- Focused Storybook interaction and accessibility execution: 2 App Shell
  stories and the affected floating-layer story pass through the repository's
  Storybook Vitest project.
- The required MCP focused run was invoked and returned no per-story result in
  the JJ workspace. Supplemental focused execution remains green.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Declarative settings presentation

- Added the public `AppSettings.Root`, `Search`, `Navigation`, `Content`,
  `Section`, and `Item` compound components plus the complete
  `WorkspaceSettingsSurface` and context-bound `AppShell.Settings` surface.
- Recreated the Lapis settings navigation, schema cards, compact field rows,
  search results, Hotkeys page, and Core Plugins page with native CSS and
  public Workspace tokens instead of copied shadcn/Tailwind primitives.
- The default field renderer covers primitive values, range and choice
  controls, lists, JSON-safe structured collections, dynamic editor
  associations, custom renderers, actions, unsupported fallbacks, and
  restoration through the controller.
- Focused settings and application-controller unit execution: 2 files and 19
  tests pass.
- Focused Storybook interaction and accessibility execution: 1 file and 5
  stories pass through the repository's Storybook Vitest project.
- The required MCP focused run was invoked and returned no per-story result in
  the JJ workspace. Supplemental focused execution remains green.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Mobile shell

- Added a full-height, container-responsive mobile renderer with editor,
  left/right sidebar, open-tab overview, floating dock, and compact action
  presentation.
- `AppShell.Surface` now resolves `always`, `never`, and live `auto` display
  modes and reads the controller's breakpoint, default page, bottom-navigation,
  sidebar-inclusion, and floating-inclusion settings. Explicit surface props
  retain precedence.
- Mobile tab activation, close, undo close, creation, and sidebar selection
  use the existing controller mutation and persistence paths.
- Focused Storybook interaction and accessibility execution: 2 files and 6
  stories pass through the repository's Storybook Vitest project.
- The required MCP focused run was invoked and returned no per-story result in
  the JJ workspace. Supplemental focused execution remains green.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Pointer-swipe settling and mobile action-drawer parity remain in progress.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

## Completion gate

The migration is complete only when:

- every retained public API is exported from `@stevejuma/ui/workspace`;
- current layout snapshots round-trip without data loss;
- all current component and plugin behavior is covered in the target;
- every public visual component has colocated documentation and a deterministic
  baseline;
- real pointer tests cover reorder, move, split, float, and redock;
- target checks pass;
- a human has reviewed the Visual Delta matrix;
- the source package is removed through a separate Lapis Changeyard change.
