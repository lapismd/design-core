<!-- Adapted from https://shadcn-svelte.com/docs/components/collapsible.md for the @stevejuma/ui native-CSS catalog. -->

# Collapsible

An interactive component which expands/collapses a panel.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as Collapsible from "@stevejuma/ui/shadcn/collapsible";
</script>
```

```svelte
<Collapsible.Root>
  <Collapsible.Trigger>Can I use this in my project?</Collapsible.Trigger>
  <Collapsible.Content>
    Yes. Free to use for personal and commercial projects. No attribution
    required.
  </Collapsible.Content>
</Collapsible.Root>
```
