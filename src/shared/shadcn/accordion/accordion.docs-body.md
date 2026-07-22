## Installation

```bash
pnpm ui:add accordion
```

## Usage

```html
<script lang="ts">
  import * as Accordion from "@stevejuma/ui/shadcn/accordion";
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
