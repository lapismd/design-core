<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/context-menu.md for the @lapismd/design-core native-CSS catalog. -->

# Context Menu

Displays a menu to the user — such as a set of actions or functions — triggered by right click.

## Installation

```bash
pnpm ui:add context-menu
```

## Usage

```html
<script lang="ts">
  import * as ContextMenu from "@lapismd/design-core/shadcn/context-menu";
</script>
```

```html
<ContextMenu.Root>
  <ContextMenu.Trigger>Right click</ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item>Profile</ContextMenu.Item>
    <ContextMenu.Item>Billing</ContextMenu.Item>
    <ContextMenu.Item>Team</ContextMenu.Item>
    <ContextMenu.Item>Subscription</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
```
