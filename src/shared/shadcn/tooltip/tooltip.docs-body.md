## Installation

```bash
pnpm ui:add tooltip
```

## Usage

The `Tooltip.Provider` component should be placed once in your root layout, wrapping all content that will contain tooltips. This ensures that only one tooltip within the provider can be open at a time.

```html
<script lang="ts">
  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";

  let { children } = $props();
</script>
```

```html
<Tooltip.Provider> {@render children()} </Tooltip.Provider>
```

Then use tooltips anywhere in your app:

```html
<script lang="ts">
  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";
</script>

<Tooltip.Root>
  <Tooltip.Trigger>Hover</Tooltip.Trigger>
  <Tooltip.Content>
    <p>Add to library</p>
  </Tooltip.Content>
</Tooltip.Root>
```

### Nested Providers

You can nest providers to create groups with different settings. Tooltips use the closest ancestor provider. This is useful when you want instant tooltips in specific areas:

```html
<Tooltip.Provider delayDuration="{0}">
  <!-- Tooltips here will open instantly -->
</Tooltip.Provider>
```

---

## Changelog

### 2025-12 Update tooltip colors

We've updated the tooltip colors to use the foreground color for the background and the background color for the foreground.

Replace `bg-primary text-primary-foreground` with `bg-foreground text-background` for `<Tooltip.Content />`.
