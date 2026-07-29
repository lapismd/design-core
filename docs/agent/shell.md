---
id: shell
title: App shell composition
summary: Use the canonical compound topology, toggle placement, headers, and collapsed-rail behavior.
sources:
  - src/shared/shell/Guidance.mdx
  - src/shared/shell/AppShell.mdx
  - src/shared/shell/AppShell.stories.svelte
  - src/shared/shell/examples/AppShellCompleteDemo.svelte
  - src/shared/shell/index.ts
---

# App shell composition

Use `@stevejuma/ui/shell` for bounded application chrome with application
sidebars and a main surface. Read **Shell/Guidance** in Storybook before
composing a shell; use the **Shell/App Shell** examples as reference markup.

## Canonical topology

```svelte
<AppShell.Root {controller}>
  <AppShell.Sidebar side="left">
    <AppShell.Sidebar.Header>...</AppShell.Sidebar.Header>
    <AppShell.Sidebar.Body>...</AppShell.Sidebar.Body>
    <AppShell.Sidebar.Footer>...</AppShell.Sidebar.Footer>
  </AppShell.Sidebar>

  <AppShell.Main>
    <AppShell.Toolbar>
      <AppShell.Sidebar.Toggle side="left" />
      ...
      <AppShell.Sidebar.Toggle side="right" />
    </AppShell.Toolbar>
    <AppShell.Body>...</AppShell.Body>
  </AppShell.Main>

  <AppShell.Sidebar side="right" closeable>
    <AppShell.Sidebar.Header>
      ...
      <AppShell.Sidebar.Close />
    </AppShell.Sidebar.Header>
    <AppShell.Sidebar.Body>...</AppShell.Sidebar.Body>
  </AppShell.Sidebar>
</AppShell.Root>
```

Keep root sidebars and main as siblings. Keep fixed `Sidebar.Header`,
`Sidebar.Footer`, and `Toolbar` regions outside scrolling `Sidebar.Body` and
`Body`. Do not replace these parts with bespoke layout wrappers: they provide
the shell's structural selectors, scroll boundaries, responsive teleport
targets, accessible regions, and cross-column alignment hooks.

## Toggle placement

- Primary left root sidebar: first action in the main `Toolbar`.
- Primary right root sidebar: last action in the main `Toolbar`.
- Additional outer-left sidebar: first action in the adjacent inner
  `Sidebar.Header`, targeting its named `sidebarController`.
- Body-local panel: `Body.Toggle` in the matching corner of the same
  `Body layout="regions"`, targeting its `Body.Sidebar`.
- Closeable root sidebar: `Sidebar.Close` at the far edge of its own
  `Sidebar.Header`.

A toggle belongs in adjacent chrome that remains available when its target is
collapsed or closed. Do not put the only toggle inside the panel it controls,
duplicate it with a bespoke button, move it into scrolling content, or use
`Sidebar.Close` as collapse.

For multiple panels on one side, create each stable controller with
`controller.createSidebar(id, side)`. Put the outer panel first with
`variant="outer"`, `revealOnEdgeHover`, and `edgeRevealLabel`; put its toggle
in the adjacent inner `Sidebar.Header` with `previewOnHover`. The **Nested
project and file sidebars** and **Complete shell composition** stories are
canonical.

## Desktop preview overlays

When an outer same-side sidebar is collapsed or closed, desktop may preview it
as a temporary expanded overlay without durable state changes or shifting
adjacent columns:

- **`previewOnHover`** on the adjacent `Sidebar.Toggle` (usually in the inner
  sidebar header): delayed hover preview (default 600ms via `previewDelay`).
- **`revealOnEdgeHover`** on the outer `Sidebar`: narrow edge control at the
  shell’s leading edge. When the outer panel is collapsed or closed, that
  control sits against the visible edge of the next column (typically the
  inner sidebar). Hover or focus previews; click expands/opens inline.

Both set transient `previewed` only. Portalled Select/Popover/menu content
linked from the sidebar remains inside the preview interaction boundary. Do
not invent a custom flyout for these affordances. Desktop-only; mobile uses
the edge-stage track.

## Headers and alignment

Every root sidebar uses `Sidebar.Header`; main uses `Toolbar`. Style consumer
header rows from `--ui-shell-toolbar-height` and keep
`--ui-shell-main-block-inset` authoritative rather than hard-coding unrelated
column heights. A header may add a second row, but the first action/title row
retains the shared baseline.

Do not put a fake header inside `Sidebar.Body`, add custom sticky chrome, or
render the main title outside `AppShell.Main`.

Omit `border-block-end` on the outer / first project sidebar header
(`variant="outer"`), including when expanded or previewed. Keep the usual
header separator on inner Files rails and the right AI/inspector header.

## Collapsed behavior

- Expanded: full width, labels and fields visible, resize handle available.
- Collapsed: mounted icon rail, essential accessible icon actions, no resize
  handle.
- Closed: removed from inline layout; adjacent toggle or edge affordance
  reopens it.
- Previewed: temporary expanded overlay without durable state changes.
  Desktop entry points are `previewOnHover` (adjacent toggle) and
  `revealOnEdgeHover` (edge control); see **Desktop preview overlays**.

Keep `Sidebar.Header`, `Sidebar.Body`, and `Sidebar.Footer` mounted when
collapsed. Hide only expanded labels, section captions, inputs, and verbose
footer content. Keep every icon-only action named with `aria-label` and usually
`title`; do not leave full text clipped into the rail.

Compact rendering must account for presentation:

```ts
const compact =
  controller.mobile.resolvedMode === "desktop" &&
  sidebar.collapsed &&
  !sidebar.previewed;
```

Do not derive compact markup from `sidebar.collapsed` alone. Durable desktop
collapse can coexist with full mobile or preview presentation, and mobile stage
changes must not mutate desktop collapse/close/width state.

## Body and ownership boundaries

Use `AppShell.Body layout="regions"` plus `Body.Sidebar`, `Body.Content`, and
`Body.Toggle` for document-local panels such as a table of contents. Use
`@stevejuma/ui/workspace` instead when the host needs registered views, tabs,
recursive splits, commands, settings, or plugins.

Shell owns geometry and layout interactions. Consumers own routing, selection,
documents, domain actions, header/body content, persistence policy, and storage
keys. Never put application routers, APIs, vaults, plugins, or domain state
inside the shared shell.

## Required references

- Storybook guidance: `Shell/Guidance`
- Full API and behavior: `Shell/App Shell/Docs`
- Composition: `Complete shell composition`
- Nested previews: `Nested project and file sidebars`
- Collapse: `Independent icon rails`
- Responsive edges: `Mobile edge panels`
- Local panels: `Markdown document body sidebars`
