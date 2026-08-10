<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/hover-card.md for the @lapismd/design-core native-CSS catalog. -->

# Hover Card

For sighted users to preview content available behind a link.

## Installation

```bash
pnpm ui:add hover-card
```

## Usage

```html
<script lang="ts">
  import * as HoverCard from "@lapismd/design-core/shadcn/hover-card";
</script>
```

```html
<HoverCard.Root>
  <HoverCard.Trigger>Hover</HoverCard.Trigger>
  <HoverCard.Content>
    SvelteKit - Web development, streamlined
  </HoverCard.Content>
</HoverCard.Root>
```
