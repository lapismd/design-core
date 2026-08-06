<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/accordion.md for the @lapismd/design-core native-CSS catalog. -->

# Accordion

A vertically stacked set of interactive headings that each reveal a section of content.

## Installation

```bash
pnpm ui:add accordion
```

## Usage

```html
<script lang="ts">
  import * as Accordion from "@lapismd/design-core/shadcn/accordion";
</script>
```

```html
<Accordion.Root type="single">
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
    <Accordion.Content>
      Yes. It adheres to the WAI-ARIA design pattern.
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```
