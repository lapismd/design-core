<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/popover.md for the @stevejuma/ui native-CSS catalog. -->

# Popover

Displays rich content in a portal, triggered by a button.

## Installation

```bash
pnpm ui:add popover
```

## Usage

```html
<script lang="ts">
  import * as Popover from "@stevejuma/ui/shadcn/popover";
</script>
```

```html
<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Content>Place content for the popover here.</Popover.Content>
</Popover.Root>
```
