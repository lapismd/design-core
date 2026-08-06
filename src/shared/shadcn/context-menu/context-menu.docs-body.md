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
