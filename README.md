# `@lapismd/design-core`

[![Release public packages](https://github.com/lapismd/design-core/actions/workflows/release.yml/badge.svg)](https://github.com/lapismd/design-core/actions/workflows/release.yml)
[![Storybook Pages](https://github.com/lapismd/design-core/actions/workflows/publish-storybook-pages.yml/badge.svg)](https://github.com/lapismd/design-core/actions/workflows/publish-storybook-pages.yml)
[![npm version](https://img.shields.io/npm/v/@lapismd/design-core.svg)](https://www.npmjs.com/package/@lapismd/design-core)
[![Storybook](https://img.shields.io/badge/storybook-live-ff4785?logo=storybook&logoColor=white)](https://lapismd.github.io/design-core/)

Svelte 5 design-system package for LapisMD applications. It provides native-CSS
component families, form primitives, search/filter controls, AI chat
presentation, diff views, shell layout, and a workspace framework.

Design Core owns reusable presentation and controller behavior. Consumers own
routing, data loading, persistence, domain state, transport, and application
policy.

## Current package status

- Public package: `@lapismd/design-core@0.1.0`.
- Runtime peer: `svelte@^5`.
- Source package: exports point at tracked `.svelte`, `.ts`, and `.css` source
  files for modern Svelte/Vite consumers.
- Canonical repository: `lapismd/design-core`.
- Live catalog: <https://lapismd.github.io/design-core/>.

## Install

```sh
pnpm add @lapismd/design-core svelte
```

Import the shared stylesheet once at the application boundary:

```ts
import "@lapismd/design-core/styles.css";
```

Then import component families from their public layer:

```svelte
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { StructuredForm } from "@lapismd/design-core/forms";
  import * as AppShell from "@lapismd/design-core/shell";
</script>
```

## Public layers

| Layer             | Import                                                                     | Use for                                                                                                           |
| ----------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Styles and themes | `@lapismd/design-core/styles.css`, `@lapismd/design-core/themes/lapis.css` | Theme tokens, base package styles, Lapis theme assets                                                             |
| shadcn primitives | `@lapismd/design-core/shadcn/<family>`                                     | Low-level buttons, inputs, dialogs, popovers, menus, tabs, scroll areas, and layout primitives                    |
| Forms             | `@lapismd/design-core/forms`, `@lapismd/design-core/forms/core`            | Structured forms, field renderers, form controls, editors, review/diff affordances                                |
| Filter            | `@lapismd/design-core/filter`                                              | Search bars, power-search tokens, and the filter-query CodeMirror language                                        |
| AI                | `@lapismd/design-core/ai`, `@lapismd/design-core/ai/chat`                  | Host-controlled chat layout, messages, composer, tool-call, dictation, and status presentation                    |
| AI experimental   | `@lapismd/design-core/ai/experimental`                                     | Lab-derived chat affordances marked experimental                                                                  |
| Diff              | `@lapismd/design-core/diff`                                                | File listings, change stats, file diffs, merge presentation, and headless diff models                             |
| Shell             | `@lapismd/design-core/shell`                                               | Bounded app chrome, sidebars, body regions, responsive shell state, and shell layout persistence adapters         |
| Workspace         | `@lapismd/design-core/workspace`                                           | Registered views, tabs, splits, sidebars, panels, plugins, commands, settings, and workspace persistence adapters |

Focused component subpaths are also exported for compatibility, especially under
`forms` and `workspace`. Treat `package.json` exports as the supported import
boundary.

## Component coverage

Implemented shadcn families include:

accordion, alert, alert-dialog, badge, breadcrumb, button, button-group, card,
checkbox, code, code-block, collapsible, column-canvas, command, command-view,
context-menu, dialog, drawer, dropdown-menu, empty, field, hover-card, input,
input-group, label, pagination, popover, progress, resizable, scroll-area,
select, separator, sheet, sidebar, skeleton, slider, spinner, swipe-item,
switch, table, tabs, textarea, toggle, toggle-group, and tooltip.

The higher layers compose these primitives:

- Forms provide structured rendering, YAML/JSON-backed editing, list editors,
  autocomplete/chip inputs, date/time/reference pickers, code/YAML editors, and
  patch review surfaces.
- Filter provides reusable search chrome plus parser/language helpers for the
  filter-query syntax.
- AI provides presentation-only chat parts. It does not own model calls, network
  transport, conversation storage, or host actions.
- Diff provides file/change/merge UI. Hosts own repository state and file
  contents.
- Shell provides application chrome and responsive sidebars without owning
  application navigation.
- Workspace provides the heavier app framework for registered views, layout
  persistence, commands, panels, and plugins.

Use Shell for application chrome. Use Workspace when the host needs registered
views, tab/split layout, plugins, settings, command palette, or full workspace
persistence.

## Styling contract

Design Core uses native CSS and public custom properties. Consumers should style
through tokens and typed props rather than patching internal selectors.

1. Import `@lapismd/design-core/styles.css` once.
2. Override public `--ui-*` variables on `:root` or a shared ancestor.
3. Prefer component props for variants, density, layout, and state.
4. Avoid overriding private DOM structure or internal class names.

Token families:

| Scope                | Token examples                                                      | Source                                                |
| -------------------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| Global theme         | `--background`, `--foreground`, `--primary`, `--border`, `--radius` | `src/theme.css`                                       |
| shadcn family tokens | `--ui-button-*`, `--ui-input-*`, `--ui-card-*`                      | colocated family token files                          |
| Forms                | `--ui-form-*`                                                       | `@lapismd/design-core/forms/form.tokens.css`          |
| AI                   | `--ui-ai-*`                                                         | `@lapismd/design-core/ai/tokens`                      |
| Diff                 | `--ui-diff-*`                                                       | `@lapismd/design-core/diff/tokens`                    |
| Shell                | `--ui-shell-*`                                                      | `@lapismd/design-core/shell/shell.tokens.css`         |
| Workspace            | `--ui-workspace-*`                                                  | `@lapismd/design-core/workspace/workspace.tokens.css` |

Component roots stamp stable `data-ui-component` and `data-ui-part` attributes
for package-owned styling. Consumers may use side-channel attributes for their
own selectors, but should not overwrite Design Core identity attributes on
package components.

## Layout conventions

Source layout follows the public catalog and package layers:

```text
src/
  styles.css, theme.css, storybook.css
  shared/
    shadcn/<family>/
    forms/<family>/
    filter/<family>/
    ai/<component>/
    ai/experimental/<component>/
    diff/<family>/
    shell/app-shell/
    workspace/<family>/
```

One directory owns one independent component family or one compound family.
Multipart components stay together in the owning family folder. Public barrels
live at the layer root or family root.

## Usage examples

### shadcn primitive

```svelte
<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
</script>

<Button variant="default" size="sm">Save</Button>
```

### Shell layout

```svelte
<script lang="ts">
  import * as AppShell from "@lapismd/design-core/shell";

  const shell = AppShell.createAppShellController({
    layoutId: "app",
  });
</script>

<AppShell.Root controller={shell}>
  <AppShell.Sidebar side="left">
    <AppShell.Sidebar.Header>Navigation</AppShell.Sidebar.Header>
    <AppShell.Sidebar.Body>...</AppShell.Sidebar.Body>
  </AppShell.Sidebar>

  <AppShell.Main>
    <AppShell.Toolbar>Toolbar</AppShell.Toolbar>
    <AppShell.Body>
      <AppShell.Body.Content>Application content</AppShell.Body.Content>
    </AppShell.Body>
  </AppShell.Main>
</AppShell.Root>
```

### Forms

```svelte
<script lang="ts">
  import { FormField } from "@lapismd/design-core/forms";
  import { Textarea } from "@lapismd/design-core/shadcn/textarea";
</script>

<FormField label="Summary" description="Short text shown in previews">
  <Textarea bind:value={summary} />
</FormField>
```

## Storybook and local documentation

Run the local catalog:

```sh
pnpm storybook
```

Build the static catalog:

```sh
pnpm build-storybook
```

Offline package guidance:

```sh
pnpm ui guide
pnpm ui guide styling
pnpm ui components
pnpm ui components button
```

The canonical specification lives in `spec/src`. Use it for package behavior,
architecture, style rules, and verification evidence:

```sh
pnpm spec:search -- "tokens"
pnpm spec:check
```

## Release and validation

Common validation commands:

```sh
pnpm spec:first
pnpm spec:check
pnpm check
pnpm test:unit
pnpm build-storybook
pnpm checks:release
```

Release planning and package artifacts:

```sh
pnpm changeset
pnpm release:check
pnpm release:plan --registry https://registry.npmjs.org
pnpm packages:pack
```

`@lapismd/design-core@0.1.0` was manually bootstrapped from a reviewed tarball.
Future releases use Changesets and the repository release workflow.

## Further reading

| Resource                                                               | Use                                 |
| ---------------------------------------------------------------------- | ----------------------------------- |
| [`spec/src/index.md`](./spec/src/index.md)                             | Canonical Design Core specification |
| [`spec/src/component-inventory.md`](./spec/src/component-inventory.md) | Implemented component inventory     |
| [`spec/src/styling-and-themes.md`](./spec/src/styling-and-themes.md)   | Styling and token contract          |
| [`spec/src/packages.md`](./spec/src/packages.md)                       | Public export requirements          |
| [`AGENTS.md`](./AGENTS.md)                                             | Contributor and agent workflow      |
