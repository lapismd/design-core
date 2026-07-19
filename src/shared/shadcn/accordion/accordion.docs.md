<!-- Adapted from https://shadcn-svelte.com/docs/components/accordion.md for the @stevejuma/ui native-CSS catalog. -->

# Accordion

A vertically stacked set of interactive headings that each reveal a section of content.

## [Usage](#usage)

```svelte
<script lang="ts">
  import * as Accordion from "@stevejuma/ui/shadcn/accordion";
</script>
```

```svelte
<Accordion.Root type="single">
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
    <Accordion.Content>
      Yes. It adheres to the WAI-ARIA design pattern.
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```
