# Workspace provenance

This package adapts owned source code from Lapis Notes at revision
`97518d8158a12ade0f9b1a35aa051ffcf5dfe8ac`.

| Lapis source                                                                         | Adapted surface                            |
| ------------------------------------------------------------------------------------ | ------------------------------------------ |
| `packages/workspace/src/lib/components/app/desktop-workspace-shell.svelte`           | Three-region workspace shell               |
| `packages/workspace/src/lib/components/sidebar/sidebar-*.svelte`                     | Generic controlled sidebars                |
| `packages/workspace/src/lib/components/tabs/tabs-sidebar.svelte`                     | Icon sidebar tabs and collapsible groups   |
| `packages/workspace/src/lib/components/tabs/tabs-split.svelte` and `tabs-top.svelte` | Recursive splits and top-tab pane behavior |
| `packages/workspace/src/lib/components/tabs/tabs-stacked.svelte`                     | Vertical stacked-tab rails                 |
| `packages/workspace/src/lib/components/tabs/tabs-drop.svelte`                        | Five-zone tab drop geometry and overlay    |
| `packages/workspace/src/lib/components/leaf/leaf.svelte`                             | View host lifecycle                        |
| `packages/api/src/lib/workspace.svelte.ts` and `view.svelte.ts`                      | Decoupled layout and view contracts        |
| `packages/workspace/src/lib/components/view-header/view-header.svelte`               | Reusable workspace view frame              |
| `packages/workspace/e2e/tab-drag-drop.spec.ts`                                       | Drag/drop browser-test scenarios           |
| `packages/workspace/e2e/workspace-shell-visual.spec.ts`                              | Shell geometry assertions                  |

The adapted code is intentionally relicensed by its owner for this private,
`UNLICENSED` package. Lapis application stores, vault APIs, plugins, mobile
surfaces, floating windows, and application-specific drag/drop integrations are
not included.
