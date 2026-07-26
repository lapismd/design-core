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
| Sidebars and groups              | sidebar modules                                            | component families         | Pending             | Pending | Pending  | Pending | Pending |
| View chrome and menus            | view header, empty, menus                                  | component families         | In progress         | Pass    | Partial  | Pending | Pending |
| Windows and overlays             | window and drop modules                                    | component families         | In progress         | Pass    | Partial  | Pending | Pending |
| Mobile shell                     | mobile modules                                             | component families         | Pending             | Pending | Pending  | Pending | Pending |
| Ribbon and status                | ribbon/status modules                                      | component families         | Pending             | Pending | Pending  | Pending | Pending |
| Settings presentation            | settings Svelte components                                 | component families         | Pending             | Pending | Pending  | Pending | Pending |
| Compound AppShell                | `app-shell-*` modules                                      | component families         | Pending             | Pending | Pending  | Pending | Pending |
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
