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
