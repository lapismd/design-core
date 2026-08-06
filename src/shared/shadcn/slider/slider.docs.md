<!-- Adapted from https://github.com/huntabyte/shadcn-svelte/blob/bf4f461d88526359d0e96e1950f637912bbeebe7/docs/content/components/slider.md for the @lapismd/design-core native-CSS catalog. -->

# Slider

An input where the user selects a value from within a given range.

## Installation

```bash
pnpm ui:add slider
```

## Usage

```html
<script lang="ts">
  import { Slider } from "@lapismd/design-core/shadcn/slider";
  let value = $state(33);
</script>
```

```html
<Slider type="single" bind:value max={100} step={1} />
```
