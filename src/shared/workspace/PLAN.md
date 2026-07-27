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
- Active parity JJ workspace:
  `/Users/stevejuma/ui-workspace-parity`

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
- Workspace sources may compose repository-owned `@stevejuma/ui/shadcn`
  primitives, but do not import `shadcn-svelte`, `tailwind-merge`, or
  `tailwind-variants`, and do not reconstruct an existing shadcn family.
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

| Slice                             | Source                                                     | Target                     | Code                | Unit | Stories   | Visual                                       | Review  |
| --------------------------------- | ---------------------------------------------------------- | -------------------------- | ------------------- | ---- | --------- | -------------------------------------------- | ------- |
| Layer contract and tokens         | package/spec                                               | `workspace/`               | Complete            | Pass | Guidance  | N/A                                          | Pending |
| Lapis brand and source references | theme + source Storybook snapshots                         | `themes/`, `reference/`    | Complete            | Pass | Reference | v1: 52 immutable; v2: 104 corrected captures | Pending |
| Controller and events             | `core/app-shell-controller*`, `event-dispatcher.ts`        | `core/controller/`         | Complete            | Pass | Pending   | N/A                                          | Pending |
| Layout and persistence            | `core/layout*`, `workspace-json*`, `persistence.ts`        | `core/layout/`             | Complete            | Pass | N/A       | N/A                                          | Pending |
| Views and editor associations     | `core/view*`, `workspace-view.ts`, `editor-view-registry*` | `core/views/`              | Complete            | Pass | Pending   | N/A                                          | Pending |
| Commands and keymaps              | `core/command-*`                                           | `core/commands/`           | Complete            | Pass | Partial   | Pending                                      | Pending |
| Configuration and settings model  | `settings/*.ts`, `core/built-in-settings*`                 | `core/settings/`           | Complete            | Pass | Pending   | N/A                                          | Pending |
| Plugin lifecycle                  | `core/plugin-manager*`, UI registry                        | `core/plugins/`            | Complete            | Pass | Pending   | N/A                                          | Pending |
| Notifications model               | notice and notification managers                           | `core/notifications/`      | Complete            | Pass | Pending   | N/A                                          | Pending |
| Tabs and splits                   | tab, pane, tree, drag modules                              | component families         | Complete            | Pass | Pass      | Candidate pass; review pending               | Pending |
| Sidebars and groups               | sidebar modules                                            | component families         | Complete            | Pass | Pass      | Candidate pass; review pending               | Pending |
| View chrome and menus             | view header, empty, menus                                  | component families         | Complete            | Pass | Pass      | Candidate pass; review pending               | Pending |
| Windows and overlays              | window and drop modules                                    | component families         | Complete            | Pass | Pass      | Candidate pass; review pending               | Pending |
| Mobile shell                      | mobile modules                                             | component families         | Complete            | Pass | Pass      | Candidate pass; review pending               | Pending |
| Ribbon and status                 | ribbon/status modules                                      | component families         | Complete            | Pass | Pass      | Candidate pass; review pending               | Pending |
| Settings presentation             | settings Svelte components                                 | component families         | Complete            | Pass | Pass      | Candidate pass; review pending               | Pending |
| Compound AppShell                 | `app-shell-*` modules                                      | component families         | Complete            | Pass | Pass      | Candidate pass; review pending               | Pending |
| F-Mode                            | optional plugin package                                    | `plugins/f-mode/`          | Complete            | Pass | Pass      | Candidate pass; review pending               | Pending |
| Notifications                     | optional plugin package                                    | `plugins/notifications/`   | Complete            | Pass | Pass      | Candidate pass; review pending               | Pending |
| Demo and reference                | demos, stories, references                                 | `demo/`, `reference/`      | Complete            | Pass | Pass      | Canonical and candidate pass                 | Pending |
| Lapis source removal              | `lapis-notes/app-shell`                                    | separate Changeyard change | Blocked on approval | N/A  | N/A       | N/A                                          | Pending |

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

### Lapis brand and source Storybook references

- Added a selectable `lapis` Storybook brand theme while retaining the
  independent light/dark colour-mode toggle.
- Mapped the pinned Lapis palette and source shell geometry onto public host and
  `--ui-workspace-*` tokens without importing Lapis runtime code.
- Imported all 52 validated standalone app-shell Storybook captures into the
  immutable reference tree with revision, capture, inventory-hash, and mapping
  provenance.
- Mapped component stories expose a read-only **Lapis source** Visual Delta
  mode; existing target candidate baselines remain separate and unchanged.
- Preserved the original 52 copied images as immutable v1 evidence.
- Added a guarded source capture harness pinned to CY revision `b06d1e3f58c3`.
  The corrected v2 inventory contains all 52 canonical scenes in light and dark
  modes (104 images) with explicit scopes, frozen time, Storybook completion
  waits, and exact injected plugin CSS hashes.
- Added a complete 79-story crosswalk: 52 canonical parity fixtures and 27
  interaction-only stories.
- The parity workspace Storybook uses port `9110`; its Visual Delta server uses
  port `9111`.

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
- Restored source context menus on grouped panel headers, with panel-specific
  hide and move-to-normal-tabs actions plus the shared close, window, and
  view-contributed pane actions.
- Focused controller tests cover metadata persistence and moving a grouped
  panel back to normal sidebar tabs.
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
- Restored the outer group-icon context menu with controller-persisted title
  and icon updates, shadcn-backed edit and visibility dialogs, ungrouping,
  hidden-panel cleanup, and group close actions.
- Selecting a sidebar icon updates the live controller identity; closing the
  sidebar uses the same controller mutation path as programmatic changes.
- Focused Storybook interaction and accessibility execution: 1 file and 3
  stories pass through the repository's Storybook Vitest project.
- Live Storybook verification confirms the context-menu trigger leaves sidebar
  icon tabs and grouped panel headers as direct `button` elements, and the
  edit interaction updates the rendered group identity.
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

### Complete compound adapters

- Completed the shadcn-style `AppShell` map with context-bound About,
  CommandPalette, Notices, PluginLayer, Sidebar, Tabs, HotkeySettings, and
  CorePluginsSettings adapters in addition to the primary shell surfaces.
- `AppShell.Root` retains backwards-compatible default infrastructure while
  exposing `renderOverlays` and `renderPopouts` switches for applications that
  compose or replace those layers explicitly.
- The settings compound now exposes `DialogSurface` and `Surface` aliases
  alongside its lower-level Root, Search, Navigation, Content, Section, and
  Item pieces.
- Focused Storybook interaction and accessibility execution: all 7 AppShell
  stories pass, including explicit utility-layer, low-level tab/sidebar, and
  standalone settings-page compositions.
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

### Optional F-Mode plugin

- Added `@stevejuma/ui/workspace/plugins/fmode` with the static
  `fModePlugin()` descriptor, prefix-free hint generation, target-group
  settings, modal key capture, typed session model, and composable overlay.
- `AppShell.Root` now renders controller-registered overlay contributions
  inside its own surface. Plugin enable/disable continues to own registration
  and reverse-order cleanup through the existing transactional manager.
- The overlay uses native CSS, public Workspace tokens, clipping-aware target
  geometry, resize/scroll repositioning, detailed/compact/minimal HUD modes,
  and light/dark inheritance.
- Focused F-Mode and modal-keymap unit execution: 4 files and 6 tests pass.
- Focused Storybook interaction and accessibility execution: 1 file and 6
  stories pass, including real keyboard query and exact-target activation.
- The required MCP focused runs were invoked and returned no per-story result
  in the JJ workspace. Supplemental focused execution remains green.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Optional Notifications plugin

- Added `@stevejuma/ui/workspace/plugins/notifications` with the static
  `notificationsPlugin()` descriptor and composable toast, status, and
  notification-center components.
- The controller-owned service retains transient notices, durable history,
  persistence, unread state, determinate and indeterminate progress,
  cancellation, and Lapis-compatible `Notice` behavior when the plugin is
  absent.
- Presentation is leased transactionally: enabling the plugin suppresses the
  lightweight shell fallback, while disabling it removes plugin UI and allows
  only future notices to use the fallback.
- Focused notification, notice, status-model, and plugin unit execution: 4
  files and 13 tests pass.
- Focused Storybook interaction and accessibility execution: 1 file and 6
  stories pass, including status-to-center navigation, toast severities,
  history, cancellation, fallback presentation, and notice dismissal.
- The required MCP focused runs were invoked and returned no per-story result
  in the JJ workspace. Supplemental focused execution remains green.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Command palette and application about dialog

- Added individually importable command-palette and about-dialog component
  families with native CSS, public Workspace tokens, colocated stories, and
  MDX documentation.
- `AppShell.Root` now renders both controller-owned overlays by default. The
  command palette searches and executes the public command registry, while the
  configurable status-version item opens application metadata without global
  state.
- Focused Storybook interaction and accessibility execution: 2 files and 4
  stories pass, covering open/search/run/empty command states and the status
  item to about-dialog path.
- The required MCP focused runs were invoked and returned no per-story result
  in the JJ workspace. Supplemental focused execution remains green.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Popout presentation

- Added an independently importable popout surface and controller-context
  popout layer. `AppShell.Root` installs the browser host by default and accepts
  `null` or a consumer-provided desktop/native adapter.
- Runtime popouts mount the same recursive tree, view registry, drag state,
  theme tokens, and controller identity into the returned document; closing or
  removing a popout unmounts its Svelte tree.
- Focused Storybook interaction and accessibility execution: the popout
  component story and affected default AppShell story pass through the
  repository's Storybook Vitest project.
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
- Restored the source mobile pan threshold, axis cancellation, pointer capture,
  velocity settling, measured sidebar width, nearest-page snapping, and
  close-panel behavior.
- Extracted the source action sheet, view actions, tab tile, tab-actions drawer,
  dock, and sidebar renderers as individually importable public components.
- Replaced the reconstructed inline mobile menus with shell-scoped source-shaped
  bottom sheets for quick actions, pane actions, and open-tab operations.
- Focused Storybook interaction and accessibility execution: 2 files and 11
  stories pass through the repository's Storybook Vitest project.
- The required MCP focused run was invoked against the standard checkout on
  port `9009`; it correctly found no matching workspace-only stories. The
  isolated workspace uses supplemental focused execution on port `9109`.
- `pnpm check:no-tailwind`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- Real Chromium pointer coverage verifies mobile pan reveal and dismissal.
- Visual Delta candidate baselines remain pending explicit human approval; no
  committed baseline image was created or replaced in this slice.

### Reusable framework demo

- Added a public-API-only Lapis-like application composed from
  `AppShellController`, registered `WorkspaceView` classes, serializable
  layouts, asynchronous persistence, commands, settings, ribbon/status
  contributions, floating windows, sidebars, and optional F-Mode and
  Notifications descriptors.
- The consumer-owned Plugins status menu exercises transactional disable and
  enable behavior through the same static plugin manager exposed to
  applications.
- Focused Storybook interaction and accessibility execution: 1 file and 4
  stories pass, including tab selection and close persistence, plugin
  lifecycle, and deterministic mobile composition.
- `pnpm check:no-tailwind src/shared/workspace`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- The migration workspace Storybook is isolated on port `9109` with its Visual
  Delta static server on `9110`; the target repository's standard
  `9009`/`9010` ports remain unchanged.
- Visual Delta candidate baselines and immutable reference mapping remain
  pending explicit human approval; no committed baseline image was created or
  replaced in this slice.

### Real pointer parity

- Added a dedicated Playwright project that defaults to isolated Storybook
  `9209` and Visual Delta `9210`, while accepting the active migration workspace
  ports through environment variables.
- Seven real Chromium mouse/pointer tests pass against Storybook `9109`:
  mobile pan reveal/dismiss, centre move, proportional edge split, insertion
  marker and reorder, sidebar-group top drop, floating fallback, and redock.
- Centre and edge tests pause before release and assert the visible target,
  bounds, background, medium radius, and `0.5` opacity. Sidebar-group tests
  similarly assert the source-shaped 2px top insertion indicator.
- `test:workspace:pointer` is included in `storybook:check` and the repository
  `checks` orchestration without changing the main checkout's Storybook ports.
- `pnpm check:no-tailwind src/shared/workspace`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- No Visual Delta baseline or immutable Lapis reference was created or changed.

### Historical canonical reference bridge

- Copied the reviewed Lapis light and dark shell captures plus provenance into
  `reference/lapis/workspace-shell` without changing their SHA-256 digests.
- Storybook originally served those immutable assets from `/lapis-reference`,
  independently of candidate images under `/visual-baselines`.
- The historical `Workspace/Reference/Canonical Lapis / Shell` story was
  assembled only through the target public API.
- Visual Delta receives independent viewport and device-scale metadata for the
  1280 × 900 DSF-3 candidate and 1440 × 960 DSF-1 canonical captures. The Dark
  visual mode uses the same story rather than adding a duplicate dark variant.
- Focused Workspace reference contract tests verify all three immutable hashes,
  PNG geometry, pinned revision, theme metadata, static route, candidate route,
  and review-story tag.
- Focused Storybook interaction and accessibility execution: 1 story passes
  through the target repository's Storybook Vitest project.
- The required MCP preview and test calls were invoked; the MCP is bound to the
  standard checkout on port `9009` and correctly found no target-workspace story.
  The isolated target preview on `9109` was inspected in light and dark mode.
- The live target index now contains 72 Workspace stories: 71
  `visual-pending` and one intentionally `skip-visual` icon fallback.
- This bridge was retired after explicit human approval of the migrated
  component catalog. The assets remain offline provenance.

### Visual and public-surface completion audits

- Added read-only `workspace:visual:audit` and strict
  `workspace:visual:verify` commands. The audit derives target snapshot paths
  from the same nested-path helper used by Playwright, validates mutually
  exclusive review tags, reports missing candidates, and rejects orphan
  Workspace snapshots.
- The current pre-approval matrix is explicit: 72 stories, 71
  `visual-pending`, one `skip-visual`, zero candidate baselines, zero orphan
  images, and zero contract errors.
- `storybook:check` and `checks` now run the read-only audit after the production
  Storybook build. The strict verifier is reserved for the post-approval
  baseline gate.
- The public export audit found and fixed four missing individually importable
  subpaths: `workspace/about-dialog`, `workspace/command-palette`,
  `workspace/demo`, and `workspace/popout`.
- A package-manifest contract test now requires every top-level Workspace family
  with an `index.ts` barrel to have a matching package subpath, and verifies the
  two documented optional-plugin subpaths.
- Focused audit and public-subpath unit execution: 2 files and 5 tests pass.
- `pnpm workspace:visual:audit`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.

### Aggregate Workspace validation

- Complete Workspace unit execution: 22 files and 76 tests pass, including the
  visual-audit helper.
- Complete Workspace Storybook interaction and accessibility execution: all 29
  story files and 72 stories pass.
- The aggregate story run found and fixed one incorrectly double-escaped
  missing-view text matcher; the component had rendered the correct
  `demo.missing` message.
- Real Chromium interaction execution: all seven pointer scenarios pass.
- `pnpm workspace:visual:audit`: pass with zero classification errors and zero
  orphan snapshots.
- `pnpm check:no-tailwind src/shared/workspace`: pass.
- `pnpm check`: pass with zero Svelte errors or warnings.
- The only deliberately incomplete aggregate gate is candidate Visual Delta
  capture, which remains paused for manual approval.

### Approved candidate baseline seed

- Human approval to create the missing Workspace candidate images was recorded
  on 2026-07-26.
- The guarded missing-only Playwright workflow created exactly 71 candidate
  images under `tests/visual/storybook.spec.ts-snapshots/workspace`; it did not
  replace any existing image.
- Removed generated `.actual.png` and `.diff.png` diagnostics after the
  approved seed. The committed set contains 71 candidate images and no
  diagnostics.
- Added the missing `workspace/` import-path mapping to the shared Visual Delta
  baseline resolver and a TypeScript CSF regression test. Every candidate story
  now exposes its exact baseline through `parameters.visualDelta`.
- `pnpm workspace:visual:verify`: pass with 72 classified stories, 71 candidate
  baselines, one intentional `skip-visual`, zero missing candidates, zero
  orphan candidates, and zero contract errors.
- Production Storybook build: pass.
- Exact compare-only Chromium execution for the 71 Workspace stories against
  the production Storybook artifact: pass.
- The canonical light, dark, and provenance SHA-256 hashes remain unchanged:
  `612902f9da1b729f94a94e15057296cad752cafeab26435f2bed017a6735a28e`,
  `7b4b1f94d61a7efeb725ddf0c56b024853be5873da76f24be517878c28f09985`,
  and
  `853b8fe4e84fa1915018c3055ea8ed88796aaabec944782fafcff423e70ec5b2`.
- The review tags remain `visual-pending`; baseline creation approval does not
  imply per-story visual approval.

### CY-0004 parity close-out review

- Added 52 one-to-one `Workspace/Parity/CY-0004` fixtures built only through
  public Workspace APIs. The source crosswalk now accounts for all 79 CY
  stories: 52 canonical visual scenes and 27 interaction-only cases.
- Added guarded v2 source capture and compare-only Playwright projects. Source
  capture freezes time, awaits Storybook completion and fonts, injects the
  exact hashed plugin CSS, isolates every scene in its own Chromium process,
  and median-samples three same-context screenshots.
- Restored source geometry and tokens across top tabs, settings, empty views,
  shell chrome, F-Mode, and Notifications while retaining the target
  repository's semantic markup and native-CSS boundary.
- Aligned the interactive shell fixture with the source ownership model:
  settings fields use the repository shadcn primitives, settings search
  navigates to and briefly highlights the selected field, sidebar content uses
  the shadcn ScrollArea, and split/sidebar rails use the shadcn resizable
  primitive with a one-pixel resting line and two-pixel accent-painted active
  line. Structured data settings leave the two-column field grid and place
  their shadcn Table or collection control in a dedicated full-width row.
  Stacked groups assign each internal divider solely to that one-pixel resizer
  and reserve a status-safe area below a collapsed final right panel.
- Restored the source shell seams and controls: sidebar and top-tab dividers
  share one continuous horizontal edge, expanded sidebars retain their outer
  boundary, ribbon masking stops at the header, the collapsed left toggle
  inherits the main header divider instead of painting a second adjacent edge,
  the external right toggle retains its own divider, sidebar toggles expose
  their expanded geometry, and every top-tab group receives a default
  serializable New tab action through the existing controller persistence path.
- Collapsed floating windows now end with their 2.25rem toolbar instead of
  retaining the source extraction's unused 0.5rem body strip; normal, maximized,
  and minimized window geometry remains unchanged.
- Focused validation is clean: 21 Workspace/reference/plugin unit tests, 72
  Storybook interaction/accessibility tests, `pnpm check:no-tailwind`, and
  `pnpm check`.
- The compare-only zero-pixel gate retains source, target, diff, DOM, state, and
  Playwright trace artifacts. The current manual-review scenes still have
  non-zero pixels:
  - top tabs: 86,427 light / 114,978 dark;
  - Settings search: 205,220 light / 214,324 dark;
  - active F-Mode: 243,987 light / 216,997 dark;
  - notification centre: 211,823 light / 254,453 dark;
  - notification toasts: 120,969 light / 130,608 dark.
- Repeated guarded source regeneration can still move a handful of isolated
  antialias pixels between unrelated dark scenes. No comparison tolerance has
  been introduced; approving one requires explicit manual review.
- The parity Storybook remains isolated on `9110` with Visual Delta on `9111`.
  The Storybook MCP remains bound to the standard checkout, so focused parity
  execution uses the same repository Storybook Vitest project directly.
- The broad Storybook, visual, and repository gates remain intentionally
  paused until the manual Visual Delta review.

### Approved target baseline close-out

- Rebasing brought the migration stack onto the main UI workspace revision
  `f3890f7a6acc` while preserving the accepted Workspace behavior.
- Manual review accepted the current target rendering as the source of truth.
  The 52 parity-only CY-0004 stories, the canonical review story, the source
  capture command, the static `/lapis-reference` route, and the compare-only
  Playwright project were retired.
- Reusable component, plugin, settings, mobile, and full-demo stories remain
  the active Storybook catalog. Every non-skipped Workspace story is classified
  `visual-approved` and owns a deterministic candidate under
  `tests/visual/storybook.spec.ts-snapshots/workspace/`.
- Lapis v1 and v2 images, manifests, hashes, and crosswalks remain unchanged as
  offline migration provenance. Normal tests and approved target baseline
  updates do not serve or rewrite that archive.
- The active catalog contains 74 Workspace stories: 70 `visual-approved`
  stories with committed candidates and four interaction-only `skip-visual`
  stories. The coverage audit reports zero pending, failed, missing, orphaned,
  or contract-error entries.
- The guarded update recreated all 70 active candidates from the accepted
  rendering. A fresh production Storybook build and compare-only Chromium run
  then passed all 70 candidates with no differing pixels.
- Focused close-out validation passes: 21 Workspace/reference/plugin unit files
  with 76 tests, 28 Workspace Storybook files with 74 interaction/accessibility
  tests, seven real-pointer Workspace scenarios, the full 180-file Storybook
  interaction suite with 501 tests, formatting, Svelte diagnostics, and the
  production Storybook build.

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
