<!-- Adapted from https://shadcn-svelte.com/docs/components/popover.md for the @stevejuma/ui native-CSS catalog. -->

# Popover

Displays rich content in a portal, triggered by a button.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as Popover from "@stevejuma/ui/shadcn/popover";
</script>
```

```svelte
<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Content>Place content for the popover here.</Popover.Content>
</Popover.Root>
```
