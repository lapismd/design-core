# Workspace source provenance

The Workspace layer is a source-led migration of the standalone
`@lapis-notes/workspace-shell` package. It remains an application-independent
UI framework and does not import the Lapis runtime.

## Pinned revisions

- Standalone app-shell validated slice: `b06d1e3f58c3`
- Canonical Lapis source:
  `a371198e495d9e4e465c2960a04b3a4fd11f4023`
- Target UI migration base: `bfa709f3`

## Source tree hashes

Hashes are SHA-256 digests of the sorted per-file SHA-256 list for each source
tree.

| Source tree                               | SHA-256                                                            |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `app-shell/src/lib/core`                  | `d32a22a58339721b15eef051dcb96e021cb29ba7c3baef27baf0d1dc39cf7019` |
| `app-shell/src/lib/settings`              | `b61eecaef1276a44f8fde51809d71ad19aad68e4092c21c8fe551042ead2352b` |
| `app-shell/src/lib/ui`                    | `002c0adf375b3258c151d518dad2232b51a8d59be11ab791a1428675bb08e4e4` |
| `app-shell/src/lib/components/ui`         | `aa9c65cf5377be19db43c0af8de5bdae31a6dc80d22b447c86bf924d432036b5` |
| `app-shell/plugins/fmode/src/lib`         | `b5b39f3b1bf12901c85a8ec637028a8facf84ae0ee195846a244d306c9de4ba7` |
| `app-shell/plugins/notifications/src/lib` | `95e226285406b89514cc0c7ace9eb71ca11629b1500e2dbf8da1d0b308e5fb72` |

The copied `components/ui` tree is recorded for audit purposes only. It is not
part of the target migration.

## Immutable reference assets

| Asset                       | SHA-256                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `workspace-shell-light.png` | `612902f9da1b729f94a94e15057296cad752cafeab26435f2bed017a6735a28e` |
| `workspace-shell-dark.png`  | `7b4b1f94d61a7efeb725ddf0c56b024853be5873da76f24be517878c28f09985` |
| `reference/provenance.json` | `853b8fe4e84fa1915018c3055ea8ed88796aaabec944782fafcff423e70ec5b2` |

Normal Visual Delta and test commands must never rewrite these assets.

## Styling adaptation

The source shell used copied shadcn-svelte components and generated Tailwind
utilities. The target retains the accessible behavior and Lapis geometry while
replacing that implementation with:

- direct semantic HTML where sufficient;
- direct Bits UI primitives where managed focus or popup semantics are needed;
- Paneforge for recursive resizing;
- component-local native CSS;
- public `--ui-workspace-*` tokens;
- `data-ui-component` and `data-ui-part` ownership markers.

Any markup deviation required by this adaptation must be recorded beside the
component in `PLAN.md` and covered by behavior and visual tests.

## Component migration audit

The audit treats source component families as the contract. Target filenames are
allowed to change to follow this repository's one-family-per-folder convention,
but retained behavior must have a public target component and colocated story
coverage.

| Source app-shell family                                                                                                         | Target Workspace family                                                                                    | Status   |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| `app-shell-{root,surface,ribbon,left-sidebar,right-sidebar,workspace,floating-layer,status-bar}.svelte`                         | `app-shell/` compound components                                                                           | Complete |
| `app-shell-{about-dialog,command-palette,settings,hotkey-settings,core-plugins-settings,notice-host,plugin-layer}.svelte`       | `app-shell/`, `about-dialog/`, `command-palette/`, `settings/`                                             | Complete |
| `workspace-{tab-strip,tabs-move}.svelte` and top-tab rendering from `workspace-pane.svelte`                                     | `tabs/WorkspaceTabs.svelte`, `tabs/WorkspaceTabsMove.svelte`                                               | Complete |
| `workspace-stacked-pane.svelte`                                                                                                 | `stacked-tabs/WorkspaceStackedTabs.svelte`                                                                 | Complete |
| `workspace-{pane,tree}.svelte` split recursion                                                                                  | `split/WorkspaceSplit.svelte`, `tree/WorkspaceTree.svelte`                                                 | Complete |
| `workspace-{sidebar,sidebar-empty,sidebar-group,sidebar-toggle}.svelte`                                                         | `sidebar/`, `sidebar-empty/`, `sidebar-group/`, `sidebar-toggle/`                                          | Complete |
| `workspace-{view-header,view-host,imperative-view,empty,icon}.svelte`                                                           | `view-header/`, `view-host/`, `empty/`, `icon/`                                                            | Complete |
| `workspace-context-menu-items.svelte`, `workspace-menu-items.svelte`                                                            | `menu/WorkspaceMenuItems.svelte`                                                                           | Complete |
| `workspace-drag.svelte.ts`, `workspace-pointer-drag-policy.ts`, `workspace-tabs-drop.{svelte,ts}`, `workspace-tabs-move.svelte` | `drag/`, `drop-overlay/`, `tabs/WorkspaceTabsMove.svelte`                                                  | Complete |
| `workspace-{floating-window,popout-surface}.svelte`, shell floating and popout layers                                           | `floating-window/`, `floating-layer/`, `popout/`                                                           | Complete |
| `workspace-{ribbon,status-bar,status-item}.svelte`                                                                              | `ribbon/`, `status-bar/`, `status-item/`                                                                   | Complete |
| `workspace-mobile.svelte` and all seven `workspace-mobile-*` helper components                                                  | `mobile/WorkspaceMobile*.svelte` public component family                                                   | Complete |
| `app-settings-*`, `workspace-setting-*`, `workspace-settings-surface.svelte`                                                    | `settings/` native-CSS compound components                                                                 | Complete |
| F-Mode and Notifications package components                                                                                     | `plugins/f-mode/`, `plugins/notifications/`                                                                | Complete |
| Source shell, framework, component, settings, overlay, and reference stories                                                    | Colocated `*.stories.svelte` and `*.mdx` files across each target family                                   | Complete |
| Copied shadcn components and generated Tailwind utility wrappers                                                                | Not migrated; replaced by semantic HTML, direct Bits UI where needed, Paneforge, native CSS, and UI tokens | Excluded |

The remaining migration gate is visual evidence rather than unimplemented
component ownership: candidate baselines and the immutable Lapis reference
matrix are tracked separately and require explicit review before approval.
