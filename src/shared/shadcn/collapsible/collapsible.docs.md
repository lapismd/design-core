<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/collapsible.md for the @stevejuma/ui native-CSS catalog. -->

# Collapsible

An interactive component which expands/collapses a panel.

## Installation

```bash
pnpm ui:add collapsible
```

## Usage

```html
<script lang="ts">
  import * as Collapsible from "@stevejuma/ui/shadcn/collapsible";
</script>
```

```html
<Collapsible.Root>
  <Collapsible.Trigger>Can I use this in my project?</Collapsible.Trigger>
  <Collapsible.Content>
    Yes. Free to use for personal and commercial projects. No attribution
    required.
  </Collapsible.Content>
</Collapsible.Root>
```
